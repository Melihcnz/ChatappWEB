'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { FaSearch, FaUser } from 'react-icons/fa';

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
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Kullanıcılar</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border-b border-red-200">
          {error}
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Aranıyor...
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center"
            >
              <div className="relative flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <FaUser className="text-gray-600 dark:text-gray-400" />
                  </div>
                )}
                
                {isUserOnline(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </div>
              
              <div className="ml-3">
                <p className="font-medium text-gray-800 dark:text-white">
                  {user.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          ))
        ) : search ? (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Kullanıcı bulunamadı
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Bir kullanıcı aramak için yukarıdaki arama kutusunu kullanın
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 