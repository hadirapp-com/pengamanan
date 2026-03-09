# Menu Management API Documentation

## Overview
The Menu Management API provides role-based menu access control with hierarchical menu support. Menus can be assigned to specific roles and organized in a parent-child structure.

## Base URL
```
/menus
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header.

## Role-Based Access
- **Admin users**: Can access all endpoints and manage all menus
- **Regular users**: Can only view menus they have access to

## Endpoints

### 1. Get All Menus
**GET** `/menus`

Returns a paginated list of menus filtered by the user's role.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or href

**Response:**
```json
{
  "result": [
    {
      "id": "uuid",
      "name": "Dashboard",
      "href": "/app",
      "icon": "BarChart3",
      "hasChildren": "false",
      "parentId": null,
      "order": "0",
      "isActive": "true",
      "allowedRoles": "admin,user",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. Get Menu by ID
**GET** `/menus/:id`

Returns a specific menu by ID (if user has access).

**Response:**
```json
{
  "result": {
    "id": "uuid",
    "name": "Dashboard",
    "href": "/app",
    "icon": "BarChart3",
    "hasChildren": "false",
    "parentId": null,
    "order": "0",
    "isActive": "true",
    "allowedRoles": "admin,user",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Get Menus by Role (Hierarchical)
**GET** `/menus/by-role/:role`

Returns a hierarchical tree of menus for a specific role. Only admins can request menus for other roles.

**Response:**
```json
{
  "result": [
    {
      "id": "uuid",
      "name": "Reports",
      "href": "/app/reports",
      "icon": "FileText",
      "hasChildren": "true",
      "parentId": null,
      "order": "5",
      "isActive": "true",
      "allowedRoles": "admin",
      "children": [
        {
          "id": "uuid-2",
          "name": "Delivery Reports",
          "href": "/app/reports/deliveries",
          "icon": "FileBarChart",
          "hasChildren": "false",
          "parentId": "uuid",
          "order": "0",
          "isActive": "true",
          "allowedRoles": "admin",
          "children": []
        }
      ]
    }
  ]
}
```

### 4. Create Menu (Admin Only)
**POST** `/menus`

Creates a new menu item.

**Request Body:**
```json
{
  "name": "New Menu",
  "href": "/app/new-menu",
  "icon": "Plus",
  "hasChildren": false,
  "parentId": null,
  "order": 0,
  "isActive": true,
  "allowedRoles": "admin,user"
}
```

**Response:**
```json
{
  "message": "Menu created successfully",
  "menu": {
    "id": "uuid",
    "name": "New Menu",
    "href": "/app/new-menu",
    "icon": "Plus",
    "hasChildren": "false",
    "parentId": null,
    "order": "0",
    "isActive": "true",
    "allowedRoles": "admin,user",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Update Menu (Admin Only)
**PUT** `/menus/:id`

Updates an existing menu item.

**Request Body:**
```json
{
  "name": "Updated Menu",
  "href": "/app/updated-menu",
  "icon": "Edit",
  "isActive": true,
  "allowedRoles": "admin"
}
```

**Response:**
```json
{
  "message": "Menu updated successfully",
  "menu": {
    "id": "uuid",
    "name": "Updated Menu",
    "href": "/app/updated-menu",
    "icon": "Edit",
    "hasChildren": "false",
    "parentId": null,
    "order": "0",
    "isActive": "true",
    "allowedRoles": "admin",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 6. Delete Menu (Admin Only)
**DELETE** `/menus/:id`

Deletes a menu item. Cannot delete menus with children.

**Response:**
```json
{
  "message": "Menu deleted successfully"
}
```

## Menu Schema

### Menu Object
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Display name
  href: string;            // Navigation URL
  icon: string;            // Icon name (optional)
  hasChildren: string;     // "true" or "false"
  parentId: string | null; // Parent menu ID (for hierarchical structure)
  order: string;           // Display order
  isActive: string;        // "true" or "false"
  allowedRoles: string;    // Comma-separated list of allowed roles
  createdAt: string;       // Creation timestamp
  updatedAt: string;       // Last update timestamp
}
```

## Default Menus

The system comes with pre-configured menus:

### Admin Access Only:
- User Management
- Customer Management
- Menu Management
- Reports (with submenus)
- Settings

### Both Admin and User Access:
- Dashboard
- Delivery Management

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Token tidak ditemukan"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Menu not found"
}
```

### 400 Bad Request
```json
{
  "error": "Cannot delete menu with children. Please delete children first."
}
```

## Usage Examples

### Get menus for current user's role:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/menus/by-role/user
```

### Create a new menu (admin only):
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Analytics",
       "href": "/app/analytics",
       "icon": "BarChart",
       "allowedRoles": "admin"
     }' \
     http://localhost:3000/menus
```

### Update menu order:
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"order": 1}' \
     http://localhost:3000/menus/MENU_ID
``` 