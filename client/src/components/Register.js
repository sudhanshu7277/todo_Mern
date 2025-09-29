import React, { useState } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'ws://localhost:3001';

const Register = ({ onRegister, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onRegister({ accessToken: data.accessToken, refreshToken: data.refreshToken }, 'Registration');
      } else {
        onError(data.message || 'Registration failed');
      }
    } catch (err) {
      onError('Error registering');
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
      <h2>Register</h2>
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
        Register
      </motion.button>
    </motion.form>
  );
};

export default Register;