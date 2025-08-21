import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const userAPI = {
  getAll: (page = 0, size = 10, username = '', email = '') => {
    const params = new URLSearchParams({ page, size });
    if (username) params.append('username', username);
    if (email) params.append('email', email);
    return api.get(`/users?${params}`);
  },
  
  getById: (id) => api.get(`/users/${id}`),
  
  create: (userData) => api.post('/users', userData),
  
  update: (id, userData) => api.put(`/users/${id}`, userData),
  
  delete: (id) => api.delete(`/users/${id}`),
};

export const productAPI = {
  getAll: (page = 0, size = 10, name = '', minPrice = '', maxPrice = '', inStock = '') => {
    const params = new URLSearchParams({ page, size });
    if (name) params.append('name', name);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (inStock) params.append('inStock', inStock);
    return api.get(`/products?${params}`);
  },
  
  getById: (id) => api.get(`/products/${id}`),
  
  create: (productData) => api.post('/products', productData),
  
  update: (id, productData) => api.put(`/products/${id}`, productData),
  
  delete: (id) => api.delete(`/products/${id}`),
  
  getAvailable: (page = 0, size = 10) => 
    api.get(`/products/available?page=${page}&size=${size}`),
  
  updateStock: (id, quantity) => 
    api.put(`/products/${id}/stock?quantity=${quantity}`),
};

export const orderAPI = {
  getAll: (page = 0, size = 10, status = '') => {
    const params = new URLSearchParams({ page, size });
    if (status) params.append('status', status);
    return api.get(`/orders?${params}`);
  },
  
  getById: (id) => api.get(`/orders/${id}`),
  
  create: (orderData) => api.post('/orders', orderData),
  
  updateStatus: (id, status) => 
    api.put(`/orders/${id}/status?status=${status}`),
  
  delete: (id) => api.delete(`/orders/${id}`),
  
  getByUserId: (userId, page = 0, size = 10) => 
    api.get(`/orders/user/${userId}?page=${page}&size=${size}`),
  
  countByUserIdAndStatus: (userId, status) => 
    api.get(`/orders/user/${userId}/count?status=${status}`),
};

export default api;