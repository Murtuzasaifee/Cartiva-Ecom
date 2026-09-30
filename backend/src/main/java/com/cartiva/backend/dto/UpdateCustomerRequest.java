package com.cartiva.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCustomerRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    String phone
) {
}
