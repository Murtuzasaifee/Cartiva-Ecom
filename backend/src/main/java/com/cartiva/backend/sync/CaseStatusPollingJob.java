package com.cartiva.backend.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.cartiva.backend.config.SchedulingConfig;
import com.cartiva.backend.model.Ticket;
import com.cartiva.backend.repository.TicketRepository;
import com.cartiva.backend.salesforce.SalesforceCaseService;
import com.cartiva.backend.salesforce.SalesforceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Salesforce -> Backend direction (doc §34): polls for Cases modified since the last
 * run and syncs their triage/resolution fields back onto the matching local Ticket.
 * Deliberately simple polling for the POC; a later phase can replace this with
 * Salesforce Platform Events (doc §35).
 */
@Component
public class CaseStatusPollingJob {

    private static final Logger log = LoggerFactory.getLogger(CaseStatusPollingJob.class);

    private final SalesforceCaseService caseService;
    private final SalesforceMapper mapper;
    private final TicketRepository ticketRepository;
    private final SchedulingConfig schedulingConfig;

    private final AtomicReference<Instant> lastPollTime = new AtomicReference<>(Instant.now());

    public CaseStatusPollingJob(SalesforceCaseService caseService, SalesforceMapper mapper,
                                 TicketRepository ticketRepository, SchedulingConfig schedulingConfig) {
        this.caseService = caseService;
        this.mapper = mapper;
        this.ticketRepository = ticketRepository;
        this.schedulingConfig = schedulingConfig;
    }

    @Scheduled(fixedDelayString = "${cartiva.polling.interval-ms:10000}")
    public void poll() {
        if (!schedulingConfig.getPolling().isEnabled() || !caseService.isAvailable()) {
            return;
        }
        Instant since = lastPollTime.get();
        Instant pollStartedAt = Instant.now();

        List<JsonNode> changedCases = caseService.findCasesModifiedSince(since);
        for (JsonNode caseRecord : changedCases) {
            syncOne(caseRecord);
        }
        if (!changedCases.isEmpty()) {
            log.info("Synced {} Case update(s) from Salesforce", changedCases.size());
        }
        lastPollTime.set(pollStartedAt);
    }

    private void syncOne(JsonNode caseRecord) {
        String caseId = caseRecord.get("Id").asText();
        Optional<Ticket> ticketOpt = ticketRepository.findBySalesforceCaseId(caseId);
        if (ticketOpt.isEmpty()) {
            return;
        }
        Ticket ticket = ticketOpt.get();
        mapper.applyCaseToTicket(caseRecord, ticket);
        ticketRepository.save(ticket);
    }
}
