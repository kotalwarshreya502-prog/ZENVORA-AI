import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zenvora_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('zenvora_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setUser(res.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch {
          // If server fails or token invalid, check if we have stored user
          const savedUser = localStorage.getItem('zenvora_user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res?.token && res?.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('zenvora_token', res.token);
        localStorage.setItem('zenvora_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err?.message || 'Failed to authenticate' };
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    return await login('demo@zenvora.ai', 'Demo1234!');
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      if (res?.token && res?.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('zenvora_token', res.token);
        localStorage.setItem('zenvora_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res?.message || 'Registration failed' };
    } catch (err) {
      // err is shaped as { message, status, data } by the Axios response interceptor
      const message =
        err?.message ||
        err?.data?.message ||
        err?.response?.data?.message ||
        'Failed to register account';
      return { success: false, message, status: err?.status };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zenvora_token');
    localStorage.removeItem('zenvora_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        loading,
        login,
        loginDemo,
        register,
        logout,
      }}
    >
      {children}
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

export default AuthContext;
