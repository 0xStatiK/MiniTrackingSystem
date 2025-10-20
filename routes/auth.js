// routes/auth.js

const express = require('express');

const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'All fields are required.', code: 'VALIDATION_ERROR' },
      });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username must be 3-50 characters.', field: 'username' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid email format.', field: 'email' },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 8 characters.', field: 'password' },
      });
    }

    // Check duplicates
    if (User.usernameExists(username)) {
      return res.status(409).json({
        success: false,
        error: { message: 'Username already taken.', field: 'username' },
      });
    }

    if (User.emailExists(email)) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email already registered.', field: 'email' },
      });
    }
    // Create user
    const user = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      data: { message: 'User registered successfully', userId: user.id },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to register user' },
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username and password are required' },
      });
    }

    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid username or password', code: 'INVALID_CREDENTIALS' },
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid username or password', code: 'INVALID_CREDENTIALS' },
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = Boolean(user.is_admin);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: Boolean(user.is_admin),
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' },
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: { message: 'Logout failed' },
      });
    }

    res.clearCookie('connect.sid');
    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });
});

// GET /api/auth/check
router.get('/check', (req, res) => {
  if (req.session && req.session.userId) {
    const user = User.findById(req.session.userId);
    if (user) {
      return res.json({
        success: true,
        data: {
          authenticated: true,
          user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
        },
      });
    }
  }

  res.json({
    success: true,
    data: { authenticated: false },
  });
});

module.exports = router;
