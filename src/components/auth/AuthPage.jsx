'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md px-4">
        {isLoginForm ? (
          <LoginForm onSwitchToRegister={toggleForm} />
        ) : (
          <RegisterForm onSwitchToLogin={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default AuthPage; 