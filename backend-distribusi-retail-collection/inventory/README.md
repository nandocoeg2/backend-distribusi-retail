# Inventory API Documentation

Dokumentasi lengkap untuk endpoint Inventory API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/inventories
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Inventory
Membuat data inventory baru.

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
  "plu": "PLU003",
  "nama_barang": "New Item from Bruno",
  "stok_c": 10,
  "stok_q": 50,
  "harga_barang": 25000,
  "min_stok": 15,
  "berat": 2.5,
  "panjang": 35,
  "lebar": 25,
  "tinggi": 5
}
```

**Validation Rules:**
- `plu`: **Required** - Price Look-Up code (kode barang)
- `nama_barang`: **Required** - Nama barang
- `stok_c`: **Required** - Stok dalam karton (cartons)
- `stok_q`: **Required** - Stok dalam pcs (pieces)
- `harga_barang`: **Required** - Harga barang
- `min_stok`: Optional - Minimum stok level (default: 10)
- `berat`: Optional - Berat dalam kg (default: 0)
- `panjang`: Optional - Panjang dalam cm (default: 0)
- `lebar`: Optional - Lebar dalam cm (default: 0)
- `tinggi`: Optional - Tinggi dalam cm (default: 0)
- `createdBy`: Optional - User yang membuat (auto-generated)
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "inventory-uuid",
    "plu": "PLU003",
    "nama_barang": "New Item from Bruno",
    "stok_c": 10,
    "stok_q": 50,
    "harga_barang": 25000,
    "min_stok": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "dimensiKardus": {
      "id": "dimensi-uuid",
      "inventoryId": "inventory-uuid",
      "berat": 2.5,
      "panjang": 35,
      "lebar": 25,
      "tinggi": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "user-uuid",
      "updatedBy": "user-uuid"
    }
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: PLU is required"
  }
}
```

**Response Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "message": "PLU already exists"
  }
}
```

---

### 2. Get All Inventories
Mengambil daftar semua inventory dengan pagination.

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
GET /api/v1/inventories?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "inventory-uuid",
        "plu": "PLU003",
        "nama_barang": "New Item from Bruno",
        "stok_c": 10,
        "stok_q": 50,
        "harga_barang": 25000,
        "min_stok": 15,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

---

### 3. Get Inventory By ID
Mengambil data inventory berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID inventory

**Example Request:**
```
GET /api/v1/inventories/inventory-uuid
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "inventory-uuid",
    "plu": "PLU003",
    "nama_barang": "New Item from Bruno",
    "stok_c": 10,
    "stok_q": 50,
    "harga_barang": 25000,
    "min_stok": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid"
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Inventory not found"
  }
}
```

---

### 4. Update Inventory
Memperbarui data inventory berdasarkan ID.

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
- `id` (required): ID inventory

**Request Body:**
```json
{
  "nama_barang": "Updated Item Name",
  "stok_c": 12,
  "stok_q": 75,
  "harga_barang": 30000,
  "min_stok": 20,
  "berat": 3.0,
  "panjang": 40,
  "lebar": 30,
  "tinggi": 6
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `plu`: Optional - Price Look-Up code
- `nama_barang`: Optional - Nama barang
- `stok_c`: Optional - Stok dalam karton
- `stok_q`: Optional - Stok dalam pcs
- `harga_barang`: Optional - Harga barang
- `min_stok`: Optional - Minimum stok level
- `berat`: Optional - Berat dalam kg
- `panjang`: Optional - Panjang dalam cm
- `lebar`: Optional - Lebar dalam cm
- `tinggi`: Optional - Tinggi dalam cm
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "inventory-uuid",
    "plu": "PLU003",
    "nama_barang": "Updated Item Name",
    "stok_c": 12,
    "stok_q": 75,
    "harga_barang": 30000,
    "min_stok": 20,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "dimensiKardus": {
      "id": "dimensi-uuid",
      "inventoryId": "inventory-uuid",
      "berat": 3.0,
      "panjang": 40,
      "lebar": 30,
      "tinggi": 6,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "createdBy": "user-uuid",
      "updatedBy": "user-uuid"
    }
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Inventory not found"
  }
}
```

---

### 5. Delete Inventory
Menghapus data inventory berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID inventory

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
    "message": "Inventory not found"
  }
}
```

---

### 6. Search Inventories
Mencari inventory berdasarkan query dengan pagination.

**Endpoint:** `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `q` (optional): Query pencarian (nama barang atau PLU)
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/inventories/search?q=TAS BELANJA&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "inventory-uuid",
        "plu": "PLU001",
        "nama_barang": "TAS BELANJA",
        "stok_c": 5,
        "stok_q": 25,
        "harga_barang": 15000,
        "min_stok": 10,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
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
- `409 Conflict`: Konflik data (misalnya PLU sudah ada)
- `500 Internal Server Error`: Error server internal

## Pagination

Endpoint yang mendukung pagination mengembalikan data dalam format:

```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

## Search Functionality

- Search akan mencari berdasarkan nama barang dan PLU
- Search bersifat case-insensitive
- Jika query kosong, akan mengembalikan semua data dengan pagination
- Mendukung partial matching (contains)

## Data Structure

### Inventory Object
```json
{
  "id": "string (UUID)",
  "plu": "string (unique)",
  "nama_barang": "string",
  "stok_c": "number (stok karton)",
  "stok_q": "number (stok pcs)",
  "harga_barang": "number",
  "min_stok": "number (default: 10)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)",
  "dimensiKardus": {
    "id": "string (UUID)",
    "inventoryId": "string (UUID, unique)",
    "berat": "number (kg)",
    "panjang": "number (cm)",
    "lebar": "number (cm)",
    "tinggi": "number (cm)",
    "createdAt": "DateTime (ISO 8601)",
    "updatedAt": "DateTime (ISO 8601)",
    "createdBy": "string (UUID)",
    "updatedBy": "string (UUID)"
  }
}
```

## Stock Management

- `stok_c`: Stok dalam satuan karton (cartons)
- `stok_q`: Stok dalam satuan pcs (pieces)
- `min_stok`: Level minimum stok untuk alert
- Sistem akan otomatis mengecek level stok dan mengirim notifikasi jika stok di bawah minimum

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- PLU harus unik dalam sistem
- Search mendukung pencarian berdasarkan nama barang dan PLU
- Inventory digunakan untuk mengelola stok barang dalam sistem
- Sistem memiliki audit log untuk semua operasi CRUD
- **Dimensi Kardus**: Setiap inventory akan otomatis memiliki record dimensi kardus (relasi 1:1)
- Field dimensi kardus (berat, panjang, lebar, tinggi) bersifat opsional dengan default 0
- Dimensi kardus dapat diupdate bersamaan dengan data inventory
