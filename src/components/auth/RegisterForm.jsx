'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Şifreleri kontrol et
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }
    
    try {
      await register({ username, email, password });
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        ChatApp'e Kayıt Ol
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 mb-2">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
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
        
        <div className="mb-4">
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
            minLength={6}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-2">
            Şifre Tekrar
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Zaten hesabınız var mı?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 