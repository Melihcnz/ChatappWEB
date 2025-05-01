'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaUsers, FaBell, FaCircle } from 'react-icons/fa';

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
    
    // Her 30 saniyede bir sohbetleri yenile
    const interval = setInterval(() => {
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
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          Sohbetlerim
          <div className="h-px flex-grow bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700 ml-2"></div>
        </h3>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatClick(chat)}
            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center border-l-4 transition-all duration-200 ${
              selectedChat?._id === chat._id 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="relative flex-shrink-0">
              {chat.isGroupChat ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <FaUsers className="text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-sm">
                  <FaUser className="text-white" />
                </div>
              )}
              
              {isUserOnline(chat) && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-white">
                  {getChatName(chat)}
                </p>
                <div className="flex items-center">
                  {chat.latestMessage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                      {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                  {hasChatNotification(chat._id) && (
                    <span className="flex items-center justify-center text-xs bg-red-500 text-white rounded-full min-w-[20px] h-5 px-1.5 font-medium">
                      {notification.filter((n) => n.chatId === chat._id).length}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {getLastMessage(chat)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {chats.length === 0 && (
          <div className="p-8 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-2 inline-block">
              <FaUsers className="text-blue-500 dark:text-blue-400 text-3xl mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                Henüz sohbet bulunmuyor. Kullanıcı listesinden birini seçerek sohbet başlatabilirsiniz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 