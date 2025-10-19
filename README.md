# MiniTrackingSystem

A self-hosted web application for tracking Warhammer 40k miniature collections with multi-user support, public/private lists, and detailed metadata tracking.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML, CSS, JavaScript (ES8)
- **Authentication**: Session-based with bcrypt

## Features

### Phase 1 (MVP)
- User registration and authentication (admin + test user)
- Create, edit, and delete miniature lists
- Public/private list visibility toggle
- Add miniatures with detailed tracking:
  - Name, faction, unit type, points value
  - Assembly status (Not Started, In Progress, Assembled)
  - Painting status (Unpainted, Primed, Base Coated, Detailed, Finished)
  - Metadata (paint colors, techniques, purchase date, cost, storage location, notes)
- Browse public lists from other users (read-only)
- Admin panel for managing factions, unit types, and miniatures library

### Phase 2 (Enhanced Features)
- Warhammer 40k data integration (GitHub sources)
- Advanced painting progress tracking with dates
- Image uploads (Cloudinary integration)
- OAuth login (Google, Discord)
- Reporting and analytics dashboard
- Frontend framework migration (React/Vue consideration)

### Phase 3 (Deployment & Advanced)
- Docker containerization
- Proxmox VM deployment
- Army list building with points calculator
- Social features (follow users, comments, likes)
- Performance optimization
- Security hardening

---

## Development Task List

### PHASE 1: MVP (Core Functionality)

#### 1. Project Setup & Architecture

- [x]] 1.1 Initialize Node.js project
  - Create package.json with npm init
  - Set up project metadata

- [x] 1.2 Install core dependencies
  - express (web framework)
  - better-sqlite3 (database - faster, synchronous SQLite driver)
  - bcrypt (password hashing)
  - express-session (session management)
  - dotenv (environment variables)

- [x] 1.3 Create project folder structure
  ```
  /MiniTrackingSystem
    /public
      /css
      /js
      /images
    /views
    /routes
    /models
    /middleware
    /database
      /migrations
      /seeds
    /config
    server.js
    .env
    .gitignore
  ```

- [x] 1.4 Set up Express.js server
  - Create server.js with basic Express app
  - Configure middleware (body-parser, session, static files)
  - Set up basic error handling

- [x] 1.5 Configure SQLite database connection
  - Create database connection module
  - Set up database initialization script

---

#### 2. Database Design & Schema

- [ ] 2.1 Design database schema
  - Create ERD (Entity Relationship Diagram) document or comment block

- [ ] 2.2 Create users table
  ```sql
  users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  ```

- [ ] 2.3 Create factions table
  ```sql
  factions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
  )
  ```

- [ ] 2.4 Create unit_types table
  ```sql
  unit_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
  )
  ```

- [ ] 2.5 Create miniatures table
  ```sql
  miniatures (
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
  )
  ```

- [ ] 2.6 Create lists table
  ```sql
  lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
  ```

- [ ] 2.7 Create list_items table
  ```sql
  list_items (
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
  )
  ```

- [ ] 2.8 Create metadata table
  ```sql
  metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_item_id INTEGER NOT NULL,
    paint_colors TEXT,
    techniques TEXT,
    purchase_date DATE,
    cost REAL,
    storage_location TEXT,
    custom_notes TEXT,
    FOREIGN KEY (list_item_id) REFERENCES list_items(id) ON DELETE CASCADE
  )
  ```

- [ ] 2.9 Create migration scripts
  - Write SQL file to create all tables
  - Create migration runner script

- [ ] 2.10 Create seed data
  - Add admin user (username: admin)
  - Add test user (username: testuser)
  - Add basic factions (Space Marines, Chaos, Orks, Tyranids, etc.)
  - Add basic unit types (Troops, HQ, Elites, Fast Attack, Heavy Support, etc.)
  - Add sample miniatures for testing

---

#### 3. Backend API Development (Express.js)

- [ ] 3.1 Create authentication routes
  - POST /api/auth/register - User registration
  - POST /api/auth/login - User login
  - POST /api/auth/logout - User logout
  - GET /api/auth/check - Check if user is authenticated

- [ ] 3.2 Create authentication middleware
  - isAuthenticated - Verify user is logged in
  - isAdmin - Verify user has admin privileges

