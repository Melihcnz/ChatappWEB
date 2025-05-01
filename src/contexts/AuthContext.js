'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API URL'i
const API_URL = 'https://chatappapi-f5xk.onrender.com/api';

// Auth Context oluşturma
const AuthContext = createContext();

// Context hook
export const useAuth = () => useContext(AuthContext);

// Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('chatapp-token');
        const storedUser = localStorage.getItem('chatapp-user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Auth yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Kayıt fonksiyonu
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      const { token, ...user } = response.data;
      
      localStorage.setItem('chatapp-token', token);
      localStorage.setItem('chatapp-user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Kayıt işlemi başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Giriş fonksiyonu
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      const { token, ...user } = response.data;
      
      localStorage.setItem('chatapp-token', token);
      localStorage.setItem('chatapp-user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Giriş işlemi başarısız');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const logout = async () => {
    setLoading(true);
    
    try {
      if (token) {
        await axios.post(`${API_URL}/users/logout`);
      }
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      localStorage.removeItem('chatapp-token');
      localStorage.removeItem('chatapp-user');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  // Context değerleri
  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 