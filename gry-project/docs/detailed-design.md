# GRY Demo Project - Detailed Design

## Code定义 (Code Definitions)

### Response Codes
```java
public enum ResponseCode {
    SUCCESS("0000", "操作成功"),
    INVALID_PARAMETER("1001", "参数无效"),
    USER_NOT_FOUND("2001", "用户不存在"),
    PRODUCT_NOT_FOUND("3001", "产品不存在"),
    INSUFFICIENT_STOCK("3002", "库存不足"),
    ORDER_NOT_FOUND("4001", "订单不存在"),
    SYSTEM_ERROR("9999", "系统错误");
}
```

### Status Codes
```java
public enum OrderStatus {
    PENDING("待处理"),
    PROCESSING("处理中"),
    SHIPPED("已发货"),
    DELIVERED("已送达"),
    CANCELLED("已取消");
}
```

## Message一览 (Message List)

### API Response Messages
```properties
# Success Messages
user.created.success=用户创建成功
product.updated.success=产品更新成功
order.deleted.success=订单删除成功

# Error Messages
validation.username.required=用户名不能为空
validation.email.invalid=邮箱格式无效
validation.price.positive=价格必须为正数
business.stock.insufficient=库存不足，当前库存: {0}

# Kafka Messages
order.status.changed=订单状态已变更: 订单ID {0}, 新状态 {1}
```

## Config配置

### Application Properties
```yaml
# Database Configuration
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

# Kafka Configuration
spring:
  kafka:
    producer:
      retries: 3
      batch-size: 16384
      buffer-memory: 33554432
    consumer:
      enable-auto-commit: false
      auto-offset-reset: earliest
```

### Profile Configurations
- **dev**: H2内存数据库，详细日志
- **test**: 测试专用配置，嵌入式Kafka
- **prod**: SQL Server数据库，生产级别配置

## POM定义 (Maven Dependencies)

### Core Dependencies
- **spring-boot-starter-web**: Web应用框架
- **spring-boot-starter-data-jpa**: JPA数据访问
- **spring-boot-starter-validation**: 数据验证
- **spring-kafka**: Kafka集成

### Test Dependencies
- **spring-boot-starter-test**: 测试框架
- **testcontainers**: 集成测试容器
- **jacoco**: 代码覆盖率

## Resources配置

### Database Scripts
```sql
-- data.sql (测试数据)
INSERT INTO users (username, email, password) VALUES 
('testuser1', 'test1@example.com', 'password123'),
('testuser2', 'test2@example.com', 'password456');

INSERT INTO products (name, description, price, stock_quantity) VALUES 
('笔记本电脑', '高性能办公笔记本', 5999.00, 50),
('无线鼠标', '蓝牙无线鼠标', 199.00, 100);
```

### Logging Configuration
```yaml
logging:
  level:
    com.gry.demo: DEBUG
    org.springframework.web: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## API Endpoint详细定义

### User API
```
GET    /api/users/{id}           # 获取用户信息
POST   /api/users               # 创建用户
PUT    /api/users/{id}          # 更新用户信息
DELETE /api/users/{id}          # 删除用户
GET    /api/users               # 分页查询用户列表
```

### Product API
```
GET    /api/products/{id}       # 获取产品详情
POST   /api/products            # 创建产品
PUT    /api/products/{id}       # 更新产品
DELETE /api/products/{id}       # 删除产品
GET    /api/products            # 分页查询产品列表
```

### Order API
```
GET    /api/orders/{id}         # 获取订单详情
POST   /api/orders              # 创建订单
PUT    /api/orders/{id}/status  # 更新订单状态
DELETE /api/orders/{id}         # 删除订单
GET    /api/orders/user/{userId} # 查询用户订单(多表关联)
```

## Kafka Topic定义

### Topics
- **order-events**: 订单状态变更事件
- **notification-events**: 通知事件
- **inventory-events**: 库存变更事件

### Message Schema
```json
{
  "orderId": "123",
  "userId": "456",
  "eventType": "ORDER_STATUS_CHANGED",
  "oldStatus": "PENDING",
  "newStatus": "PROCESSING",
  "timestamp": "2024-01-01T10:00:00Z"
}
```