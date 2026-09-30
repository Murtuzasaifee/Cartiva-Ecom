package com.cartiva.backend.service;

import com.cartiva.backend.exception.ResourceNotFoundException;
import com.cartiva.backend.model.Customer;
import com.cartiva.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer getCustomerOrThrow(Long customerId) {
        return customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
    }

    /** Email is intentionally not editable here — it's the match key used to link/reuse the Salesforce Contact. */
    public Customer updateProfile(Long customerId, String firstName, String lastName, String phone) {
        Customer customer = getCustomerOrThrow(customerId);
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setPhone(phone);
        return customerRepository.save(customer);
    }
}
