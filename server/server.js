// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// console.log('JWT_SECRET in server.js:', process.env.JWT_SECRET);

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const userdataRoutes = require('./routes/userdata');
// const authRoutes = require('./routes/auth');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.NODE_ENV === 'production' ? 'https://the-numbers-game.onrender.com' : '*', // Update with actual frontend URL in production
//   },
// });

// app.set('io', io);

// const PORT = process.env.PORT || 3001;
// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   console.error('Error: MONGO_URI is not defined in .env file');
//   process.exit(1);
// }

// if (!process.env.JWT_SECRET) {
//   console.error('Error: JWT_SECRET is not defined in .env file');
//   process.exit(1);
// }

// // Middleware
// app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://the-numbers-game.onrender.com' : '*' })); // Update with actual frontend URL
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/userdata', userdataRoutes);
// app.use('/api/auth', authRoutes);

// // Start server
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





// //CODE TO BE DEPLOYED TO PRODUCTION ON RENDER
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Load .env first
console.log('JWT_SECRET in server.js:', process.env.JWT_SECRET); // Debug log

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const todoRoutes = require('./routes/todos');
const userdataRoutes = require('./routes/userdata');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://the-numbers-game.onrender.com' : '*', // Update with actual frontend URL in production
  },
});

app.set('io', io);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI and JWT_SECRET are defined
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// Middleware
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://the-numbers-game.onrender.com' : '*' })); // Update with actual frontend URL
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/userdata', userdataRoutes);
app.use('/api/auth', authRoutes);

// Serve React app for unmatched routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Socket.io authentication and rooms
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);

  socket.on('joinRoom', (room) => {
    if (room === `user_${socket.user.id}` || (room === 'admins' && socket.user.role === 'admin')) {
      socket.join(room);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
















// CODE FOR LOCALHOST DEVELOPMENT
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Load .env first
// console.log('JWT_SECRET in server.js:', process.env.JWT_SECRET); // Debug log

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const userdataRoutes = require('./routes/userdata');
// const todoRoutes = require('./routes/todos');
// const authRoutes = require('./routes/auth');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   },
// });

// app.set('io', io);

// const PORT = process.env.PORT || 3001;
// const MONGO_URI = process.env.MONGO_URI;

// // Check if MONGO_URI and JWT_SECRET are defined
// if (!MONGO_URI) {
//   console.error('Error: MONGO_URI is not defined in .env file');
//   process.exit(1);
// }
// if (!process.env.JWT_SECRET) {
//   console.error('Error: JWT_SECRET is not defined in .env file');
//   process.exit(1);
// }

// // Middleware
// app.use(cors({ origin: '*' }));
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

// // Routes
// app.use('/api/todos', todoRoutes);
// app.use('/api/userdata', userdataRoutes);
// app.use('/api/auth', authRoutes);

// // Socket.io authentication and rooms
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error('Authentication error'));
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = decoded;
//     next();
//   } catch (err) {
//     next(new Error('Authentication error'));
//   }
// });

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.user.id);

//   socket.on('joinRoom', (room) => {
//     if (room === `user_${socket.user.id}` || (room === 'admins' && socket.user.role === 'admin')) {
//       socket.join(room);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.user.id);
//   });
// });

// // Start server
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });