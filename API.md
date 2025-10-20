# API Documentation

This document provides detailed information about all API endpoints in the MiniTrackingSystem.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Factions](#factions)
4. [Unit Types](#unit-types)
5. [Miniatures](#miniatures)
6. [Lists](#lists)
7. [List Items](#list-items)
8. [Metadata](#metadata)
9. [Response Format](#response-format)
10. [Error Handling](#error-handling)

---

## Base URL

```
http://localhost:3000/api
```

In production, replace with your deployed domain.

---

## Response Format

All API responses follow this standard format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE" // Optional
  }
}
```

---

## Authentication

Session-based authentication using cookies. After login, a session cookie is automatically included in subsequent requests.

### Register New User

**Endpoint:** `POST /api/auth/register`

**Authentication Required:** No

**Request Body:**

```json
{
  "username": "string (3-50 characters, required)",
  "email": "string (valid email, required)",
  "password": "string (min 8 characters, required)",
  "confirmPassword": "string (must match password, required)"
}
```

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "message": "User registered successfully",
    "userId": 123
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `409 Conflict` - Username or email already exists

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

---

### Login

**Endpoint:** `POST /api/auth/login`

**Authentication Required:** No

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@localhost",
      "isAdmin": true
    }
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication Required:** Yes

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

### Check Authentication Status

**Endpoint:** `GET /api/auth/check`

**Authentication Required:** No

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": 1,
      "username": "admin",
      "isAdmin": true
    }
  }
}
```

If not authenticated:

```json
{
  "success": true,
  "data": {
    "authenticated": false
  }
}
```

---

## Users

### Get Current User Profile

**Endpoint:** `GET /api/users/me`

**Authentication Required:** Yes

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@localhost",
    "isAdmin": true,
    "createdAt": "2025-10-19T12:00:00.000Z"
  }
}
```

---

### Update Current User Profile

**Endpoint:** `PUT /api/users/me`

**Authentication Required:** Yes

**Request Body:**

```json
{
  "email": "string (optional)",
  "password": "string (optional, min 8 characters)",
  "currentPassword": "string (required if changing password)"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

---

## Factions

### Get All Factions

**Endpoint:** `GET /api/factions`

**Authentication Required:** No

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Space Marines",
      "description": "The Angels of Death, superhuman warriors of the Imperium"
    },
    {
      "id": 2,
      "name": "Chaos Space Marines",
      "description": "Traitorous Space Marines who serve the Chaos Gods"
    }
  ]
}
```

---

### Get Single Faction

**Endpoint:** `GET /api/factions/:id`

**Authentication Required:** No

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Space Marines",
    "description": "The Angels of Death, superhuman warriors of the Imperium"
  }
}
```

**Error Responses:**

- `404 Not Found` - Faction not found

---

### Create Faction

**Endpoint:** `POST /api/factions`

**Authentication Required:** Yes (Admin only)

**Request Body:**

```json
{
  "name": "string (required, unique)",
  "description": "string (optional)"
}
```

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 11,
    "name": "Chaos Daemons",
    "description": "Entities from the Warp"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation errors
- `403 Forbidden` - Not an admin user
- `409 Conflict` - Faction name already exists

---

### Update Faction

**Endpoint:** `PUT /api/factions/:id`

**Authentication Required:** Yes (Admin only)

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Faction updated successfully"
  }
}
```

---

### Delete Faction

**Endpoint:** `DELETE /api/factions/:id`

**Authentication Required:** Yes (Admin only)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Faction deleted successfully"
  }
}
```

**Error Responses:**

- `403 Forbidden` - Not an admin user
- `404 Not Found` - Faction not found
- `409 Conflict` - Faction is in use by miniatures

---

## Unit Types

### Get All Unit Types

**Endpoint:** `GET /api/unit-types`

**Authentication Required:** No

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "HQ",
      "description": "Headquarters units - leaders and commanders"
    },
    {
      "id": 2,
      "name": "Troops",
      "description": "Core infantry units"
    }
  ]
}
```

---

### Create, Update, Delete Unit Types

Similar structure to Factions endpoints. See [Factions](#factions) for reference.

- `GET /api/unit-types/:id` - Get single unit type
- `POST /api/unit-types` - Create (Admin only)
- `PUT /api/unit-types/:id` - Update (Admin only)
- `DELETE /api/unit-types/:id` - Delete (Admin only)

---

## Miniatures

### Get All Miniatures

**Endpoint:** `GET /api/miniatures`

**Authentication Required:** No

**Query Parameters:**

- `faction` (integer, optional) - Filter by faction ID
- `unitType` (integer, optional) - Filter by unit type ID
- `search` (string, optional) - Search by name
- `limit` (integer, optional) - Results per page (default: 50)
- `offset` (integer, optional) - Pagination offset (default: 0)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "miniatures": [
      {
        "id": 1,
        "name": "Space Marine Intercessors",
        "factionId": 1,
        "factionName": "Space Marines",
        "unitTypeId": 2,
        "unitTypeName": "Troops",
        "pointsValue": 100,
        "baseSize": "32mm",
        "description": "Standard Primaris infantry",
        "createdAt": "2025-10-19T12:00:00.000Z"
      }
    ],
    "total": 5,
    "limit": 50,
    "offset": 0
  }
}
```