- [ ] 3.3 Create user routes
  - GET /api/users/me - Get current user profile
  - PUT /api/users/me - Update current user profile

- [ ] 3.4 Create faction routes
  - GET /api/factions - Get all factions
  - GET /api/factions/:id - Get single faction
  - POST /api/factions - Create faction (admin only)
  - PUT /api/factions/:id - Update faction (admin only)
  - DELETE /api/factions/:id - Delete faction (admin only)

- [ ] 3.5 Create unit type routes
  - GET /api/unit-types - Get all unit types
  - GET /api/unit-types/:id - Get single unit type
  - POST /api/unit-types - Create unit type (admin only)
  - PUT /api/unit-types/:id - Update unit type (admin only)
  - DELETE /api/unit-types/:id - Delete unit type (admin only)

- [ ] 3.6 Create miniature routes
  - GET /api/miniatures - Get all miniatures (with filtering)
  - GET /api/miniatures/:id - Get single miniature with full details
  - POST /api/miniatures - Create miniature (admin only)
  - PUT /api/miniatures/:id - Update miniature (admin only)
  - DELETE /api/miniatures/:id - Delete miniature (admin only)

- [ ] 3.7 Create list routes
  - GET /api/lists - Get current user's lists
  - GET /api/lists/public - Get all public lists
  - GET /api/lists/:id - Get single list with items
  - POST /api/lists - Create new list
  - PUT /api/lists/:id - Update list
  - DELETE /api/lists/:id - Delete list

- [ ] 3.8 Create list item routes
  - POST /api/lists/:id/items - Add miniature to list
  - PUT /api/list-items/:id - Update list item (status, quantity, notes)
  - DELETE /api/list-items/:id - Remove item from list

- [ ] 3.9 Create metadata routes
  - GET /api/list-items/:id/metadata - Get metadata for list item
  - POST /api/list-items/:id/metadata - Create/update metadata
  - PUT /api/metadata/:id - Update metadata
  - DELETE /api/metadata/:id - Delete metadata

- [ ] 3.10 Implement input validation
  - Validate all request bodies
  - Sanitize user inputs
  - Return clear error messages

- [ ] 3.11 Implement authorization logic
  - Users can only edit their own lists
  - Public lists are readable by anyone
  - Private lists only visible to owner
  - Admin can manage factions/units/miniatures

- [ ] 3.12 Add error handling
  - Global error handler middleware
  - Consistent error response format
  - Log errors appropriately

---

#### 4. Frontend Development (HTML/CSS/JS)

- [ ] 4.1 Create index.html (Landing/Login Page)
  - Header with app title and logo area
  - Login form (username, password)
  - Link to registration page
  - Responsive layout

- [ ] 4.2 Create register.html (Registration Page)
  - Registration form (username, email, password, confirm password)
  - Link back to login
  - Client-side validation

- [ ] 4.3 Create dashboard.html (User Dashboard)
  - Header with user info and logout button
  - Navigation menu (Dashboard, Miniatures Library, Admin Panel if admin)
  - Display user's lists (cards/grid layout)
  - "Create New List" button
  - Show list names, item counts, privacy status
  - Click to view list details

- [ ] 4.4 Create list-view.html (Detailed List View)
  - List header (name, description, public/private toggle)
  - "Add Miniature" button
  - Table/grid of miniatures in list:
    - Miniature name, faction, unit type
    - Quantity
    - Assembly status (dropdown/select)
    - Painting status (dropdown/select)
    - Edit metadata button
    - Delete button
  - Statistics summary (total miniatures, completion %)
  - Back to dashboard button

- [ ] 4.5 Create miniatures-library.html (Browse All Miniatures)
  - Search and filter controls (by faction, unit type, name)
  - Grid/table of all miniatures in database
  - Miniature details (name, faction, unit type, points)
  - "Add to List" button for each miniature
  - Pagination if needed

- [ ] 4.6 Create admin-panel.html (Admin Management)
  - Tabs for Factions, Unit Types, Miniatures
  - CRUD forms for each entity type
  - Tables showing existing data
  - Only accessible to admin users

