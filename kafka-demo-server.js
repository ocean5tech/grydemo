const http = require('http');
const EventEmitter = require('events');

// 模拟Kafka事件系统
class MockKafka extends EventEmitter {
    constructor() {
        super();
        this.topics = new Map();
        this.consumers = new Map();
        this.messageHistory = [];
    }
    
    // 创建Topic
    createTopic(topicName) {
        if (!this.topics.has(topicName)) {
            this.topics.set(topicName, []);
            console.log(`📋 Kafka Topic创建: ${topicName}`);
        }
    }
    
    // 发送消息
    async send(topic, message) {
        this.createTopic(topic);
        
        const kafkaMessage = {
            topic,
            partition: 0,
            offset: this.topics.get(topic).length,
            timestamp: new Date().toISOString(),
            key: null,
            value: message
        };
        
        this.topics.get(topic).push(kafkaMessage);
        this.messageHistory.push(kafkaMessage);
        
        console.log(`📤 Kafka Producer发送消息到 ${topic}:`, JSON.stringify(message, null, 2));
        
        // 触发消费者处理
        this.emit('message', kafkaMessage);
        
        return kafkaMessage;
    }
    
    // 消费消息
    subscribe(topic, groupId, handler) {
        this.createTopic(topic);
        
        const consumerKey = `${topic}-${groupId}`;
        this.consumers.set(consumerKey, { topic, groupId, handler });
        
        console.log(`📥 Kafka Consumer订阅: ${topic} (group: ${groupId})`);
        
        this.on('message', (kafkaMessage) => {
            if (kafkaMessage.topic === topic) {
                setTimeout(() => {
                    try {
                        console.log(`🔄 处理消息: Topic=${topic}, Partition=${kafkaMessage.partition}, Offset=${kafkaMessage.offset}`);
                        handler(kafkaMessage);
                        console.log(`✅ 消息处理成功: ${topic}`);
                    } catch (error) {
                        console.error(`❌ 消息处理失败: ${topic}`, error);
                        // 模拟重试机制
                        this.retryMessage(kafkaMessage, handler, 1);
                    }
                }, 100); // 模拟异步处理延迟
            }
        });
    }
    
    // 重试机制
    retryMessage(message, handler, attempt) {
        const maxRetries = 3;
        if (attempt <= maxRetries) {
            console.log(`🔄 重试消息处理 (第${attempt}次): Topic=${message.topic}`);
            setTimeout(() => {
                try {
                    handler(message);
                    console.log(`✅ 重试成功: ${message.topic}`);
                } catch (error) {
                    console.error(`❌ 重试失败 (第${attempt}次): ${message.topic}`, error);
                    if (attempt < maxRetries) {
                        this.retryMessage(message, handler, attempt + 1);
                    } else {
                        console.error(`💀 达到最大重试次数，消息进入死信队列: ${message.topic}`);
                    }
                }
            }, 1000 * attempt); // 指数退避
        }
    }
    
    // 获取Topic信息
    getTopicInfo(topic) {
        return {
            topic,
            messageCount: this.topics.get(topic)?.length || 0,
            messages: this.topics.get(topic) || []
        };
    }
    
    // 获取所有消息历史
    getAllMessages() {
        return this.messageHistory;
    }
}

// 全局Kafka实例
const kafka = new MockKafka();

// 初始化Kafka Topics
kafka.createTopic('order-events');
kafka.createTopic('notification-events');
kafka.createTopic('inventory-events');

// 设置消费者
kafka.subscribe('order-events', 'order-processing-group', (message) => {
    const event = message.value;
    const eventType = event.eventType;
    
    console.log(`🎯 订单事件处理: ${eventType}`);
    
    switch (eventType) {
        case 'ORDER_CREATED':
            processOrderCreated(event);
            break;
        case 'ORDER_STATUS_CHANGED':
            processOrderStatusChanged(event);
            break;
        case 'ORDER_DELETED':
            processOrderDeleted(event);
            break;
        default:
            console.warn(`⚠️ 未知事件类型: ${eventType}`);
    }
});

// 业务处理函数
function processOrderCreated(event) {
    console.log(`📦 处理订单创建事件: 订单ID=${event.orderId}, 用户ID=${event.userId}, 金额=${event.totalAmount}`);
    
    // 模拟发送库存事件
    kafka.send('inventory-events', {
        eventType: 'STOCK_RESERVED',
        orderId: event.orderId,
        timestamp: new Date().toISOString()
    });
    
    // 模拟发送通知事件
    kafka.send('notification-events', {
        eventType: 'ORDER_CONFIRMATION_EMAIL',
        userId: event.userId,
        orderId: event.orderId,
        timestamp: new Date().toISOString()
    });
}

