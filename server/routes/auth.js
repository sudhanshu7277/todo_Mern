// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const auth = require('../middleware/auth');

// // Debug log inside route
// router.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   console.log('Register request received:', { username });
//   console.log('JWT_SECRET in auth.js (route):', process.env.JWT_SECRET);
//   try {
//     if (!process.env.JWT_SECRET) {
//       console.error('JWT_SECRET is undefined in auth.js');
//       throw new Error('JWT_SECRET is not defined');
//     }
//     if (!process.env.REFRESH_TOKEN_SECRET) {
//       console.error('REFRESH_TOKEN_SECRET is undefined in auth.js');
//       throw new Error('REFRESH_TOKEN_SECRET is not defined');
//     }

//     let user = await User.findOne({ username });
//     if (user) return res.status(400).json({ message: 'User already exists' });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const userCount = await User.countDocuments();
//     const role = userCount === 0 ? 'admin' : 'user';

//     user = new User({ username, password: hashedPassword, role });
//     await user.save();

//     const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

//     user.refreshToken = refreshToken;
//     await user.save();

//     res.status(201).json({ accessToken, refreshToken });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const user = await User.findOne({ username });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

//     user.refreshToken = refreshToken;
//     await user.save();

//     res.json({ accessToken, refreshToken });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Refresh Token
// router.post('/refresh', async (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(403).json({ message: 'Invalid refresh token' });
//     }

//     const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

//     user.refreshToken = newRefreshToken;
//     await user.save();

//     res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
//   } catch (err) {
//     res.status(403).json({ message: 'Invalid refresh token' });
//   }
// });

// // Get current user info
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('username role _id');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;





// OLD WORING CODE 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Register request received:', { username });
  console.log('JWT_SECRET in auth.js (route):', process.env.JWT_SECRET); // Debug inside route
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is undefined in auth.js');
      throw new Error('JWT_SECRET is not defined');
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error('REFRESH_TOKEN_SECRET is undefined in auth.js');
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    console.log('Checking for existing user...');
    let user = await User.findOne({ username });
    if (user) {
      console.log('User already exists:', username);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Counting users for role assignment...');
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    console.log('Creating new user...');
    user = new User({ username, password: hashedPassword, role });
    await user.save();

    console.log('Generating tokens...');
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log('Saving refresh token...');
    user.refreshToken = refreshToken;
    await user.save();

    console.log('Registration successful:', username);
    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username role _id');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;