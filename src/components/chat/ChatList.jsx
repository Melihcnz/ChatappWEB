'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaUsers, FaBell } from 'react-icons/fa';

const ChatList = () => {
  const { user } = useAuth();
  const { 
    chats, 
    selectedChat, 
    setSelectedChat, 
    fetchChats, 
    notification,
    setNotification,
    onlineUsers
  } = useChat();

  useEffect(() => {
    fetchChats();
    console.log("ChatList: İlk sohbet listesi yükleniyor");
    
    // Her 30 saniyede bir sohbetleri yenile
    const interval = setInterval(() => {
      console.log("ChatList: Sohbet listesi yenileniyor");
      fetchChats();
    }, 30000); // Tam 30 saniye
    
    return () => clearInterval(interval);
  }, []);

  // Chatın son mesajını veya bilgisini göster
  const getLastMessage = (chat) => {
    const lastMessage = chat.latestMessage;
    if (!lastMessage) return 'Yeni sohbet';
    if (!lastMessage.content) return 'Yeni mesaj';
    if (!lastMessage.sender) return 'Mesaj';
    
    const isSender = lastMessage.sender._id === user?._id;
    const senderName = isSender ? 'Sen' : lastMessage.sender.username;
    
    return `${senderName}: ${lastMessage.content.length > 20 
      ? lastMessage.content.substring(0, 20) + '...' 
      : lastMessage.content}`;
  };

  // Kullanıcı adını gösterme fonksiyonu
  const getChatName = (chat) => {
    if (!chat || !chat.users || !user) return 'Sohbet';
    
    if (chat.isGroupChat) return chat.chatName;
    
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return otherUser?.username || 'Kullanıcı';
  };

  // Kullanıcı çevrimiçi mi
  const isUserOnline = (chat) => {
    if (chat.isGroupChat) return false;
    
    const otherUser = chat.users.find((u) => u._id !== user?._id);
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  // Bildirim kontrolü
  const hasChatNotification = (chatId) => {
    return notification.some((n) => n.chatId === chatId);
  };

  // Bildirimler için tıklama işleyicisi
  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    
    // Bildirimleri temizle
    setNotification(notification.filter((n) => n.chatId !== chat._id));
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Sohbetlerim</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatClick(chat)}
            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center ${
              selectedChat?._id === chat._id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              {chat.isGroupChat ? (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaUsers className="text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <FaUser className="text-gray-600 dark:text-gray-400" />
                </div>
              )}
              
              {isUserOnline(chat) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"></span>
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-800 dark:text-white">
                  {getChatName(chat)}
                </p>
                {hasChatNotification(chat._id) && (
                  <span className="text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {notification.filter((n) => n.chatId === chat._id).length}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {getLastMessage(chat)}
              </p>
            </div>
          </div>
        ))}
        
        {chats.length === 0 && (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Henüz sohbet bulunmuyor. Kullanıcı listesinden birini seçerek sohbet başlatabilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 