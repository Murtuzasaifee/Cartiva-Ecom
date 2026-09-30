package com.cartiva.backend.service;

import com.cartiva.backend.dto.CreateTicketRequest;
import com.cartiva.backend.dto.TicketResponse;
import com.cartiva.backend.exception.ResourceNotFoundException;
import com.cartiva.backend.model.Customer;
import com.cartiva.backend.model.Order;
import com.cartiva.backend.model.Ticket;
import com.cartiva.backend.model.TicketStatus;
import com.cartiva.backend.repository.TicketRepository;
import com.cartiva.backend.util.ReferenceNumberGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final CustomerService customerService;
    private final OrderService orderService;
    private final SalesforceService salesforceService;

    public TicketService(TicketRepository ticketRepository, CustomerService customerService,
                          OrderService orderService, SalesforceService salesforceService) {
        this.ticketRepository = ticketRepository;
        this.customerService = customerService;
        this.orderService = orderService;
        this.salesforceService = salesforceService;
    }

    public TicketResponse createTicket(CreateTicketRequest request) {
        Customer customer = customerService.getCustomerOrThrow(request.customerId());
        Order order = orderService.getOrderOrThrow(request.orderId());
        if (!order.getCustomerId().equals(customer.getId())) {
            throw new IllegalArgumentException("Order does not belong to this customer");
        }

        Ticket ticket = new Ticket();
        ticket.setCustomerId(customer.getId());
        ticket.setOrderId(order.getId());
        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setIssueType(request.issueType());
        ticket = ticketRepository.save(ticket);
        ticket.setTicketNumber(ReferenceNumberGenerator.generate("TCK-", ticketRepository::existsByTicketNumber));

        attemptSalesforceSync(ticket, order, customer);

        return TicketResponse.from(ticketRepository.save(ticket));
    }

    public TicketResponse getTicket(Long ticketId) {
        return TicketResponse.from(getTicketOrThrow(ticketId));
    }

    public List<TicketResponse> getTicketsForCustomer(Long customerId) {
        customerService.getCustomerOrThrow(customerId);
        return ticketRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
            .map(TicketResponse::from)
            .toList();
    }

    public Ticket getTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
    }

    /** Retries Salesforce Case creation for tickets stuck in SYNC_PENDING (doc §36 retry requirement). */
    public synchronized void retryPendingSyncs() {
        List<Ticket> pending = ticketRepository.findByStatus(TicketStatus.SYNC_PENDING);
        for (Ticket ticket : pending) {
            Order order = orderService.getOrderOrThrow(ticket.getOrderId());
            Customer customer = customerService.getCustomerOrThrow(ticket.getCustomerId());
            // Only save on a successful sync — the scheduled retry job and a manual
            // retry can otherwise race: one thread's successful save gets clobbered
            // by another thread's stale (still-pending) copy of the same ticket.
            if (attemptSalesforceSync(ticket, order, customer)) {
                ticketRepository.save(ticket);
            }
        }
    }

    private boolean attemptSalesforceSync(Ticket ticket, Order order, Customer customer) {
        if (!salesforceService.isAvailable()) {
            log.warn("Salesforce is not configured; ticket {} stays SYNC_PENDING", ticket.getTicketNumber());
            return false;
        }
        try {
            String caseId = salesforceService.createCaseForTicket(ticket, order, customer);
            ticket.setSalesforceCaseId(caseId);
            ticket.setStatus(TicketStatus.SUBMITTED);
            return true;
        } catch (Exception ex) {
            log.warn("Salesforce Case creation failed for ticket {}: {}", ticket.getTicketNumber(), ex.getMessage());
            return false;
        }
    }
}
