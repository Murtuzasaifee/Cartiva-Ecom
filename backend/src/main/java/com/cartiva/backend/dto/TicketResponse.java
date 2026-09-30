package com.cartiva.backend.dto;

import com.cartiva.backend.model.Ticket;

import java.time.Instant;

public record TicketResponse(
    Long id,
    String ticketNumber,
    Long orderId,
    String subject,
    String description,
    String issueType,
    String category,
    String priority,
    String status,
    String salesforceCaseId,
    String resolution,
    Instant createdAt,
    Instant updatedAt
) {
    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
            t.getId(),
            t.getTicketNumber(),
            t.getOrderId(),
            t.getSubject(),
            t.getDescription(),
            t.getIssueType(),
            t.getCategory(),
            t.getPriority(),
            t.getStatus().name(),
            t.getSalesforceCaseId(),
            t.getResolution(),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }
}
