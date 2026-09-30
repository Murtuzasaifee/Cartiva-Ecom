package com.cartiva.backend.dto;

import com.cartiva.backend.model.Product;

import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String name,
    String description,
    String category,
    BigDecimal price,
    String imageUrl,
    Integer inventory
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getCategory(), p.getPrice(), p.getImageUrl(), p.getInventory());
    }
}
