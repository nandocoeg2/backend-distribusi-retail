# History Pengiriman API Documentation

Dokumentasi lengkap untuk endpoint History Pengiriman API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/history-pengiriman
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Get All History Pengiriman
Mengambil semua data history pengiriman.

**Endpoint:** `GET /`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-pengiriman-uuid",
      "surat_jalan_id": "surat-jalan-uuid",
      "status_id": "status-uuid",
      "tanggal_kirim": "2024-01-01T10:00:00.000Z",
      "keterangan": "Pengiriman berhasil dilakukan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "user-uuid",
      "updatedBy": "user-uuid",
      "suratJalan": {
        "id": "surat-jalan-uuid",
        "no_surat_jalan": "SJ001",
        "deliver_to": "PT. Customer Jaya",
        "PIC": "John Doe",
        "alamat_tujuan": "Jl. Customer No. 123",
        "is_printed": true,
        "print_counter": 1,
        "invoiceId": "invoice-uuid",
        "statusId": "status-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      },
      "status": {
        "id": "status-uuid",
        "status_code": "DELIVERED",
        "status_name": "Terkirim",
        "status_description": "Barang telah berhasil dikirim",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

---

### 2. Get History Pengiriman By Surat Jalan ID
Mengambil data history pengiriman berdasarkan ID surat jalan.

**Endpoint:** `GET /surat-jalan/:suratJalanId`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `suratJalanId` (required): ID surat jalan

**Example Request:**
```
GET /api/v1/history-pengiriman/surat-jalan/surat-jalan-uuid
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-pengiriman-uuid",
      "surat_jalan_id": "surat-jalan-uuid",
      "status_id": "status-uuid",
      "tanggal_kirim": "2024-01-01T10:00:00.000Z",
      "keterangan": "Pengiriman berhasil dilakukan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "user-uuid",
      "updatedBy": "user-uuid",
      "suratJalan": {
        "id": "surat-jalan-uuid",
        "no_surat_jalan": "SJ001",
        "deliver_to": "PT. Customer Jaya",
        "PIC": "John Doe",
        "alamat_tujuan": "Jl. Customer No. 123",
        "is_printed": true,
        "print_counter": 1,
        "invoiceId": "invoice-uuid",
        "statusId": "status-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      },
      "status": {
        "id": "status-uuid",
        "status_code": "DELIVERED",
        "status_name": "Terkirim",
        "status_description": "Barang telah berhasil dikirim",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "No history pengiriman found for this surat jalan"
  }
}
```

---

### 3. Get History Pengiriman By Tanggal Kirim
Mengambil data history pengiriman berdasarkan tanggal kirim.

**Endpoint:** `GET /tanggal/:tanggalKirim`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `tanggalKirim` (required): Tanggal kirim dalam format ISO 8601 (YYYY-MM-DD atau YYYY-MM-DDTHH:mm:ss.sssZ)

**Example Request:**
```
GET /api/v1/history-pengiriman/tanggal/2024-01-01
GET /api/v1/history-pengiriman/tanggal/2024-01-01T10:00:00.000Z
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-pengiriman-uuid",
      "surat_jalan_id": "surat-jalan-uuid",
      "status_id": "status-uuid",
      "tanggal_kirim": "2024-01-01T10:00:00.000Z",
      "keterangan": "Pengiriman berhasil dilakukan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "user-uuid",
      "updatedBy": "user-uuid",
      "suratJalan": {
        "id": "surat-jalan-uuid",
        "no_surat_jalan": "SJ001",
        "deliver_to": "PT. Customer Jaya",
        "PIC": "John Doe",
        "alamat_tujuan": "Jl. Customer No. 123",
        "is_printed": true,
        "print_counter": 1,
        "invoiceId": "invoice-uuid",
        "statusId": "status-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      },
      "status": {
        "id": "status-uuid",
        "status_code": "DELIVERED",
        "status_name": "Terkirim",
        "status_description": "Barang telah berhasil dikirim",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Invalid date format"
  }
}
```

---

### 4. Get History Pengiriman By Status Code
Mengambil data history pengiriman berdasarkan kode status.

**Endpoint:** `GET /status/:statusCode`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `statusCode` (required): Kode status pengiriman

**Example Request:**
```
GET /api/v1/history-pengiriman/status/DELIVERED
GET /api/v1/history-pengiriman/status/PENDING
GET /api/v1/history-pengiriman/status/IN_TRANSIT
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-pengiriman-uuid",
      "surat_jalan_id": "surat-jalan-uuid",
      "status_id": "status-uuid",
      "tanggal_kirim": "2024-01-01T10:00:00.000Z",
      "keterangan": "Pengiriman berhasil dilakukan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "user-uuid",
      "updatedBy": "user-uuid",
      "suratJalan": {
        "id": "surat-jalan-uuid",
        "no_surat_jalan": "SJ001",
        "deliver_to": "PT. Customer Jaya",
        "PIC": "John Doe",
        "alamat_tujuan": "Jl. Customer No. 123",
        "is_printed": true,
        "print_counter": 1,
        "invoiceId": "invoice-uuid",
        "statusId": "status-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      },
      "status": {
        "id": "status-uuid",
        "status_code": "DELIVERED",
        "status_name": "Terkirim",
        "status_description": "Barang telah berhasil dikirim",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "No history pengiriman found for this status code"
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
- `400 Bad Request`: Request tidak valid (format tanggal salah)
- `401 Unauthorized`: Tidak terautentikasi atau token tidak valid
- `404 Not Found`: Data tidak ditemukan
- `500 Internal Server Error`: Error server internal

## Data Structure

### History Pengiriman Object
```json
{
  "id": "string (UUID)",
  "surat_jalan_id": "string (UUID)",
  "status_id": "string (UUID)",
  "tanggal_kirim": "DateTime (ISO 8601)",
  "keterangan": "string (optional)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)",
  "suratJalan": "SuratJalan Object",
  "status": "Status Object"
}
```

### Surat Jalan Object (Included)
```json
{
  "id": "string (UUID)",
  "no_surat_jalan": "string",
  "deliver_to": "string",
  "PIC": "string",
  "alamat_tujuan": "string",
  "is_printed": "boolean",
  "print_counter": "number",
  "invoiceId": "string (UUID, optional)",
  "statusId": "string (UUID, optional)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)"
}
```

### Status Object (Included)
```json
{
  "id": "string (UUID)",
  "status_code": "string",
  "status_name": "string",
  "status_description": "string (optional)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)"
}
```

## Common Status Codes

Beberapa status code yang umum digunakan:
- `PENDING`: Menunggu pengiriman
- `IN_TRANSIT`: Sedang dalam perjalanan
- `DELIVERED`: Berhasil dikirim
- `FAILED`: Gagal dikirim
- `RETURNED`: Dikembalikan

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Data history pengiriman mencakup informasi surat jalan dan status terkait
- Tanggal kirim harus dalam format ISO 8601 yang valid
- Endpoint ini hanya untuk membaca data, tidak ada operasi create, update, atau delete
- History pengiriman digunakan untuk melacak status pengiriman surat jalan
- Data dikembalikan dalam bentuk array karena satu surat jalan bisa memiliki multiple history pengiriman
