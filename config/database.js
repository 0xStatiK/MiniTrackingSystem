// config/database.js
const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'minitracker.db');

/**
 * Get database connection
 * @returns {Database} Database instance
 */
function getDatabase() {
  try {
    const db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log('Connected to SQLite database:', DB_PATH);
    return db;
  } catch (err) {
    console.error('Error opening database:', err.message);
    throw err;
  }
}

/**
 * Run a query that doesn't return data (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Result with lastInsertRowid and changes
 */
function run(sql, params = []) {
  const db = getDatabase();
  try {
    const result = db.prepare(sql).run(params);
    db.close();
    return { lastID: result.lastInsertRowid, changes: result.changes };
  } catch (err) {
    db.close();
    throw err;
  }
}

/**
 * Get a single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object|undefined} Single row or undefined
 */
function get(sql, params = []) {
  const db = getDatabase();
  try {
    const row = db.prepare(sql).get(params);
    db.close();
    return row;
  } catch (err) {
    db.close();
    throw err;
  }
}

/**
 * Get multiple rows
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Array} Array of rows
 */
function all(sql, params = []) {
  const db = getDatabase();
  try {
    const rows = db.prepare(sql).all(params);
    db.close();
    return rows;
  } catch (err) {
    db.close();
    throw err;
  }
}

module.exports = {
  getDatabase,
  run,
  get,
  all
};