function processOrderStatusChanged(event) {
    console.log(`🔄 处理订单状态变更: 订单ID=${event.orderId}, ${event.oldStatus} → ${event.newStatus}`);
    
    if (event.newStatus === 'DELIVERED') {
        console.log(`🎉 订单已送达，触发完成流程`);
        
        // 发送完成通知
        kafka.send('notification-events', {
            eventType: 'ORDER_DELIVERED_NOTIFICATION',
            userId: event.userId,
            orderId: event.orderId,
            timestamp: new Date().toISOString()
        });
    }
}

function processOrderDeleted(event) {
    console.log(`🗑️ 处理订单删除事件: 订单ID=${event.orderId}`);
    
    // 释放库存
    kafka.send('inventory-events', {
        eventType: 'STOCK_RELEASED',
        orderId: event.orderId,
        timestamp: new Date().toISOString()
    });
}

// 设置其他消费者
kafka.subscribe('notification-events', 'notification-group', (message) => {
    const event = message.value;
    console.log(`📧 通知事件处理: ${event.eventType}`);
});

kafka.subscribe('inventory-events', 'inventory-group', (message) => {
    const event = message.value;
    console.log(`📦 库存事件处理: ${event.eventType}`);
});

// 模拟数据
const users = [
    { id: 1, username: 'testuser1', email: 'test1@example.com', createdAt: new Date().toISOString() },
    { id: 2, username: 'testuser2', email: 'test2@example.com', createdAt: new Date().toISOString() }
];

const products = [
    { id: 1, name: '笔记本电脑', description: '高性能办公笔记本', price: 5999.00, stockQuantity: 50 },
    { id: 2, name: '无线鼠标', description: '蓝牙无线鼠标', price: 199.00, stockQuantity: 100 }
];

let orders = [
    { 
        id: 1, 
        user: users[0], 
        totalAmount: 6198.00, 
        status: 'PENDING', 
        createdAt: new Date().toISOString(),
        orderItems: [
            { id: 1, product: products[0], quantity: 1, price: 5999.00 }
        ]
    }
];

