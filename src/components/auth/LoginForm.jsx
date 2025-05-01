'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        ChatApp'e Giriş Yap
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Hesabınız yok mu?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 