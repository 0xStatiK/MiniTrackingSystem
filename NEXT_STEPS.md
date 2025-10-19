# Next Steps: Detailed Development Guide

This document provides a detailed, step-by-step breakdown of the next 10 critical development tasks to complete Phase 1 of the MiniTrackingSystem.

**Current Status:** Project infrastructure complete, ready to build authentication and API routes.

**Estimated Time:** 8-12 hours for all 10 tasks (for someone learning as they go)

---

## Table of Contents

1. [Task 1: Create User Model](#task-1-create-user-model)
2. [Task 2: Create Authentication Middleware](#task-2-create-authentication-middleware)
3. [Task 3: Create Authentication Routes](#task-3-create-authentication-routes)
4. [Task 4: Wire Up Auth Routes in Server](#task-4-wire-up-auth-routes-in-server)
5. [Task 5: Test Authentication with curl](#task-5-test-authentication-with-curl)
6. [Task 6: Create Login Page (Frontend)](#task-6-create-login-page-frontend)
7. [Task 7: Create Registration Page](#task-7-create-registration-page)
8. [Task 8: Add Basic CSS Styling](#task-8-add-basic-css-styling)
9. [Task 9: Create JavaScript API Utilities](#task-9-create-javascript-api-utilities)
10. [Task 10: Test Full Auth Flow](#task-10-test-full-auth-flow)

---

## Task 1: Create User Model

**File:** `models/User.js`

**Purpose:** Encapsulate all database operations related to users.

**Estimated Time:** 30 minutes

### Implementation

```javascript
// models/User.js
const { get, run, all } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User Model
 * Handles all database operations for users
 */
class User {
  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|undefined} User object without password hash
   */
  static findById(id) {
    const user = get('SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?', [id]);
    if (user) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: Boolean(user.is_admin),
        createdAt: user.created_at
      };
    }
    return undefined;
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Object|undefined} User object WITH password hash (for authentication)
   */
  static findByUsername(username) {
    return get('SELECT * FROM users WHERE username = ?', [username]);
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Object|undefined} User object
   */
  static findByEmail(email) {
    return get('SELECT * FROM users WHERE email = ?', [email]);
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Plain text password (will be hashed)
   * @returns {Object} Created user with ID
   */
  static async create(userData) {
    const { username, email, password } = userData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = run(
      'INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, 0]
    );

    return {
      id: result.lastID,
      username,
      email,
      isAdmin: false
    };
  }

  /**
   * Update user email
   * @param {number} id - User ID
   * @param {string} email - New email
   */
  static updateEmail(id, email) {
    run('UPDATE users SET email = ? WHERE id = ?', [email, id]);
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} newPassword - New password (plain text, will be hashed)
   */
  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} passwordHash - Hashed password from database
   * @returns {boolean} True if password matches
   */
  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }

  /**
   * Get all users (admin only)
   * @returns {Array} Array of user objects
   */
  static getAll() {
    const users = all('SELECT id, username, email, is_admin, created_at FROM users');
    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: Boolean(user.is_admin),
      createdAt: user.created_at
    }));
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   */
  static delete(id) {
    run('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {boolean} True if username exists
   */
  static usernameExists(username) {
    const result = get('SELECT COUNT(*) as count FROM users WHERE username = ?', [username]);
    return result.count > 0;
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {boolean} True if email exists
   */
  static emailExists(email) {
    const result = get('SELECT COUNT(*) as count FROM users WHERE email = ?', [email]);
    return result.count > 0;
  }
}

module.exports = User;
```

### Testing

```bash
# Test in Node.js REPL
node
> const User = require('./models/User.js')
> User.findByUsername('admin')
> User.findById(1)
```

---

## Task 2: Create Authentication Middleware

**File:** `middleware/auth.js`

**Purpose:** Middleware functions to protect routes that require authentication or admin access.

**Estimated Time:** 20 minutes

### Implementation

```javascript
// middleware/auth.js

/**
 * Authentication Middleware
 * Protects routes that require user authentication
 */

/**
 * Check if user is authenticated
 * Allows request to continue if user is logged in
 * Otherwise returns 401 Unauthorized
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    // User is logged in, continue to next middleware/route
    return next();
  }

  // Not logged in
  return res.status(401).json({
    success: false,
    error: {
      message: 'Authentication required. Please log in.',
      code: 'UNAUTHORIZED'
    }
  });
}

/**
 * Check if user is an admin
 * Requires authentication first
 */
function isAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      }
    });
  }

  if (!req.session.isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Admin access required',
        code: 'FORBIDDEN'
      }
    });
  }

  // User is admin, continue
  next();
}

/**
 * Optional authentication
 * Adds user info to request if logged in, but doesn't require it
 */
function optionalAuth(req, res, next) {
  // Just pass through - user info will be in session if they're logged in
  next();
}

module.exports = {
  isAuthenticated,
  isAdmin,
  optionalAuth
};
```

---

## Task 3: Create Authentication Routes

**File:** `routes/auth.js`

**Purpose:** Handle registration, login, logout, and auth status checking.

**Estimated Time:** 45 minutes

### Implementation

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'All fields are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Username validation
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username must be between 3 and 50 characters',
          code: 'VALIDATION_ERROR',
          field: 'username'
        }
      });
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'VALIDATION_ERROR',
          field: 'email'
        }
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 8 characters',
          code: 'VALIDATION_ERROR',
          field: 'password'
        }
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Passwords do not match',
          code: 'VALIDATION_ERROR',
          field: 'confirmPassword'
        }
      });
    }

    // Check if username already exists
    if (User.usernameExists(username)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Username already taken',
          code: 'DUPLICATE_ENTRY',
          field: 'username'
        }
      });
    }

    // Check if email already exists
    if (User.emailExists(email)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Email already registered',
          code: 'DUPLICATE_ENTRY',
          field: 'email'
        }
      });
    }

    // Create user
    const user = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      data: {
        message: 'User registered successfully',
        userId: user.id
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to register user',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username and password are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Find user
    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid username or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid username or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = Boolean(user.is_admin);

    // Return user data (without password hash)
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: Boolean(user.is_admin)
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Logout failed',
          code: 'INTERNAL_ERROR'
        }
      });
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  });
});

