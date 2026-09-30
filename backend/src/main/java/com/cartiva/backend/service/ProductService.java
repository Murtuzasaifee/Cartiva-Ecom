package com.cartiva.backend.service;

import com.cartiva.backend.dto.ProductResponse;
import com.cartiva.backend.exception.ResourceNotFoundException;
import com.cartiva.backend.model.Product;
import com.cartiva.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> listProducts() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getProduct(Long id) {
        return ProductResponse.from(getProductOrThrow(id));
    }

    public Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }
}
