# Authentication API Documentation

Dokumentasi lengkap untuk endpoint Authentication API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/auth
```

## Endpoints

### 1. Register User
Mendaftarkan pengguna baru ke dalam sistem.

**Endpoint:** `POST /register`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Request Body:**
```json
{
  "username": "admmin",
  "firstName": "first name",
  "lastName": "lastName",
  "email": "test123z@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `username`: Minimum 2 karakter
- `firstName`: Minimum 2 karakter
- `lastName`: Minimum 2 karakter
- `email`: Format email yang valid
- `password`: Minimum 6 karakter

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "username": "admmin",
    "firstName": "first name",
    "lastName": "lastName",
    "email": "test123z@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Username must be at least 2 characters long"
  }
}
```

**Response Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "message": "Email already exists"
  }
}
```

---

### 2. Login User
Melakukan autentikasi pengguna dan mengembalikan access token.

**Endpoint:** `POST /login`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Request Body:**
```json
{
  "email": "test123z@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Format email yang valid
- `password`: Password yang sesuai

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "username": "admmin",
      "firstName": "first name",
      "lastName": "lastName",
      "email": "test123z@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password"
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Invalid email address"
  }
}
```

---

### 3. Logout User
Melakukan logout pengguna dan invalidasi token.

**Endpoint:** `POST /logout`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Accept": "application/json"
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Authentication:**
- Memerlukan Bearer Token yang valid
- Token harus dalam header Authorization

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Response Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "message": "User not authenticated"
  }
}
```

**Response Error (401 Unauthorized - Invalid Token):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired token"
  }
}
```

---

## Error Handling

Semua endpoint menggunakan format error response yang konsisten:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## Status Codes

- `200 OK`: Request berhasil
- `201 Created`: Resource berhasil dibuat
- `400 Bad Request`: Request tidak valid
- `401 Unauthorized`: Tidak terautentikasi atau token tidak valid
- `409 Conflict`: Konflik data (misalnya email sudah ada)
- `500 Internal Server Error`: Error server internal

## Authentication Flow

1. **Register**: Daftar akun baru dengan endpoint `/register`
2. **Login**: Login dengan endpoint `/login` untuk mendapatkan access token
3. **Use Token**: Gunakan access token di header `Authorization: Bearer <token>` untuk mengakses endpoint yang memerlukan autentikasi
4. **Logout**: Logout dengan endpoint `/logout` untuk invalidasi token

## Notes

- Access token yang didapat dari login harus disimpan dan digunakan untuk request ke endpoint lain yang memerlukan autentikasi
- Token memiliki masa berlaku tertentu (sesuai konfigurasi JWT)
- Setelah logout, token tidak dapat digunakan lagi
- Semua endpoint menggunakan validasi input dengan Zod schema
