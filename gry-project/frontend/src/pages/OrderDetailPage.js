import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(id);
        setOrder(response.data.data);
      } catch (error) {
        console.error('获取订单详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!order) {
    return <div className="error">订单不存在</div>;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">订单详情</h1>
        <Link to="/orders" className="btn btn-secondary">返回订单列表</Link>
      </div>

      <div className="card">
        <h2>订单信息</h2>
        <p><strong>订单ID:</strong> {order.id}</p>
        <p><strong>用户:</strong> {order.user?.username} ({order.user?.email})</p>
        <p><strong>总金额:</strong> ¥{order.totalAmount}</p>
        <p><strong>状态:</strong> {order.status}</p>
        <p><strong>创建时间:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>更新时间:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
      </div>

      {order.orderItems && order.orderItems.length > 0 && (
        <div className="card">
          <h2>订单项目</h2>
          <table className="table">
            <thead>
              <tr>
                <th>产品名称</th>
                <th>数量</th>
                <th>单价</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || '未知产品'}</td>
                  <td>{item.quantity}</td>
                  <td>¥{item.price}</td>
                  <td>¥{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;