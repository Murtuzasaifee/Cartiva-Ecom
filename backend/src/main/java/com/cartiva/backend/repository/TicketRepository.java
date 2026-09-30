package com.cartiva.backend.repository;

import com.cartiva.backend.model.Ticket;
import com.cartiva.backend.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Ticket> findBySalesforceCaseId(String salesforceCaseId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findBySalesforceCaseIdIsNotNull();
    boolean existsByTicketNumber(String ticketNumber);
}