- [ ] 4.7 Create public-lists.html (Browse Public Lists)
  - Grid of public lists from all users
  - Show list owner, name, item count
  - Click to view list details (read-only)

- [ ] 4.8 Create CSS stylesheet (css/style.css)
  - CSS reset/normalize
  - Color scheme and typography
  - Header and navigation styles
  - Form styles (inputs, buttons, selects)
  - Card/grid layouts
  - Table styles
  - Modal styles (for add/edit forms)
  - Responsive breakpoints (mobile, tablet, desktop)
  - Loading states and transitions

- [ ] 4.9 Create main JavaScript file (js/app.js)
  - API utility functions (fetch wrappers with error handling)
  - Authentication state management
  - Page initialization logic
  - Form validation helpers
  - Show/hide modal functions
  - Toast/notification system for user feedback

- [ ] 4.10 Implement login functionality (js/login.js)
  - Handle login form submission
  - Store session/token
  - Redirect to dashboard on success
  - Display error messages

- [ ] 4.11 Implement registration functionality (js/register.js)
  - Handle registration form submission
  - Client-side validation
  - Password confirmation check
  - Redirect to login on success

- [ ] 4.12 Implement dashboard functionality (js/dashboard.js)
  - Fetch and display user's lists
  - Create new list modal/form
  - Delete list with confirmation
  - Navigate to list view

- [ ] 4.13 Implement list view functionality (js/list-view.js)
  - Fetch and display list items
  - Add miniature to list (search/select from library)
  - Update item status (assembly, painting)
  - Edit metadata modal
  - Delete item with confirmation
  - Toggle list privacy
  - Calculate and display statistics

- [ ] 4.14 Implement miniatures library functionality (js/library.js)
  - Fetch and display all miniatures
  - Search and filter logic
  - Add to list functionality
  - Pagination if needed

- [ ] 4.15 Implement admin panel functionality (js/admin.js)
  - CRUD operations for factions
  - CRUD operations for unit types
  - CRUD operations for miniatures
  - Form handling and validation
  - Restrict access to admin users

- [ ] 4.16 Implement public lists functionality (js/public-lists.js)
  - Fetch and display public lists
  - View public list details (read-only)
  - Filter by user or search

- [ ] 4.17 Add loading states and error handling
  - Loading spinners during API calls
  - Error message display
  - Empty state messages

---

#### 5. Core Features Implementation

- [ ] 5.1 User authentication flow
  - Test registration
  - Test login/logout
  - Test session persistence
  - Test password hashing

- [ ] 5.2 List management
  - Test create list
  - Test edit list details
  - Test delete list
  - Test public/private toggle

- [ ] 5.3 Miniature tracking
  - Test add miniature to list
  - Test update quantity
  - Test update assembly status
  - Test update painting status
  - Test remove miniature from list

- [ ] 5.4 Metadata management
  - Test add/edit metadata
  - Test all metadata fields (paint colors, techniques, purchase date, cost, storage, notes)
  - Test metadata display

- [ ] 5.5 Public list browsing
  - Test viewing public lists
  - Test privacy controls work correctly
  - Test read-only access

- [ ] 5.6 Admin functionality
  - Test faction CRUD
  - Test unit type CRUD
  - Test miniature CRUD
  - Test admin-only access controls

---

#### 6. Testing & Documentation

- [ ] 6.1 Test all API endpoints
  - Use Postman or curl to test each endpoint
  - Test success cases
  - Test error cases (validation, authorization)
  - Test edge cases

- [ ] 6.2 Test authentication and authorization
  - Test logged out vs logged in access
  - Test admin vs regular user access
  - Test session expiration

- [ ] 6.3 Test frontend functionality
  - Test all forms
  - Test all buttons and links
  - Test responsive design on different screen sizes
  - Test browser compatibility

- [ ] 6.4 Create/update README.md
  - Project description
  - Features list
  - Setup instructions
  - How to run the application
  - Default login credentials

- [ ] 6.5 Document API endpoints
  - Create API.md with all endpoints
  - Include request/response examples
  - Document authentication requirements

- [ ] 6.6 Add code comments
  - Comment complex logic
  - Document function parameters and return values
  - Add JSDoc comments where helpful

