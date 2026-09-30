package com.cartiva.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTicketRequest(
    @NotNull Long customerId,
    @NotNull Long orderId,
    @NotBlank String issueType,
    @NotBlank String subject,
    @NotBlank String description
) {
}
