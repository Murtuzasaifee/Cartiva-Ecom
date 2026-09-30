package com.cartiva.backend.salesforce;

import com.fasterxml.jackson.databind.JsonNode;
import com.cartiva.backend.model.Customer;
import com.cartiva.backend.model.Order;
import com.cartiva.backend.model.Ticket;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Salesforce-side Case (and supporting Contact) operations for a Ticket.
 * All CRUD goes through {@link SalesforceClient}; field-shaping goes through {@link SalesforceMapper}.
 */
@Service
public class SalesforceCaseService {

    private static final List<String> CASE_SYNC_FIELDS = List.of(
        "Id", "Triage_Category__c", "Triage_Priority__c", "Fulfillment_Status__c", "Resolution__c", "LastModifiedDate"
    );

    private final SalesforceClient client;
    private final SalesforceMapper mapper;

    public SalesforceCaseService(SalesforceClient client, SalesforceMapper mapper) {
        this.client = client;
        this.mapper = mapper;
    }

    public boolean isAvailable() {
        return client.isConfigured();
    }

    /** Performs a real login attempt against the org; used by the /status endpoint. */
    public boolean testConnection() {
        return client.testConnection();
    }

    /**
     * Ensures the customer has a Salesforce Contact, returning the Contact Id.
     * Looks up an existing Contact by email first — Salesforce's standard duplicate
     * rule blocks a second Contact create for the same person (allowSave alone
     * doesn't bypass it over the plain REST API), and this also makes the local
     * H2 database resettable without leaving orphaned/blocked Contact creates.
     */
    public String ensureContact(Customer customer) {
        if (customer.getSalesforceContactId() != null) {
            return customer.getSalesforceContactId();
        }
        String existingId = findContactIdByEmail(customer.getEmail());
        if (existingId != null) {
            return existingId;
        }
        JsonNode response = client.createSObject("Contact", mapper.toContactFields(customer));
        return response.get("id").asText();
    }

    private String findContactIdByEmail(String email) {
        String escapedEmail = email.replace("\\", "\\\\").replace("'", "\\'");
        JsonNode result = client.query("SELECT Id FROM Contact WHERE Email = '" + escapedEmail + "' LIMIT 1");
        if (result != null && result.has("records") && result.get("records").size() > 0) {
            return result.get("records").get(0).get("Id").asText();
        }
        return null;
    }

    /** Creates the Case for this ticket and returns the Salesforce Case Id. */
    public String createCase(Ticket ticket, Order order, Customer customer) {
        JsonNode response = client.createSObject("Case", mapper.toCaseFields(ticket, order, customer));
        return response.get("id").asText();
    }

    /** Fetches the full current field set for a single Case by Id. */
    public JsonNode getCase(String caseId) {
        return client.getSObject("Case", caseId);
    }

    /** Queries Cases modified since the given instant that originated from this backend (have an External Ticket ID). */
    public List<JsonNode> findCasesModifiedSince(Instant since) {
        String sinceLiteral = DateTimeFormatter.ISO_INSTANT.format(since);
        String soql = "SELECT " + String.join(", ", CASE_SYNC_FIELDS) +
            " FROM Case WHERE External_Ticket_Id__c != null AND LastModifiedDate > " + sinceLiteral +
            " ORDER BY LastModifiedDate ASC";

        JsonNode result = client.query(soql);
        List<JsonNode> records = new ArrayList<>();
        if (result != null && result.has("records")) {
            result.get("records").forEach(records::add);
        }
        return records;
    }
}
