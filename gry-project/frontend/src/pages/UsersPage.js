import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import UserForm from '../components/UserForm';

const UsersPage = () => {
  const { state, actions } = useAppContext();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (page = 0) => {
    try {
      setLoading(true);
      actions.clearMessages();
      
      const response = await userAPI.getAll(page, 10, searchUsername, searchEmail);
      const { content, totalPages: total, number } = response.data.data;
      
      setUsers(content);
      setTotalPages(total);
      setCurrentPage(number);
    } catch (error) {
      actions.setError('获取用户列表失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, [searchUsername, searchEmail]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(0);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('确定要删除此用户吗？')) return;
    
    try {
      await userAPI.delete(userId);
      actions.setSuccess('用户删除成功');
      fetchUsers(currentPage);
    } catch (error) {
      actions.setError('删除用户失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFormSubmit = async (userData) => {
    try {
      await userAPI.create(userData);
      actions.setSuccess('用户创建成功');
      setShowForm(false);
      fetchUsers(currentPage);
    } catch (error) {
      actions.setError('创建用户失败: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">用户管理</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          新增用户
        </button>
      </div>

      {state.error && <div className="error">{state.error}</div>}
      {state.success && <div className="success">{state.success}</div>}

      {/* Search Form */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-control"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="输入用户名搜索"
            />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">邮箱</label>
            <input
              type="email"
              className="form-control"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="输入邮箱搜索"
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
            <button type="submit" className="btn btn-secondary">搜索</button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <Link to={`/users/${user.id}`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                      查看
                    </Link>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                disabled={currentPage === 0}
                onClick={() => fetchUsers(currentPage - 1)}
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn ${currentPage === i ? 'active' : ''}`}
                  onClick={() => fetchUsers(i)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className="page-btn"
                disabled={currentPage === totalPages - 1}
                onClick={() => fetchUsers(currentPage + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '90vw'
          }}>
            <h2>新增用户</h2>
            <UserForm 
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;