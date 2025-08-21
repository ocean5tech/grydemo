const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟数据
const users = [
  { id: 1, username: 'testuser1', email: 'test1@example.com', createdAt: new Date().toISOString() },
  { id: 2, username: 'testuser2', email: 'test2@example.com', createdAt: new Date().toISOString() },
  { id: 3, username: 'admin', email: 'admin@example.com', createdAt: new Date().toISOString() }
];

const products = [
  { id: 1, name: '笔记本电脑', description: '高性能办公笔记本', price: 5999.00, stockQuantity: 50, createdAt: new Date().toISOString() },
  { id: 2, name: '无线鼠标', description: '蓝牙无线鼠标', price: 199.00, stockQuantity: 100, createdAt: new Date().toISOString() },
  { id: 3, name: '机械键盘', description: '87键机械键盘', price: 299.00, stockQuantity: 75, createdAt: new Date().toISOString() }
];

const orders = [
  { 
    id: 1, 
    user: users[0], 
    totalAmount: 6198.00, 
    status: 'PENDING', 
    createdAt: new Date().toISOString(),
    orderItems: [
      { id: 1, product: products[0], quantity: 1, price: 5999.00 },
      { id: 2, product: products[1], quantity: 1, price: 199.00 }
    ]
  },
  { 
    id: 2, 
    user: users[1], 
    totalAmount: 299.00, 
    status: 'PROCESSING', 
    createdAt: new Date().toISOString(),
    orderItems: [
      { id: 3, product: products[2], quantity: 1, price: 299.00 }
    ]
  }
];

