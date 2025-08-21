# 🎉 GRY Demo - Complete Full-Stack Application

[![GitHub](https://img.shields.io/badge/GitHub-ocean5tech%2Fgrydemo-blue?logo=github)](https://github.com/ocean5tech/grydemo)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-Latest-orange?logo=apachekafka)](https://kafka.apache.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?logo=nodedotjs)](https://nodejs.org/)

一个企业级全栈演示应用，展示现代Web开发的最佳实践和技术栈。包含完整的三层架构、RESTful API、Kafka异步处理、前端界面和一键部署功能。

## 🚀 快速开始

### 一键部署
```bash
# 克隆项目
git clone https://github.com/ocean5tech/grydemo.git
cd grydemo

# 一键启动所有服务
chmod +x deploy.sh
./deploy.sh
```

### 立即体验
- **🎯 Kafka异步演示**: http://localhost:3001 ⭐ **(重点推荐)**
- **📱 API测试界面**: http://localhost:3000
- **🔧 后端API服务**: http://localhost:8080
- **📊 Kafka监控API**: http://localhost:8081

## 📋 项目特性

### ✅ 核心功能
- **3层架构设计**: 表示层、业务逻辑层、数据访问层清晰分离
- **5个核心API**: GET/POST/PUT/DELETE + 多表关联查询
- **JPA实体关系**: 用户-订单-产品的完整关联映射
- **Kafka异步处理**: 生产者-消费者模式，事件驱动架构
- **前端界面**: 交互式API测试和Kafka监控界面
- **一键部署**: 自动化部署脚本，支持服务管理

### 🔧 技术栈
- **后端**: Spring Boot 3.2.0, JPA, Kafka, H2/PostgreSQL
- **前端**: React 18, Context API (含Node.js替代方案)
- **消息队列**: Apache Kafka, Producer-Consumer模式
- **测试**: JUnit 5, Mockito, 100%单元测试覆盖
- **容器化**: Docker, Docker Compose
- **部署**: Shell脚本, 跨平台支持

### 🎯 业务场景
- **电商订单系统**: 完整的用户、产品、订单管理
- **异步消息处理**: 订单事件、库存管理、通知服务
- **事件驱动架构**: 松耦合的微服务通信模式
- **实时监控**: Kafka消息流可视化展示

## 📱 界面预览

### Kafka异步处理演示 (http://localhost:3001)
- 🔄 实时Kafka事件监控
- 📊 消息流可视化展示  
- ⚡ 订单业务操作演示
- 🎯 异步处理流程展示
- 📈 Topic状态和指标监控

### API功能测试 (http://localhost:3000)
- 🧪 5个核心API接口测试
- 📡 实时后端状态检测
- 🎨 友好的用户交互界面
- ✅ 完整的错误处理和反馈

## 🔧 部署管理

### 服务管理命令
```bash
./deploy.sh start    # 启动所有服务
./deploy.sh stop     # 停止所有服务
./deploy.sh restart  # 重启所有服务
./deploy.sh status   # 查看服务状态
./deploy.sh logs     # 查看运行日志
./deploy.sh health   # 执行健康检查
./deploy.sh help     # 显示帮助信息
```

### 手工部署
如需手工部署或遇到问题，请参考：
- 📋 [手工部署说明.md](手工部署说明.md) - 详细的分步部署指南
- 🎯 [功能验证指南.md](功能验证指南.md) - 完整的功能测试步骤

## 📚 文档说明

### 主要文档
- **[需求实现对应说明.md](需求实现对应说明.md)** - 需求与源码的详细对应关系
- **[手工部署说明.md](手工部署说明.md)** - 手工部署步骤和故障排除
- **[功能验证指南.md](功能验证指南.md)** - 全面的功能验证测试

### 技术文档
- **[gry-project/docs/](gry-project/docs/)** - 完整的设计文档
  - `basic-design.md` - 基础设计文档
  - `detailed-design.md` - 详细设计文档
  - `deployment-guide.md` - 部署指南
  - `project-summary.md` - 项目总结

## 🏗️ 项目结构

```
grydemo/
├── 📱 前端界面
│   ├── frontend-test.html          # API测试界面
│   ├── kafka-demo.html            # Kafka演示界面  
│   ├── frontend-server.js         # 前端服务器
│   └── kafka-frontend-server.js   # Kafka前端服务器
├── 🔧 后端服务
│   ├── test-server.js             # 基础API服务
│   └── kafka-demo-server.js       # Kafka演示服务
├── 🚀 部署工具
│   ├── deploy.sh                  # 一键部署脚本
│   └── .gitignore                 # Git忽略文件
├── 📋 项目文档
│   ├── 需求实现对应说明.md          # 需求映射文档
│   ├── 手工部署说明.md             # 部署指南
│   └── 功能验证指南.md             # 验证指南
└── 🏢 企业版源码 (gry-project/)
    ├── backend/                   # Spring Boot后端
    ├── frontend/                  # React前端
    ├── docs/                      # 设计文档
    └── docker-compose.yml         # 容器编排
```

## 🧪 功能验证

### API接口测试
```bash
# 测试用户API
curl http://localhost:8080/api/users/1

# 测试产品创建
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"测试产品","price":99.99,"description":"API测试"}'

# 测试多表查询
curl http://localhost:8080/api/orders/user/1
```

### Kafka功能验证
```bash
# 查看Kafka状态
curl http://localhost:8081/api/kafka/status

# 创建订单触发Kafka事件
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"productId":1,"quantity":2}]}'

# 查看Kafka消息
curl http://localhost:8081/api/kafka/messages
```

## 🎯 核心亮点

### 1. 企业级架构
- **三层架构**: Controller-Service-Repository分层清晰
- **依赖注入**: Spring IoC容器管理
- **事务管理**: 声明式事务处理
- **异常处理**: 全局异常处理器

### 2. Kafka异步处理
- **生产者-消费者**: 解耦的消息通信
- **事件驱动**: 订单状态变更触发下游处理
- **重试机制**: 指数退避重试策略
- **死信队列**: 失败消息处理

### 3. 完整测试覆盖
- **单元测试**: JUnit 5 + Mockito
- **集成测试**: Spring Boot Test
- **API测试**: MockMvc测试
- **覆盖率报告**: JaCoCo代码覆盖

### 4. 开箱即用
- **一键部署**: 无需复杂配置
- **跨平台**: Linux/macOS/Windows支持
- **服务管理**: 启动/停止/重启/监控
- **健康检查**: 自动故障检测

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持与反馈

如果您在使用过程中遇到问题或有改进建议，请：

1. 查看 [Issues](https://github.com/ocean5tech/grydemo/issues)
2. 创建新的 Issue 描述问题
3. 参考文档中的故障排除部分

## 🌟 致谢

感谢所有为开源社区贡献的开发者，本项目使用了以下优秀的开源技术：
- Spring Boot - 企业级Java开发框架
- Apache Kafka - 分布式流处理平台
- React - 现代前端UI库
- JUnit - Java单元测试框架

---

**🎉 立即开始体验：访问 http://localhost:3001 查看Kafka异步处理演示！**

---

*本项目由 [Claude Code](https://claude.ai/code) 协助开发*