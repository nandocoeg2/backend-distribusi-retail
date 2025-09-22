# Laporan Penerimaan Barang API Documentation

Dokumentasi lengkap untuk endpoint Laporan Penerimaan Barang API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/laporan-penerimaan-barang
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Laporan Penerimaan Barang
Membuat data laporan penerimaan barang baru.

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
  "purchaseOrderId": "clx1otn7p000108l82e7ke2j9",
  "tanggal_po": "2024-01-01T00:00:00.000Z",
  "customerId": "clx1otn81000308l89p8y5a2k",
  "alamat_customer": "Jl. Contoh No. 123, Jakarta",
  "termin_bayar": "clx1otn7p000108l82e7ke2j8",
  "statusId": "clx1otn7p000108l82e7ke2j7",
  "files": ["clx1otn7p000108l82e7ke2j6", "clx1otn7p000108l82e7ke2j5"]
}
```

**Validation Rules:**
- `purchaseOrderId`: **Required** - ID purchase order
- `tanggal_po`: Optional - Tanggal purchase order (ISO 8601)
- `customerId`: **Required** - ID customer
- `alamat_customer`: Optional - Alamat customer
- `termin_bayar`: Optional - ID term of payment
- `statusId`: Optional - ID status
- `files`: Optional - Array ID file yang diupload
- `createdBy`: Optional - User yang membuat (auto-generated)
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "laporan-uuid",
    "purchaseOrderId": "clx1otn7p000108l82e7ke2j9",
    "tanggal_po": "2024-01-01T00:00:00.000Z",
    "customerId": "clx1otn81000308l89p8y5a2k",
    "alamat_customer": "Jl. Contoh No. 123, Jakarta",
    "termin_bayar": "clx1otn7p000108l82e7ke2j8",
    "statusId": "clx1otn7p000108l82e7ke2j7",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "purchaseOrder": {
      "id": "clx1otn7p000108l82e7ke2j9",
      "po_number": "PO-2024-001",
      "tanggal_po": "2024-01-01T00:00:00.000Z"
    },
    "customer": {
      "id": "clx1otn81000308l89p8y5a2k",
      "namaCustomer": "Customer Name",
      "kodeCustomer": "CUST001"
    },
    "termOfPayment": {
      "id": "clx1otn7p000108l82e7ke2j8",
      "kode_top": "TOP001",
      "nama_top": "Cash"
    },
    "status": {
      "id": "clx1otn7p000108l82e7ke2j7",
      "status_name": "Draft",
      "status_code": "DRAFT"
    },
    "files": [
      {
        "id": "clx1otn7p000108l82e7ke2j6",
        "filename": "document1.pdf",
        "originalName": "document1.pdf",
        "mimeType": "application/pdf",
        "size": 1024000
      }
    ]
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Purchase Order ID is required"
  }
}
```

---

### 2. Get All Laporan Penerimaan Barang
Mengambil daftar semua laporan penerimaan barang dengan pagination.

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
GET /api/v1/laporan-penerimaan-barang?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "laporan-uuid",
        "purchaseOrderId": "clx1otn7p000108l82e7ke2j9",
        "tanggal_po": "2024-01-01T00:00:00.000Z",
        "customerId": "clx1otn81000308l89p8y5a2k",
        "alamat_customer": "Jl. Contoh No. 123, Jakarta",
        "termin_bayar": "clx1otn7p000108l82e7ke2j8",
        "statusId": "clx1otn7p000108l82e7ke2j7",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "purchaseOrder": {...},
        "customer": {...},
        "termOfPayment": {...},
        "status": {...},
        "files": [...]
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

### 3. Get Laporan Penerimaan Barang By ID
Mengambil data laporan penerimaan barang berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID laporan penerimaan barang

**Example Request:**
```
GET /api/v1/laporan-penerimaan-barang/clx1p0d3j000108l8g2f3d9b4
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "laporan-uuid",
    "purchaseOrderId": "clx1otn7p000108l82e7ke2j9",
    "tanggal_po": "2024-01-01T00:00:00.000Z",
    "customerId": "clx1otn81000308l89p8y5a2k",
    "alamat_customer": "Jl. Contoh No. 123, Jakarta",
    "termin_bayar": "clx1otn7p000108l82e7ke2j8",
    "statusId": "clx1otn7p000108l82e7ke2j7",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "purchaseOrder": {...},
    "customer": {...},
    "termOfPayment": {...},
    "status": {...},
    "files": [...]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Laporan penerimaan barang not found"
  }
}
```

