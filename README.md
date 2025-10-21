# MiniTrackingSystem

A self-hosted web application for tracking Warhammer 40k miniature collections with multi-user support, public/private lists, and detailed painting progress tracking.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Overview

MiniTrackingSystem helps Warhammer 40k hobbyists organize and track their miniature collections. Keep detailed records of your painting progress, assembly status, paint schemes, and more. Share your collections publicly or keep them private.

### Key Features

- **Collection Management** - Organize miniatures into custom lists
- **Progress Tracking** - Track assembly and painting status for each miniature
- **Detailed Metadata** - Record paint colors, techniques, purchase info, and storage locations
- **Multi-User Support** - User accounts with admin roles
- **Public Sharing** - Share your collections publicly or keep them private
- **Warhammer 40k Data** - Built-in faction and unit type databases

---

## Tech Stack

- **Backend:** Node.js, Express.js (v5.1.0)
- **Database:** SQLite with better-sqlite3 (v12.4.1)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Authentication:** Session-based with bcrypt password hashing
- **Development:** nodemon, dotenv

---

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

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

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Default Login Credentials

- **Admin Account**
  - Username: `admin`
  - Password: `admin123` (⚠️ Change immediately in production!)

- **Test User Account**
  - Username: `testuser`
  - Password: `test123`

---

## Project Structure

```
MiniTrackingSystem/
├── server.js                 # Express application entry point
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
│
├── config/
│   └── database.js          # Database connection configuration
│
├── database/
│   ├── minitracker.db       # SQLite database file (generated)
│   ├── migrations/          # Database schema migrations
│   │   ├── 001_initial_schema.sql
│   │   └── runMigrations.js
│   └── seeds/               # Seed data scripts
│       └── runSeeds.js
│
├── models/                  # Data access layer
│   ├── User.js
│   ├── Faction.js
│   ├── UnitType.js
│   └── Miniature.js
│
├── routes/                  # API route handlers
│   ├── auth.js
│   ├── users.js
│   ├── factions.js
│   ├── unitTypes.js
│   └── miniatures.js
│
├── middleware/              # Express middleware
│   └── auth.js             # Authentication/authorization
│
├── public/                  # Static assets
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── login.js
│   │   └── register.js
│   └── images/
│
└── views/                   # HTML templates
    ├── index.html          # Login page
    └── register.html       # Registration page
```

---

## Database Schema

The application uses SQLite with 7 main tables:

- **users** - User accounts with admin flags
- **factions** - Warhammer 40k factions (Space Marines, Orks, etc.)
- **unit_types** - Unit categories (HQ, Troops, Elites, etc.)
- **miniatures** - Master list of miniatures
- **lists** - User-created collection lists
- **list_items** - Miniatures in lists with tracking data
- **metadata** - Extended metadata for list items

See [PLANNING.md](PLANNING.md) for detailed Entity Relationship Diagrams.

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### Factions

- `GET /api/factions` - Get all factions
- `GET /api/factions/:id` - Get single faction
- `POST /api/factions` - Create faction (admin only)
- `PUT /api/factions/:id` - Update faction (admin only)
- `DELETE /api/factions/:id` - Delete faction (admin only)

### Unit Types

- `GET /api/unit-types` - Get all unit types
- `GET /api/unit-types/:id` - Get single unit type
- `POST /api/unit-types` - Create unit type (admin only)
- `PUT /api/unit-types/:id` - Update unit type (admin only)
- `DELETE /api/unit-types/:id` - Delete unit type (admin only)

### Miniatures

- `GET /api/miniatures` - Get all miniatures (with filters)
- `GET /api/miniatures/:id` - Get single miniature
- `POST /api/miniatures` - Create miniature (admin only)
- `PUT /api/miniatures/:id` - Update miniature (admin only)
- `DELETE /api/miniatures/:id` - Delete miniature (admin only)

See [API.md](API.md) for complete API documentation with request/response examples.

---

## Development

### NPM Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run db:init    # Initialize database (run migrations)
npm run db:seed    # Seed database with sample data
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database/minitracker.db

# Session Configuration
SESSION_SECRET=your-super-secret-key-change-this

# Admin Credentials (for seeding)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@localhost

# Test User Credentials (for seeding)
TEST_USERNAME=testuser
TEST_PASSWORD=test123
TEST_EMAIL=test@localhost
```

### Development Workflow

1. Make code changes
2. Server auto-restarts (nodemon)
3. Test with curl or browser
4. Commit changes with git

---

## Roadmap

### Phase 1: MVP (In Progress)

- ✅ Project setup and architecture
- ✅ Database schema and migrations
- ✅ Seed data system
- 🔄 Backend API routes
- ⏳ Frontend pages
- ⏳ User authentication flow
- ⏳ List management features

### Phase 2: Enhanced Features

- Warhammer 40k data integration (GitHub sources)
- Advanced painting progress tracking
- Image uploads via Cloudinary
- OAuth login (Google, Discord)
- Analytics and reporting dashboard
- Frontend framework migration (React/Vue)

### Phase 3: Deployment & Advanced

- Docker containerization
- Proxmox VM deployment
- Army list builder with points calculator
- Social features (follows, comments, likes)
- Performance optimization
- Security hardening

---

## Documentation

- **[README.md](README.md)** - Project overview (you are here!)
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Complete development guide for beginners
- **[IMPLEMENTATION_TASKS_9-12.md](IMPLEMENTATION_TASKS_9-12.md)** - Complete code for Lists, ListItems, Metadata
- **[API.md](API.md)** - Full API endpoint documentation
- **[PLANNING.md](PLANNING.md)** - System architecture and design decisions
- **[ESLINT_SETUP.md](ESLINT_SETUP.md)** - ESLint and Prettier configuration guide

---

## Contributing

This is a personal learning project, but suggestions and feedback are welcome! Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Share your experience using the system

### Development Guidelines

- Follow existing code style
- Add JSDoc comments to functions
- Include error handling in routes
- Write clear commit messages
- Test changes before submitting PRs

---

## Security Considerations

### For Development

- Change default admin password immediately
- Use strong SESSION_SECRET in .env
- Never commit .env file to git
- Database backups are not included in git

### For Production

- Use HTTPS only
- Set secure session cookies
- Implement rate limiting
- Regular dependency updates
- Database backups to secure location
- Consider using PostgreSQL instead of SQLite

---

## Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test API endpoints
curl http://localhost:3000/api/factions
curl http://localhost:3000/api/miniatures
```

See [API.md](API.md) for comprehensive testing examples.

---

## Troubleshooting

### Common Issues

**Port already in use**

```bash
# Change PORT in .env file
PORT=3001
```

**Database errors**

```bash
# Recreate database
rm database/minitracker.db
npm run db:init
npm run db:seed
```

**Module not found errors**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Session not persisting**

- Check SESSION_SECRET is set in .env
- Clear browser cookies
- Restart server

---

## License

[MIT License](LICENSE)

---

## Acknowledgments

- Warhammer 40k data from community sources
- Built with Express.js and SQLite
- Inspired by the Warhammer 40k hobby community

---

## Contact & Support

For questions or issues:

- Check the [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
- Review [API.md](API.md) for endpoint details
- See [PLANNING.md](PLANNING.md) for architecture information

---

**Made with ⚔️ for the Emperor**
