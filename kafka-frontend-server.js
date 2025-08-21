const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 根路径返回Kafka演示页面
    if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = fs.readFileSync('./kafka-demo.html', 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(404);
            res.end('Kafka demo HTML file not found');
        }
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3001;

server.listen(PORT, () => {
    console.log(`🚀 GRY Demo - Kafka演示前端服务已启动`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🎯 功能特性:`);
    console.log(`   - Kafka事件实时监控`);
    console.log(`   - 订单业务操作演示`);
    console.log(`   - 消息生产者-消费者模式`);
    console.log(`   - 异步处理流程可视化`);
    console.log(`   - 重试机制和错误处理`);
    console.log(`\n🔗 与后端服务配合:`);
    console.log(`   - 基础API服务: http://localhost:8080`);
    console.log(`   - Kafka演示服务: http://localhost:8081`);
    console.log(`   - 前端测试页面: http://localhost:3000`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请检查并关闭占用进程`);
    } else {
        console.error('❌ Kafka前端服务器启动失败:', err);
    }
});