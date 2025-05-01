'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserList from './UserList';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import GroupChatModal from './GroupChatModal';
import { FaSignOutAlt, FaPlus, FaUser, FaUsers, FaMoon, FaSun, FaBars } from 'react-icons/fa';

const ChatLayout = () => {
  const { user, logout } = useAuth();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Dark mode kontrolü
  useEffect(() => {
    // Sistem ayarı veya localStorage kontrolü
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Ekran boyutu kontrolü
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center transition-colors duration-200">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="mr-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FaBars className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              Chat<span className="text-gray-800 dark:text-white">App</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Açık Mod' : 'Koyu Mod'}
          >
            {darkMode ? (
              <FaSun className="text-yellow-500" />
            ) : (
              <FaMoon className="text-gray-700" />
            )}
          </button>
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
              <FaUser className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-gray-800 dark:text-white font-medium">
              {user?.username}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-outline flex items-center"
            title="Çıkış Yap"
          >
            <FaSignOutAlt className="mr-2" />
            Çıkış
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex h-[calc(100vh-72px)]">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            isMobile ? 'absolute z-40 w-72' : 'relative w-80'
          } h-full bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out flex flex-col`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sohbetler</h2>
            <button 
              onClick={() => setShowGroupModal(true)}
              className="btn btn-primary flex items-center py-1.5 px-3 rounded-full shadow-sm"
              title="Yeni Grup Sohbeti"
            >
              <FaUsers className="mr-1.5" />
              <span className="text-sm">Grup Oluştur</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <UserList />
            </div>
            <div className="p-4 pt-0">
              <ChatList />
            </div>
          </div>
        </div>
        
        {/* Chat area */}
        <div className={`${isMobile && sidebarOpen ? 'opacity-50' : 'opacity-100'} flex-1 transition-opacity duration-300`}>
          <ChatBox />
          
          {isMobile && sidebarOpen && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>
      
      {/* Grup sohbeti oluşturma modalı */}
      <GroupChatModal 
        isOpen={showGroupModal} 
        onClose={() => setShowGroupModal(false)} 
      />
    </div>
  );
};

export default ChatLayout; 