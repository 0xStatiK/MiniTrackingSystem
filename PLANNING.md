# MiniTrackingSystem - Technical Planning & Architecture

This document provides detailed technical planning, architecture decisions, and design considerations for the Warhammer 40k Miniatures Inventory Tracking System.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [API Architecture](#api-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [Data Flow](#data-flow)
8. [Technology Decisions](#technology-decisions)
9. [Security Considerations](#security-considerations)
10. [Scalability & Performance](#scalability--performance)
11. [Future Enhancements](#future-enhancements)

---

## Project Overview

### Vision
A self-hosted web application that allows Warhammer 40k hobbyists to track their miniature collections, painting progress, and organize their armies with detailed metadata.

### Core Goals
- **Simple & Beginner-Friendly**: Easy to set up and run locally
- **Privacy-Focused**: Self-hosted with user control over data sharing
- **Comprehensive Tracking**: Detailed metadata for assembly, painting, and organization
- **Community Features**: Optional public sharing of collections

### Target Users
- Warhammer 40k hobbyists managing personal collections
- Painters tracking their progress and techniques
- Collectors organizing large inventories
- Army builders planning competitive lists

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (HTML/CSS/JavaScript - Browser)                            │
│                                                              │
│  - Login/Register Pages                                     │
│  - Dashboard (User's Lists)                                 │
│  - List View (Miniatures in List)                          │
│  - Miniatures Library                                       │
│  - Admin Panel                                              │
│  - Public Lists Browser                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/HTTPS
                   │ RESTful API Calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Node.js + Express.js)                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Middleware Layer                                   │    │
│  │  - Session Management                               │    │
│  │  - Authentication Check                             │    │
│  │  - Authorization Check                              │    │
│  │  - Input Validation                                 │    │
│  │  - Error Handling                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Route Handlers                                     │    │
│  │  - /api/auth/*        - Authentication              │    │
│  │  - /api/users/*       - User Management             │    │
│  │  - /api/factions/*    - Faction CRUD                │    │
│  │  - /api/unit-types/*  - Unit Type CRUD              │    │
│  │  - /api/miniatures/*  - Miniature CRUD              │    │
│  │  - /api/lists/*       - List Management             │    │
│  │  - /api/list-items/*  - List Item Management        │    │
│  │  - /api/metadata/*    - Metadata Management         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Business Logic Layer                               │    │
│  │  - User Service                                     │    │
│  │  - List Service                                     │    │
│  │  - Miniature Service                                │    │
│  │  - Statistics Calculator                            │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL Queries
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  (SQLite Database)                                          │
│                                                              │
│  - users                                                    │
│  - factions                                                 │
│  - unit_types                                               │
│  - miniatures                                               │
│  - lists                                                    │
│  - list_items                                               │
│  - metadata                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
/MiniTrackingSystem
├── server.js                    # Main application entry point
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables (not in git)
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore rules
├── README.md                    # Project documentation
├── PLANNING.md                  # This file
├── GETTING_STARTED.md           # Beginner setup guide
├── API.md                       # API documentation
│
├── /config                      # Configuration files
│   ├── database.js              # Database connection config
│   └── session.js               # Session configuration
│
├── /database                    # Database files
│   ├── minitracker.db           # SQLite database (not in git)
│   ├── /migrations              # Database migration scripts
│   │   └── 001_initial_schema.sql
│   └── /seeds                   # Seed data scripts
│       ├── 001_users.js
│       ├── 002_factions.js
│       ├── 003_unit_types.js
│       └── 004_sample_miniatures.js
│
├── /routes                      # API route handlers
│   ├── auth.js                  # Authentication routes
│   ├── users.js                 # User routes
│   ├── factions.js              # Faction routes
│   ├── unitTypes.js             # Unit type routes
│   ├── miniatures.js            # Miniature routes
│   ├── lists.js                 # List routes
│   ├── listItems.js             # List item routes
│   └── metadata.js              # Metadata routes
│
├── /models                      # Database models/queries
│   ├── User.js                  # User model
│   ├── Faction.js               # Faction model
│   ├── UnitType.js              # Unit type model
│   ├── Miniature.js             # Miniature model
│   ├── List.js                  # List model
│   ├── ListItem.js              # List item model
│   └── Metadata.js              # Metadata model
│
├── /middleware                  # Express middleware
│   ├── auth.js                  # Authentication middleware
│   ├── validation.js            # Input validation middleware
│   └── errorHandler.js          # Error handling middleware
│
├── /services                    # Business logic services
│   ├── authService.js           # Authentication logic
│   ├── listService.js           # List management logic
│   ├── statsService.js          # Statistics calculations
│   └── validationService.js     # Validation helpers
│
├── /public                      # Static files served to client
│   ├── /css
│   │   ├── style.css            # Main stylesheet
│   │   └── responsive.css       # Responsive design styles
│   ├── /js
│   │   ├── app.js               # Main app utilities
│   │   ├── login.js             # Login page logic
│   │   ├── register.js          # Registration page logic
│   │   ├── dashboard.js         # Dashboard logic
│   │   ├── list-view.js         # List view logic
│   │   ├── library.js           # Miniatures library logic
│   │   ├── admin.js             # Admin panel logic
│   │   └── public-lists.js      # Public lists browser logic
│   └── /images
│       └── logo.png             # App logo
│
└── /views                       # HTML pages
    ├── index.html               # Landing/login page
    ├── register.html            # Registration page
    ├── dashboard.html           # User dashboard
    ├── list-view.html           # Detailed list view
    ├── miniatures-library.html  # Browse miniatures
    ├── admin-panel.html         # Admin management
    └── public-lists.html        # Browse public lists
```

---

## Database Design

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │───┐
│ username        │   │
│ password_hash   │   │
│ email           │   │
│ is_admin        │   │
│ created_at      │   │
└─────────────────┘   │
                      │
                      │ 1:N
                      │
                      ▼
              ┌─────────────────┐
              │     lists       │
              ├─────────────────┤
              │ id (PK)         │───┐
              │ user_id (FK)    │   │
              │ name            │   │
              │ description     │   │
              │ is_public       │   │
              │ created_at      │   │
              │ updated_at      │   │
              └─────────────────┘   │
                                    │
                                    │ 1:N
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   list_items    │
                            ├─────────────────┤
                            │ id (PK)         │───┐
                            │ list_id (FK)    │   │
                            │ miniature_id(FK)│◄──┼──┐
                            │ quantity        │   │  │
                            │ assembly_status │   │  │
                            │ painting_status │   │  │
                            │ notes           │   │  │
                            │ added_at        │   │  │
                            └─────────────────┘   │  │
                                    │             │  │
                                    │ 1:1         │  │
                                    │             │  │
                                    ▼             │  │
                            ┌─────────────────┐   │  │
                            │    metadata     │   │  │
                            ├─────────────────┤   │  │
                            │ id (PK)         │   │  │
                            │ list_item_id(FK)│───┘  │
                            │ paint_colors    │      │
                            │ techniques      │      │
                            │ purchase_date   │      │
                            │ cost            │      │
                            │ storage_location│      │
                            │ custom_notes    │      │
                            └─────────────────┘      │
                                                     │
                                                     │ N:1
┌─────────────────┐                                 │
│   factions      │                                 │
├─────────────────┤                                 │
│ id (PK)         │───┐                            │
│ name            │   │                            │
│ description     │   │                            │
└─────────────────┘   │                            │
                      │ 1:N                        │
                      │                            │
                      ▼                            │
              ┌─────────────────┐                  │
              │   miniatures    │                  │
              ├─────────────────┤                  │
              │ id (PK)         │──────────────────┘
              │ name            │
              │ faction_id (FK) │
              │ unit_type_id(FK)│◄──┐
              │ points_value    │   │
              │ base_size       │   │
              │ description     │   │
              │ created_at      │   │
              └─────────────────┘   │
                                    │ N:1
┌─────────────────┐                 │
│   unit_types    │                 │
├─────────────────┤                 │
│ id (PK)         │─────────────────┘
│ name            │
│ description     │
└─────────────────┘
```

### Database Tables

#### 1. users
Stores user account information.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### 2. factions
Warhammer 40k factions (Space Marines, Chaos, Orks, etc.).

```sql
CREATE TABLE factions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE INDEX idx_factions_name ON factions(name);
```

#### 3. unit_types
Unit categories (Troops, HQ, Elites, etc.).

```sql
CREATE TABLE unit_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE INDEX idx_unit_types_name ON unit_types(name);
```

#### 4. miniatures
Master list of all miniature types.

```sql
CREATE TABLE miniatures (
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

CREATE INDEX idx_miniatures_faction ON miniatures(faction_id);
CREATE INDEX idx_miniatures_unit_type ON miniatures(unit_type_id);
CREATE INDEX idx_miniatures_name ON miniatures(name);
```

#### 5. lists
User-created collections/armies.

```sql
CREATE TABLE lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_lists_is_public ON lists(is_public);
```

#### 6. list_items
Miniatures in a user's list with tracking info.

```sql
CREATE TABLE list_items (
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

CREATE INDEX idx_list_items_list_id ON list_items(list_id);
CREATE INDEX idx_list_items_miniature_id ON list_items(miniature_id);
```

#### 7. metadata
Extended metadata for list items.

```sql
CREATE TABLE metadata (
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

CREATE INDEX idx_metadata_list_item_id ON metadata(list_item_id);
```

---

## API Architecture

### REST API Design Principles

1. **Resource-Based URLs**: URLs represent resources (nouns), not actions
2. **HTTP Methods**: Use appropriate HTTP verbs (GET, POST, PUT, DELETE)
3. **Stateless**: Each request contains all necessary information
4. **JSON Format**: All requests and responses use JSON
5. **Consistent Error Handling**: Standardized error response format

### API Endpoint Structure

```
/api
├── /auth
│   ├── POST   /register          # Create new user account
│   ├── POST   /login             # Authenticate user
│   ├── POST   /logout            # End user session
│   └── GET    /check             # Check if authenticated
│
├── /users
│   ├── GET    /me                # Get current user profile
│   └── PUT    /me                # Update current user profile
│
├── /factions
│   ├── GET    /                  # List all factions
│   ├── GET    /:id               # Get single faction
│   ├── POST   /                  # Create faction (admin)
│   ├── PUT    /:id               # Update faction (admin)
│   └── DELETE /:id               # Delete faction (admin)
│
├── /unit-types
│   ├── GET    /                  # List all unit types
│   ├── GET    /:id               # Get single unit type
│   ├── POST   /                  # Create unit type (admin)
│   ├── PUT    /:id               # Update unit type (admin)
│   └── DELETE /:id               # Delete unit type (admin)
│
├── /miniatures
│   ├── GET    /                  # List all miniatures (filterable)
│   ├── GET    /:id               # Get single miniature
│   ├── POST   /                  # Create miniature (admin)
│   ├── PUT    /:id               # Update miniature (admin)
│   └── DELETE /:id               # Delete miniature (admin)
│
├── /lists
│   ├── GET    /                  # Get current user's lists
│   ├── GET    /public            # Get all public lists
│   ├── GET    /:id               # Get single list with items
│   ├── POST   /                  # Create new list
│   ├── PUT    /:id               # Update list
│   ├── DELETE /:id               # Delete list
│   └── POST   /:id/items         # Add miniature to list
│
├── /list-items
│   ├── PUT    /:id               # Update list item
│   ├── DELETE /:id               # Remove item from list
│   └── GET    /:id/metadata      # Get metadata for item
│
└── /metadata
    ├── POST   /list-items/:id/metadata  # Create/update metadata
    ├── PUT    /:id                      # Update metadata
    └── DELETE /:id                      # Delete metadata
```

### Standard Response Formats

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details if applicable
    }
  }
}
```

#### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## Frontend Architecture

### Page Structure

#### 1. Landing/Login Page (index.html)
- Login form
- Link to registration
- App description/branding

#### 2. Registration Page (register.html)
- Registration form
- Client-side validation
- Password strength indicator

#### 3. Dashboard (dashboard.html)
- User's lists displayed as cards
- Create new list button
- Quick statistics overview
- Navigation menu

#### 4. List View (list-view.html)
- List header with edit options
- Table/grid of miniatures
- Add miniature button
- Filter and sort options
- Statistics panel

#### 5. Miniatures Library (miniatures-library.html)
- Searchable/filterable grid of all miniatures
- Quick add to list functionality
- Admin can edit miniatures

#### 6. Admin Panel (admin-panel.html)
- Tabs for Factions, Unit Types, Miniatures
- CRUD forms
- Data tables with edit/delete actions

#### 7. Public Lists Browser (public-lists.html)
- Grid of public lists from all users
- Search and filter
- View-only access to lists

### JavaScript Module Pattern

Each page has its own JS file with a consistent structure:

```javascript
// Example: dashboard.js
(function() {
  'use strict';

  // State management
  const state = {
    lists: [],
    currentUser: null,
    loading: false
  };

  // API calls
  const api = {
    fetchLists: async () => {
      // API call implementation
    },
    createList: async (listData) => {
      // API call implementation
    }
  };

  // DOM manipulation
  const ui = {
    renderLists: (lists) => {
      // Render lists to DOM
    },
    showLoading: () => {
      // Show loading spinner
    }
  };

  // Event handlers
  const events = {
    handleCreateList: (e) => {
      // Handle form submission
    }
  };

  // Initialization
  const init = async () => {
    // Set up event listeners
    // Load initial data
    // Render UI
  };

  // Run on page load
  document.addEventListener('DOMContentLoaded', init);
})();
```

---

## Authentication & Authorization

### Authentication Flow

```
1. User submits login form
   ↓
2. Server validates credentials
   ↓
3. Server creates session
   ↓
4. Server sets session cookie
   ↓
5. Client stores session info
   ↓
6. All subsequent requests include session cookie
   ↓
7. Server validates session on each request
```

### Session Management

```javascript
// Express session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### Authorization Levels

1. **Public**: Anyone (unauthenticated)
   - View public lists
   - View miniatures library (read-only)

2. **Authenticated User**: Logged-in users
   - Create/edit/delete own lists
   - Add miniatures to own lists
   - Toggle list privacy
   - View all public lists

3. **Admin**: Admin users only
   - All authenticated user permissions
   - Create/edit/delete factions
   - Create/edit/delete unit types
   - Create/edit/delete miniatures
   - Access admin panel

### Authorization Middleware

```javascript
// middleware/auth.js

// Check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: { message: 'Authentication required' }
  });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.isAdmin) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: { message: 'Admin privileges required' }
  });
};

// Check if user owns the resource
const isOwner = (resourceUserId) => {
  return (req, res, next) => {
    if (req.session.userId === resourceUserId) {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied' }
    });
  };
};
```

---

## Data Flow

### Creating a New List

```
User Action:
  Click "Create List" button
    ↓
Frontend:
  Show modal with form
    ↓
User fills in:
  - List name
  - Description
  - Public/Private toggle
    ↓
User clicks "Save"
    ↓
Frontend:
  Validate form data
  Send POST /api/lists with JSON body
    ↓
Backend:
  Validate session
  Validate input
  Insert into database
  Return new list with ID
    ↓
Frontend:
  Close modal
  Add new list to UI
  Show success message
```

### Adding Miniature to List

```
User Action:
  Click "Add Miniature" in list view
    ↓
Frontend:
  Show modal with miniatures library
  User searches/filters miniatures
    ↓
User selects miniature
User sets:
  - Quantity
  - Assembly status
  - Painting status
  - Notes
    ↓
User clicks "Add to List"
    ↓
Frontend:
  Send POST /api/lists/:id/items with:
    - miniature_id
    - quantity
    - assembly_status
    - painting_status
    - notes
    ↓
Backend:
  Validate session
  Verify list ownership
  Validate miniature exists
  Insert list_item
  Return new list_item with ID
    ↓
Frontend:
  Close modal
  Refresh list view
  Show success message
```

---

## Technology Decisions

### Why Node.js + Express.js?

**Pros:**
- ✅ JavaScript on both frontend and backend (consistent language)
- ✅ Beginner-friendly with extensive documentation
- ✅ Large ecosystem (npm packages)
- ✅ Fast development cycle
- ✅ Good for I/O-heavy applications

**Cons:**
- ❌ Single-threaded (but adequate for this use case)
- ❌ Callback complexity (mitigated with async/await)

### Why SQLite?

**Pros:**
- ✅ No separate database server needed
- ✅ Perfect for self-hosted applications
- ✅ Simple setup (just a file)
- ✅ Full SQL support
- ✅ Fast for small to medium datasets
- ✅ Easy backups (copy the .db file)

**Cons:**
- ❌ Limited concurrent writes (not an issue for single-user/small user base)
- ❌ Less suitable for high-traffic applications

**Future Migration Path:**
If scaling is needed later, can migrate to PostgreSQL or MySQL with minimal code changes.

### Why Vanilla JavaScript (for MVP)?

**Pros:**
- ✅ Learn fundamentals first
- ✅ No build step needed
- ✅ Faster initial development
- ✅ Easier debugging for beginners
- ✅ Smaller bundle size

**Cons:**
- ❌ More verbose DOM manipulation
- ❌ Less structured state management
- ❌ No component reusability

**Phase 2 Migration:**
After understanding fundamentals, can migrate to React or Vue.js for better structure and reusability.

---

## Security Considerations

### Password Security
- **bcrypt**: Use bcrypt for password hashing (10-12 salt rounds)
- **Never store plain text passwords**
- **Enforce minimum password length** (8+ characters recommended)

### Session Security
- **Secure cookies**: HTTPS only in production
- **HttpOnly flag**: Prevent JavaScript access to cookies
- **Session timeout**: Implement automatic logout
- **CSRF protection**: Add CSRF tokens (Phase 2)

### Input Validation
- **Server-side validation**: Never trust client input
- **SQL injection prevention**: Use parameterized queries
- **XSS prevention**: Escape user-generated content
- **Input sanitization**: Remove/escape dangerous characters

### API Security
- **Rate limiting**: Prevent brute force attacks (Phase 3)
- **Authentication on all routes**: Except public endpoints
- **Authorization checks**: Verify resource ownership
- **Error messages**: Don't leak sensitive information

### Database Security
- **Parameterized queries**: Prevent SQL injection
- **Foreign key constraints**: Maintain referential integrity
- **Cascade deletes**: Clean up orphaned records
- **Regular backups**: Automated backup strategy

---

## Scalability & Performance

### Database Optimization
- **Indexes**: Add indexes on frequently queried columns
- **Query optimization**: Use JOINs efficiently
- **Connection pooling**: Reuse database connections
- **Prepared statements**: Cache query plans

### Caching Strategy (Phase 2+)
- **In-memory cache**: Cache factions and unit types
- **Redis**: For session storage and caching
- **Cache invalidation**: Clear cache on updates

### Frontend Optimization
- **Lazy loading**: Load images and data on-demand
- **Pagination**: Limit results per page
- **Debouncing**: Delay search input processing
- **Minification**: Compress CSS and JS (production)

### Backend Optimization
- **Compression**: Gzip response bodies
- **Static file caching**: Set cache headers
- **Database connection pooling**
- **Async operations**: Use async/await everywhere

---

## Future Enhancements

### Phase 2 Features
1. **Warhammer 40k Data Integration**
   - Import faction/unit data from GitHub sources
   - Keep data updated with community sources

2. **Advanced Painting Tracking**
   - Timeline of painting stages
   - Progress percentage calculation
   - Painting statistics and velocity

3. **Image Uploads**
   - Cloudinary integration
   - Multiple images per miniature
   - Before/after comparisons
   - Gallery view

4. **OAuth Integration**
   - Google login
   - Discord login
   - Account linking

5. **Reporting & Analytics**
   - User statistics dashboard
   - Data visualizations (charts)
   - Export to CSV/JSON
   - Spending tracker

### Phase 3 Features
1. **Deployment**
   - Docker containerization
   - Proxmox VM setup
   - SSL/HTTPS configuration
   - Domain and DNS setup

2. **Army List Building**
   - Points calculator
   - Detachment rules validation
   - Print/export army lists
   - Rules compliance checking

3. **Social Features**
   - User profiles
   - Follow system
   - Comments on public lists
   - Like/favorite lists
   - Activity feed

4. **Performance**
   - Redis caching
   - Database query optimization
   - Image optimization
   - Code splitting

5. **Security Hardening**
   - Rate limiting
   - CSRF protection
   - Security headers
   - Penetration testing

---

## Development Best Practices

### Code Style
- Use consistent naming conventions (camelCase for JS, snake_case for SQL)
- Add comments for complex logic
- Write descriptive function and variable names
- Keep functions small and focused (single responsibility)

### Git Workflow
- Commit frequently with clear messages
- Use feature branches for new features
- Keep main branch stable
- Write meaningful commit messages

### Testing Strategy
- Manual testing for MVP
- Write unit tests for critical functions (Phase 2)
- Integration tests for API endpoints (Phase 2)
- E2E tests for user flows (Phase 3)

### Documentation
- Keep README.md updated
- Document API endpoints in API.md
- Add inline comments for complex code
- Create setup guides for new developers

---

## References & Resources

### Official Documentation
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Docs](https://expressjs.com/)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [MDN Web Docs](https://developer.mozilla.org/)

### Learning Resources
- [RESTful API Design](https://restfulapi.net/)
- [bcrypt Guide](https://www.npmjs.com/package/bcrypt)
- [Express.js Tutorial](https://expressjs.com/en/starter/installing.html)
- [SQLite with Node.js](https://github.com/TryGhost/node-sqlite3)

### Warhammer 40k Data Sources
- [Depot - W40k Companion App](https://github.com/fjlaubscher/depot)
- [UnitCrunch Data Exports](https://github.com/korzxd/UnitCrunch-data-exports)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [DB Browser for SQLite](https://sqlitebrowser.org/) - Database management
- [Visual Studio Code](https://code.visualstudio.com/) - Code editor

---

## Conclusion

This planning document provides a comprehensive overview of the technical architecture and design decisions for the MiniTrackingSystem. Refer back to this document as you build the application to ensure consistency and proper implementation of the planned features.

For getting started with development, see [GETTING_STARTED.md](./GETTING_STARTED.md).

For detailed task lists, see [README.md](./README.md).
