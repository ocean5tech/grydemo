import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import UserDetailPage from './pages/UserDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderDetailPage from './pages/OrderDetailPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                GRY Demo
              </Link>
              <div className="nav-menu">
                <Link to="/" className="nav-link">首页</Link>
                <Link to="/users" className="nav-link">用户管理</Link>
                <Link to="/products" className="nav-link">产品管理</Link>
                <Link to="/orders" className="nav-link">订单管理</Link>
              </div>
            </div>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>&copy; 2024 GRY Demo. 全栈演示应用.</p>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;