import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserForm from './UserForm';

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByText('创建')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('创建'));
    
    await waitFor(() => {
      expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
      expect(screen.getByText('邮箱不能为空')).toBeInTheDocument();
      expect(screen.getByText('密码不能为空')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/邮箱/i), {
      target: { value: 'invalid-email' }
    });
    fireEvent.click(screen.getByText('创建'));
    
    await waitFor(() => {
      expect(screen.getByText('邮箱格式无效')).toBeInTheDocument();
    });
  });

  test('validates minimum password length', async () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: '123' }
    });
    fireEvent.click(screen.getByText('创建'));
    
    await waitFor(() => {
      expect(screen.getByText('密码至少6个字符')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/用户名/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/邮箱/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('创建'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('取消'));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('renders in edit mode when user prop is provided', () => {
    const existingUser = {
      id: 1,
      username: 'existinguser',
      email: 'existing@example.com'
    };
    
    render(<UserForm user={existingUser} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByDisplayValue('existinguser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('existing@example.com')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
    expect(screen.getByText('新密码 (留空不修改)')).toBeInTheDocument();
  });
});