- [ ] 6.7 Create .env.example
  - Document all required environment variables
  - Provide example values

---

### PHASE 2: Enhanced Features & Improvements

#### 7. Warhammer 40k Data Integration

- [ ] 7.1 Research GitHub data sources
  - Evaluate Depot repository structure
  - Evaluate UnitCrunch data format
  - Determine best import strategy

- [ ] 7.2 Create data import script
  - Parse external data format
  - Map to internal database schema
  - Handle duplicates

- [ ] 7.3 Implement faction/unit data seeding
  - Import comprehensive faction list
  - Import unit types and categories
  - Import miniature data with stats

- [ ] 7.4 Add custom unit creation
  - Allow users to add custom factions
  - Allow users to add custom unit types
  - Allow users to add custom miniatures

- [ ] 7.5 Create data update mechanism
  - Manual refresh button in admin panel
  - Check for data source updates
  - Merge new data without losing custom entries

---

#### 8. Advanced Painting Progress Tracking

- [ ] 8.1 Add painting_stages table
  ```sql
  painting_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_item_id INTEGER NOT NULL,
    stage_name TEXT NOT NULL,
    completed_date DATE,
    notes TEXT,
    FOREIGN KEY (list_item_id) REFERENCES list_items(id) ON DELETE CASCADE
  )
  ```

- [ ] 8.2 Create painting progress API endpoints
  - POST /api/list-items/:id/stages - Add painting stage
  - GET /api/list-items/:id/stages - Get all stages for item
  - PUT /api/stages/:id - Update stage
  - DELETE /api/stages/:id - Delete stage

- [ ] 8.3 Implement painting progress UI
  - Timeline view of painting stages
  - Add stage modal
  - Progress percentage calculation
  - Date tracking for each stage

- [ ] 8.4 Create painting statistics
  - Average time per miniature
  - Most used painting techniques
  - Completion rate over time
  - Painting velocity (minis per month)

---

#### 9. Image Upload System

- [ ] 9.1 Set up Cloudinary account
  - Create account and get API keys
  - Configure upload presets

- [ ] 9.2 Install Cloudinary SDK
  - npm install cloudinary multer

- [ ] 9.3 Create images table
  ```sql
  images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_item_id INTEGER NOT NULL,
    cloudinary_id TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    image_type TEXT CHECK(image_type IN ('WIP', 'Finished', 'Detail', 'Other')),
    caption TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_item_id) REFERENCES list_items(id) ON DELETE CASCADE
  )
  ```

- [ ] 9.4 Create image upload API endpoints
  - POST /api/list-items/:id/images - Upload image
  - GET /api/list-items/:id/images - Get all images for item
  - DELETE /api/images/:id - Delete image

- [ ] 9.5 Implement image upload UI
  - File upload form with drag-and-drop
  - Image type selector (WIP, Finished, etc.)
  - Caption field
  - Image preview before upload

- [ ] 9.6 Create image gallery view
  - Grid of thumbnails
  - Lightbox for full-size view
  - Navigation between images
  - Before/after slider for WIP vs Finished

- [ ] 9.7 Add fallback to local storage
  - Create uploads folder
  - Implement local file storage
  - Serve images as static files

---

#### 10. OAuth Integration

- [ ] 10.1 Install OAuth libraries
  - npm install passport passport-google-oauth20 passport-discord

- [ ] 10.2 Set up Google OAuth
  - Create Google Cloud project
  - Configure OAuth consent screen
  - Get client ID and secret
  - Implement Google strategy

- [ ] 10.3 Set up Discord OAuth
  - Create Discord application
  - Get client ID and secret
  - Implement Discord strategy

- [ ] 10.4 Update users table
  - Add google_id column
  - Add discord_id column
  - Make password_hash optional

- [ ] 10.5 Create OAuth routes
  - GET /api/auth/google - Initiate Google OAuth
  - GET /api/auth/google/callback - Handle Google callback
  - GET /api/auth/discord - Initiate Discord OAuth
  - GET /api/auth/discord/callback - Handle Discord callback

- [ ] 10.6 Update login UI
  - Add "Login with Google" button
  - Add "Login with Discord" button
  - Handle OAuth redirects

