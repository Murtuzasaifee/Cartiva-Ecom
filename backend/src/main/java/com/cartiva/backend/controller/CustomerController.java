package com.cartiva.backend.controller;

import com.cartiva.backend.dto.CustomerResponse;
import com.cartiva.backend.dto.OrderResponse;
import com.cartiva.backend.dto.TicketResponse;
import com.cartiva.backend.dto.UpdateCustomerRequest;
import com.cartiva.backend.service.CustomerService;
import com.cartiva.backend.service.OrderService;
import com.cartiva.backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final OrderService orderService;
    private final TicketService ticketService;

    public CustomerController(CustomerService customerService, OrderService orderService, TicketService ticketService) {
        this.customerService = customerService;
        this.orderService = orderService;
        this.ticketService = ticketService;
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomer(@PathVariable Long id) {
        return CustomerResponse.from(customerService.getCustomerOrThrow(id));
    }

    @PutMapping("/{id}")
    public CustomerResponse updateCustomer(@PathVariable Long id, @Valid @RequestBody UpdateCustomerRequest request) {
        return CustomerResponse.from(customerService.updateProfile(id, request.firstName(), request.lastName(), request.phone()));
    }

    @GetMapping("/{id}/orders")
    public List<OrderResponse> getOrdersForCustomer(@PathVariable Long id) {
        return orderService.getOrdersForCustomer(id);
    }

    @GetMapping("/{id}/tickets")
    public List<TicketResponse> getTicketsForCustomer(@PathVariable Long id) {
        return ticketService.getTicketsForCustomer(id);
    }
}
