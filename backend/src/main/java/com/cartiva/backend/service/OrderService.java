package com.cartiva.backend.service;

import com.cartiva.backend.dto.CreateOrderRequest;
import com.cartiva.backend.dto.OrderItemRequest;
import com.cartiva.backend.dto.OrderItemResponse;
import com.cartiva.backend.dto.OrderResponse;
import com.cartiva.backend.exception.ResourceNotFoundException;
import com.cartiva.backend.model.Customer;
import com.cartiva.backend.model.Order;
import com.cartiva.backend.model.OrderItem;
import com.cartiva.backend.model.Product;
import com.cartiva.backend.repository.OrderItemRepository;
import com.cartiva.backend.repository.OrderRepository;
import com.cartiva.backend.util.ReferenceNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("20.00");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerService customerService;
    private final ProductService productService;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                         CustomerService customerService, ProductService productService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.customerService = customerService;
        this.productService = productService;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Customer customer = customerService.getCustomerOrThrow(request.customerId());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> items = new java.util.ArrayList<>();
        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productService.getProductOrThrow(itemRequest.productId());
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setProductId(product.getId());
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(product.getPrice());
            items.add(item);
        }

        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setShippingAddress(request.shippingAddress());
        order.setTotalAmount(subtotal.add(DELIVERY_FEE));
        order = orderRepository.save(order);
        order.setOrderNumber(ReferenceNumberGenerator.generate("ORD-", orderRepository::existsByOrderNumber));
        order = orderRepository.save(order);

        for (OrderItem item : items) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(items);

        return toResponse(order, items);
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = getOrderOrThrow(orderId);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return toResponse(order, items);
    }

    public List<OrderResponse> getOrdersForCustomer(Long customerId) {
        customerService.getCustomerOrThrow(customerId);
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
            .map(order -> toResponse(order, orderItemRepository.findByOrderId(order.getId())))
            .toList();
    }

    public Order getOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
            .map(item -> {
                var product = productService.getProduct(item.getProductId());
                return new OrderItemResponse(
                    item.getProductId(),
                    product.name(),
                    product.imageUrl(),
                    item.getQuantity(),
                    item.getUnitPrice()
                );
            })
            .toList();
        return OrderResponse.from(order, itemResponses);
    }
}