- [ ] 10.7 Implement account linking
  - Allow users to link Google/Discord to existing account
  - Account settings page

---

#### 11. Reporting & Analytics

- [ ] 11.1 Create statistics API endpoints
  - GET /api/stats/user - Get current user statistics
  - GET /api/stats/list/:id - Get statistics for specific list

- [ ] 11.2 Implement user statistics calculations
  - Total miniatures owned
  - Total miniatures painted (by status)
  - Painting completion rate
  - Total points value across all armies
  - Most painted faction
  - Total spending
  - Spending over time

- [ ] 11.3 Implement list statistics calculations
  - Total miniatures in list
  - Total points value
  - Completion percentage
  - Assembly status breakdown
  - Painting status breakdown

- [ ] 11.4 Create statistics dashboard page
  - Overview cards (totals, percentages)
  - Charts and graphs (use Chart.js or similar)
  - Timeline of activity
  - Faction breakdown pie chart
  - Painting progress over time line chart

- [ ] 11.5 Add data export functionality
  - Export user data to CSV
  - Export user data to JSON
  - Export specific list to CSV
  - Download button in UI

- [ ] 11.6 Create reports page
  - Customizable date ranges
  - Filterable by list, faction, status
  - Printable format

---

#### 12. Frontend Framework Migration (Optional)

- [ ] 12.1 Evaluate React vs Vue.js
  - Consider learning curve
  - Consider community support
  - Consider bundle size
  - Make decision

- [ ] 12.2 Set up build tooling
  - Install Vite or Create React App
  - Configure bundler
  - Set up development server

- [ ] 12.3 Plan component architecture
  - Identify reusable components
  - Plan component hierarchy
  - Plan state management approach

- [ ] 12.4 Migrate authentication pages
  - Convert Login page to component
  - Convert Register page to component
  - Implement route guards

- [ ] 12.5 Migrate dashboard
  - Create Dashboard component
  - Create ListCard component
  - Implement state management

- [ ] 12.6 Migrate list view
  - Create ListView component
  - Create ListItem component
  - Create AddMiniatureModal component

- [ ] 12.7 Migrate remaining pages
  - Convert all remaining pages
  - Update routing
  - Test functionality

- [ ] 12.8 Improve UI/UX
  - Add animations and transitions
  - Improve responsive design
  - Add keyboard navigation
  - Improve accessibility

---

### PHASE 3: Deployment & Advanced Features

#### 13. Deployment Setup

- [ ] 13.1 Create Dockerfile
  - Define base image
  - Copy application files
  - Install dependencies
  - Set up entry point

- [ ] 13.2 Create docker-compose.yml
  - Define services
  - Configure volumes for database persistence
  - Set up networking

- [ ] 13.3 Set up environment variables
  - Create production .env
  - Document all variables
  - Secure sensitive values

- [ ] 13.4 Configure Proxmox VM
  - Create VM with appropriate resources
  - Install Docker and Docker Compose
  - Configure networking and firewall

