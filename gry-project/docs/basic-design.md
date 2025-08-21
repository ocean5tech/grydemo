# GRY Demo Project - Basic Design

## 业务逻辑定义 (Business Logic Definition)

### Core Business Domain: Order Management System
- **用户管理 (User Management)**: 用户注册、登录、信息管理
- **产品管理 (Product Management)**: 产品CRUD、库存管理
- **订单管理 (Order Management)**: 订单创建、状态更新、支付处理
- **通知系统 (Notification System)**: 异步消息处理

## Common Functions
- **数据验证 (Data Validation)**: 输入参数验证
- **异常处理 (Exception Handling)**: 统一异常处理机制
- **日志记录 (Logging)**: 业务操作审计
- **分页查询 (Pagination)**: 大数据集分页处理

## Business Functions
1. **用户注册登录 (User Registration/Login)**
2. **产品浏览查询 (Product Browsing/Search)**
3. **购物车管理 (Cart Management)**
4. **订单处理流程 (Order Processing)**
5. **库存管理 (Inventory Management)**

## Class定义 (Class Definitions)

### Entity Classes
- **User**: 用户实体
- **Product**: 产品实体
- **Order**: 订单实体
- **OrderItem**: 订单项实体

### Service Classes
- **UserService**: 用户业务逻辑
- **ProductService**: 产品业务逻辑
- **OrderService**: 订单业务逻辑
- **NotificationService**: 通知服务

### Controller Classes
- **UserController**: 用户API控制器
- **ProductController**: 产品API控制器
- **OrderController**: 订单API控制器

## API接口定义 (Interface Definitions)

### RESTful APIs
1. **GET /api/users/{id}** - 获取用户信息
2. **POST /api/products** - 创建产品
3. **PUT /api/products/{id}** - 更新产品
4. **DELETE /api/products/{id}** - 删除产品
5. **GET /api/orders/user/{userId}** - 多表关联查询用户订单

## Data Model & Table Structure

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Order_Items Table
```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## ER Diagram Relationships
- User 1:N Order (一个用户可以有多个订单)
- Order 1:N OrderItem (一个订单可以有多个订单项)
- Product 1:N OrderItem (一个产品可以在多个订单项中)

## 异常处理分析 (Exception Handling Analysis)
- **数据验证异常**: 400 Bad Request
- **资源不存在异常**: 404 Not Found
- **业务逻辑异常**: 422 Unprocessable Entity
- **系统异常**: 500 Internal Server Error

## 3层架构 (3-Tier Architecture)
1. **Presentation Layer**: React Frontend + REST Controllers
2. **Business Logic Layer**: Spring Services + Business Rules
3. **Data Access Layer**: JPA Repositories + H2/SQL Server Database