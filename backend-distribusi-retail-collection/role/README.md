# Role API Documentation

API untuk mengelola data role/peran pengguna dalam sistem distribusi retail.

## Base URL
```
http://localhost:5050/api/v1/roles
```

## Authentication
Semua endpoint memerlukan Bearer Token authentication.

**Header:**
```
Authorization: Bearer {access_token}
Accept: application/json
```

---

## Endpoints

### 1. Get All Roles
Mengambil daftar semua role yang tersedia.

**Request:**
```http
GET /api/v1/roles/
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "role_id_1",
      "name": "Admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "menus": [
        {
          "id": "menu_id_1",
          "name": "Dashboard",
          "url": "/dashboard",
          "icon": "dashboard"
        }
      ]
    }
  ]
}
```

---

### 2. Create Role
Membuat role baru dengan menu yang dapat diakses.

**Request:**
```http
POST /api/v1/roles
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "name": "new role",
  "menuIds": [
    "cmeef18710005ydcq4dsy8k12"
  ]
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Nama role |
| menuIds | array | Yes | Array ID menu yang dapat diakses role ini |

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "role_id_1",
    "name": "new role",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "menus": [
      {
        "id": "cmeef18710005ydcq4dsy8k12",
        "name": "Dashboard",
        "url": "/dashboard",
        "icon": "dashboard"
      }
    ]
  }
}
```

---

### 3. Update Menus by Role
Memperbarui menu yang dapat diakses oleh role tertentu.

**Request:**
```http
PUT /api/v1/roles/{role_id}/menus
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role_id | string | Yes | ID unik role |

**Body:**
```json
{
  "menuIds": [
    "cmeef18850005ydcq4dsy8k1q",
    "cmeef18890006ydcqmfikzahj",
    "cmeef18800003ydcqcd04s8zh"
  ]
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| menuIds | array | Yes | Array ID menu yang dapat diakses role ini |

**Response:**
```json
{
  "success": true,
  "message": "Role menus updated successfully",
  "data": {
    "id": "role_id_1",
    "name": "Admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "menus": [
      {
        "id": "cmeef18850005ydcq4dsy8k1q",
        "name": "Users",
        "url": "/users",
        "icon": "users"
      },
      {
        "id": "cmeef18890006ydcqmfikzahj",
        "name": "Settings",
        "url": "/settings",
        "icon": "settings"
      },
      {
        "id": "cmeef18800003ydcqcd04s8zh",
        "name": "Reports",
        "url": "/reports",
        "icon": "reports"
      }
    ]
  }
}
```

---

### 4. Delete Role
Menghapus role.

**Request:**
```http
DELETE /api/v1/roles/{role_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role_id | string | Yes | ID unik role |

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Role name is required"
    },
    {
      "field": "menuIds",
      "message": "At least one menu must be selected"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Role not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Role name already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

- Role tidak dapat dihapus jika masih digunakan oleh user
- Menu yang tidak valid akan diabaikan saat update
- Setiap role harus memiliki minimal satu menu yang dapat diakses
