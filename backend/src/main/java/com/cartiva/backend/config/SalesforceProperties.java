package com.cartiva.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT Bearer flow config. Username-password flow isn't used here — many orgs
 * (this one included) block it by default (Setup > OAuth and OpenID Connect
 * Settings > "Allow OAuth Username-Password Flows" is off, and not admin-togglable
 * on some org types). JWT Bearer works regardless of that setting and doesn't need MFA.
 */
@Component
@ConfigurationProperties(prefix = "salesforce")
public class SalesforceProperties {

    private String loginUrl;
    private String clientId;
    private String username;
    private String jwtPrivateKeyPath;
    private String apiVersion;

    public String getLoginUrl() {
        return loginUrl;
    }

    public void setLoginUrl(String loginUrl) {
        this.loginUrl = loginUrl;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getJwtPrivateKeyPath() {
        return jwtPrivateKeyPath;
    }

    public void setJwtPrivateKeyPath(String jwtPrivateKeyPath) {
        this.jwtPrivateKeyPath = jwtPrivateKeyPath;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public boolean isConfigured() {
        return notBlank(clientId) && notBlank(username) && notBlank(jwtPrivateKeyPath)
            && new java.io.File(jwtPrivateKeyPath).exists();
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}
