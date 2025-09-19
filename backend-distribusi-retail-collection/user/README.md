# User API Documentation

API untuk mengelola data user/pengguna dalam sistem distribusi retail.

## Base URL
```
http://localhost:5050/api/v1/users
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

### 1. Get All Users
Mengambil daftar semua user yang terdaftar dalam sistem.

**Request:**
```http
GET /api/v1/users/
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
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user_id_1",
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Administrator",
      "isActive": true,
      "role": {
        "id": "role_id_1",
        "name": "Admin",
        "menus": [
          {
            "id": "menu_id_1",
            "name": "Dashboard",
            "url": "/dashboard",
            "icon": "dashboard"
          }
        ]
      },
      "company": {
        "id": "company_id_1",
        "name": "PT Example",
        "code": "COMP001"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "user_id_2",
      "username": "manager",
      "email": "manager@example.com",
      "fullName": "Manager Name",
      "isActive": true,
      "role": {
        "id": "role_id_2",
        "name": "Manager",
        "menus": [
          {
            "id": "menu_id_2",
            "name": "Inventory",
            "url": "/inventory",
            "icon": "inventory"
          }
        ]
      },
      "company": {
        "id": "company_id_1",
        "name": "PT Example",
        "code": "COMP001"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get User by ID
Mengambil data user berdasarkan ID.

**Request:**
```http
GET /api/v1/users/{user_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | ID unik user |

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user_id_1",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Administrator",
    "isActive": true,
    "role": {
      "id": "role_id_1",
      "name": "Admin",
      "menus": [
        {
          "id": "menu_id_1",
          "name": "Dashboard",
          "url": "/dashboard",
          "icon": "dashboard"
        },
        {
          "id": "menu_id_2",
          "name": "Users",
          "url": "/users",
          "icon": "users"
        },
        {
          "id": "menu_id_3",
          "name": "Settings",
          "url": "/settings",
          "icon": "settings"
        }
      ]
    },
    "company": {
      "id": "company_id_1",
      "name": "PT Example",
      "code": "COMP001",
      "address": "Jl. Example No. 123, Jakarta",
      "phoneNumber": "021-1234567"
    },
    "profile": {
      "phoneNumber": "081234567890",
      "address": "Jl. User Address No. 456, Jakarta",
      "position": "System Administrator"
    },
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## User Data Structure

### User Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | ID unik user |
| username | string | Username untuk login |
| email | string | Email address user |
| fullName | string | Nama lengkap user |
| isActive | boolean | Status aktif user |
| role | object | Role dan permission user |
| company | object | Company yang terkait dengan user |
| profile | object | Informasi profil tambahan (opsional) |
| lastLogin | string | Waktu login terakhir (ISO 8601) |
| createdAt | string | Waktu pembuatan user (ISO 8601) |
| updatedAt | string | Waktu update terakhir (ISO 8601) |

### Role Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | ID unik role |
| name | string | Nama role |
| menus | array | Daftar menu yang dapat diakses |

### Menu Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | ID unik menu |
| name | string | Nama menu |
| url | string | URL menu |
| icon | string | Icon menu |

### Company Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | ID unik company |
| name | string | Nama company |
| code | string | Kode company |
| address | string | Alamat company (opsional) |
| phoneNumber | string | Nomor telepon company (opsional) |

### Profile Object
| Field | Type | Description |
|-------|------|-------------|
| phoneNumber | string | Nomor telepon user (opsional) |
| address | string | Alamat user (opsional) |
| position | string | Posisi/jabatan user (opsional) |

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
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

## User Management Notes

### User Creation
- User baru dibuat melalui endpoint register di auth API
- User harus memiliki role yang valid
- User harus terkait dengan company yang valid
- Username dan email harus unik

### User Permissions
- User hanya dapat mengakses menu sesuai dengan role yang diberikan
- Admin memiliki akses penuh ke semua menu
- Manager memiliki akses terbatas sesuai konfigurasi role
- User biasa hanya dapat mengakses menu yang diizinkan

### User Status
- User dapat diaktifkan atau dinonaktifkan
- User yang dinonaktifkan tidak dapat login
- Status user dapat diubah oleh admin

### Company Association
- Setiap user harus terkait dengan satu company
- User hanya dapat mengakses data dari company yang sama
- Super admin dapat mengakses data dari semua company

---

## Security Considerations

1. **Password Management**: Password tidak dikembalikan dalam response API
2. **Token Authentication**: Semua endpoint memerlukan valid Bearer token
3. **Role-based Access**: Akses dibatasi berdasarkan role user
4. **Company Isolation**: User hanya dapat mengakses data company mereka
5. **Audit Trail**: Semua aktivitas user dicatat untuk audit

---

## Related APIs

- **Auth API**: Untuk login, register, dan logout
- **Role API**: Untuk mengelola role dan permission
- **Company API**: Untuk mengelola data company
- **Menu API**: Untuk mengelola menu dan permission
