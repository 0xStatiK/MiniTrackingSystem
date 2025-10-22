// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (for forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ============================================
// ROUTES
// ============================================

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/factions', require('./routes/factions'));
app.use('/api/unit-types', require('./routes/unitTypes'));
app.use('/api/miniatures', require('./routes/miniatures'));
// app.use('/api/lists', require('./routes/lists')); // TODO: Create routes/lists.js

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
