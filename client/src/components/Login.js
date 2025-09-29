import React, { useState } from 'react';
import { motion } from 'framer-motion';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_URL = 'http://localhost:3001/api';

const Login = ({ onLogin, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin({ accessToken: data.accessToken, refreshToken: data.refreshToken }, 'Login');
      } else {
        onError(data.message || 'Login failed');
      }
    } catch (err) {
      onError('Error logging in');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="auth-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Login</h2>
      <motion.input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="auth-input"
        required
        whileFocus={{ scale: 1.02 }}
      />
      <motion.input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="auth-input"
        required
        whileFocus={{ scale: 1.02 }}
      />
      <motion.button
        type="submit"
        className="auth-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Login
      </motion.button>
    </motion.form>
  );
};

export default Login;