/**
 * GET /api/auth/check
 * Check if user is authenticated
 */
router.get('/check', (req, res) => {
  if (req.session && req.session.userId) {
    const user = User.findById(req.session.userId);

    if (user) {
      return res.json({
        success: true,
        data: {
          authenticated: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          }
        }
      });
    }
  }

  res.json({
    success: true,
    data: {
      authenticated: false
    }
  });
});

module.exports = router;
```

---

## Task 4: Wire Up Auth Routes in Server

**File:** `server.js` (modify existing)

**Purpose:** Connect the authentication routes to the Express app.

**Estimated Time:** 5 minutes

### Implementation

Update the routes section in [server.js](server.js):

```javascript
// In server.js, find the ROUTES section and uncomment/add:

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
// app.use('/api/users', require('./routes/users'));     // Uncomment when created
// app.use('/api/factions', require('./routes/factions')); // Uncomment when created
// etc.
```

---

## Task 5: Test Authentication with curl

**Purpose:** Verify authentication works before building frontend.

**Estimated Time:** 15 minutes

### Test Commands

```bash
# 1. Check server health
curl http://localhost:3000/health

# 2. Check auth status (should be not authenticated)
curl http://localhost:3000/api/auth/check

# 3. Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Expected: {"success":true,"data":{"message":"User registered successfully","userId":3}}

# 4. Login with the test user (save cookies)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser2",
    "password": "SecurePass123"
  }'

# Expected: {"success":true,"data":{"user":{...}}}

# 5. Check auth status (should be authenticated)
curl http://localhost:3000/api/auth/check -b cookies.txt

# Expected: {"success":true,"data":{"authenticated":true,"user":{...}}}

# 6. Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt

# Expected: {"success":true,"data":{"message":"Logged out successfully"}}

# 7. Check auth status again (should be not authenticated)
curl http://localhost:3000/api/auth/check -b cookies.txt

