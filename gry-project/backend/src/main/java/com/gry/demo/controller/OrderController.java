package com.gry.demo.controller;

import com.gry.demo.dto.ApiResponse;
import com.gry.demo.dto.OrderDto;
import com.gry.demo.entity.Order;
import com.gry.demo.entity.OrderStatus;
import com.gry.demo.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderWithDetails(id);
        return ResponseEntity.ok(ApiResponse.success("获取订单信息成功", order));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(@Valid @RequestBody OrderDto orderDto) {
        Order createdOrder = orderService.createOrder(orderDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("订单创建成功", createdOrder));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(@PathVariable Long id, 
                                                               @RequestParam OrderStatus status) {
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("订单状态更新成功", updatedOrder));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("订单删除成功", null));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrdersByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderService.getOrdersByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("获取用户订单列表成功", orders));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;
        
        if (status != null) {
            orders = orderService.getOrdersByStatus(status, pageable);
        } else {
            orders = orderService.getAllOrders(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("获取订单列表成功", orders));
    }
    
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<ApiResponse<Long>> countUserOrdersByStatus(
            @PathVariable Long userId,
            @RequestParam OrderStatus status) {
        
        long count = orderService.countOrdersByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("获取用户订单统计成功", count));
    }
}