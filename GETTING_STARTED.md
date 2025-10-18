# Getting Started with MiniTrackingSystem

This guide will walk you through setting up your development environment and building the MiniTrackingSystem from scratch. This guide is beginner-friendly and assumes you have basic knowledge of JavaScript but are new to web development with Node.js.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Phase 1 Walkthrough](#phase-1-walkthrough)
4. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
5. [Helpful Tips for Beginners](#helpful-tips-for-beginners)
6. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

Before you begin, make sure you have the following installed on your computer:

#### 1. Node.js (v16 or higher)

**What is it?** Node.js is a JavaScript runtime that lets you run JavaScript on your computer (not just in a browser).

**How to install:**
- Visit [nodejs.org](https://nodejs.org/)
- Download the LTS (Long Term Support) version
- Run the installer and follow the prompts
- Verify installation by opening a terminal and running:
  ```bash
  node --version
  npm --version
  ```
  You should see version numbers for both commands.

#### 2. Git

**What is it?** Git is a version control system that tracks changes to your code.

**How to install:**
- Visit [git-scm.com](https://git-scm.com/)
- Download and install for your operating system
- Verify installation:
  ```bash
  git --version
  ```

#### 3. A Code Editor

**Recommendation:** Visual Studio Code (VS Code)
- Visit [code.visualstudio.com](https://code.visualstudio.com/)
- Download and install
- Install helpful extensions:
  - "ESLint" (for code quality)
  - "SQLite" (for viewing database)
  - "REST Client" (for testing APIs)

#### 4. A Web Browser

**Recommendation:** Chrome or Firefox (both have good developer tools)

---

## Initial Setup

### Step 1: Navigate to Your Project

Open a terminal/command prompt and navigate to your project folder:

```bash
cd /home/glaive/Code/MiniTrackingSystem
```

### Step 2: Initialize Node.js Project

This creates a `package.json` file that tracks your project dependencies.

```bash
npm init -y
```

This creates a basic `package.json` file. You can edit it later to add more details.

### Step 3: Install Core Dependencies

Install the required npm packages:

```bash
npm install express better-sqlite3 bcrypt express-session dotenv
```

**What each package does:**
- **express**: Web framework for building the API
- **better-sqlite3**: Fast, synchronous SQLite3 database driver (better performance than sqlite3)
- **bcrypt**: Library for hashing passwords securely
- **express-session**: Session management for user login
- **dotenv**: Loads environment variables from a .env file

### Step 4: Install Development Dependencies

These are tools that help during development:

```bash
npm install --save-dev nodemon
```

**nodemon**: Automatically restarts your server when you make code changes.

### Step 5: Update package.json Scripts

Open `package.json` and add these scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:init": "node database/migrations/runMigrations.js",
    "db:seed": "node database/seeds/runSeeds.js"
  }
}
```

### Step 6: Create Folder Structure

Create all the necessary folders:

```bash
mkdir -p public/css public/js public/images views routes models middleware services database/migrations database/seeds config
```

**Explanation of folders:**
- `public/`: Files served directly to the browser (CSS, JS, images)
- `views/`: HTML files
- `routes/`: API route handlers
- `models/`: Database query functions
- `middleware/`: Express middleware (authentication, validation)
- `services/`: Business logic
- `database/`: Database files and scripts
- `config/`: Configuration files

### Step 7: Create .env File

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following content to `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database/minitracker.db

# Session Configuration
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Admin Credentials (for seeding)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@localhost

# Test User Credentials (for seeding)
TEST_USERNAME=testuser
TEST_PASSWORD=test123
TEST_EMAIL=test@localhost
```

**Important:** Change `SESSION_SECRET` to a random string for security!

### Step 8: Create .env.example

Create `.env.example` (safe to commit to git):

```bash
cp .env .env.example
```

Edit `.env.example` and replace sensitive values with placeholders:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database/minitracker.db

# Session Configuration
SESSION_SECRET=your-super-secret-key-here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this
ADMIN_EMAIL=admin@example.com

# Test User Credentials
TEST_USERNAME=testuser
TEST_PASSWORD=change-this
TEST_EMAIL=test@example.com
```

### Step 9: Update .gitignore

Create or update `.gitignore` to prevent committing sensitive files:

```bash
touch .gitignore
```

Add the following to `.gitignore`:

```
# Dependencies
node_modules/

# Environment variables
.env

# Database
database/*.db
database/*.db-journal

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
```

---

## Phase 1 Walkthrough

Now let's build the application step by step following the Phase 1 task list.

### Task 1.4: Set Up Express.js Server

Create `server.js` in the root directory:

```javascript
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
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// API routes will be added here later
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// etc.

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

**Test it:**
```bash
npm run dev
```

Open your browser to `http://localhost:3000/health` and you should see:
```json
{"status":"ok","message":"Server is running"}
```

### Task 1.5: Configure SQLite Database Connection

Create `config/database.js`:

```javascript
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
```

### Task 2.9: Create Migration Scripts

Create `database/migrations/001_initial_schema.sql`:

```sql
-- database/migrations/001_initial_schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Factions table
CREATE TABLE IF NOT EXISTS factions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_factions_name ON factions(name);

-- Unit types table
CREATE TABLE IF NOT EXISTS unit_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_unit_types_name ON unit_types(name);

-- Miniatures table
CREATE TABLE IF NOT EXISTS miniatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    faction_id INTEGER,
    unit_type_id INTEGER,
    points_value INTEGER,
    base_size TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faction_id) REFERENCES factions(id),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id)
);

CREATE INDEX IF NOT EXISTS idx_miniatures_faction ON miniatures(faction_id);
CREATE INDEX IF NOT EXISTS idx_miniatures_unit_type ON miniatures(unit_type_id);
CREATE INDEX IF NOT EXISTS idx_miniatures_name ON miniatures(name);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_is_public ON lists(is_public);

-- List items table
CREATE TABLE IF NOT EXISTS list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    miniature_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    assembly_status TEXT CHECK(assembly_status IN ('Not Started', 'In Progress', 'Assembled')) DEFAULT 'Not Started',
    painting_status TEXT CHECK(painting_status IN ('Unpainted', 'Primed', 'Base Coated', 'Detailed', 'Finished')) DEFAULT 'Unpainted',
    notes TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (miniature_id) REFERENCES miniatures(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_miniature_id ON list_items(miniature_id);

-- Metadata table
CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_item_id INTEGER NOT NULL,
    paint_colors TEXT,
    techniques TEXT,
    purchase_date DATE,
    cost REAL,
    storage_location TEXT,
    custom_notes TEXT,
    FOREIGN KEY (list_item_id) REFERENCES list_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_metadata_list_item_id ON metadata(list_item_id);
```

Create `database/migrations/runMigrations.js`:

```javascript
// database/migrations/runMigrations.js
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../../config/database');

const MIGRATIONS_DIR = __dirname;

async function runMigrations() {
  console.log('Running database migrations...');

  try {
    // Read the SQL file
    const sqlFile = path.join(MIGRATIONS_DIR, '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    const db = getDatabase();

    // Execute each statement
    for (const statement of statements) {
      db.prepare(statement).run();
    }

    db.close();
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
```

**Run the migration:**
```bash
npm run db:init
```

You should see: `✅ Migrations completed successfully!`

### Task 2.10: Create Seed Data

Create `database/seeds/runSeeds.js`:

```javascript
// database/seeds/runSeeds.js
const bcrypt = require('bcrypt');
const { run } = require('../../config/database');

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Seed users
    const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const testPasswordHash = await bcrypt.hash(process.env.TEST_PASSWORD || 'test123', 10);

    await run(`
      INSERT OR IGNORE INTO users (username, password_hash, email, is_admin)
      VALUES (?, ?, ?, ?)
    `, [process.env.ADMIN_USERNAME || 'admin', adminPasswordHash, process.env.ADMIN_EMAIL || 'admin@localhost', 1]);

    await run(`
      INSERT OR IGNORE INTO users (username, password_hash, email, is_admin)
      VALUES (?, ?, ?, ?)
    `, [process.env.TEST_USERNAME || 'testuser', testPasswordHash, process.env.TEST_EMAIL || 'test@localhost', 0]);

    console.log('✅ Users seeded');

    // Seed factions
    const factions = [
      ['Space Marines', 'The Angels of Death, superhuman warriors of the Imperium'],
      ['Chaos Space Marines', 'Traitorous Space Marines who serve the Chaos Gods'],
      ['Orks', 'Brutal and warlike green-skinned aliens'],
      ['Tyranids', 'Extra-galactic hive mind organism'],
      ['Aeldari', 'Ancient and advanced alien race'],
      ['T\'au Empire', 'Technologically advanced alien civilization'],
      ['Necrons', 'Ancient robotic race awakening from eons of slumber'],
      ['Imperial Guard', 'Vast armies of humanity\'s soldiers'],
      ['Adeptus Mechanicus', 'Tech-priests of Mars'],
      ['Genestealer Cults', 'Insidious alien-hybrid cults']
    ];

    for (const [name, description] of factions) {
      await run('INSERT OR IGNORE INTO factions (name, description) VALUES (?, ?)', [name, description]);
    }

    console.log('✅ Factions seeded');

    // Seed unit types
    const unitTypes = [
      ['HQ', 'Headquarters units - leaders and commanders'],
      ['Troops', 'Core infantry units'],
      ['Elites', 'Specialized veteran units'],
      ['Fast Attack', 'Fast-moving units'],
      ['Heavy Support', 'Heavy weapons and vehicles'],
      ['Flyer', 'Aircraft and flying units'],
      ['Dedicated Transport', 'Vehicles for transporting units'],
      ['Fortification', 'Defensive structures'],
      ['Lord of War', 'Super-heavy units']
    ];

    for (const [name, description] of unitTypes) {
      await run('INSERT OR IGNORE INTO unit_types (name, description) VALUES (?, ?)', [name, description]);
    }

    console.log('✅ Unit types seeded');

    // Seed sample miniatures
    const miniatures = [
      ['Space Marine Intercessors', 1, 2, 100, '32mm', 'Standard Primaris infantry'],
      ['Space Marine Captain', 1, 1, 80, '40mm', 'Commander of Space Marine forces'],
      ['Ork Boyz', 3, 2, 90, '32mm', 'Basic Ork infantry mob'],
      ['Tyranid Termagants', 4, 2, 60, '28mm', 'Basic Tyranid organisms'],
      ['Imperial Guard Infantry Squad', 8, 2, 65, '25mm', 'Standard human soldiers']
    ];

    for (const [name, faction_id, unit_type_id, points, base_size, description] of miniatures) {
      await run(`
        INSERT OR IGNORE INTO miniatures (name, faction_id, unit_type_id, points_value, base_size, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, faction_id, unit_type_id, points, base_size, description]);
    }

    console.log('✅ Sample miniatures seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log(`Admin - Username: ${process.env.ADMIN_USERNAME || 'admin'}, Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`Test User - Username: ${process.env.TEST_USERNAME || 'testuser'}, Password: ${process.env.TEST_PASSWORD || 'test123'}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
```

**Run the seed script:**
```bash
npm run db:seed
```

You should see success messages and default login credentials.

---

## Common Issues & Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:** Make sure you installed dependencies:
```bash
npm install
```

### Issue: "EADDRINUSE: address already in use"

**Solution:** Another process is using port 3000. Either:
1. Kill the other process
2. Change the PORT in your `.env` file

### Issue: "Error opening database"

**Solution:** Make sure the `database` folder exists:
```bash
mkdir -p database
```

### Issue: "Session secret is not set"

**Solution:** Make sure you created the `.env` file with SESSION_SECRET.

### Issue: Changes not reflecting in browser

**Solution:**
1. Make sure `nodemon` is running (npm run dev)
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache

---

## Helpful Tips for Beginners

### Understanding async/await

Many database operations are **asynchronous** - they take time to complete. We use `async/await` to handle this:

```javascript
// ❌ BAD - doesn't wait for database
function getUser(id) {
  return db.get('SELECT * FROM users WHERE id = ?', [id]);
}

// ✅ GOOD - waits for database
async function getUser(id) {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  return user;
}
```

### Debugging Tips

1. **Use console.log()**: Print variables to understand what's happening
   ```javascript
   console.log('User data:', user);
   ```

2. **Check browser console**: Press F12 to see JavaScript errors

3. **Use browser Network tab**: See what API requests are being made

4. **Read error messages**: They usually tell you exactly what's wrong

### Testing Your API

Use one of these methods to test your API endpoints:

1. **Browser**: For GET requests, just visit the URL
2. **curl**: Command-line tool
   ```bash
   curl http://localhost:3000/api/users
   ```
3. **Postman**: Visual API testing tool (free)
4. **VS Code REST Client extension**: Test APIs directly in your editor

---

## Next Steps

You've now completed the initial setup! Here's what to do next:

1. ✅ **Verify everything works:**
   - Server starts: `npm run dev`
   - Database initialized: `npm run db:init`
   - Database seeded: `npm run db:seed`

2. **Continue with Phase 1 tasks:**
   - Task 3.1: Create authentication routes
   - Task 3.2: Create authentication middleware
   - Task 4.1: Create index.html (login page)
   - And so on...

3. **Commit your progress:**
   ```bash
   git add .
   git commit -m "Initial project setup complete"
   ```

4. **Read the planning document:**
   - See [PLANNING.md](./PLANNING.md) for architecture details

5. **Reference the task list:**
   - See [README.md](./README.md) for the complete task list

---

## Learning Resources

### Recommended Tutorials

- **JavaScript:**
  - [JavaScript.info](https://javascript.info/) - Modern JavaScript tutorial
  - [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

- **Node.js & Express:**
  - [Express.js Guide](https://expressjs.com/en/guide/routing.html)
  - [Node.js Getting Started](https://nodejs.dev/learn)

- **SQL & SQLite:**
  - [SQLite Tutorial](https://www.sqlitetutorial.net/)
  - [SQL Basics](https://www.w3schools.com/sql/)

- **Web Development:**
  - [MDN Web Docs](https://developer.mozilla.org/)
  - [HTML & CSS Tutorial](https://www.internetingishard.com/)

### Community & Help

- **Stack Overflow**: Search for error messages
- **Reddit**: r/learnprogramming, r/node, r/javascript
- **Discord**: Node.js Discord, programming discords
- **Documentation**: Always check official docs first!

---

## Conclusion

You're now ready to start building the MiniTrackingSystem! Take it one task at a time, test frequently, and don't hesitate to look things up. Every developer uses Google and reads documentation constantly - it's part of the process!

Good luck, and have fun building your Warhammer 40k miniatures tracking app! 🚀

For questions or issues, refer back to this guide or the [PLANNING.md](./PLANNING.md) document.
