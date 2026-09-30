package com.cartiva.backend.salesforce;

/** Cached OAuth2 access token + the per-org instance URL it's scoped to. */
public record SalesforceAuthToken(String accessToken, String instanceUrl) {
}
