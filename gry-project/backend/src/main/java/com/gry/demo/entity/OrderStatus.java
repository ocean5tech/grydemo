package com.gry.demo.entity;

public enum OrderStatus {
    PENDING("待处理"),
    PROCESSING("处理中"),
    SHIPPED("已发货"),
    DELIVERED("已送达"),
    CANCELLED("已取消");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}