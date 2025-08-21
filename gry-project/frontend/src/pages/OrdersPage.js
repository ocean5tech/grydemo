import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async (page = 0) => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll(page, 10);
      const { content, totalPages: total, number } = response.data.data;
      
      setOrders(content);
      setTotalPages(total);
      setCurrentPage(number);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">订单管理</h1>
      
      <table className="table">
        <thead>
          <tr>
            <th>订单ID</th>
            <th>用户ID</th>
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
              <td>{order.user?.id}</td>
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
    </div>
  );
};

export default OrdersPage;