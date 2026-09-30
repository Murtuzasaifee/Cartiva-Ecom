package com.cartiva.backend.dto;

import com.cartiva.backend.model.Customer;

public record CustomerResponse(Long id, String firstName, String lastName, String email, String phone) {
    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), c.getPhone());
    }
}
