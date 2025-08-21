import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        setProduct(response.data.data);
      } catch (error) {
        console.error('获取产品详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!product) {
    return <div className="error">产品不存在</div>;
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">产品详情</h1>
        <Link to="/products" className="btn btn-secondary">返回产品列表</Link>
      </div>

      <div className="card">
        <h2>{product.name}</h2>
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>描述:</strong> {product.description || '暂无描述'}</p>
        <p><strong>价格:</strong> ¥{product.price}</p>
        <p><strong>库存数量:</strong> {product.stockQuantity}</p>
        <p><strong>创建时间:</strong> {new Date(product.createdAt).toLocaleString()}</p>
        <p><strong>更新时间:</strong> {new Date(product.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;