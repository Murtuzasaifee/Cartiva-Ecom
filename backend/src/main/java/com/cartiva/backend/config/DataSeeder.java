package com.cartiva.backend.config;

import com.cartiva.backend.model.Customer;
import com.cartiva.backend.model.Order;
import com.cartiva.backend.model.OrderItem;
import com.cartiva.backend.model.OrderStatus;
import com.cartiva.backend.model.Product;
import com.cartiva.backend.model.Ticket;
import com.cartiva.backend.model.TicketStatus;
import com.cartiva.backend.repository.CustomerRepository;
import com.cartiva.backend.repository.OrderItemRepository;
import com.cartiva.backend.repository.OrderRepository;
import com.cartiva.backend.repository.ProductRepository;
import com.cartiva.backend.repository.TicketRepository;
import com.cartiva.backend.util.ReferenceNumberGenerator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Seeds demo products, a demo customer, and a few historical orders/tickets on
 * first boot so the storefront and support pages aren't empty on a fresh run.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final String IMG_PARAMS = "?w=600&q=80&auto=format&fit=crop";

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TicketRepository ticketRepository;

    public DataSeeder(ProductRepository productRepository, CustomerRepository customerRepository,
                       OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                       TicketRepository ticketRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            seedProducts();
        }
        if (customerRepository.count() == 0) {
            seedCustomer();
        }
        if (orderRepository.count() == 0) {
            seedOrdersAndTickets();
        }
    }

    private void seedProducts() {
        productRepository.saveAll(List.of(
            product("Running Shoes Pro", "Lightweight running shoe with responsive cushioning and breathable mesh — built for daily training miles.",
                "Sports", "299.00", "https://images.unsplash.com/photo-1542291026-7eec264c27ff" + IMG_PARAMS, 40),
            product("Nike Air Runner", "Everyday training shoe with a breathable mesh upper and cushioned midsole for all-day comfort.",
                "Sports", "120.00", "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519" + IMG_PARAMS, 25),
            product("Adidas Street Trainer", "Casual trainer with a durable rubber outsole, built for all-day wear on and off the street.",
                "Sports", "140.00", "https://images.unsplash.com/photo-1608231387042-66d1773070a5" + IMG_PARAMS, 30),
            product("Puma Sprint", "Lightweight sprint shoe with a low-profile sole, built for speed on the track.",
                "Sports", "95.00", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a" + IMG_PARAMS, 20),
            product("Wireless Headphones", "Over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
                "Electronics", "199.00", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" + IMG_PARAMS, 50),
            product("Smart Watch", "Fitness tracking smart watch with heart-rate monitoring, GPS, and a week-long battery.",
                "Electronics", "149.00", "https://images.unsplash.com/photo-1523275335684-37898b6baf30" + IMG_PARAMS, 35),
            product("Cotton T-Shirt", "Everyday crew-neck t-shirt in 100% breathable cotton. Machine washable, true to size.",
                "Fashion", "49.00", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab" + IMG_PARAMS, 100),
            product("Ceramic Mug Set", "Set of 4 handcrafted ceramic mugs, dishwasher and microwave safe.",
                "Home", "79.00", "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d" + IMG_PARAMS, 60)
        ));
    }

    private void seedCustomer() {
        Customer demoCustomer = new Customer();
        demoCustomer.setFirstName("Peter");
        demoCustomer.setLastName("Baines");
        demoCustomer.setEmail("peter.baines@example.com");
        demoCustomer.setPhone("+1-415-555-0142");
        customerRepository.save(demoCustomer);
    }

    /** Backdated demo orders (and a couple of resolved/in-progress tickets) for the demo customer. */
    private void seedOrdersAndTickets() {
        Customer customer = customerRepository.findAll().get(0);
        List<Product> products = productRepository.findAll();
        Product runningShoes = findByName(products, "Running Shoes Pro");
        Product nikeRunner = findByName(products, "Nike Air Runner");
        Product adidasTrainer = findByName(products, "Adidas Street Trainer");
        Product pumaSprint = findByName(products, "Puma Sprint");
        Product headphones = findByName(products, "Wireless Headphones");
        Product watch = findByName(products, "Smart Watch");
        Product tshirt = findByName(products, "Cotton T-Shirt");
        Product mugSet = findByName(products, "Ceramic Mug Set");

        Order order1 = seedOrder(customer, OrderStatus.DELIVERED, 12, List.of(
            lineOf(runningShoes, 1), lineOf(headphones, 1)
        ));
        Order order2 = seedOrder(customer, OrderStatus.IN_TRANSIT, 3, List.of(
            lineOf(watch, 1)
        ));
        seedOrder(customer, OrderStatus.SHIPPED, 1, List.of(
            lineOf(tshirt, 2)
        ));
        seedOrder(customer, OrderStatus.DELIVERED, 28, List.of(
            lineOf(nikeRunner, 1), lineOf(mugSet, 1)
        ));
        seedOrder(customer, OrderStatus.DELIVERED, 20, List.of(
            lineOf(adidasTrainer, 1)
        ));
        seedOrder(customer, OrderStatus.DELIVERED, 45, List.of(
            lineOf(mugSet, 2), lineOf(tshirt, 1)
        ));
        seedOrder(customer, OrderStatus.PACKED, 0, List.of(
            lineOf(pumaSprint, 2)
        ));

        seedTicket(customer, order1, "Delivery Issue",
            "Package took longer than expected",
            "My order was estimated for 2 days but took over a week to arrive.",
            "Delivery", "Medium", TicketStatus.RESOLVED,
            "Shipment was delayed at customs; delivered the next business day after release.",
            11);

        seedTicket(customer, order2, "Product Issue",
            "Watch band feels loose",
            "The strap on the smart watch doesn't stay clipped in place.",
            "Product Issue", "Medium", TicketStatus.IN_PROGRESS,
            null, 2);
    }

    private Order seedOrder(Customer customer, OrderStatus status, int daysAgo, List<OrderItem> lineItems) {
        Instant createdAt = Instant.now().minus(daysAgo, ChronoUnit.DAYS);
        BigDecimal subtotal = lineItems.stream()
            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setShippingAddress("123 Example Street, Dubai, UAE");
        order.setStatus(status);
        order.setTotalAmount(subtotal.add(new BigDecimal("20.00")));
        order.setCreatedAt(createdAt);
        order = orderRepository.save(order);
        order.setOrderNumber(ReferenceNumberGenerator.generate("ORD-", orderRepository::existsByOrderNumber));
        order = orderRepository.save(order);

        for (OrderItem item : lineItems) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(lineItems);
        return order;
    }

    private void seedTicket(Customer customer, Order order, String issueType, String subject, String description,
                             String category, String priority, TicketStatus status, String resolution, int daysAgo) {
        Instant createdAt = Instant.now().minus(daysAgo, ChronoUnit.DAYS);
        Ticket ticket = new Ticket();
        ticket.setCustomerId(customer.getId());
        ticket.setOrderId(order.getId());
        ticket.setIssueType(issueType);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);
        ticket.setResolution(resolution);
        ticket.setCreatedAt(createdAt);
        ticket.setUpdatedAt(createdAt);
        ticket = ticketRepository.save(ticket);
        ticket.setTicketNumber(ReferenceNumberGenerator.generate("TCK-", ticketRepository::existsByTicketNumber));
        ticketRepository.save(ticket);
    }

    private OrderItem lineOf(Product product, int quantity) {
        OrderItem item = new OrderItem();
        item.setProductId(product.getId());
        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        return item;
    }

    private Product findByName(List<Product> products, String name) {
        return products.stream().filter(p -> p.getName().equals(name)).findFirst()
            .orElseThrow(() -> new IllegalStateException("Seed product not found: " + name));
    }

    private Product product(String name, String description, String category, String price, String imageUrl, int inventory) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setCategory(category);
        p.setPrice(new BigDecimal(price));
        p.setImageUrl(imageUrl);
        p.setInventory(inventory);
        return p;
    }
}
