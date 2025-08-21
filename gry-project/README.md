# GRY Demo - 全栈演示项目

一个完整的3层架构全栈应用，展示现代企业级开发实践和技术栈。

## 项目概述

本项目是一个订单管理系统，实现了用户管理、产品管理、订单处理等核心业务功能，并集成了异步消息处理、监控等企业级特性。

### 技术栈

**后端 (Backend)**
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Kafka
- H2/PostgreSQL 数据库
- Maven 构建工具
- JUnit 5 + Mockito 测试

**前端 (Frontend)**
- React 18
- React Router DOM
- Context API 状态管理
- Axios HTTP 客户端
- CSS3 响应式设计

**基础设施**
- Docker & Docker Compose
- Kafka & Zookeeper
- Prometheus + Grafana 监控
- Nginx 反向代理

## 系统架构

### 3层架构设计
1. **表现层 (Presentation Layer)**: React 前端 + REST API 控制器
2. **业务逻辑层 (Business Logic Layer)**: Spring Service 层
3. **数据访问层 (Data Access Layer)**: JPA Repository + 数据库

### 核心功能模块
- **用户管理**: 用户CRUD、分页查询、数据验证
- **产品管理**: 产品CRUD、库存管理、搜索过滤
- **订单管理**: 订单创建、状态管理、多表关联查询
- **异步处理**: Kafka 消息队列、事件驱动架构
- **监控系统**: 健康检查、指标收集、日志聚合

## API 接口说明

### 5个核心 RESTful APIs

1. **GET /api/users/{id}** - 获取用户信息
2. **POST /api/products** - 创建产品
3. **PUT /api/products/{id}** - 更新产品
4. **DELETE /api/products/{id}** - 删除产品
5. **GET /api/orders/user/{userId}** - 多表关联查询用户订单

### 完整 API 列表

#### 用户管理 API
```
GET    /api/users/{id}           # 获取用户详情
POST   /api/users               # 创建用户
PUT    /api/users/{id}          # 更新用户
DELETE /api/users/{id}          # 删除用户
GET    /api/users               # 分页查询用户列表
```

#### 产品管理 API
```
GET    /api/products/{id}       # 获取产品详情
POST   /api/products            # 创建产品
PUT    /api/products/{id}       # 更新产品
DELETE /api/products/{id}       # 删除产品
GET    /api/products            # 分页查询产品列表
GET    /api/products/available  # 获取可用产品
PUT    /api/products/{id}/stock # 更新库存
```

#### 订单管理 API
```
GET    /api/orders/{id}         # 获取订单详情
POST   /api/orders              # 创建订单
PUT    /api/orders/{id}/status  # 更新订单状态
DELETE /api/orders/{id}         # 删除订单
GET    /api/orders              # 分页查询订单列表
GET    /api/orders/user/{userId} # 查询用户订单(多表关联)
```

## 快速开始

### 环境要求
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.6+

### 1. 本地开发环境

#### 后端启动
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### 前端启动
```bash
cd frontend
npm install
npm start
```

### 2. Docker 容器化部署

#### 构建并启动所有服务
```bash
docker-compose up -d
```

#### 服务访问地址
- 前端应用: http://localhost:3000
- 后端API: http://localhost:8080
- H2数据库控制台: http://localhost:8080/h2-console
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

#### 停止服务
```bash
docker-compose down
```

#### 查看日志
```bash
docker-compose logs -f [service-name]
```

### 3. 生产环境部署

#### 使用 PostgreSQL 数据库
```bash
# 修改 application-prod.yml 配置
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:postgresql://localhost:5432/gry_demo
    username: your_username
    password: your_password
```

#### Kafka 集群配置
```yaml
spring:
  kafka:
    bootstrap-servers: kafka-cluster:9092
    producer:
      acks: all
      retries: 3
    consumer:
      group-id: gry-demo-prod-group
```

## 数据库设计

### ER 图关系
- User 1:N Order (一个用户可以有多个订单)
- Order 1:N OrderItem (一个订单可以有多个订单项)
- Product 1:N OrderItem (一个产品可以在多个订单项中)

### 表结构

#### users 表
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### products 表
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### orders 表
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### order_items 表
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

## 测试

### 单元测试
```bash
# 后端测试
cd backend
mvn test

# 前端测试
cd frontend
npm test
```

### 集成测试
```bash
# 使用 TestContainers
mvn verify -P integration-tests
```

### 测试覆盖率
- 目标: 100% 代码覆盖率
- 工具: JaCoCo (后端) + Jest (前端)

```bash
# 生成覆盖率报告
mvn jacoco:report
npm run test:coverage
```

## Kafka 消息处理

### Topic 配置
- **order-events**: 订单状态变更事件
- **notification-events**: 通知事件
- **inventory-events**: 库存变更事件

### 消息示例
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

### 异常处理
- 重试机制: 3次重试，指数退避
- 死信队列: 失败消息转存
- 幂等性保证: 消息去重处理

## 监控和运维

### 健康检查
- 应用健康状态: `/actuator/health`
- 数据库连接检查
- Kafka 连接状态
- 外部服务依赖检查

### 指标监控
- JVM 内存使用率
- API 响应时间
- 请求成功率
- 数据库连接池状态
- Kafka 消费延迟

### 日志管理
- 结构化日志格式
- 不同级别日志配置
- 敏感信息脱敏
- 日志聚合和搜索

## 安全考虑

### 数据验证
- 输入参数校验
- XSS 攻击防护
- SQL 注入防护
- CSRF 保护

### 认证授权
- JWT Token 认证 (可扩展)
- 角色权限控制 (可扩展)
- API 访问限流 (可扩展)

## 性能优化

### 数据库优化
- 索引优化
- 查询性能调优
- 连接池配置
- 读写分离 (可扩展)

### 缓存策略
- Redis 缓存 (可扩展)
- 查询结果缓存
- 静态资源缓存

### 前端优化
- 代码分割 (Code Splitting)
- 懒加载 (Lazy Loading)
- 静态资源压缩
- CDN 加速 (可扩展)

## 开发规范

### 代码规范
- Java: Google Java Style Guide
- JavaScript: ESLint + Prettier
- 统一的代码格式化
- Git 提交信息规范

### 分支管理
- Git Flow 工作流
- 功能分支开发
- Code Review 流程
- 自动化 CI/CD (可扩展)

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tuln | grep :8080
   lsof -i :8080
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose logs postgres
   ```

3. **Kafka 连接问题**
   ```bash
   # 检查 Kafka 服务
   docker-compose logs kafka
   ```

4. **前端构建失败**
   ```bash
   # 清理依赖重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

### 日志查看
```bash
# 应用日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 系统日志
tail -f /var/log/app.log
```

## 扩展功能

### 已实现
- ✅ 3层架构设计
- ✅ RESTful API 开发
- ✅ JPA 数据持久化
- ✅ Kafka 异步处理
- ✅ React 前端界面
- ✅ Docker 容器化
- ✅ 单元测试覆盖
- ✅ 监控和健康检查

### 可扩展
- 🔄 用户认证授权 (JWT/OAuth2)
- 🔄 API 网关集成
- 🔄 微服务架构拆分
- 🔄 Redis 缓存集成
- 🔄 Elasticsearch 搜索
- 🔄 CI/CD 流水线
- 🔄 Kubernetes 部署
- 🔄 分布式链路追踪

## 联系方式

- 项目作者: GRY Team
- 技术栈: Spring Boot + React + Kafka + Docker
- 部署环境: 支持 Windows/Linux/Mac 跨平台部署

---

**🎉 这是一个开箱即用的全栈演示应用，包含完整的企业级开发实践和最佳实践！**