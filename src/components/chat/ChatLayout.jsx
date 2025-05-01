'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserList from './UserList';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import GroupChatModal from './GroupChatModal';
import { FaSignOutAlt, FaPlus, FaUser, FaUsers } from 'react-icons/fa';

const ChatLayout = () => {
  const { user, logout } = useAuth();
  const [showGroupModal, setShowGroupModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md rounded-lg mb-4 flex justify-between items-center p-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ChatApp</h1>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-2">
              <FaUser className="text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-gray-800 dark:text-white font-medium">
              {user?.username}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-outline flex items-center"
          >
            <FaSignOutAlt className="mr-2" />
            Çıkış
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sohbetler</h2>
            <button 
              onClick={() => setShowGroupModal(true)}
              className="btn btn-primary flex items-center py-1 px-2"
              title="Yeni Grup Sohbeti"
            >
              <FaUsers className="mr-1" />
              <span className="text-sm">Grup Oluştur</span>
            </button>
          </div>
          
          <UserList />
          <ChatList />
        </div>
        
        {/* Chat area */}
        <div className="md:col-span-3 h-[calc(100vh-160px)]">
          <ChatBox />
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