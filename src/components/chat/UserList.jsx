'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { FaSearch, FaUser, FaSpinner } from 'react-icons/fa';

const API_URL = 'https://chatappapi-f5xk.onrender.com/api';

const UserList = () => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const { createChat, onlineUsers } = useChat();

  // Kullanıcı arama
  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.get(`${API_URL}/users?search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSearchResults(data);
    } catch (err) {
      setError('Kullanıcılar aranırken bir hata oluştu');
      console.error('Kullanıcı arama hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Arama değiştiğinde
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) handleSearch();
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Kullanıcıya tıklandığında chat oluştur
  const handleUserClick = async (userId) => {
    try {
      await createChat(userId);
    } catch (err) {
      setError('Sohbet oluşturulurken bir hata oluştu');
      console.error('Sohbet oluşturma hatası:', err);
    }
  };

  // Kullanıcı çevrimiçi mi
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-3">
          Kullanıcılar
          <div className="h-px flex-grow bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700 ml-2"></div>
        </h3>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pr-10 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900"
          />
          <div className="absolute right-3 text-gray-400">
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/30 flex items-center justify-center">
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      <div className="max-h-60 overflow-y-auto">
        {loading && searchResults.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-blue-500 text-xl mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Kullanıcılar aranıyor...</p>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center border-l-4 border-transparent hover:border-blue-500 transition-all duration-200"
            >
              <div className="relative flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center shadow-sm">
                    <FaUser className="text-white" />
                  </div>
                )}
                
                {isUserOnline(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                )}
              </div>
              
              <div className="ml-3">
                <p className="font-semibold text-gray-800 dark:text-white flex items-center">
                  {user.username}
                  {isUserOnline(user._id) && (
                    <span className="ml-2 text-xs text-green-500 font-medium">çevrimiçi</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          ))
        ) : search ? (
          <div className="p-8 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg inline-block">
              <p className="text-gray-600 dark:text-gray-400">
                "<span className="font-semibold">{search}</span>" için kullanıcı bulunamadı
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 inline-block">
              <FaSearch className="text-blue-500 dark:text-blue-400 text-2xl mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                Bir kullanıcı aramak için yukarıdaki arama kutusunu kullanın
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 