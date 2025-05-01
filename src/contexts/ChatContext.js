'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

// API URL'i
const API_URL = 'https://chatappapi-f5xk.onrender.com/api';
const SOCKET_URL = 'https://chatappapi-f5xk.onrender.com';

// Chat Context oluşturma
const ChatContext = createContext();

// Context hook
export const useChat = () => useContext(ChatContext);

// Provider bileşeni
export const ChatProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  // Socket.io bağlantısı
  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  // Socket olaylarını dinle
  useEffect(() => {
    if (!socket || !user) return;

    // Kullanıcı kurulumu
    socket.emit('setup', user);
    console.log('Socket: Kullanıcı kurulumu yapıldı', user._id);

    // Bağlantı kuruldu
    socket.on('connected', () => {
      console.log('Socket: Bağlantı kuruldu');
    });

    // Yazıyor
    socket.on('typing', (chatId) => {
      console.log(`Socket: ${chatId} sohbetinde birisi yazıyor`);
      setTyping(true);
    });
    
    socket.on('stop-typing', (chatId) => {
      console.log(`Socket: ${chatId} sohbetinde yazma durdu`);
      setTyping(false);
    });

    // Kullanıcı durumu
    socket.on('user-online', (userId) => {
      console.log(`Socket: ${userId} kullanıcısı çevrimiçi oldu`);
      setOnlineUsers((prevUsers) => {
        if (prevUsers.includes(userId)) return prevUsers;
        return [...prevUsers, userId];
      });
    });

    socket.on('user-offline', (userId) => {
      console.log(`Socket: ${userId} kullanıcısı çevrimdışı oldu`);
      setOnlineUsers((prevUsers) => prevUsers.filter((id) => id !== userId));
    });

    // Yeni mesaj
    socket.on('message-received', (newMessage) => {
      console.log('Socket: Yeni mesaj alındı', newMessage._id);
      // Eğer seçili sohbet aktif ise ve mesaj bu sohbetten geliyorsa
      if (selectedChat && selectedChat._id === newMessage.chatId) {
        setMessages((prevMessages) => {
          // Aynı mesajın tekrar eklenmesini önlemek için ID kontrolü yapıyoruz
          if (prevMessages.some(msg => msg._id === newMessage._id)) {
            console.log(`Socket: ${newMessage._id} ID'li mesaj zaten mevcut`);
            return prevMessages;
          }
          console.log(`Socket: ${newMessage._id} ID'li mesaj eklendi`);
          return [...prevMessages, newMessage];
        });
      } else {
        // Bildirim
        console.log(`Socket: ${newMessage._id} ID'li mesaj bildirim olarak eklendi`);
        setNotification((prevNotifications) => [newMessage, ...prevNotifications]);
        // Sohbetleri yenileme
        fetchChats();
      }
    });

    return () => {
      console.log('Socket: Event dinleyicileri temizlendi');
      socket.off('connected');
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('message-received');
    };
  }, [socket, user, selectedChat]);

  // Tüm sohbetleri getir
  const fetchChats = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const startTime = new Date();
      console.log("Context: Sohbetler getiriliyor...");
      
      const { data } = await axios.get(`${API_URL}/chats`);
      setChats(data);
      
      const endTime = new Date();
      console.log(`Context: Sohbetler getirildi (${endTime - startTime}ms)`);
    } catch (error) {
      console.error('Sohbetleri getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sohbet oluştur
  const createChat = async (userId) => {
    try {
      const { data } = await axios.post(`${API_URL}/chats`, { userId });
      
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      
      setSelectedChat(data);
      return data;
    } catch (error) {
      console.error('Sohbet oluşturma hatası:', error);
      throw error;
    }
  };

  // Grup sohbeti oluştur
  const createGroupChat = async (users, name) => {
    try {
      const { data } = await axios.post(`${API_URL}/chats/group`, {
        users: JSON.stringify(users),
        name,
      });
      
      setChats([data, ...chats]);
      setSelectedChat(data);
      return data;
    } catch (error) {
      console.error('Grup sohbeti oluşturma hatası:', error);
      throw error;
    }
  };

  // Mesajları getir
  const fetchMessages = async (chatId) => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const startTime = new Date();
      console.log(`Context: ${chatId} ID'li sohbetin mesajları getiriliyor...`);
      
      const { data } = await axios.get(`${API_URL}/messages/${chatId}`);
      setMessages(data);
      
      // Sohbete katıl
      socket.emit('join-chat', chatId);
      
      const endTime = new Date();
      console.log(`Context: Mesajlar getirildi (${endTime - startTime}ms)`);
      
      return data;
    } catch (error) {
      console.error('Mesajları getirme hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mesaj gönder
  const sendMessage = async (content, chatId) => {
    socket.emit('stop-typing', chatId);
    
    try {
      const { data } = await axios.post(`${API_URL}/messages`, {
        content,
        chatId,
      });
      
      // Yeni mesajı socket ile diğer kullanıcılara gönder
      socket.emit('new-message', data);
      
      // Mesaj listesine ekle
      setMessages((prevMessages) => {
        // Aynı mesajın tekrar eklenmesini önlemek için ID kontrolü yapıyoruz
        if (prevMessages.some(msg => msg._id === data._id)) {
          return prevMessages;
        }
        return [...prevMessages, data];
      });
      
      // Sohbetleri güncelle
      fetchChats();
      
      return data;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  };

  // Yazıyor olayını başlat
  const startTyping = (chatId) => {
    socket.emit('typing', chatId);
  };

  // Yazıyor olayını durdur
  const stopTyping = (chatId) => {
    socket.emit('stop-typing', chatId);
  };

  // Context değerleri
  const value = {
    socket,
    chats,
    selectedChat,
    setSelectedChat,
    messages,
    loading,
    notification,
    setNotification,
    onlineUsers,
    typing,
    fetchChats,
    createChat,
    createGroupChat,
    fetchMessages,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext; 