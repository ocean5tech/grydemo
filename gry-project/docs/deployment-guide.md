# 部署指南 (Deployment Guide)

## 部署前检查清单

### 环境验证
- [ ] Java 17+ 已安装
- [ ] Node.js 18+ 已安装  
- [ ] Docker & Docker Compose 已安装
- [ ] Maven 3.6+ 已安装
- [ ] 端口可用性检查 (8080, 3000, 5432, 9092)

### 配置检查
- [ ] 数据库连接配置正确
- [ ] Kafka 集群配置正确
- [ ] 环境变量设置完整
- [ ] 网络配置无冲突

## 1. 本地开发部署

### 1.1 后端服务启动

```bash
# 进入后端目录
cd backend

# 编译项目
mvn clean compile

# 运行单元测试
mvn test

# 启动应用 (使用H2内存数据库)
mvn spring-boot:run
```

**验证步骤:**
```bash
# 检查应用是否启动成功
curl http://localhost:8080/actuator/health

# 测试API接口
curl http://localhost:8080/api/users
```

### 1.2 前端服务启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

**验证步骤:**
- 浏览器访问 http://localhost:3000
- 检查页面加载正常
- 测试基本功能操作

### 1.3 Kafka 本地部署 (可选)

```bash
# 如需本地Kafka，使用Docker快速启动
docker run -d --name kafka-local \
  -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  confluentinc/cp-kafka:latest
```

## 2. Docker 容器化部署

### 2.1 完整服务栈部署

```bash
# 克隆项目
git clone <repository-url>
cd gry-project

# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 2.2 服务访问验证

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | React 用户界面 |
| 后端API | http://localhost:8080 | Spring Boot REST API |
| 数据库控制台 | http://localhost:8080/h2-console | H2 数据库管理 |
| Prometheus | http://localhost:9090 | 监控指标收集 |
| Grafana | http://localhost:3001 | 监控仪表板 |
| Kafka UI | http://localhost:8081 | Kafka 管理界面 |

### 2.3 Docker 服务管理

```bash
# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart backend

# 查看特定服务日志
docker-compose logs -f backend

# 进入容器调试
docker-compose exec backend bash

# 清理所有数据
docker-compose down -v
```

## 3. 生产环境部署

### 3.1 数据库配置

#### PostgreSQL 生产配置
```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://prod-db-server:5432/gry_demo
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: validate  # 生产环境不自动创建表
```

#### 数据库初始化脚本
```sql
-- 创建数据库
CREATE DATABASE gry_demo;
CREATE USER gry_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE gry_demo TO gry_user;

-- 创建表结构 (运行 schema.sql)
\i schema.sql

-- 插入初始数据 (运行 data.sql)
\i data.sql
```

### 3.2 Kafka 集群配置

#### 高可用Kafka集群
```yaml
version: '3.8'
services:
  kafka-1:
    image: confluentinc/cp-kafka:7.4.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zk-1:2181,zk-2:2181,zk-3:2181
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-1:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
  
  kafka-2:
    # 类似配置，BROKER_ID: 2
  
  kafka-3:
    # 类似配置，BROKER_ID: 3
```

#### 应用Kafka配置
```yaml
spring:
  kafka:
    bootstrap-servers: kafka-1:9092,kafka-2:9092,kafka-3:9092
    producer:
      acks: all
      retries: 3
      enable-idempotence: true
    consumer:
      group-id: gry-demo-prod
      enable-auto-commit: false
      auto-offset-reset: earliest
```

### 3.3 负载均衡配置

#### Nginx 配置
```nginx
upstream backend_servers {
    server backend-1:8080;
    server backend-2:8080;
    server backend-3:8080;
}

