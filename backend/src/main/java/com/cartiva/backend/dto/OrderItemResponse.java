package com.cartiva.backend.dto;

import java.math.BigDecimal;

public record OrderItemResponse(Long productId, String productName, String productImageUrl, Integer quantity, BigDecimal unitPrice) {
}