---

### 4. Update Laporan Penerimaan Barang
Memperbarui data laporan penerimaan barang berdasarkan ID.

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
- `id` (required): ID laporan penerimaan barang

**Request Body:**
```json
{
  "alamat_customer": "Jl. Contoh Baru No. 456, Jakarta",
  "statusId": "clx1otn7p000108l82e7ke2j7",
  "files": ["clx1otn7p000108l82e7ke2j6"]
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `purchaseOrderId`: Optional - ID purchase order
- `tanggal_po`: Optional - Tanggal purchase order
- `customerId`: Optional - ID customer
- `alamat_customer`: Optional - Alamat customer
- `termin_bayar`: Optional - ID term of payment
- `statusId`: Optional - ID status
- `files`: Optional - Array ID file yang diupload
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "laporan-uuid",
    "purchaseOrderId": "clx1otn7p000108l82e7ke2j9",
    "tanggal_po": "2024-01-01T00:00:00.000Z",
    "customerId": "clx1otn81000308l89p8y5a2k",
    "alamat_customer": "Jl. Contoh Baru No. 456, Jakarta",
    "termin_bayar": "clx1otn7p000108l82e7ke2j8",
    "statusId": "clx1otn7p000108l82e7ke2j7",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "purchaseOrder": {...},
    "customer": {...},
    "termOfPayment": {...},
    "status": {...},
    "files": [...]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Laporan penerimaan barang not found"
  }
}
```

---

### 5. Delete Laporan Penerimaan Barang
Menghapus data laporan penerimaan barang berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID laporan penerimaan barang

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
    "message": "Laporan penerimaan barang not found"
  }
}
```

---

### 6. Search Laporan Penerimaan Barang
Mencari laporan penerimaan barang berdasarkan query dengan pagination.

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
GET /api/v1/laporan-penerimaan-barang/search?q=jakarta&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "laporan-uuid",
        "purchaseOrderId": "clx1otn7p000108l82e7ke2j9",
        "tanggal_po": "2024-01-01T00:00:00.000Z",
        "customerId": "clx1otn81000308l89p8y5a2k",
        "alamat_customer": "Jl. Contoh No. 123, Jakarta",
        "termin_bayar": "clx1otn7p000108l82e7ke2j8",
        "statusId": "clx1otn7p000108l82e7ke2j7",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "purchaseOrder": {...},
        "customer": {...},
        "termOfPayment": {...},
        "status": {...},
        "files": [...]
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

- Search akan mencari berdasarkan:
  - Alamat customer
  - Nama file yang diupload
  - Nomor purchase order
  - Nama customer
  - Kode term of payment
  - Nama status
- Search bersifat case-insensitive
- Mendukung partial matching (contains)

## Data Structure

### Laporan Penerimaan Barang Object
```json
{
  "id": "string (UUID)",
  "purchaseOrderId": "string (UUID)",
  "tanggal_po": "DateTime (ISO 8601)",
  "customerId": "string (UUID)",
  "alamat_customer": "string",
  "termin_bayar": "string (UUID)",
  "statusId": "string (UUID)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)",
  "purchaseOrder": "PurchaseOrder Object",
  "customer": "Customer Object",
  "termOfPayment": "TermOfPayment Object",
  "status": "Status Object",
  "files": "FileUploaded[] Array"
}
```

## File Management

- Laporan dapat memiliki multiple file attachments
- File harus diupload terlebih dahulu menggunakan endpoint file upload
- File yang sudah terhubung dengan laporan lain tidak dapat digunakan
- Saat update, array files akan mengganti semua file yang ada

## Business Rules

- Purchase Order ID dan Customer ID wajib diisi saat create
- File yang diupload harus valid dan belum terhubung dengan laporan lain
- Semua relasi (purchase order, customer, term of payment, status) harus valid
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Laporan penerimaan barang digunakan untuk melacak penerimaan barang dari supplier
- Search mendukung pencarian berdasarkan berbagai field terkait
- Data include relasi dengan purchase order, customer, term of payment, status, dan files
