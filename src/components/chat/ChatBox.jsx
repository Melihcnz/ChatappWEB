'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaPaperPlane, FaUserFriends, FaImage, FaSmile, FaEllipsisV, FaInfoCircle, FaTimes } from 'react-icons/fa';

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
  const messageInputRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Seçili sohbet değiştiğinde mesajları getir ve input'a focus yap
  useEffect(() => {
    if (selectedChat) {
      fetchingRef.current = true;
      const now = Date.now();
      lastFetchTimeRef.current = now;
      
      fetchMessages(selectedChat._id)
        .then(() => {
          // Eğer bu, en son başlatılan fetch ise scroll yap
          if (lastFetchTimeRef.current === now) {
            performScrollToBottom(500);
            fetchingRef.current = false;
          }
        })
        .catch(() => {
          fetchingRef.current = false;
        });
        
      messageInputRef.current?.focus();
    }
  }, [selectedChat]);

  // Sohbet yenileme işlemi
  useEffect(() => {
    if (!selectedChat) return;
    
    // Her 30 saniyede bir mesajları yenileme
    const interval = setInterval(() => {
      if (selectedChat && !fetchingRef.current) {
        fetchingRef.current = true;
        const now = Date.now();
        lastFetchTimeRef.current = now;
        
        fetchMessages(selectedChat._id)
          .then(() => {
            // Eğer bu, en son başlatılan fetch ise scroll yap
            if (lastFetchTimeRef.current === now) {
              performScrollToBottom(500);
              fetchingRef.current = false;
            }
          })
          .catch(() => {
            fetchingRef.current = false;
          });
      }
    }, 30000); // 30 saniye
    
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Güvenli ve kontrollü scroll işlemi
  const performScrollToBottom = (delay = 100) => {
    // Önceki timeout'u temizle
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Yeni bir timeout ayarla
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      scrollTimeoutRef.current = null;
    }, delay);
  };
  
  // Otomatik kaydırma - Mesajlar değiştiğinde
  useEffect(() => {
    if (messages.length > 0 && !loading && !fetchingRef.current) {
      performScrollToBottom(200);
    }
  }, [messages, loading]);

  // Component unmount olduğunda timeout'ları temizle
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Mesaj gönderme
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      await sendMessage(message, selectedChat._id);
      setMessage('');
      performScrollToBottom(300);
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

  // Enter ile gönderme
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Kullanıcı adını gösterme fonksiyonu
  const getSenderName = (chat) => {
    if (!chat || !chat.users || !user) return 'Sohbet';
    
    return chat.isGroupChat
      ? chat.chatName
      : chat.users.find((u) => u._id !== user._id)?.username || 'Kullanıcı';
  };

  // Ek bilgiler
  const getChatInfo = (chat) => {
    if (!chat || !chat.users || !user) return '';
    
    return chat.isGroupChat
      ? `${chat.users.length} üye`
      : 'Çevrimiçi'; // Gerçek duruma göre değiştirilebilir
  };

  // Mesaj sahibi kontrolü
  const isMessageFromCurrentUser = (msg) => {
    return msg && msg.sender && msg.sender._id === user?._id;
  };

  // Son mesaj zamanını formatla
  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    
    // Bugünün tarihi ile karşılaştır
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Dün mü?
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Dün ' + messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Bu hafta içi mi?
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(today.getDate() - 6);
    if (messageDate >= sixDaysAgo) {
      return messageDate.toLocaleDateString([], {weekday: 'long'}) + ' ' +
        messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Daha eski ise
    return messageDate.toLocaleDateString() + ' ' +
      messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Grup üyelerini göster/gizle
  const toggleGroupInfo = () => {
    setShowGroupInfo(!showGroupInfo);
    setShowOptions(false);
  };

  // Mesaj gönderenin adını göster
  const getSenderDisplayName = (msg) => {
    if (!msg || !msg.sender) return '';
    
    if (isMessageFromCurrentUser(msg)) {
      return '';
    }
    
    return msg.sender.username || 'Kullanıcı';
  };

  // Chat seçilmemiş ise
  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-5 mb-4">
          <FaUserFriends className="text-4xl text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Sohbetiniz Hazır</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
          Sohbete başlamak için bir kişi veya grup seçin. Mesajlarınız uçtan uca şifrelidir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sohbet başlığı */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
            {selectedChat.isGroupChat ? (
              <FaUserFriends className="text-blue-600 dark:text-blue-400" />
            ) : (
              <FaUser className="text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {getSenderName(selectedChat)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getChatInfo(selectedChat)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {selectedChat.isGroupChat && (
            <button
              onClick={toggleGroupInfo}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
              title="Grup Bilgileri"
            >
              <FaInfoCircle className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaEllipsisV className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Sohbeti Sil
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {selectedChat.isGroupChat ? 'Gruptan Çık' : 'Kişiyi Engelle'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grup üyeleri bilgisi (açılır panel) */}
      {selectedChat.isGroupChat && showGroupInfo && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 animate-fadeDown shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800 dark:text-white">Grup Üyeleri</h4>
            <button
              onClick={() => setShowGroupInfo(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaTimes className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedChat.users.map((member) => (
                <div 
                  key={member._id} 
                  className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center mr-2 shadow-sm">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {member.username}
                    </p>
                    {member._id === selectedChat.groupAdmin?._id && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">Admin</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800" id="messages-container">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loading-spinner" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Mesajlar yükleniyor...</span>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3 fade-in">
            {messages.map((msg, index) => {
              const showDateHeader = index === 0 || 
                new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
              const senderName = selectedChat.isGroupChat ? getSenderDisplayName(msg) : '';
              
              return (
                <div key={msg._id} className="space-y-1">
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      isMessageFromCurrentUser(msg) ? 'justify-end' : 'justify-start'
                    } items-start gap-2`}
                  >
                    {!isMessageFromCurrentUser(msg) && selectedChat.isGroupChat && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                        <FaUser className="text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className={`message-bubble ${
                      isMessageFromCurrentUser(msg) 
                        ? 'message-bubble-sender shadow-md' 
                        : 'message-bubble-receiver shadow-md'
                    }`}>
                      {selectedChat.isGroupChat && !isMessageFromCurrentUser(msg) && senderName && (
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                          {senderName}
                        </span>
                      )}
                      <p className="break-words">{msg.content || msg.text}</p>
                      <div className="flex items-center justify-end">
                        <span className="message-time">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isMessageFromCurrentUser(msg) && msg.readBy && (
                          <span className="ml-2" title="Görüldü">
                            {msg.readBy.length > 1 ? (
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-500">✓✓</span>
                            ) : (
                              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex justify-start items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <FaUser className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="message-bubble message-bubble-receiver shadow-md">
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
          <div className="flex flex-col justify-center items-center h-full">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg mb-2">
              <p className="text-center">
                Bu sohbette henüz mesaj bulunmuyor.
              </p>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Bir mesaj göndererek sohbeti başlatın.
            </p>
          </div>
        )}
      </div>

      {/* Mesaj gönderme formu */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Dosya ekle"
          >
            <FaImage />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Emoji ekle"
          >
            <FaSmile />
          </button>
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            ref={messageInputRef}
            className="flex-1 input rounded-full border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            className={`p-3 rounded-full ${
              message.trim() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            } transition-all duration-200 hover:shadow-md active:scale-95`}
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