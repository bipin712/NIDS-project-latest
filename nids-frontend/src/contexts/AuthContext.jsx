import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on initial load
    const initAuth = async () => {
      try {
        const response = await api.checkAuth();
        if (response.authenticated) {
          setUser(response.user);
          setIsAdmin(response.is_admin || false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success) {
      setUser(res.user);
      setIsAdmin(false);
    }
    return res;
  };

  const loginAdmin = async (credentials) => {
    const res = await api.adminLogin(credentials);
    if (res.success) {
      setUser({ name: 'System Admin', email: credentials.email }); // Fallback if admin profile not fully returned
      setIsAdmin(true);
    }
    return res;
  };

  const registerUser = async (data) => {
    return await api.register(data);
  };

  const logout = async () => {
    try {
      if (isAdmin) {
        await api.adminLogout();
      } else {
        await api.logout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    loginUser,
    loginAdmin,
    registerUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
