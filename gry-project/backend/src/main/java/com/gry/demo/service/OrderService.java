package com.gry.demo.service;

import com.gry.demo.dto.OrderDto;
import com.gry.demo.dto.OrderItemDto;
import com.gry.demo.entity.*;
import com.gry.demo.exception.ResourceNotFoundException;
import com.gry.demo.repository.OrderRepository;
import com.gry.demo.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private NotificationService notificationService;
    
    public Order createOrder(OrderDto orderDto) {
        User user = userService.getUserById(orderDto.getUserId());
        
        Order order = new Order(user, orderDto.getTotalAmount());
        order = orderRepository.save(order);
        
        List<OrderItem> orderItems = new ArrayList<>();
        
        if (orderDto.getOrderItems() != null) {
            for (OrderItemDto itemDto : orderDto.getOrderItems()) {
                Product product = productService.getProductById(itemDto.getProductId());
                productService.updateStock(product.getId(), itemDto.getQuantity());
                
                OrderItem orderItem = new OrderItem(order, product, itemDto.getQuantity(), itemDto.getPrice());
                orderItems.add(orderItemRepository.save(orderItem));
            }
        }
        
        order.setOrderItems(orderItems);
        
        notificationService.sendOrderCreatedNotification(order);
        
        return order;
    }
    
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }
    
    @Transactional(readOnly = true)
    public Order getOrderWithDetails(Long id) {
        Order order = orderRepository.findOrderWithDetails(id);
        if (order == null) {
            throw new ResourceNotFoundException("Order", "id", id);
        }
        return order;
    }
    
    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByUserId(Long userId, Pageable pageable) {
        userService.getUserById(userId);
        return orderRepository.findOrdersByUserIdWithDetails(userId, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }
    
    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = getOrderById(id);
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order = orderRepository.save(order);
        
        notificationService.sendOrderStatusChangedNotification(order, oldStatus, newStatus);
        
        return order;
    }
    
    public void deleteOrder(Long id) {
        Order order = getOrderWithDetails(id);
        
        for (OrderItem item : order.getOrderItems()) {
            productService.restoreStock(item.getProduct().getId(), item.getQuantity());
        }
        
        orderRepository.delete(order);
        
        notificationService.sendOrderDeletedNotification(order);
    }
    
    @Transactional(readOnly = true)
    public long countOrdersByUserIdAndStatus(Long userId, OrderStatus status) {
        return orderRepository.countOrdersByUserIdAndStatus(userId, status);
    }
}