'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaPaperPlane } from 'react-icons/fa';

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const { 
    selectedChat, 
    messages, 
    loading, 
    typing,
    fetchMessages, 
    sendMessage,
    startTyping,
    stopTyping
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Seçili sohbet değiştiğinde mesajları getir
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  // Otomatik kaydırma
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mesaj gönderme
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      await sendMessage(message, selectedChat._id);
      setMessage('');
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  // Yazıyor etkinliği
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!typing) {
      startTyping(selectedChat._id);
    }
    
    // Yazma işlemini durdur
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      
      if (timeDiff >= timerLength && typing) {
        stopTyping(selectedChat._id);
      }
    }, timerLength);
  };

  // Kullanıcı adını gösterme fonksiyonu
  const getSenderName = (chat) => {
    if (!chat || !chat.users || !user) return 'Sohbet';
    
    return chat.isGroupChat
      ? chat.chatName
      : chat.users.find((u) => u._id !== user._id)?.username || 'Kullanıcı';
  };

  // Mesaj sahibi kontrolü
  const isMessageFromCurrentUser = (msg) => {
    return msg && msg.sender && msg.sender._id === user?._id;
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Sohbet başlatmak için bir kullanıcı seçin
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Sohbet başlığı */}
      <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {getSenderName(selectedChat)}
        </h3>
      </div>

      {/* Mesaj listesi */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Mesajlar yükleniyor...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  isMessageFromCurrentUser(msg) ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`message-bubble ${
                  isMessageFromCurrentUser(msg) 
                    ? 'message-bubble-sender' 
                    : 'message-bubble-receiver'
                }`}>
                  <p className="break-words">{msg.content || msg.text}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="message-bubble message-bubble-receiver">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              Henüz mesaj yok. Bir mesaj göndererek sohbeti başlatın.
            </p>
          </div>
        )}
      </div>

      {/* Mesaj gönderme formu */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            value={message}
            onChange={handleTyping}
            className="flex-1 input rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 mr-2"
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-primary px-3 py-2 rounded-full hover:bg-blue-700 transition-colors"
            disabled={!message.trim()}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox; 