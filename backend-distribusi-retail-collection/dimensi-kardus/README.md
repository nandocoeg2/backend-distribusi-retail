Dimensi Kardus API Documentation

Dokumentasi lengkap untuk endpoint Dimensi Kardus pada sistem Backend Distribusi Retail.

Base URL
```
http://localhost:5050/api/v1/dimensi-kardus
```

Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

Endpoints

1. Create Dimensi Kardus
Membuat data dimensi kardus untuk sebuah inventory. Relasi 1:1; satu inventory hanya boleh punya satu record dimensi.

Endpoint: `POST /`

Headers:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Request Body:
```json
{
  "inventoryId": "inventory-uuid",
  "berat": 1.2,
  "panjang": 30,
  "lebar": 20,
  "tinggi": 15
}
```

Validation Rules:
- `inventoryId`: Required - UUID inventory yang terkait (unik, 1:1)
- `berat`: Required - Berat dalam kilogram (>= 0)
- `panjang`: Required - Panjang dalam cm (>= 0)
- `lebar`: Required - Lebar dalam cm (>= 0)
- `tinggi`: Required - Tinggi dalam cm (>= 0)

Response Success (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "dimensi-uuid",
    "inventoryId": "inventory-uuid",
    "berat": 1.2,
    "panjang": 30,
    "lebar": 20,
    "tinggi": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid"
  }
}
```

Response Error (409 Conflict):
```json
{
  "success": false,
  "error": { "message": "Unique constraint failed on the fields: (inventoryId)" }
}
```

---

2. Get All Dimensi Kardus
Mengambil daftar dimensi kardus dengan pagination.

Endpoint: `GET /`

Headers:
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Query Parameters:
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

Example Request:
```
GET /api/v1/dimensi-kardus?page=1&limit=10
```

Response Success (200 OK):
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "dimensi-uuid",
        "inventoryId": "inventory-uuid",
        "berat": 1.2,
        "panjang": 30,
        "lebar": 20,
        "tinggi": 15,
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

3. Get Dimensi Kardus By ID
Mengambil data dimensi kardus berdasarkan ID.

Endpoint: `GET /:id`

Headers:
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Path Parameters:
- `id` (required): ID dimensi kardus

Example Request:
```
GET /api/v1/dimensi-kardus/dimensi-uuid
```

Response Success (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "dimensi-uuid",
    "inventoryId": "inventory-uuid",
    "berat": 1.2,
    "panjang": 30,
    "lebar": 20,
    "tinggi": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid"
  }
}
```

Response Error (404 Not Found):
```json
{
  "success": false,
  "error": { "message": "DimensiKardus not found" }
}
```

---

4. Update Dimensi Kardus
Memperbarui data dimensi kardus berdasarkan ID.

Endpoint: `PUT /:id`

Headers:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Path Parameters:
- `id` (required): ID dimensi kardus

Request Body (semua optional, kirim hanya yang diubah):
```json
{
  "inventoryId": "inventory-uuid",
  "berat": 1.3,
  "panjang": 35,
  "lebar": 22,
  "tinggi": 18
}
```

Response Success (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "dimensi-uuid",
    "inventoryId": "inventory-uuid",
    "berat": 1.3,
    "panjang": 35,
    "lebar": 22,
    "tinggi": 18,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid"
  }
}
```

Response Error (404 Not Found):
```json
{
  "success": false,
  "error": { "message": "DimensiKardus not found" }
}
```

---

5. Delete Dimensi Kardus
Menghapus data dimensi kardus berdasarkan ID.

Endpoint: `DELETE /:id`

Headers:
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Path Parameters:
- `id` (required): ID dimensi kardus

Response Success (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "dimensi-uuid",
    "inventoryId": "inventory-uuid",
    "berat": 1.3,
    "panjang": 35,
    "lebar": 22,
    "tinggi": 18,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid"
  }
}
```

Response Error (404 Not Found):
```json
{
  "success": false,
  "error": { "message": "DimensiKardus not found" }
}
```

---

6. Search Dimensi Kardus
Mencari dimensi kardus berdasarkan data inventory (nama barang atau PLU) dengan pagination.

Endpoint: `GET /search`

Headers:
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Query Parameters:
- `q` (optional): Query pencarian (nama barang atau PLU melalui relasi inventory)
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

Example Request:
```
GET /api/v1/dimensi-kardus/search?q=TAS BELANJA&page=1&limit=10
```

Response Success (200 OK):
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "dimensi-uuid",
        "inventoryId": "inventory-uuid",
        "berat": 1.2,
        "panjang": 30,
        "lebar": 20,
        "tinggi": 15,
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

Error Handling
Semua endpoint menggunakan format error response yang konsisten:

```json
{
  "success": false,
  "error": { "message": "Error description" }
}
```

Status Codes
- 200 OK: Request berhasil
- 201 Created: Resource berhasil dibuat
- 400 Bad Request: Request tidak valid
- 401 Unauthorized: Tidak terautentikasi atau token tidak valid
- 404 Not Found: Resource tidak ditemukan
- 409 Conflict: Konflik data (misalnya inventoryId sudah punya dimensi)
- 500 Internal Server Error: Error server internal

Pagination
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

Search Functionality
- Pencarian berdasarkan `inventory.nama_barang` dan `inventory.plu`
- Case-insensitive, partial matching (contains)
- Jika `q` kosong, akan mengembalikan semua data (with pagination)

Data Structure

Dimensi Kardus Object
```json
{
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
```

Relasi 1:1 dengan Inventory
- Satu `Inventory` memiliki paling banyak satu `DimensiKardus`
- Field kunci: `DimensiKardus.inventoryId` (unique)

Notes
- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` otomatis diisi dari user login
- Timestamp `createdAt` dan `updatedAt` otomatis diatur sistem
- Sistem memiliki audit log untuk semua operasi CRUD (create/update/delete)

