// models/User.js
const bcrypt = require('bcrypt');
const { get, run, all } = require('../config/database');

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
        createdAt: user.created_at,
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
    const result = run('INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)', [
      username,
      email,
      passwordHash,
      0,
    ]);

    return {
      id: result.lastID,
      username,
      email,
      isAdmin: false,
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
    return bcrypt.compare(plainPassword, passwordHash);
  }

  /**
   * Get all users (admin only)
   * @returns {Array} Array of user objects
   */
  static getAll() {
    const users = all('SELECT id, username, email, is_admin, created_at FROM users');
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: Boolean(user.is_admin),
      createdAt: user.created_at,
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
