'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';
import ChatLayout from '@/components/chat/ChatLayout';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Hidrasyonu kontrol et
  useEffect(() => {
    setMounted(true);
  }, []);

  // Yapay yükleme animasyonu için
  useEffect(() => {
    if (loading || !mounted) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          // Yavaşlayarak 90'a kadar git (gerçek yüklenme tamamlanınca 100 olacak)
          const newProgress = prev + (90 - prev) * 0.1;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 150);
      
      return () => {
        clearInterval(interval);
        setLoadingProgress(100); // Yükleme tamamlandığında 100% göster
      };
    }
  }, [loading, mounted]);

  // Sayfa yüklenirken veya oturum kontrolü yapılırken yükleme ekranı göster
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-500">
        <div className="text-center mb-8 select-none">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300">
            Chat<span className="text-gray-800 dark:text-white">App</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
            Güvenli mesajlaşma platformu
          </p>
        </div>
        
        <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex justify-center mb-4">
            <div className="loading-spinner" />
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {loadingProgress < 30 ? 'Uygulama başlatılıyor...' :
             loadingProgress < 60 ? 'Bağlantı kuruluyor...' :
             loadingProgress < 90 ? 'Hazırlanıyor...' : 'Neredeyse hazır...'}
          </p>
        </div>
      </div>
    );
  }

  // Kullanıcının oturum durumuna göre ilgili sayfayı göster
  return isAuthenticated ? <ChatLayout /> : <AuthPage />;
}
