import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Login from './components/Login';
import Register from './components/Register';
import './styles.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [isAllView, setIsAllView] = useState(false);
  const socket = useRef(null);

  let isRefreshing = false;
  let refreshQueue = [];

  useEffect(() => {
    if (accessToken) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      fetchTodos();
      connectSocket();
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user, isAllView]);

  const connectSocket = () => {
    if (socket.current) {
      socket.current.disconnect();
    }

    socket.current = io(SOCKET_URL, {
      auth: { token: accessToken },
    });

    socket.current.on('connect', () => {
      socket.current.emit('joinRoom', `user_${user._id}`);
      if (user.role === 'admin') {
        socket.current.emit('joinRoom', 'admins');
      }
    });

    socket.current.on('todoCreated', (newTodo) => {
      if (!isAllView && newTodo.user === user._id) {
        setTodos((prev) => [...prev, newTodo]);
      } else if (isAllView && user.role === 'admin') {
        setTodos((prev) => [...prev, newTodo]);
        if (newTodo.user !== user._id) {
          toast.info(`New todo added by ${newTodo.user?.username || 'user'}`, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      }
    });

    socket.current.on('todoUpdated', (updatedTodo) => {
      setTodos((prev) =>
        prev.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo))
      );
      if (isAllView && user.role === 'admin' && updatedTodo.user !== user._id) {
        toast.info(`Todo updated by ${updatedTodo.user?.username || 'user'}`, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    });

    socket.current.on('todoDeleted', (deletedId) => {
      setTodos((prev) => prev.filter((todo) => todo._id !== deletedId));
      if (isAllView && user.role === 'admin') {
        toast.info('Todo deleted', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    });

    socket.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  const processQueue = (error, newAccessToken = null, newRefreshToken = null) => {
    refreshQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      }
    });
    refreshQueue = [];
  };

  const refreshAccessToken = () => {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    return fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Refresh failed');
        }
      })
      .then((data) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        processQueue(null, data.accessToken, data.refreshToken);
        isRefreshing = false;
        return { accessToken: data.accessToken, refreshToken: data.refreshToken };
      })
      .catch((err) => {
        processQueue(err);
        isRefreshing = false;
        handleLogout();
        toast.error('Session expired. Please log in again.', {
          position: 'top-right',
          autoClose: 3000,
        });
        throw err;
      });
  };

  const apiCall = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      try {
        await refreshAccessToken();
        headers.Authorization = `Bearer ${accessToken}`;
        res = await fetch(url, { ...options, headers });
      } catch (err) {
        return res;
      }
    }

    return res;
  };

  const fetchMe = async () => {
    try {
      const res = await apiCall(`${API_URL}/auth/me`);
      if (res.ok) {
        setUser(await res.json());
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      handleLogout();
    }
  };

  const fetchTodos = async () => {
    try {
      const url = `${API_URL}/todos${isAllView ? '?all=true' : ''}`;
      const res = await apiCall(url);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else {
        handleLogout();
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setLoading(false);
      toast.error('Failed to fetch todos.', { position: 'top-right', autoClose: 3000 });
    }
  };

  const addTodo = async (task) => {
    try {
      const res = await apiCall(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      if (res.ok) {
        toast.success('Todo added successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add todo.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error adding todo:', err);
      toast.error('Error adding todo.', { position: 'top-right', autoClose: 3000 });
    }
  };

  const updateTodo = async (id, updatedTodo) => {
    try {
      const res = await apiCall(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });
      if (res.ok) {
        toast.success('Todo updated successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update todo.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      toast.error('Error updating todo.', { position: 'top-right', autoClose: 3000 });
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await apiCall(`${API_URL}/todos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Todo deleted successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete todo.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      toast.error('Error deleting todo.', { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleAuth = (tokens, action) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    toast.success(`${action} successful!`, { position: 'top-right', autoClose: 3000 });
  };

  const handleAuthError = (errorMessage) => {
    toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setTodos([]);
    setUser(null);
    setIsAllView(false);
    if (socket.current) {
      socket.current.disconnect();
    }
    toast.success('Logged out successfully!', { position: 'top-right', autoClose: 3000 });
  };

  const toggleForm = () => {
    setShowRegister(!showRegister);
  };

  const toggleView = () => {
    setIsAllView(!isAllView);
    toast.info(`Switched to ${!isAllView ? 'All Todos' : 'My Todos'} view`, {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="app-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <motion.h1
          className="app-title"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Todo App
        </motion.h1>
        {accessToken && user ? (
          <motion.div
            key={isAllView ? 'all' : 'my'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="user-info">
              <span>Welcome, {user.username} ({user.role})</span>
              <motion.button
                onClick={handleLogout}
                className="logout-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
            {user.role === 'admin' && (
              <motion.button
                onClick={toggleView}
                className="toggle-view-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isAllView ? 'View My Todos' : 'View All Todos'}
              </motion.button>
            )}
            <TodoForm addTodo={addTodo} />
            {loading ? (
              <p className="loading">Loading todos...</p>
            ) : (
              <TodoList todos={todos} updateTodo={updateTodo} deleteTodo={deleteTodo} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={showRegister ? 'register' : 'login'}
            initial={{ opacity: 0, x: showRegister ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: showRegister ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {showRegister ? (
              <Register onRegister={handleAuth} onError={handleAuthError} />
            ) : (
              <Login onLogin={handleAuth} onError={handleAuthError} />
            )}
            <motion.button
              onClick={toggleForm}
              className="toggle-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showRegister ? 'Switch to Login' : 'Switch to Register'}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;