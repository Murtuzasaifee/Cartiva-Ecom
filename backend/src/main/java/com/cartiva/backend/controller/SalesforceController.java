package com.cartiva.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.cartiva.backend.salesforce.SalesforceCaseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Direct Salesforce Case inspection/retry endpoints, mainly for verifying the
 * integration during the POC demo — day-to-day Case creation happens via TicketController.
 */
@RestController
@RequestMapping("/api/salesforce")
public class SalesforceController {

    private final SalesforceCaseService caseService;
    private final com.cartiva.backend.service.TicketService ticketService;

    public SalesforceController(SalesforceCaseService caseService, com.cartiva.backend.service.TicketService ticketService) {
        this.caseService = caseService;
        this.ticketService = ticketService;
    }

    /** Reports whether Salesforce credentials are present and whether login actually succeeds. */
    @GetMapping("/status")
    public Map<String, Object> status() {
        boolean configured = caseService.isAvailable();
        boolean connected = configured && caseService.testConnection();
        return Map.of("configured", configured, "connected", connected);
    }

    @GetMapping("/cases/{id}")
    public JsonNode getCase(@PathVariable String id) {
        return caseService.getCase(id);
    }

    /** Re-attempts Salesforce Case creation for a ticket stuck in SYNC_PENDING. */
    @PostMapping("/cases/retry")
    public void retryPendingSyncs() {
        ticketService.retryPendingSyncs();
    }
}