**Example:**

```bash
# Get all Space Marine units
curl http://localhost:3000/api/miniatures?faction=1

# Search for "Captain"
curl http://localhost:3000/api/miniatures?search=Captain
```

---

### Get Single Miniature

**Endpoint:** `GET /api/miniatures/:id`

**Authentication Required:** No

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Space Marine Intercessors",
    "faction": {
      "id": 1,
      "name": "Space Marines"
    },
    "unitType": {
      "id": 2,
      "name": "Troops"
    },
    "pointsValue": 100,
    "baseSize": "32mm",
    "description": "Standard Primaris infantry",
    "createdAt": "2025-10-19T12:00:00.000Z"
  }
}
```

---

### Create Miniature

**Endpoint:** `POST /api/miniatures`

**Authentication Required:** Yes (Admin only)

**Request Body:**

```json
{
  "name": "string (required)",
  "factionId": "integer (required)",
  "unitTypeId": "integer (required)",
  "pointsValue": "integer (optional)",
  "baseSize": "string (optional)",
  "description": "string (optional)"
}
```

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Space Marine Terminators",
    "factionId": 1,
    "unitTypeId": 3,
    "pointsValue": 200,
    "baseSize": "40mm",
    "description": "Elite armored warriors"
  }
}
```

---

### Update and Delete Miniatures

- `PUT /api/miniatures/:id` - Update miniature (Admin only)
- `DELETE /api/miniatures/:id` - Delete miniature (Admin only)

---

## Lists

### Get Current User's Lists

**Endpoint:** `GET /api/lists`

**Authentication Required:** Yes

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "My Space Marine Collection",
      "description": "All my painted Space Marines",
      "isPublic": true,
      "itemCount": 15,
      "createdAt": "2025-10-19T12:00:00.000Z",
      "updatedAt": "2025-10-19T14:30:00.000Z"
    }
  ]
}
```

---

### Get All Public Lists

**Endpoint:** `GET /api/lists/public`

**Authentication Required:** No

**Query Parameters:**

- `limit` (integer, optional) - Results per page (default: 20)
- `offset` (integer, optional) - Pagination offset (default: 0)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "lists": [
      {
        "id": 1,
        "userId": 1,
        "username": "admin",
        "name": "My Space Marine Collection",
        "description": "All my painted Space Marines",
        "itemCount": 15,
        "createdAt": "2025-10-19T12:00:00.000Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Get Single List

**Endpoint:** `GET /api/lists/:id`

**Authentication Required:** Conditional (required for private lists)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "list": {
      "id": 1,
      "userId": 1,
      "name": "My Space Marine Collection",
      "description": "All my painted Space Marines",
      "isPublic": true,
      "createdAt": "2025-10-19T12:00:00.000Z",
      "updatedAt": "2025-10-19T14:30:00.000Z"
    },
    "items": [
      {
        "id": 1,
        "miniatureId": 1,
        "miniatureName": "Space Marine Intercessors",
        "factionName": "Space Marines",
        "unitTypeName": "Troops",
        "quantity": 10,
        "assemblyStatus": "Assembled",
        "paintingStatus": "Finished",
        "notes": "Painted in Ultramarines colors",
        "addedAt": "2025-10-19T12:00:00.000Z"
      }
    ],
    "statistics": {
      "totalItems": 15,
      "totalPoints": 1500,
      "assemblyProgress": {
        "notStarted": 2,
        "inProgress": 3,
        "assembled": 10
      },
      "paintingProgress": {
        "unpainted": 1,
        "primed": 2,
        "baseCoated": 3,
        "detailed": 4,
        "finished": 5
      }
    }
  }
}
```

**Error Responses:**

- `403 Forbidden` - Private list owned by another user
- `404 Not Found` - List not found

---

### Create List

**Endpoint:** `POST /api/lists`

**Authentication Required:** Yes

**Request Body:**

```json
{
  "name": "string (required, max 100 characters)",
  "description": "string (optional)",
  "isPublic": "boolean (optional, default: false)"
}
```

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "My Ork Army",
    "description": "WAAAGH!",
    "isPublic": false
  }
}
```

---

### Update List

**Endpoint:** `PUT /api/lists/:id`

**Authentication Required:** Yes (Owner only)

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "isPublic": "boolean (optional)"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "List updated successfully"
  }
}
```

---

### Delete List

**Endpoint:** `DELETE /api/lists/:id`