// API响应格式
function createApiResponse(code = '0000', message = '操作成功', data = null) {
    return {
        code,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}

// HTTP服务器
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;
    
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    console.log(`${method} ${pathname}`);
    
    try {
        // 健康检查
        if (pathname === '/actuator/health') {
            res.writeHead(200);
            res.end(JSON.stringify({ 
                status: 'UP', 
                components: { 
                    db: { status: 'UP' },
                    kafka: { 
                        status: 'UP',
                        topics: Array.from(kafka.topics.keys()),
                        totalMessages: kafka.messageHistory.length
                    }
                } 
            }));
            return;
        }
        
        // Kafka状态API
        if (pathname === '/api/kafka/status' && method === 'GET') {
            const status = {
                topics: Object.fromEntries(
                    Array.from(kafka.topics.keys()).map(topic => [
                        topic, 
                        kafka.getTopicInfo(topic)
                    ])
                ),
                totalMessages: kafka.messageHistory.length,
                consumers: Array.from(kafka.consumers.keys())
            };
            
            res.writeHead(200);
            res.end(JSON.stringify(createApiResponse('0000', 'Kafka状态获取成功', status)));
            return;
        }
        
        // 获取所有Kafka消息
        if (pathname === '/api/kafka/messages' && method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify(createApiResponse('0000', '获取Kafka消息成功', kafka.getAllMessages())));
            return;
        }
        
        // 创建订单 - 触发Kafka事件
        if (pathname === '/api/orders' && method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                try {
                    const orderData = JSON.parse(body);
                    
                    const newOrder = {
                        id: orders.length + 1,
                        user: users.find(u => u.id === orderData.userId),
                        totalAmount: orderData.totalAmount,
                        status: 'PENDING',
                        createdAt: new Date().toISOString(),
                        orderItems: orderData.orderItems || []
                    };
                    
                    orders.push(newOrder);
                    
                    // 🚀 发送Kafka订单创建事件
                    await kafka.send('order-events', {
                        orderId: newOrder.id,
                        userId: newOrder.user.id,
                        eventType: 'ORDER_CREATED',
                        oldStatus: null,
                        newStatus: newOrder.status,
                        timestamp: new Date().toISOString(),
                        totalAmount: newOrder.totalAmount
                    });
                    
                    res.writeHead(201);
                    res.end(JSON.stringify(createApiResponse('0000', '订单创建成功，Kafka事件已发送', newOrder)));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify(createApiResponse('1001', '请求数据格式错误')));
                }
            });
            return;
        }
        
        // 更新订单状态 - 触发Kafka事件
        if (pathname.match(/^\/api\/orders\/\d+\/status$/) && method === 'PUT') {
            const orderId = parseInt(pathname.split('/')[3]);
            const newStatus = url.searchParams.get('status');
            
            const order = orders.find(o => o.id === orderId);
            if (!order) {
                res.writeHead(404);
                res.end(JSON.stringify(createApiResponse('4001', '订单不存在')));
                return;
            }
            
            const oldStatus = order.status;
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            
            // 🚀 发送Kafka订单状态变更事件
            await kafka.send('order-events', {
                orderId: order.id,
                userId: order.user.id,
                eventType: 'ORDER_STATUS_CHANGED',
                oldStatus: oldStatus,
                newStatus: newStatus,
                timestamp: new Date().toISOString(),
                totalAmount: order.totalAmount
            });
            
            res.writeHead(200);
            res.end(JSON.stringify(createApiResponse('0000', '订单状态更新成功，Kafka事件已发送', order)));
            return;
        }
        
        // 删除订单 - 触发Kafka事件
        if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'DELETE') {
            const orderId = parseInt(pathname.split('/')[3]);
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify(createApiResponse('4001', '订单不存在')));
                return;
            }
            
            const order = orders[orderIndex];
            orders.splice(orderIndex, 1);
            
            // 🚀 发送Kafka订单删除事件
            await kafka.send('order-events', {
                orderId: order.id,
                userId: order.user.id,
                eventType: 'ORDER_DELETED',
                oldStatus: order.status,
                newStatus: null,
                timestamp: new Date().toISOString(),
                totalAmount: order.totalAmount
            });
            
            res.writeHead(200);
            res.end(JSON.stringify(createApiResponse('0000', '订单删除成功，Kafka事件已发送', null)));
            return;
        }
        
        // 获取订单列表
        if (pathname === '/api/orders' && method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify(createApiResponse('0000', '获取订单列表成功', {
                content: orders,
                totalElements: orders.length
            })));
            return;
        }
        
        // 模拟批量处理订单状态
        if (pathname === '/api/orders/batch-update' && method === 'POST') {
            console.log(`🔄 批量更新订单状态，演示Kafka并发处理...`);
            
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                const oldStatus = order.status;
                
                order.status = newStatus;
                order.updatedAt = new Date().toISOString();
                
                // 并发发送多个Kafka事件
                kafka.send('order-events', {
                    orderId: order.id,
                    userId: order.user.id,
                    eventType: 'ORDER_STATUS_CHANGED',
                    oldStatus: oldStatus,
                    newStatus: newStatus,
                    timestamp: new Date().toISOString(),
                    totalAmount: order.totalAmount
                });
                
                // 模拟间隔
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            res.writeHead(200);
            res.end(JSON.stringify(createApiResponse('0000', '批量更新完成，Kafka事件已发送', orders)));
            return;
        }
        
        // 404
        res.writeHead(404);
        res.end(JSON.stringify(createApiResponse('404', 'API接口不存在')));
        
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500);
        res.end(JSON.stringify(createApiResponse('9999', '系统错误')));
    }
});

const PORT = 8081;

server.listen(PORT, () => {
    console.log(`🚀 GRY Demo - Kafka演示服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/actuator/health`);
    console.log(`\n📋 Kafka相关API:`);
    console.log(`   GET  /api/kafka/status     - 获取Kafka状态`);
    console.log(`   GET  /api/kafka/messages   - 获取所有Kafka消息`);
    console.log(`   POST /api/orders           - 创建订单(触发Kafka事件)`);
    console.log(`   PUT  /api/orders/{id}/status - 更新订单状态(触发Kafka事件)`);
    console.log(`   DELETE /api/orders/{id}    - 删除订单(触发Kafka事件)`);
    console.log(`   POST /api/orders/batch-update - 批量更新(演示并发Kafka)`);
    console.log(`\n🎯 Kafka功能特性:`);
    console.log(`   ✅ 生产者-消费者模式`);
    console.log(`   ✅ Topic分区和偏移量`);
    console.log(`   ✅ 消费者组`);
    console.log(`   ✅ 重试机制和死信队列`);
    console.log(`   ✅ 异步消息处理`);
    console.log(`   ✅ 事件驱动架构`);
    console.log(`\n⚡ 开始Kafka演示...`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
    } else {
        console.error('❌ 服务器启动失败:', err);
    }
});