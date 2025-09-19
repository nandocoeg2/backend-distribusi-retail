# User API Documentation

API untuk mengelola data user/pengguna dalam sistem distribusi retail dengan operasi CRUD lengkap.

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

### 1. Create User
Membuat user baru dalam sistem.

**Request:**
```http
POST /api/v1/users
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "roleId": "role_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "id": "user_id_1",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role_id_here",
    "role": {
      "id": "role_id_here",
      "name": "Admin",
      "description": "Administrator role"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Get All Users
Mengambil daftar semua user dengan pagination.

**Request:**
```http
GET /api/v1/users?page=1&limit=10
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Nomor halaman (default: 1) |
| limit | number | No | Jumlah item per halaman (default: 10) |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "user_id_1",
        "email": "admin@example.com",
        "username": "admin",
        "firstName": "Administrator",
        "lastName": "User",
        "roleId": "role_id_1",
        "role": {
          "id": "role_id_1",
          "name": "Admin",
          "description": "Administrator role"
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 3. Search Users
Mencari user berdasarkan query.

**Request:**
```http
GET /api/v1/users/search?q=admin&page=1&limit=10
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | No | Query pencarian |
| page | number | No | Nomor halaman (default: 1) |
| limit | number | No | Jumlah item per halaman (default: 10) |

**Response:**
Sama dengan Get All Users, tetapi data difilter berdasarkan query.

---

### 4. Get User by ID
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
  "data": {
    "id": "user_id_1",
    "email": "admin@example.com",
    "username": "admin",
    "firstName": "Administrator",
    "lastName": "User",
    "roleId": "role_id_1",
    "role": {
      "id": "role_id_1",
      "name": "Admin",
      "description": "Administrator role"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Update User
Mengupdate data user.

**Request:**
```http
PUT /api/v1/users/{user_id}
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | ID unik user |

**Request Body:**
```json
{
  "email": "updated@example.com",
  "username": "updateduser",
  "firstName": "Updated",
  "lastName": "User",
  "password": "newpassword123",
  "roleId": "new_role_id",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User berhasil diupdate",
  "data": {
    "id": "user_id_1",
    "email": "updated@example.com",
    "username": "updateduser",
    "firstName": "Updated",
    "lastName": "User",
    "roleId": "new_role_id",
    "role": {
      "id": "new_role_id",
      "name": "User",
      "description": "Regular user role"
    },
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 6. Delete User
Menghapus user dari sistem.

**Request:**
```http
DELETE /api/v1/users/{user_id}
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
  "message": "User berhasil dihapus",
  "data": {
    "id": "user_id_1",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "role_id_1",
    "role": {
      "id": "role_id_1",
      "name": "Admin",
      "description": "Administrator role"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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
| firstName | string | Nama depan user |
| lastName | string | Nama belakang user |
| roleId | string | ID role user |
| role | object | Role dan permission user |
| isActive | boolean | Status aktif user |
| createdAt | string | Waktu pembuatan user (ISO 8601) |
| updatedAt | string | Waktu update terakhir (ISO 8601) |

### Role Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | ID unik role |
| name | string | Nama role |
| description | string | Deskripsi role |

### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| currentPage | number | Halaman saat ini |
| totalPages | number | Total halaman |
| totalItems | number | Total item |
| itemsPerPage | number | Item per halaman |

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
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
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User dengan email ini sudah ada"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating user"
}
```

---

## Validasi

### Create User
- `email`: Required, valid email format
- `username`: Required, minimum 3 karakter
- `firstName`: Required, minimum 3 karakter
- `lastName`: Required, minimum 3 karakter
- `password`: Required, minimum 6 karakter
- `roleId`: Required, harus ada di database

### Update User
- `email`: Optional, valid email format
- `username`: Optional, minimum 3 karakter
- `firstName`: Optional, minimum 3 karakter
- `lastName`: Optional, minimum 3 karakter
- `password`: Optional, minimum 6 karakter
- `roleId`: Optional, harus ada di database
- `isActive`: Optional, boolean

---

## User Management Notes

### User Creation
- User baru dibuat melalui endpoint POST /api/users
- User harus memiliki role yang valid
- Username dan email harus unik
- Password di-hash menggunakan bcrypt sebelum disimpan

### User Permissions
- User hanya dapat mengakses menu sesuai dengan role yang diberikan
- Admin memiliki akses penuh ke semua menu
- Manager memiliki akses terbatas sesuai konfigurasi role
- User biasa hanya dapat mengakses menu yang diizinkan

### User Status
- User dapat diaktifkan atau dinonaktifkan
- User yang dinonaktifkan tidak dapat login
- Status user dapat diubah oleh admin

### Search Functionality
- Pencarian berdasarkan email, username, firstName, lastName
- Case-insensitive search
- Menggunakan OR logic untuk multiple fields
- Support pagination untuk hasil pencarian

---

## Security Considerations

1. **Password Management**: Password tidak dikembalikan dalam response API
2. **Token Authentication**: Semua endpoint memerlukan valid Bearer token
3. **Role-based Access**: Akses dibatasi berdasarkan role user
4. **Audit Trail**: Semua aktivitas user dicatat untuk audit
5. **Password Hashing**: Password di-hash menggunakan bcrypt dengan salt rounds 10
6. **Input Validation**: Semua input divalidasi menggunakan Zod schema
7. **Error Handling**: Error handling yang konsisten dengan pesan dalam Bahasa Indonesia

---

## Fitur Tambahan

### Caching
- Data user di-cache untuk performa yang lebih baik
- Cache di-invalidate saat ada perubahan data
- Cache TTL: 1 jam untuk individual user, 10 menit untuk list users

### Audit Trail
- Semua operasi CRUD dicatat dalam audit trail
- Mencakup informasi user yang melakukan operasi dan timestamp
- Mendukung operasi CREATE, UPDATE, DELETE

### Pagination
- Support pagination untuk list dan search
- Default: 10 items per halaman
- Maksimal: 100 items per halaman

### Search
- Pencarian berdasarkan email, username, firstName, lastName
- Case-insensitive search
- Menggunakan OR logic untuk multiple fields
- Support pagination untuk hasil pencarian

---

## Related APIs

- **Auth API**: Untuk login, register, dan logout
- **Role API**: Untuk mengelola role dan permission
- **Menu API**: Untuk mengelola menu dan permission