upstream frontend_servers {
    server frontend-1:80;
    server frontend-2:80;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3.4 SSL/HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 4. Kubernetes 部署 (高级)

### 4.1 Kubernetes 清单文件

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gry-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gry-backend
  template:
    metadata:
      labels:
        app: gry-backend
    spec:
      containers:
      - name: backend
        image: gry-demo/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

### 4.2 部署命令

```bash
# 应用配置
kubectl apply -f k8s/

# 查看部署状态
kubectl get deployments
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/gry-backend

# 扩容
kubectl scale deployment gry-backend --replicas=5
```

## 5. 监控和告警

### 5.1 Prometheus 配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'gry-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend-1:8080', 'backend-2:8080', 'backend-3:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka-exporter:9308']
```

### 5.2 Grafana 仪表板

导入预配置的仪表板:
- Spring Boot 应用监控
- JVM 指标监控
- PostgreSQL 数据库监控
- Kafka 集群监控

### 5.3 告警规则

```yaml
# alert-rules.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      - alert: DatabaseConnections
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.8
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool usage high"
```

## 6. 备份和恢复

### 6.1 数据库备份

```bash
# PostgreSQL 备份
pg_dump -h localhost -U gry_user -d gry_demo > backup_$(date +%Y%m%d_%H%M%S).sql

# 定时备份脚本
#!/bin/bash
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d gry_demo > $BACKUP_DIR/gry_demo_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 6.2 应用配置备份

```bash
# 导出Kubernetes配置
kubectl get all -o yaml > k8s-backup.yaml

# 导出ConfigMaps和Secrets
kubectl get configmaps -o yaml > configmaps-backup.yaml
kubectl get secrets -o yaml > secrets-backup.yaml
```

## 7. 性能调优

### 7.1 JVM 参数优化

```bash
# 生产环境 JVM 参数
JAVA_OPTS="-Xms512m -Xmx2g \
           -XX:+UseG1GC \
           -XX:MaxGCPauseMillis=200 \
           -XX:+UseStringDeduplication \
           -XX:+PrintGC \
           -XX:+PrintGCDetails \
           -Dspring.profiles.active=prod"
```

### 7.2 数据库性能调优

```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 查询优化
EXPLAIN ANALYZE SELECT o.*, u.username 
FROM orders o 
JOIN users u ON o.user_id = u.id 
WHERE o.status = 'PENDING';
```

### 7.3 Kafka 性能调优

```properties
# Producer 优化
batch.size=32768
linger.ms=10
compression.type=snappy
buffer.memory=67108864

# Consumer 优化
fetch.min.bytes=50000
fetch.max.wait.ms=500
max.partition.fetch.bytes=1048576
```

## 8. 故障排除

### 8.1 常见问题诊断

#### 应用启动失败
```bash
# 检查日志
docker-compose logs backend

# 检查端口占用
netstat -tuln | grep 8080

# 检查资源使用
docker stats
```

#### 数据库连接问题
```bash
# 测试数据库连接
psql -h localhost -U gry_user -d gry_demo

# 检查连接池状态
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
```

#### Kafka 连接问题
```bash
# 检查 Kafka 主题
docker exec -it kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# 检查消费者组
docker exec -it kafka kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

### 8.2 性能问题排查

```bash
# JVM 堆转储分析
jcmd <pid> GC.run_finalization
jcmd <pid> VM.gc

# 线程转储分析
jstack <pid> > thread-dump.txt

# 网络连接检查
ss -tuln | grep :8080
```

## 9. 安全加固

### 9.1 应用安全配置

```yaml
# 安全相关配置
spring:
  security:
    headers:
      frame-options: DENY
      content-type-options: nosniff
      xss-protection: 1; mode=block
    csrf:
      enabled: true
  datasource:
    hikari:
      leak-detection-threshold: 60000
```

### 9.2 容器安全

```dockerfile
# 使用非root用户运行
FROM openjdk:17-jdk-slim
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring
```

### 9.3 网络安全

```yaml
# Docker网络隔离
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  database:
    driver: bridge
    internal: true  # 仅内部访问
```

## 10. 部署检查清单

### 10.1 部署前检查
- [ ] 代码已通过所有测试
- [ ] 数据库迁移脚本准备就绪
- [ ] 配置文件已更新为生产环境
- [ ] SSL证书已配置
- [ ] 备份策略已实施
- [ ] 监控告警已配置

### 10.2 部署后验证
- [ ] 所有服务正常启动
- [ ] 健康检查通过
- [ ] API接口响应正常
- [ ] 前端页面加载正常
- [ ] 数据库连接正常
- [ ] Kafka消息处理正常
- [ ] 监控指标正常

### 10.3 回滚计划
- [ ] 数据库回滚脚本准备
- [ ] 应用版本回滚步骤明确
- [ ] 回滚触发条件定义
- [ ] 回滚责任人指定

---

**📋 这个部署指南覆盖了从开发环境到生产环境的完整部署流程，确保应用能够稳定、安全地运行在各种环境中。**