// API 响应格式
function createApiResponse(code = '0000', message = '操作成功', data = null) {
  return {
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// 分页响应格式
function createPageResponse(content, page = 0, size = 10, total = 0) {
  return {
    content,
    number: page,
    size,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    first: page === 0,
    last: page >= Math.ceil(total / size) - 1
  };
}

// 路由处理
function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  res.setHeader('Content-Type', 'application/json');
  
  console.log(`${method} ${pathname}`);
  
  try {
    // 健康检查
    if (pathname === '/actuator/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'UP', components: { db: { status: 'UP' } } }));
      return;
    }
    
    // API 1: GET /api/users/{id} - 获取用户信息
    if (pathname.match(/^\/api\/users\/\d+$/) && method === 'GET') {
      const id = parseInt(pathname.split('/').pop());
      const user = users.find(u => u.id === id);
      
      if (user) {
        res.writeHead(200);
        res.end(JSON.stringify(createApiResponse('0000', '获取用户信息成功', user)));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify(createApiResponse('2001', `User not found with id : '${id}'`)));
      }
      return;
    }
    
    // GET /api/users - 获取用户列表
    if (pathname === '/api/users' && method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '0');
      const size = parseInt(url.searchParams.get('size') || '10');
      const username = url.searchParams.get('username');
      const email = url.searchParams.get('email');
      
      let filteredUsers = users;
      if (username) {
        filteredUsers = filteredUsers.filter(u => u.username.includes(username));
      }
      if (email) {
        filteredUsers = filteredUsers.filter(u => u.email.includes(email));
      }
      
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const content = filteredUsers.slice(startIndex, endIndex);
      
      const pageData = createPageResponse(content, page, size, filteredUsers.length);
      
      res.writeHead(200);
      res.end(JSON.stringify(createApiResponse('0000', '获取用户列表成功', pageData)));
      return;
    }
    
    // API 2: POST /api/products - 创建产品
    if (pathname === '/api/products' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const productData = JSON.parse(body);
          const newProduct = {
            id: products.length + 1,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stockQuantity: productData.stockQuantity || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          products.push(newProduct);
          
          res.writeHead(201);
          res.end(JSON.stringify(createApiResponse('0000', '产品创建成功', newProduct)));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify(createApiResponse('1001', '请求数据格式错误')));
        }
      });
      return;
    }
    
    // API 3: PUT /api/products/{id} - 更新产品
    if (pathname.match(/^\/api\/products\/\d+$/) && method === 'PUT') {
      const id = parseInt(pathname.split('/').pop());
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const productData = JSON.parse(body);
          const productIndex = products.findIndex(p => p.id === id);
          
          if (productIndex === -1) {
            res.writeHead(404);
            res.end(JSON.stringify(createApiResponse('3001', `Product not found with id : '${id}'`)));
            return;
          }
          
          products[productIndex] = {
            ...products[productIndex],
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stockQuantity: productData.stockQuantity,
            updatedAt: new Date().toISOString()
          };
          
          res.writeHead(200);
          res.end(JSON.stringify(createApiResponse('0000', '产品更新成功', products[productIndex])));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify(createApiResponse('1001', '请求数据格式错误')));
        }
      });
      return;
    }
    
    // API 4: DELETE /api/products/{id} - 删除产品
    if (pathname.match(/^\/api\/products\/\d+$/) && method === 'DELETE') {
      const id = parseInt(pathname.split('/').pop());
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify(createApiResponse('3001', `Product not found with id : '${id}'`)));
        return;
      }
      
      products.splice(productIndex, 1);
      
      res.writeHead(200);
      res.end(JSON.stringify(createApiResponse('0000', '产品删除成功', null)));
      return;
    }
    
    // GET /api/products - 获取产品列表
    if (pathname === '/api/products' && method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '0');
      const size = parseInt(url.searchParams.get('size') || '10');
      
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const content = products.slice(startIndex, endIndex);
      
      const pageData = createPageResponse(content, page, size, products.length);
      
      res.writeHead(200);
      res.end(JSON.stringify(createApiResponse('0000', '获取产品列表成功', pageData)));
      return;
    }
    
    // API 5: GET /api/orders/user/{userId} - 多表关联查询用户订单
    if (pathname.match(/^\/api\/orders\/user\/\d+$/) && method === 'GET') {
      const userId = parseInt(pathname.split('/').pop());
      const page = parseInt(url.searchParams.get('page') || '0');
      const size = parseInt(url.searchParams.get('size') || '10');
      
      const userExists = users.find(u => u.id === userId);
      if (!userExists) {
        res.writeHead(404);
        res.end(JSON.stringify(createApiResponse('2001', `User not found with id : '${userId}'`)));
        return;
      }
      
      const userOrders = orders.filter(o => o.user.id === userId);
      
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const content = userOrders.slice(startIndex, endIndex);
      
      const pageData = createPageResponse(content, page, size, userOrders.length);
      
      res.writeHead(200);
      res.end(JSON.stringify(createApiResponse('0000', '获取用户订单列表成功', pageData)));
      return;
    }
    
    // GET /api/orders - 获取订单列表
    if (pathname === '/api/orders' && method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '0');
      const size = parseInt(url.searchParams.get('size') || '10');
      
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const content = orders.slice(startIndex, endIndex);
      
      const pageData = createPageResponse(content, page, size, orders.length);
      
      res.writeHead(200);
      res.end(JSON.stringify(createApiResponse('0000', '获取订单列表成功', pageData)));
      return;
    }
    
    // GET /api/orders/{id} - 获取订单详情
    if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'GET') {
      const id = parseInt(pathname.split('/').pop());
      const order = orders.find(o => o.id === id);
      
      if (order) {
        res.writeHead(200);
        res.end(JSON.stringify(createApiResponse('0000', '获取订单信息成功', order)));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify(createApiResponse('4001', `Order not found with id : '${id}'`)));
      }
      return;
    }
    
    // 404 Not Found
    res.writeHead(404);
    res.end(JSON.stringify(createApiResponse('404', 'API接口不存在')));
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify(createApiResponse('9999', '系统错误，请联系管理员')));
  }
}

// 启动服务器
const server = http.createServer(handleRequest);

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`🚀 GRY Demo 后端服务已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/actuator/health`);
  console.log(`\n📋 可用的API接口:`);
  console.log(`1. GET  /api/users/{id}           - 获取用户信息`);
  console.log(`2. POST /api/products             - 创建产品`);
  console.log(`3. PUT  /api/products/{id}        - 更新产品`);
  console.log(`4. DELETE /api/products/{id}      - 删除产品`);
  console.log(`5. GET  /api/orders/user/{userId} - 多表关联查询用户订单`);
  console.log(`\n🔍 其他接口:`);
  console.log(`   GET  /api/users               - 获取用户列表`);
  console.log(`   GET  /api/products            - 获取产品列表`);
  console.log(`   GET  /api/orders              - 获取订单列表`);
  console.log(`   GET  /api/orders/{id}         - 获取订单详情`);
  console.log(`\n⚡ 开始测试...`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用，请检查并关闭占用进程`);
  } else {
    console.error('❌ 服务器启动失败:', err);
  }
});