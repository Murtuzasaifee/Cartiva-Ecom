package com.cartiva.backend.service;

import com.cartiva.backend.model.Customer;
import com.cartiva.backend.model.Order;
import com.cartiva.backend.model.Ticket;
import com.cartiva.backend.repository.CustomerRepository;
import com.cartiva.backend.salesforce.SalesforceCaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Backend -> Salesforce direction: turns a locally-created Ticket into a Salesforce Case.
 * Orchestrates Contact linkage (persisting the Contact Id back onto Customer) and delegates
 * the actual REST calls to {@link SalesforceCaseService}.
 */
@Service
public class SalesforceService {

    private static final Logger log = LoggerFactory.getLogger(SalesforceService.class);

    private final SalesforceCaseService caseService;
    private final CustomerRepository customerRepository;

    public SalesforceService(SalesforceCaseService caseService, CustomerRepository customerRepository) {
        this.caseService = caseService;
        this.customerRepository = customerRepository;
    }

    public boolean isAvailable() {
        return caseService.isAvailable();
    }

    /** Creates (or reuses) the customer's Contact, then creates the Case. Returns the Salesforce Case Id. */
    public String createCaseForTicket(Ticket ticket, Order order, Customer customer) {
        String contactId = caseService.ensureContact(customer);
        if (customer.getSalesforceContactId() == null) {
            customer.setSalesforceContactId(contactId);
            customerRepository.save(customer);
            log.info("Linked customer {} to Salesforce Contact {}", customer.getId(), contactId);
        }
        return caseService.createCase(ticket, order, customer);
    }
}
