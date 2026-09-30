package com.cartiva.backend.salesforce;

import com.fasterxml.jackson.databind.JsonNode;
import com.cartiva.backend.config.SalesforceProperties;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

/**
 * OAuth2 JWT Bearer flow + REST client for the Salesforce org.
 *
 * Uses JWT Bearer rather than the username-password flow: this org (and many
 * orgs created Summer '23+) has "Allow OAuth Username-Password Flows" disabled
 * at Setup > OAuth and OpenID Connect Settings, and that toggle isn't
 * admin-overridable on some org types. JWT Bearer works regardless of that
 * setting and isn't affected by MFA, since it's a server-to-server assertion,
 * not an interactive login.
 *
 * Caches the access token for the process lifetime and re-authenticates once on a 401.
 */
@Component
public class SalesforceClient {

    private static final Logger log = LoggerFactory.getLogger(SalesforceClient.class);
    private static final long JWT_VALIDITY_MINUTES = 3;

    private final SalesforceProperties properties;
    private final RestClient authClient;

    private volatile SalesforceAuthToken cachedToken;
    private volatile PrivateKey cachedPrivateKey;

    public SalesforceClient(SalesforceProperties properties) {
        this.properties = properties;
        this.authClient = RestClient.create();
    }

    public boolean isConfigured() {
        return properties.isConfigured();
    }

    /** Attempts a real authentication (not just a config-presence check). Used by the /status endpoint. */
    public boolean testConnection() {
        if (!isConfigured()) {
            return false;
        }
        try {
            cachedToken = null;
            getOrAuthenticate();
            return true;
        } catch (Exception ex) {
            log.warn("Salesforce connection test failed: {}", ex.getMessage());
            return false;
        }
    }

    public JsonNode createSObject(String sobjectType, Map<String, Object> fields) {
        return withAuthRetry(token -> restClient(token)
            .post()
            .uri("/services/data/{v}/sobjects/{type}", properties.getApiVersion(), sobjectType)
            .contentType(MediaType.APPLICATION_JSON)
            .body(fields)
            .retrieve()
            .body(JsonNode.class));
    }

    public JsonNode getSObject(String sobjectType, String recordId) {
        return withAuthRetry(token -> restClient(token)
            .get()
            .uri("/services/data/{v}/sobjects/{type}/{id}", properties.getApiVersion(), sobjectType, recordId)
            .retrieve()
            .body(JsonNode.class));
    }

    public void updateSObject(String sobjectType, String recordId, Map<String, Object> fields) {
        withAuthRetry(token -> {
            restClient(token)
                .patch()
                .uri("/services/data/{v}/sobjects/{type}/{id}", properties.getApiVersion(), sobjectType, recordId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(fields)
                .retrieve()
                .toBodilessEntity();
            return null;
        });
    }

    public JsonNode query(String soql) {
        return withAuthRetry(token -> restClient(token)
            .get()
            .uri(uriBuilder -> uriBuilder.path("/services/data/{v}/query").queryParam("q", soql).build(properties.getApiVersion()))
            .retrieve()
            .body(JsonNode.class));
    }

    private RestClient restClient(SalesforceAuthToken token) {
        return RestClient.builder()
            .baseUrl(token.instanceUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token.accessToken())
            .build();
    }

    /** Runs the call with the cached token; on a 401 (expired/invalid) re-authenticates once and retries. */
    private <T> T withAuthRetry(java.util.function.Function<SalesforceAuthToken, T> call) {
        SalesforceAuthToken token = getOrAuthenticate();
        try {
            return call.apply(token);
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized ex) {
            log.warn("Salesforce token rejected, re-authenticating");
            cachedToken = null;
            return call.apply(getOrAuthenticate());
        }
    }

    private synchronized SalesforceAuthToken getOrAuthenticate() {
        if (cachedToken != null) {
            return cachedToken;
        }
        String assertion = buildSignedJwt();

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
        form.add("assertion", assertion);

        String tokenUrl = UriComponentsBuilder.fromHttpUrl(properties.getLoginUrl())
            .path("/services/oauth2/token")
            .toUriString();

        JsonNode response = authClient.post()
            .uri(tokenUrl)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(JsonNode.class);

        cachedToken = new SalesforceAuthToken(
            response.get("access_token").asText(),
            response.get("instance_url").asText()
        );
        log.info("Authenticated to Salesforce org at {}", cachedToken.instanceUrl());
        return cachedToken;
    }

    private String buildSignedJwt() {
        Instant now = Instant.now();
        return Jwts.builder()
            .issuer(properties.getClientId())
            .subject(properties.getUsername())
            // Salesforce requires "aud" as a plain string, not the JSON array
            // jjwt's audience() builder produces — hence the raw claim() call.
            .claim("aud", properties.getLoginUrl())
            .expiration(Date.from(now.plus(JWT_VALIDITY_MINUTES, ChronoUnit.MINUTES)))
            .signWith(getPrivateKey(), Jwts.SIG.RS256)
            .compact();
    }

    private PrivateKey getPrivateKey() {
        if (cachedPrivateKey == null) {
            cachedPrivateKey = loadPrivateKey(properties.getJwtPrivateKeyPath());
        }
        return cachedPrivateKey;
    }

    private PrivateKey loadPrivateKey(String path) {
        try {
            String pem = Files.readString(Path.of(path))
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
            byte[] der = Base64.getDecoder().decode(pem);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (IOException | java.security.GeneralSecurityException ex) {
            throw new IllegalStateException("Could not load Salesforce JWT private key from " + path, ex);
        }
    }
}
