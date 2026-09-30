package com.cartiva.backend.salesforce;

import com.fasterxml.jackson.databind.JsonNode;
import com.cartiva.backend.model.Customer;
import com.cartiva.backend.model.Order;
import com.cartiva.backend.model.Ticket;
import com.cartiva.backend.model.TicketStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Field-level mapping between Cartiva's Ticket/Order/Customer and the
 * Salesforce Case, per the requirement doc's backend<->Salesforce mapping tables.
 */
@Component
public class SalesforceMapper {

    public Map<String, Object> toCaseFields(Ticket ticket, Order order, Customer customer) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("Subject", ticket.getSubject());
        fields.put("Description", ticket.getDescription());
        fields.put("External_Ticket_Id__c", ticket.getTicketNumber());
        fields.put("External_Order_Id__c", order.getOrderNumber());
        fields.put("Order_Amount__c", order.getTotalAmount());
        if (customer.getSalesforceContactId() != null) {
            fields.put("ContactId", customer.getSalesforceContactId());
        }
        return fields;
    }

    public Map<String, Object> toContactFields(Customer customer) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("FirstName", customer.getFirstName());
        fields.put("LastName", customer.getLastName());
        fields.put("Email", customer.getEmail());
        fields.put("Phone", customer.getPhone());
        return fields;
    }

    /** Applies a queried Case record (from the polling job) back onto the local Ticket. */
    public void applyCaseToTicket(JsonNode caseRecord, Ticket ticket) {
        textField(caseRecord, "Triage_Category__c").ifPresent(ticket::setCategory);
        textField(caseRecord, "Triage_Priority__c").ifPresent(ticket::setPriority);
        textField(caseRecord, "Resolution__c").ifPresent(ticket::setResolution);
        textField(caseRecord, "Fulfillment_Status__c")
            .map(this::toTicketStatus)
            .ifPresent(ticket::setStatus);
        ticket.setUpdatedAt(Instant.now());
    }

    private java.util.Optional<String> textField(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return (value == null || value.isNull()) ? java.util.Optional.empty() : java.util.Optional.of(value.asText());
    }

    private TicketStatus toTicketStatus(String fulfillmentStatus) {
        return switch (fulfillmentStatus) {
            case "New" -> TicketStatus.SUBMITTED;
            case "Triaged" -> TicketStatus.TRIAGED;
            case "Assigned" -> TicketStatus.ASSIGNED;
            case "In Progress" -> TicketStatus.IN_PROGRESS;
            case "Waiting for Customer" -> TicketStatus.WAITING_FOR_CUSTOMER;
            case "Resolved" -> TicketStatus.RESOLVED;
            default -> TicketStatus.SUBMITTED;
        };
    }
}