**Authentication Required:** Yes (Owner only)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "List deleted successfully"
  }
}
```

---

## List Items

### Add Item to List

**Endpoint:** `POST /api/lists/:id/items`

**Authentication Required:** Yes (List owner only)

**Request Body:**

```json
{
  "miniatureId": "integer (required)",
  "quantity": "integer (optional, default: 1)",
  "assemblyStatus": "string (optional, default: 'Not Started')",
  "paintingStatus": "string (optional, default: 'Unpainted')",
  "notes": "string (optional)"
}
```

**Valid Assembly Status Values:**

- `Not Started`
- `In Progress`
- `Assembled`

**Valid Painting Status Values:**

- `Unpainted`
- `Primed`
- `Base Coated`
- `Detailed`
- `Finished`

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 25,
    "listId": 1,
    "miniatureId": 3,
    "quantity": 5,
    "assemblyStatus": "Not Started",
    "paintingStatus": "Unpainted"
  }
}
```

---

### Update List Item

**Endpoint:** `PUT /api/list-items/:id`

**Authentication Required:** Yes (List owner only)

**Request Body:**

```json
{
  "quantity": "integer (optional)",
  "assemblyStatus": "string (optional)",
  "paintingStatus": "string (optional)",
  "notes": "string (optional)"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "List item updated successfully"
  }
}
```

---

### Delete List Item

**Endpoint:** `DELETE /api/list-items/:id`

**Authentication Required:** Yes (List owner only)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Item removed from list"
  }
}
```

---

## Metadata

### Get Metadata for List Item

**Endpoint:** `GET /api/list-items/:id/metadata`

**Authentication Required:** Conditional (required for private lists)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "listItemId": 25,
    "paintColors": "Macragge Blue, Agrax Earthshade, Ultramarines Blue",
    "techniques": "Layering, edge highlighting, dry brushing",
    "purchaseDate": "2025-09-15",
    "cost": 45.99,
    "storageLocation": "Shelf A, Box 3",
    "customNotes": "Practice blending on shoulder pads"
  }
}
```

**Error Responses:**

- `404 Not Found` - No metadata exists for this item

---

### Create or Update Metadata

**Endpoint:** `POST /api/list-items/:id/metadata`

**Authentication Required:** Yes (List owner only)

**Request Body:**

```json
{
  "paintColors": "string (optional)",
  "techniques": "string (optional)",
  "purchaseDate": "string (YYYY-MM-DD format, optional)",
  "cost": "number (optional)",
  "storageLocation": "string (optional)",
  "customNotes": "string (optional)"
}
```

**Success Response:** `201 Created` or `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Metadata saved successfully",
    "id": 1
  }
}
```

---

### Delete Metadata

**Endpoint:** `DELETE /api/metadata/:id`

**Authentication Required:** Yes (List owner only)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Metadata deleted successfully"
  }
}
```

---

## Error Handling

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate, in use, etc.)
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Detailed error message",
    "code": "ERROR_CODE",
    "field": "fieldName" // For validation errors
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `DUPLICATE_ENTRY` - Resource already exists
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Not logged in
- `FORBIDDEN` - Insufficient permissions
- `INVALID_CREDENTIALS` - Wrong username/password
- `SESSION_EXPIRED` - Session has expired

---

## Rate Limiting

_To be implemented in Phase 3_

API endpoints will be rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

---

## Pagination

For endpoints that return lists (miniatures, public lists), use `limit` and `offset` query parameters:

```bash
# Get first 20 results
GET /api/miniatures?limit=20&offset=0

# Get next 20 results (page 2)
GET /api/miniatures?limit=20&offset=20
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 125,
    "limit": 20,
    "offset": 20,
    "hasMore": true
  }
}
```

---

## Testing with curl

### Example Workflow

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"test2@example.com","password":"SecurePass123","confirmPassword":"SecurePass123"}'

# 2. Login (save cookies)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser2","password":"SecurePass123"}'

# 3. Create a list (use saved cookies)
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"My First Army","description":"Learning to paint","isPublic":false}'

# 4. Add miniature to list
curl -X POST http://localhost:3000/api/lists/1/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"miniatureId":1,"quantity":10,"assemblyStatus":"Assembled","paintingStatus":"Primed"}'

# 5. Get list details
curl http://localhost:3000/api/lists/1 -b cookies.txt

# 6. Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

---

## WebSocket Support

_Planned for Phase 3_

Real-time updates for:

- New public lists
- Comments on lists
- Activity feed updates

---

## Changelog

### Version 1.0 (Phase 1 - Current)

- Initial API design
- Session-based authentication
- CRUD operations for all entities
- Public/private list system

### Version 2.0 (Phase 2 - Planned)

- OAuth integration
- Image upload endpoints
- Advanced statistics
- Data export endpoints

### Version 3.0 (Phase 3 - Planned)

- Army list builder endpoints
- Social features (follow, like, comment)
- WebSocket support
- Rate limiting

---

## Support

For issues or questions:

- Check the [README.md](README.md)
- See [GETTING_STARTED.md](GETTING_STARTED.md) for setup help
- Review [PLANNING.md](PLANNING.md) for architecture details
