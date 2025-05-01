'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';
import ChatLayout from '@/components/chat/ChatLayout';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Hidrasyonu kontrol et
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sayfa yüklenirken veya oturum kontrolü yapılırken yükleme ekranı göster
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4">
            ChatApp Yükleniyor...
          </h2>
          <div className="flex justify-center">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kullanıcının oturum durumuna göre ilgili sayfayı göster
  return isAuthenticated ? <ChatLayout /> : <AuthPage />;
}
