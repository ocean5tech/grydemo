import React, { useState } from 'react';

const UserForm = ({ user = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: user ? '' : ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式无效';
    }
    
    if (!user && !formData.password.trim()) {
      newErrors.password = '密码不能为空';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = '密码至少6个字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete submitData.password;
      }
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">用户名</label>
        <input
          type="text"
          name="username"
          className="form-control"
          value={formData.username}
          onChange={handleChange}
          placeholder="输入用户名"
        />
        {errors.username && <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.username}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">邮箱</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          placeholder="输入邮箱"
        />
        {errors.email && <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label className="form-label">{user ? '新密码 (留空不修改)' : '密码'}</label>
        <input
          type="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
          placeholder={user ? "输入新密码或留空" : "输入密码"}
        />
        {errors.password && <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.password}</div>}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary">
          {user ? '更新' : '创建'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          取消
        </button>
      </div>
    </form>
  );
};

export default UserForm;