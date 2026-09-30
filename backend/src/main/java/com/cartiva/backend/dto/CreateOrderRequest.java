package com.cartiva.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotNull String shippingAddress,
    /** Mocked for the POC — "Credit Card" or "Cash on Delivery"; no real payment gateway. */
    String paymentMethod,
    @NotEmpty @Valid List<OrderItemRequest> items
) {
}
