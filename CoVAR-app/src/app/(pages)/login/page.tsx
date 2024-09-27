'use client';
import React, { useState } from 'react';
import Login from './loginForm';
import Signup from './signupForm';
import ForgotPasswordForm from './forgotPasswordForm'; 

const LoginSignup = () => {
  const [currentForm, setCurrentForm] = useState<'login' | 'signup' | 'forgotPassword'>('login');

  const toggleForm = (formType: 'login' | 'signup' | 'forgotPassword') => {
    setCurrentForm(formType);
  };

  return (
    <>
      {currentForm === 'login' && <Login toggleForm={toggleForm} />}
      {currentForm === 'signup' && <Signup toggleForm={toggleForm} />}
      {currentForm === 'forgotPassword' && <ForgotPasswordForm toggleForm={toggleForm} />}
    </>
  );
};

export default LoginSignup;
