import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  loading: false,
  error: null,
  success: null,
  users: [],
  products: [],
  orders: [],
  currentUser: null,
  currentProduct: null,
  currentOrder: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, loading: false };
    
    case 'CLEAR_MESSAGES':
      return { ...state, error: null, success: null };
    
    case 'SET_USERS':
      return { ...state, users: action.payload, loading: false };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: false };
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload, loading: false };
    
    case 'SET_CURRENT_PRODUCT':
      return { ...state, currentProduct: action.payload, loading: false };
    
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload, loading: false };
    
    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload],
        success: '用户创建成功',
        loading: false 
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
        currentUser: action.payload,
        success: '用户更新成功',
        loading: false
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        success: '用户删除成功',
        loading: false
      };
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
        success: '产品创建成功',
        loading: false
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        ),
        currentProduct: action.payload,
        success: '产品更新成功',
        loading: false
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
        success: '产品删除成功',
        loading: false
      };
    
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [...state.orders, action.payload],
        success: '订单创建成功',
        loading: false
      };
    
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.id ? action.payload : order
        ),
        currentOrder: action.payload,
        success: '订单更新成功',
        loading: false
      };
    
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload),
        success: '订单删除成功',
        loading: false
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    setSuccess: (success) => dispatch({ type: 'SET_SUCCESS', payload: success }),
    clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
    
    setUsers: (users) => dispatch({ type: 'SET_USERS', payload: users }),
    setProducts: (products) => dispatch({ type: 'SET_PRODUCTS', payload: products }),
    setOrders: (orders) => dispatch({ type: 'SET_ORDERS', payload: orders }),
    
    setCurrentUser: (user) => dispatch({ type: 'SET_CURRENT_USER', payload: user }),
    setCurrentProduct: (product) => dispatch({ type: 'SET_CURRENT_PRODUCT', payload: product }),
    setCurrentOrder: (order) => dispatch({ type: 'SET_CURRENT_ORDER', payload: order }),
    
    addUser: (user) => dispatch({ type: 'ADD_USER', payload: user }),
    updateUser: (user) => dispatch({ type: 'UPDATE_USER', payload: user }),
    deleteUser: (userId) => dispatch({ type: 'DELETE_USER', payload: userId }),
    
    addProduct: (product) => dispatch({ type: 'ADD_PRODUCT', payload: product }),
    updateProduct: (product) => dispatch({ type: 'UPDATE_PRODUCT', payload: product }),
    deleteProduct: (productId) => dispatch({ type: 'DELETE_PRODUCT', payload: productId }),
    
    addOrder: (order) => dispatch({ type: 'ADD_ORDER', payload: order }),
    updateOrder: (order) => dispatch({ type: 'UPDATE_ORDER', payload: order }),
    deleteOrder: (orderId) => dispatch({ type: 'DELETE_ORDER', payload: orderId }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};