# Group Customer API Documentation

Dokumentasi lengkap untuk endpoint Group Customer API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/group-customers
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Group Customer
Membuat data group customer baru.

**Endpoint:** `POST /`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
```json
{
  "kode_group": "GC001",
  "nama_group": "Group Customer 1",
  "alamat": "Alamat Group Customer 1",
  "npwp": "1234567890123456"
}
```

**Validation Rules:**
- `kode_group`: **Required** - Kode group customer
- `nama_group`: **Required** - Nama group customer
- `alamat`: Optional - Alamat group customer
- `npwp`: Optional - Nomor NPWP group customer
- `createdBy`: Optional - User yang membuat (auto-generated)
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "group-customer-uuid",
    "kode_group": "GC001",
    "nama_group": "Group Customer 1",
    "alamat": "Alamat Group Customer 1",
    "npwp": "1234567890123456",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
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
    "message": "Validation error: Group code is required"
  }
}
```

---

### 2. Get All Group Customers
Mengambil daftar semua group customer dengan pagination.

**Endpoint:** `GET /`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/group-customers?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupCustomers": [
      {
        "id": "group-customer-uuid",
        "kode_group": "GC001",
        "nama_group": "Group Customer 1",
        "alamat": "Alamat Group Customer 1",
        "npwp": "1234567890123456",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Group Customer By ID
Mengambil data group customer berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID group customer

**Example Request:**
```
GET /api/v1/group-customers/group-customer-uuid
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "group-customer-uuid",
    "kode_group": "GC001",
    "nama_group": "Group Customer 1",
    "alamat": "Alamat Group Customer 1",
    "npwp": "1234567890123456",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Group customer not found"
  }
}
```

---

### 4. Update Group Customer
Memperbarui data group customer berdasarkan ID.

**Endpoint:** `PUT /:id`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID group customer

**Request Body:**
```json
{
  "nama_group": "Group Customer 1 Updated",
  "alamat": "Alamat Group Customer 1 Updated"
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `kode_group`: Optional - Kode group customer
- `nama_group`: Optional - Nama group customer
- `alamat`: Optional - Alamat group customer
- `npwp`: Optional - Nomor NPWP group customer
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "group-customer-uuid",
    "kode_group": "GC001",
    "nama_group": "Group Customer 1 Updated",
    "alamat": "Alamat Group Customer 1 Updated",
    "npwp": "1234567890123456",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Group customer not found"
  }
}
```

---

### 5. Delete Group Customer
Menghapus data group customer berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID group customer

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (204 No Content):**
```
Status: 204 No Content
Body: (empty)
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Group customer not found"
  }
}
```

---

### 6. Search Group Customers
Mencari group customer berdasarkan query dengan pagination.

**Endpoint:** `GET /search/:q` atau `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters (untuk `/search/:q`):**
- `q` (optional): Query pencarian

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/group-customers/search/GC001?page=1&limit=10
GET /api/v1/group-customers/search?q=GC&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "groupCustomers": [
      {
        "id": "group-customer-uuid",
        "kode_group": "GC001",
        "nama_group": "Group Customer 1",
        "alamat": "Alamat Group Customer 1",
        "npwp": "1234567890123456",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
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
- `204 No Content`: Resource berhasil dihapus
- `400 Bad Request`: Request tidak valid
- `401 Unauthorized`: Tidak terautentikasi atau token tidak valid
- `404 Not Found`: Resource tidak ditemukan
- `500 Internal Server Error`: Error server internal

## Pagination

Endpoint yang mendukung pagination mengembalikan data dalam format:

```json
{
  "success": true,
  "data": {
    "groupCustomers": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Search Functionality

- **Path-based search**: `/search/:q` - Query pencarian dalam path parameter
- **Query-based search**: `/search?q=query` - Query pencarian dalam query parameter
- Search akan mencari berdasarkan kode group dan nama group customer
- Kedua format search mendukung pagination

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Search mendukung pencarian berdasarkan kode group dan nama group customer
- Group customer digunakan untuk mengelompokkan customer dalam sistem
