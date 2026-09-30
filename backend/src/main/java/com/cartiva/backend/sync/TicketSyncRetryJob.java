package com.cartiva.backend.sync;

import com.cartiva.backend.service.TicketService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Backend -> Salesforce direction (doc §36): retries Case creation for tickets
 * that failed to sync when they were first created (status SYNC_PENDING).
 */
@Component
public class TicketSyncRetryJob {

    private final TicketService ticketService;

    public TicketSyncRetryJob(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @Scheduled(fixedDelayString = "${cartiva.retry.interval-ms:60000}")
    public void retry() {
        ticketService.retryPendingSyncs();
    }
}