# Expected: {"success":true,"data":{"authenticated":false}}
```

### Common Issues

- **Port already in use:** Change PORT in .env
- **Database error:** Run `npm run db:init` again
- **Module not found:** Check file paths and module.exports

---

## Task 6: Create Login Page (Frontend)

**File:** `views/index.html`

**Purpose:** Create a login form that users see when they visit the site.

**Estimated Time:** 30 minutes

### Implementation

```html
<!-- views/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - MiniTrackingSystem</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>MiniTrackingSystem</h1>
        <p>Track your Warhammer 40k miniature collection</p>
      </div>

      <form id="loginForm" class="auth-form">
        <h2>Login</h2>

        <div id="errorMessage" class="error-message hidden"></div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            autocomplete="username"
            placeholder="Enter your username"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
          >
        </div>

        <button type="submit" class="btn btn-primary" id="loginButton">
          Login
        </button>

        <div class="auth-footer">
          <p>Don't have an account? <a href="/register.html">Register here</a></p>
        </div>
      </form>

      <div class="demo-credentials">
        <p><strong>Demo Accounts:</strong></p>
        <p>Admin: <code>admin</code> / <code>admin123</code></p>
        <p>User: <code>testuser</code> / <code>test123</code></p>
      </div>
    </div>
  </div>

  <script src="/js/login.js"></script>
</body>
</html>
```

---

## Task 7: Create Registration Page

**File:** `public/register.html`

**Purpose:** Allow new users to create an account.

**Estimated Time:** 25 minutes

### Implementation

```html
<!-- public/register.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register - MiniTrackingSystem</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>MiniTrackingSystem</h1>
        <p>Create your account</p>
      </div>

      <form id="registerForm" class="auth-form">
        <h2>Register</h2>

        <div id="errorMessage" class="error-message hidden"></div>
        <div id="successMessage" class="success-message hidden"></div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            minlength="3"
            maxlength="50"
            autocomplete="username"
            placeholder="Choose a username (3-50 characters)"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autocomplete="email"
            placeholder="your.email@example.com"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="At least 8 characters"
          >
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="Re-enter your password"
          >
        </div>

        <button type="submit" class="btn btn-primary" id="registerButton">
          Register
        </button>

        <div class="auth-footer">
          <p>Already have an account? <a href="/">Login here</a></p>
        </div>
      </form>
    </div>
  </div>

  <script src="/js/register.js"></script>
</body>
</html>
```

---

## Task 8: Add Basic CSS Styling

**File:** `public/css/style.css`

**Purpose:** Make the login and registration pages look good.

**Estimated Time:** 30 minutes

### Implementation

```css
/* public/css/style.css */

/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* CSS Variables */
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --success-color: #16a34a;
  --error-color: #dc2626;
  --bg-color: #f3f4f6;
  --card-bg: #ffffff;
  --text-color: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #d1d5db;
  --input-border: #9ca3af;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Base Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Container */
.container {
  width: 100%;
  max-width: 450px;
}

/* Auth Card */
.auth-card {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 28px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Form Styles */
.auth-form h2 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-color);
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input::placeholder {
  color: var(--text-secondary);
}