- [ ] 13.5 Set up reverse proxy
  - Install and configure Nginx or Traefik
  - Configure SSL/TLS certificates (Let's Encrypt)
  - Set up domain routing

- [ ] 13.6 Deploy application
  - Build Docker image
  - Deploy to VM
  - Run migrations
  - Seed production database

- [ ] 13.7 Set up monitoring
  - Application logs
  - Error tracking
  - Performance monitoring

- [ ] 13.8 Set up backup strategy
  - Database backups
  - User upload backups
  - Automated backup schedule

---

#### 14. Army List Building

- [ ] 14.1 Research Warhammer 40k army building rules
  - Point limits
  - Detachment rules
  - Unit composition requirements

- [ ] 14.2 Create army_lists table
  ```sql
  army_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    faction_id INTEGER NOT NULL,
    points_limit INTEGER NOT NULL,
    detachment_type TEXT,
    is_valid BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (faction_id) REFERENCES factions(id)
  )
  ```

- [ ] 14.3 Create army_list_units table
  ```sql
  army_list_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    army_list_id INTEGER NOT NULL,
    miniature_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    wargear TEXT,
    FOREIGN KEY (army_list_id) REFERENCES army_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (miniature_id) REFERENCES miniatures(id)
  )
  ```

- [ ] 14.4 Implement points calculator
  - Calculate total points for army list
  - Include wargear costs
  - Validate against points limit

- [ ] 14.5 Implement army composition validation
  - Check required unit types (HQ, Troops, etc.)
  - Validate detachment rules
  - Check unit limits

- [ ] 14.6 Create army list builder UI
  - Drag-and-drop or add/remove units
  - Points tracker (running total)
  - Validation feedback
  - Save/load army lists

- [ ] 14.7 Add print/export functionality
  - Format for printing
  - Export to PDF
  - Export to text format

---

#### 15. Social Features

- [ ] 15.1 Create user profiles
  - Public profile page
  - Display username, join date, statistics
  - Show public lists
  - Bio/description field

- [ ] 15.2 Implement follow system
  - Create follows table
  - Follow/unfollow functionality
  - Following/followers lists

- [ ] 15.3 Add comments on public lists
  - Create comments table
  - POST /api/lists/:id/comments
  - Display comments on list view
  - Edit/delete own comments

- [ ] 15.4 Add likes on public lists
  - Create likes table
  - POST /api/lists/:id/like
  - Display like count
  - Show who liked

- [ ] 15.5 Create activity feed
  - Recent activities from followed users
  - New public lists
  - Painting completions
  - Feed page in UI

- [ ] 15.6 Implement list sharing
  - Generate shareable link
  - QR code for list
  - Embed code for external sites

---

#### 16. Performance & Optimization

- [ ] 16.1 Database query optimization
  - Add indexes on frequently queried columns
  - Optimize JOIN queries
  - Use prepared statements

- [ ] 16.2 Implement caching
  - Cache frequently accessed data (factions, unit types)
  - Use Redis or in-memory cache
  - Cache invalidation strategy

- [ ] 16.3 Optimize image loading
  - Lazy load images
  - Use responsive images
  - Implement progressive loading

- [ ] 16.4 Code minification
  - Minify CSS and JavaScript
  - Use bundler for production builds
  - Remove unused code

- [ ] 16.5 Implement lazy loading
  - Load lists on scroll (infinite scroll or pagination)
  - Load images only when visible
  - Defer non-critical JavaScript

- [ ] 16.6 Monitor and optimize bundle size
  - Analyze bundle composition
  - Code splitting
  - Tree shaking

---

#### 17. Security Hardening

- [ ] 17.1 Implement rate limiting
  - Limit API requests per user
  - Protect against brute force attacks
  - Use express-rate-limit

- [ ] 17.2 Add CSRF protection
  - Generate CSRF tokens
  - Validate tokens on state-changing requests
  - Use csurf middleware

- [ ] 17.3 SQL injection prevention audit
  - Use parameterized queries everywhere
  - Validate and sanitize all inputs
  - Review all database interactions

- [ ] 17.4 XSS prevention audit
  - Escape user-generated content
  - Use Content Security Policy headers
  - Sanitize HTML inputs

- [ ] 17.5 Set security headers
  - Helmet.js middleware
  - HTTPS only
  - X-Frame-Options
  - X-Content-Type-Options

- [ ] 17.6 Regular dependency updates
  - Set up automated dependency scanning
  - npm audit regularly
  - Update vulnerable packages

- [ ] 17.7 Implement proper session management
  - Secure session cookies
  - Session timeout
  - Logout invalidates session

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite3

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MiniTrackingSystem

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:init

# Seed database with initial data
npm run db:seed

# Start development server
npm run dev
```

### Default Login Credentials

- **Admin User**
  - Username: `admin`
  - Password: `admin123` (change immediately)

- **Test User**
  - Username: `testuser`
  - Password: `test123`

---

## API Documentation

See [API.md](./API.md) for detailed API endpoint documentation.

---

## Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## License

See [LICENSE](./LICENSE) file for details.

---

## Resources & Learning

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Node.js Guide](https://github.com/TryGhost/node-sqlite3)
- [RESTful API Design](https://restfulapi.net/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [Warhammer 40k Data Sources](https://github.com/fjlaubscher/depot)

---

## Project Status

**Current Phase**: Phase 1 - MVP Development

Track progress by checking off tasks above as they are completed.
