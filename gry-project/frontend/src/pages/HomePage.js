import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, productAPI, orderAPI } from '../services/api';

const HomePage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    availableProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, productsRes, ordersRes, availableRes] = await Promise.all([
          userAPI.getAll(0, 1),
          productAPI.getAll(0, 1),
          orderAPI.getAll(0, 1),
          productAPI.getAvailable(0, 1)
        ]);

        setStats({
          totalUsers: usersRes.data.data.totalElements,
          totalProducts: productsRes.data.data.totalElements,
          totalOrders: ordersRes.data.data.totalElements,
          availableProducts: availableRes.data.data.totalElements
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">欢迎使用 GRY Demo 系统</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 className="card-title">用户管理</h3>
          <p style={{ fontSize: '2rem', color: '#3498db', margin: '1rem 0' }}>{stats.totalUsers}</p>
          <p>总用户数</p>
          <Link to="/users" className="btn btn-primary">管理用户</Link>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 className="card-title">产品管理</h3>
          <p style={{ fontSize: '2rem', color: '#2ecc71', margin: '1rem 0' }}>{stats.totalProducts}</p>
          <p>总产品数 ({stats.availableProducts} 可用)</p>
          <Link to="/products" className="btn btn-success">管理产品</Link>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 className="card-title">订单管理</h3>
          <p style={{ fontSize: '2rem', color: '#e74c3c', margin: '1rem 0' }}>{stats.totalOrders}</p>
          <p>总订单数</p>
          <Link to="/orders" className="btn btn-danger">管理订单</Link>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">系统功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h4>用户管理功能</h4>
            <ul>
              <li>用户信息查询 (GET)</li>
              <li>用户注册创建 (POST)</li>
              <li>用户信息更新 (PUT)</li>
              <li>用户删除 (DELETE)</li>
              <li>分页查询和搜索</li>
            </ul>
          </div>
          
          <div>
            <h4>产品管理功能</h4>
            <ul>
              <li>产品信息查询</li>
              <li>产品创建和编辑</li>
              <li>库存管理</li>
              <li>产品搜索过滤</li>
              <li>价格范围查询</li>
            </ul>
          </div>
          
          <div>
            <h4>订单管理功能</h4>
            <ul>
              <li>订单详情查询</li>
              <li>多表关联查询</li>
              <li>订单状态管理</li>
              <li>用户订单历史</li>
              <li>异步消息处理</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">技术特性</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h4>后端技术</h4>
            <ul>
              <li>Spring Boot 3.2</li>
              <li>Spring Data JPA</li>
              <li>H2/SQL Server 数据库</li>
              <li>Apache Kafka 消息队列</li>
              <li>RESTful API 设计</li>
            </ul>
          </div>
          
          <div>
            <h4>前端技术</h4>
            <ul>
              <li>React 18</li>
              <li>React Router</li>
              <li>Context API 状态管理</li>
              <li>Axios HTTP 客户端</li>
              <li>响应式 CSS 布局</li>
            </ul>
          </div>
          
          <div>
            <h4>开发规范</h4>
            <ul>
              <li>3层架构设计</li>
              <li>统一异常处理</li>
              <li>数据验证机制</li>
              <li>分页查询支持</li>
              <li>跨域配置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;