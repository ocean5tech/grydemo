package com.gry.demo.service;

import com.gry.demo.entity.Order;
import com.gry.demo.entity.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String ORDER_EVENTS_TOPIC = "order-events";
    
    public void sendOrderCreatedNotification(Order order) {
        Map<String, Object> event = createOrderEvent(order, "ORDER_CREATED", null, order.getStatus());
        sendNotification(ORDER_EVENTS_TOPIC, event);
        logger.info("Order created notification sent for order: {}", order.getId());
    }
    
    public void sendOrderStatusChangedNotification(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        Map<String, Object> event = createOrderEvent(order, "ORDER_STATUS_CHANGED", oldStatus, newStatus);
        sendNotification(ORDER_EVENTS_TOPIC, event);
        logger.info("Order status changed notification sent for order: {} from {} to {}", 
                   order.getId(), oldStatus, newStatus);
    }
    
    public void sendOrderDeletedNotification(Order order) {
        Map<String, Object> event = createOrderEvent(order, "ORDER_DELETED", order.getStatus(), null);
        sendNotification(ORDER_EVENTS_TOPIC, event);
        logger.info("Order deleted notification sent for order: {}", order.getId());
    }
    
    private Map<String, Object> createOrderEvent(Order order, String eventType, 
                                                OrderStatus oldStatus, OrderStatus newStatus) {
        Map<String, Object> event = new HashMap<>();
        event.put("orderId", order.getId());
        event.put("userId", order.getUser().getId());
        event.put("eventType", eventType);
        event.put("oldStatus", oldStatus != null ? oldStatus.name() : null);
        event.put("newStatus", newStatus != null ? newStatus.name() : null);
        event.put("timestamp", LocalDateTime.now().toString());
        event.put("totalAmount", order.getTotalAmount());
        return event;
    }
    
    private void sendNotification(String topic, Object message) {
        try {
            kafkaTemplate.send(topic, message);
        } catch (Exception e) {
            logger.error("Failed to send notification to topic: {}", topic, e);
        }
    }
}