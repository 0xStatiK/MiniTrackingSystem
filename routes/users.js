// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

/**
 * GET /api/users/me
 * Get current user profile
 * Authentication required
 */
router.get('/me', isAuthenticated, (req, res) => {
  try {
    const user = User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user profile',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

/**
 * PUT /api/users/me
 * Update current user profile
 * Authentication required
 */
router.put('/me', isAuthenticated, async (req, res) => {
  try {
    const { email, password, currentPassword } = req.body;
    const userId = req.session.userId;

    // Validation
    if (!email && !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one field (email or password) is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // If changing password, verify current password first
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Current password is required to change password',
            code: 'VALIDATION_ERROR',
            field: 'currentPassword'
          }
        });
      }

      // Verify current password
      const user = User.findByUsername(req.session.username);
      const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Current password is incorrect',
            code: 'INVALID_CREDENTIALS',
            field: 'currentPassword'
          }
        });
      }

      // Validate new password
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

      // Update password
      await User.updatePassword(userId, password);
    }

    // Update email if provided
    if (email) {
      // Validate email format
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

      // Check if email is already in use by another user
      const existingUser = User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already in use',
            code: 'DUPLICATE_ENTRY',
            field: 'email'
          }
        });
      }

      User.updateEmail(userId, email);
    }

    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully'
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

module.exports = router;
