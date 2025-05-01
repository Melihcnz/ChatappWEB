'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { FaUser, FaTimes, FaPlus } from 'react-icons/fa';

const API_URL = 'https://chatappapi-f5xk.onrender.com/api';

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const { createGroupChat } = useChat();

  // Modal açıldığında formu sıfırla
  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setError('');
    }
  }, [isOpen]);

  // Kullanıcı arama
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data } = await axios.get(`${API_URL}/users?search=${searchQuery}`, {
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
      if (searchQuery) handleSearch();
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Kullanıcı seçme/kaldırma
  const handleUserSelect = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Grup sohbeti oluşturma
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Grup adı gereklidir');
      return;
    }
    
    if (selectedUsers.length < 2) {
      setError('En az 2 kullanıcı seçmelisiniz');
      return;
    }
    
    setLoading(true);
    
    try {
      await createGroupChat(selectedUsers.map((u) => u._id), groupName);
      onClose();
    } catch (err) {
      setError('Grup oluşturulurken bir hata oluştu');
      console.error('Grup oluşturma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Yeni Grup Sohbeti
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grup Adı
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input"
              placeholder="Grup adını girin"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kullanıcı Ara
            </label>
            <input
              type="text"
              id="searchUsers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              placeholder="Kullanıcı adı veya e-posta ara"
            />
          </div>
          
          {/* Seçili kullanıcılar */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seçili Kullanıcılar ({selectedUsers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    <span className="mr-1">{user.username}</span>
                    <button
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Arama sonuçları */}
          <div className="mb-4 max-h-40 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-2">
                Aranıyor...
              </p>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-2">
                      <FaUser className="text-gray-600 dark:text-gray-400" size={12} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    {selectedUsers.some((u) => u._id === user._id) ? (
                      <FaTimes className="text-red-500" />
                    ) : (
                      <FaPlus className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-2">
                Kullanıcı bulunamadı
              </p>
            ) : null}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline mr-2"
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !groupName || selectedUsers.length < 2}
            >
              {loading ? 'Oluşturuluyor...' : 'Grup Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal; 