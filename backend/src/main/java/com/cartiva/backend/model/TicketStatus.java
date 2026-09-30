package com.cartiva.backend.model;

public enum TicketStatus {
    /** Saved locally but the Salesforce Case call failed or hasn't run yet; retried by {@code TicketSyncRetryJob}. */
    SYNC_PENDING,
    /** Salesforce Case created; the org hasn't reported a triage outcome yet. */
    SUBMITTED,
    TRIAGED,
    ASSIGNED,
    IN_PROGRESS,
    WAITING_FOR_CUSTOMER,
    RESOLVED
}
