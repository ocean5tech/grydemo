import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, orderAPI } from '../services/api';

const UserDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          userAPI.getById(id),
          orderAPI.getByUserId(id, 0, 10)
        ]);
        
        setUser(userRes.data.data);
        setOrders(ordersRes.data.data.content);
      } catch (error) {
        console.error('获取用户详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!user) {
    return <div className="error">用户不存在</div>;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">用户详情</h1>
        <Link to="/users" className="btn btn-secondary">返回用户列表</Link>
      </div>

      <div className="card">
        <h2>基本信息</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>用户名:</strong> {user.username}</p>
        <p><strong>邮箱:</strong> {user.email}</p>
        <p><strong>创建时间:</strong> {new Date(user.createdAt).toLocaleString()}</p>
        <p><strong>更新时间:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
      </div>

      <div className="card">
        <h2>订单历史 ({orders.length})</h2>
        {orders.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>订单ID</th>
                <th>总金额</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>¥{order.totalAmount}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-primary">
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>该用户暂无订单</p>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;