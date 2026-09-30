package com.cartiva.backend.dto;

import com.cartiva.backend.model.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    String orderNumber,
    String status,
    BigDecimal totalAmount,
    String shippingAddress,
    Instant createdAt,
    List<OrderItemResponse> items
) {
    public static OrderResponse from(Order order, List<OrderItemResponse> items) {
        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus().name(),
            order.getTotalAmount(),
            order.getShippingAddress(),
            order.getCreatedAt(),
            items
        );
    }
}
