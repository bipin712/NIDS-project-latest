const API_BASE = '/api';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth
export const login = (credentials) => fetchApi('/login', { method: 'POST', body: credentials });
export const register = (userData) => fetchApi('/register', { method: 'POST', body: userData });
export const logout = () => fetchApi('/logout', { method: 'POST' });
export const checkAuth = () => fetchApi('/check-auth');

// Admin Auth
export const adminLogin = (credentials) => fetchApi('/admin/login', { method: 'POST', body: credentials });
export const adminLogout = () => fetchApi('/admin/logout', { method: 'POST' });

// User Profile
export const getUserProfile = () => fetchApi('/user/profile');
export const changePassword = (data) => fetchApi('/user/change-password', { method: 'POST', body: data });
export const sendResetCode = (data) => fetchApi('/user/send-reset-code', { method: 'POST', body: data });
export const resetPasswordEmail = (data) => fetchApi('/user/reset-password-email', { method: 'POST', body: data });
export const resetPasswordMobile = (data) => fetchApi('/user/reset-password-mobile', { method: 'POST', body: data });

// Admin Actions
export const getAdminUsers = () => fetchApi('/admin/users');
export const deleteUser = (id) => fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
export const toggleUserStatus = (id) => fetchApi(`/admin/users/${id}/toggle-status`, { method: 'POST' });

// Add other NIDS endpoints here as they are developed or mapped (e.g. alerts, dashboard, etc.)
