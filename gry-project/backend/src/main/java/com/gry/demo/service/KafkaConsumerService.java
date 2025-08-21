package com.gry.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class KafkaConsumerService {
    
    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);
    
    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 1000, multiplier = 2.0),
        topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE
    )
    @KafkaListener(topics = "order-events", groupId = "order-processing-group")
    public void handleOrderEvents(@Payload Map<String, Object> orderEvent,
                                 @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                 @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                                 @Header(KafkaHeaders.OFFSET) long offset,
                                 Acknowledgment acknowledgment) {
        try {
            logger.info("Received order event from topic: {}, partition: {}, offset: {}", topic, partition, offset);
            logger.info("Order event: {}", orderEvent);
            
            String eventType = (String) orderEvent.get("eventType");
            Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
            
            switch (eventType) {
                case "ORDER_CREATED":
                    processOrderCreated(orderEvent);
                    break;
                case "ORDER_STATUS_CHANGED":
                    processOrderStatusChanged(orderEvent);
                    break;
                case "ORDER_DELETED":
                    processOrderDeleted(orderEvent);
                    break;
                default:
                    logger.warn("Unknown event type: {}", eventType);
            }
            
            acknowledgment.acknowledge();
            logger.info("Successfully processed order event for order: {}", orderId);
            
        } catch (Exception e) {
            logger.error("Error processing order event: {}", orderEvent, e);
            throw e;
        }
    }
    
    private void processOrderCreated(Map<String, Object> orderEvent) {
        logger.info("Processing order created event: {}", orderEvent);
    }
    
    private void processOrderStatusChanged(Map<String, Object> orderEvent) {
        String oldStatus = (String) orderEvent.get("oldStatus");
        String newStatus = (String) orderEvent.get("newStatus");
        logger.info("Processing order status change from {} to {}", oldStatus, newStatus);
        
        if ("DELIVERED".equals(newStatus)) {
            logger.info("Order delivered, sending completion notification");
        }
    }
    
    private void processOrderDeleted(Map<String, Object> orderEvent) {
        logger.info("Processing order deleted event: {}", orderEvent);
    }
    
    @KafkaListener(topics = "notification-events", groupId = "notification-group")
    public void handleNotificationEvents(@Payload Map<String, Object> notificationEvent,
                                       Acknowledgment acknowledgment) {
        try {
            logger.info("Received notification event: {}", notificationEvent);
            
            acknowledgment.acknowledge();
            logger.info("Successfully processed notification event");
            
        } catch (Exception e) {
            logger.error("Error processing notification event: {}", notificationEvent, e);
            throw e;
        }
    }
    
    @KafkaListener(topics = "inventory-events", groupId = "inventory-group")
    public void handleInventoryEvents(@Payload Map<String, Object> inventoryEvent,
                                    Acknowledgment acknowledgment) {
        try {
            logger.info("Received inventory event: {}", inventoryEvent);
            
            acknowledgment.acknowledge();
            logger.info("Successfully processed inventory event");
            
        } catch (Exception e) {
            logger.error("Error processing inventory event: {}", inventoryEvent, e);
            throw e;
        }
    }
}