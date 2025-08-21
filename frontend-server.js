const http = require('http');
const fs = require('fs');
const path = require('path');

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

    // 根路径返回HTML页面
    if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = fs.readFileSync('./frontend-test.html', 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            res.writeHead(404);
            res.end('HTML file not found');
        }
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`🌐 GRY Demo 前端测试服务已启动`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🔗 现在可以通过浏览器访问并测试所有API功能！`);
    console.log(`\n✨ 功能特性:`);
    console.log(`   - 5个核心API接口测试`);
    console.log(`   - 实时后端状态检测`);
    console.log(`   - 友好的用户界面`);
    console.log(`   - 完整的错误处理`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请检查并关闭占用进程`);
    } else {
        console.error('❌ 前端服务器启动失败:', err);
    }
});