/* Buttons */
.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.error-message,
.success-message {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.error-message {
  background-color: #fee2e2;
  color: var(--error-color);
  border: 1px solid #fca5a5;
}

.success-message {
  background-color: #d1fae5;
  color: var(--success-color);
  border: 1px solid #6ee7b7;
}

.hidden {
  display: none;
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.auth-footer p {
  font-size: 14px;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Demo Credentials */
.demo-credentials {
  margin-top: 24px;
  padding: 16px;
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 13px;
}

.demo-credentials p {
  margin-bottom: 4px;
}

.demo-credentials code {
  background-color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 500px) {
  .auth-card {
    padding: 24px;
  }

  .auth-header h1 {
    font-size: 24px;
  }

  .auth-form h2 {
    font-size: 20px;
  }
}
```

---

## Task 9: Create JavaScript API Utilities

**Purpose:** Create JavaScript functions to handle login and registration.

**Estimated Time:** 40 minutes

### File 1: `public/js/login.js`

```javascript
// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const loginButton = document.getElementById('loginButton');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    hideError();

    // Disable button during request
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login successful - redirect to dashboard
        window.location.href = '/dashboard.html';
      } else {
        // Show error message
        showError(data.error.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      showError('Network error. Please try again.');
    } finally {
      // Re-enable button
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }
});
```

### File 2: `public/js/register.js`

```javascript
// public/js/register.js

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const registerButton = document.getElementById('registerButton');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous messages
    hideError();
    hideSuccess();

    // Client-side validation
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    // Disable button during request
    registerButton.disabled = true;
    registerButton.textContent = 'Registering...';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Registration successful
        showSuccess('Registration successful! Redirecting to login...');

        // Clear form
        registerForm.reset();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } else {
        // Show error message
        showError(data.error.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      showError('Network error. Please try again.');
    } finally {
      // Re-enable button
      registerButton.disabled = false;
      registerButton.textContent = 'Register';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
  }

  function hideSuccess() {
    successMessage.classList.add('hidden');
  }
});
```

---

## Task 10: Test Full Auth Flow

**Purpose:** Verify everything works together.

**Estimated Time:** 20 minutes

### Testing Steps

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open browser to `http://localhost:3000`**

3. **Test Login with existing user:**
   - Try logging in with `admin` / `admin123`
   - Should redirect to `/dashboard.html` (which doesn't exist yet, so you'll see 404)
   - This is expected! We haven't built the dashboard yet.

4. **Test Registration:**
   - Click "Register here"
   - Fill in the form with a new username
   - Submit
   - Should see success message and redirect to login

5. **Test Login with new user:**
   - Login with the newly created account
   - Should work and redirect to dashboard

6. **Test Validation:**
   - Try registering with username that's too short (< 3 chars)
   - Try passwords that don't match
   - Try registering with existing username
   - All should show appropriate error messages

7. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for any JavaScript errors
   - Check Network tab to see API requests/responses

### Success Criteria

- ✅ Can register new user
- ✅ Can login with existing user
- ✅ Can login with newly registered user
- ✅ Error messages display correctly
- ✅ Form validation works
- ✅ Redirect happens after login (even if dashboard doesn't exist yet)
- ✅ No console errors

---

## What's Next?

After completing these 10 tasks, you will have:
- ✅ Working authentication system
- ✅ Login and registration pages
- ✅ Basic styling
- ✅ API endpoints for auth

**Next priorities:**
1. Create a simple dashboard page (even if empty)
2. Create List model and routes
3. Create Faction and Unit Type routes
4. Create Miniature model and routes
5. Build the dashboard UI to display lists

See [README.md](README.md) Task 3.3+ for continuing with the rest of the API routes.

---

## Troubleshooting

### Common Issues

**Issue: "Cannot find module 'models/User'"**
- Make sure you created `models/User.js`
- Check the file path in your require statement

**Issue: "Session not persisting"**
- Check that SESSION_SECRET is set in .env
- Make sure you're using cookies in curl tests (`-c cookies.txt` and `-b cookies.txt`)
- In browser, check that cookies are enabled

**Issue: "Database locked" error**
- Close any SQLite browser tools
- Restart the server

**Issue: Form submission doesn't work**
- Check browser console for errors
- Verify JavaScript file is loaded (check Network tab)
- Make sure form IDs match JavaScript selectors

**Issue: Styling not applied**
- Check that `/css/style.css` path is correct
- Hard refresh browser (Ctrl+Shift+R)
- Verify CSS file is served (check Network tab)

---

## Tips for Success

1. **Test each task before moving to the next** - Don't pile up errors
2. **Use console.log()** - Print variables to understand what's happening
3. **Read error messages** - They usually tell you exactly what's wrong
4. **Check the browser DevTools** - Network tab shows API calls, Console shows errors
5. **Commit your code** - After each working task, commit with git
6. **Take breaks** - Your brain needs rest to process new concepts

Good luck building your MiniTrackingSystem!
