'use client'
import React, { useState } from "react";
import Login from "./loginForm";
import Signup from "./signupForm";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? <Login toggleForm={toggleForm} /> : <Signup toggleForm={toggleForm} />}
    </>
  );
};

export default LoginSignup;
