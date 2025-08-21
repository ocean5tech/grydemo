import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async (page = 0) => {
    try {
      setLoading(true);
      const response = await productAPI.getAll(page, 10);
      const { content, totalPages: total, number } = response.data.data;
      
      setProducts(content);
      setTotalPages(total);
      setCurrentPage(number);
    } catch (error) {
      console.error('获取产品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">产品管理</h1>
      
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>产品名称</th>
            <th>价格</th>
            <th>库存</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>¥{product.price}</td>
              <td>{product.stockQuantity}</td>
              <td>
                <Link to={`/products/${product.id}`} className="btn btn-primary">
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

export default ProductsPage;