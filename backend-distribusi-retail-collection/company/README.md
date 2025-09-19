# Company API Documentation

Dokumentasi lengkap untuk endpoint Company API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/companies
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Company
Membuat data perusahaan baru.

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
  "kode_company": "COMP001",
  "nama_perusahaan": "PT. Contoh Jaya",
  "alamat": "Jl. Contoh No. 123",
  "no_rekening": "1234567890",
  "bank": "BCA",
  "bank_account_name": "PT. Contoh Jaya",
  "bank_cabang": "Jakarta Pusat",
  "telp": "0211234567",
  "fax": "0211234568",
  "email": "info@contohjaya.com",
  "direktur_utama": "Budi Santoso",
  "npwp": "01.234.567.8-901.000"
}
```

**Validation Rules:**
- `kode_company`: **Required** - Kode perusahaan
- `nama_perusahaan`: **Required** - Nama perusahaan
- `alamat`: Optional - Alamat perusahaan
- `no_rekening`: Optional - Nomor rekening bank
- `bank`: Optional - Nama bank
- `bank_account_name`: Optional - Nama pemegang rekening
- `bank_cabang`: Optional - Cabang bank
- `telp`: Optional - Nomor telepon
- `fax`: Optional - Nomor fax
- `email`: Optional - Email (harus format email yang valid)
- `direktur_utama`: Optional - Nama direktur utama
- `npwp`: Optional - Nomor NPWP

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmfpgjw050000mknivf7gdu9i",
    "kode_company": "COMP001",
    "nama_perusahaan": "PT. Contoh Jaya",
    "alamat": "Jl. Contoh No. 123",
    "no_rekening": "1234567890",
    "bank": "BCA",
    "bank_account_name": "PT. Contoh Jaya",
    "bank_cabang": "Jakarta Pusat",
    "telp": "0211234567",
    "fax": "0211234568",
    "email": "info@contohjaya.com",
    "direktur_utama": "Budi Santoso",
    "npwp": "01.234.567.8-901.000",
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
    "message": "Validation error: Company code is required"
  }
}
```

---

### 2. Get All Companies
Mengambil daftar semua perusahaan dengan pagination.

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
GET /api/v1/companies?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "cmfpgjw050000mknivf7gdu9i",
        "kode_company": "COMP001",
        "nama_perusahaan": "PT. Contoh Jaya",
        "alamat": "Jl. Contoh No. 123",
        "no_rekening": "1234567890",
        "bank": "BCA",
        "bank_account_name": "PT. Contoh Jaya",
        "bank_cabang": "Jakarta Pusat",
        "telp": "0211234567",
        "fax": "0211234568",
        "email": "info@contohjaya.com",
        "direktur_utama": "Budi Santoso",
        "npwp": "01.234.567.8-901.000",
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

### 3. Get Company By ID
Mengambil data perusahaan berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID perusahaan

**Example Request:**
```
GET /api/v1/companies/cmfpgjw050000mknivf7gdu9i
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmfpgjw050000mknivf7gdu9i",
    "kode_company": "COMP001",
    "nama_perusahaan": "PT. Contoh Jaya",
    "alamat": "Jl. Contoh No. 123",
    "no_rekening": "1234567890",
    "bank": "BCA",
    "bank_account_name": "PT. Contoh Jaya",
    "bank_cabang": "Jakarta Pusat",
    "telp": "0211234567",
    "fax": "0211234568",
    "email": "info@contohjaya.com",
    "direktur_utama": "Budi Santoso",
    "npwp": "01.234.567.8-901.000",
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
    "message": "Company not found"
  }
}
```

---

### 4. Update Company
Memperbarui data perusahaan berdasarkan ID.

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
- `id` (required): ID perusahaan

**Request Body:**
```json
{
  "nama_perusahaan": "PT. Contoh Jaya Updated",
  "alamat": "Jl. Contoh No. 456",
  "telp": "0219876543"
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmfpgjw050000mknivf7gdu9i",
    "kode_company": "COMP001",
    "nama_perusahaan": "PT. Contoh Jaya Updated",
    "alamat": "Jl. Contoh No. 456",
    "no_rekening": "1234567890",
    "bank": "BCA",
    "bank_account_name": "PT. Contoh Jaya",
    "bank_cabang": "Jakarta Pusat",
    "telp": "0219876543",
    "fax": "0211234568",
    "email": "info@contohjaya.com",
    "direktur_utama": "Budi Santoso",
    "npwp": "01.234.567.8-901.000",
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
    "message": "Company not found"
  }
}
```

---

### 5. Delete Company
Menghapus data perusahaan berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID perusahaan

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
    "message": "Company not found"
  }
}
```

---

### 6. Search Companies
Mencari perusahaan berdasarkan query dengan pagination.

**Endpoint:** `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `q` (optional): Query pencarian
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/companies/search?q=COMP&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "cmfpgjw050000mknivf7gdu9i",
        "kode_company": "COMP001",
        "nama_perusahaan": "PT. Contoh Jaya",
        "alamat": "Jl. Contoh No. 123",
        "no_rekening": "1234567890",
        "bank": "BCA",
        "bank_account_name": "PT. Contoh Jaya",
        "bank_cabang": "Jakarta Pusat",
        "telp": "0211234567",
        "fax": "0211234568",
        "email": "info@contohjaya.com",
        "direktur_utama": "Budi Santoso",
        "npwp": "01.234.567.8-901.000",
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
    "companies": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Search akan mencari berdasarkan kode perusahaan dan nama perusahaan
