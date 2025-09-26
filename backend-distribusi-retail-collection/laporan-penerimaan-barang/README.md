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
  "termin_bayar": "clx1otn7p000108l82e7ke2j8",
  "statusId": "clx1otn7p000108l82e7ke2j7",
  "files": ["clx1otn7p000108l82e7ke2j6", "clx1otn7p000108l82e7ke2j5"]
}
```

**Validation Rules:**
- `purchaseOrderId`: **Required** - ID purchase order
- `tanggal_po`: Optional - Tanggal purchase order (ISO 8601)
- `customerId`: **Required** - ID customer
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
  "statusId": "clx1otn7p000108l82e7ke2j7",
  "files": ["clx1otn7p000108l82e7ke2j6"]
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `purchaseOrderId`: Optional - ID purchase order
- `tanggal_po`: Optional - Tanggal purchase order
- `customerId`: Optional - ID customer
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

### 7. Upload File dan Konversi
Mengupload file, melakukan konversi otomatis ke format JSON menggunakan Google Gemini AI, dan membuat data LPB (Laporan Penerimaan Barang) dari hasil konversi.

**Endpoint:** `POST /upload`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Content-Type:** `multipart/form-data`

**Request Body (multipart/form-data):**
- `file` (required): File yang akan diupload dan dikonversi
- `prompt` (optional): Custom prompt untuk konversi file

**Supported File Types:**
- PDF (.pdf) 
- EDI (.EDI) 

**Example Request:**
```
POST /api/v1/laporan-penerimaan-barang/upload
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Form Data:
- file: [binary file data]
- prompt: Convert this document into structured JSON format for goods receipt report
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "File uploaded and converted successfully",
  "data": {
    "lpbData": {
      "fppNumber": "FPP2024001",
      "orderDate": "2024-01-01",
      "deliveryDate": "2024-01-05",
      "deliveryTime": "14:30",
      "door": 3,
      "lpbNumber": "C24-000001",
      "supplier": {
        "code": "SUP001",
        "name": "PT Supplier ABC",
        "address": "Jl. Supplier No. 123, Jakarta",
        "phone": "021-12345678"
      },
      "items": [
        {
          "lineNo": 1,
          "plu": "PLU001",
          "productName": "Product A",
          "qtyCarton": 10,
          "qtyPcs": 0,
          "price": 100000,
          "discountPercent": 5,
          "netPrice": 95000,
          "ppnbm": 0,
          "total": 950000,
          "ket": "Good condition"
        },
        {
          "lineNo": 2,
          "plu": "PLU002",
          "productName": "Product B",
          "qtyCarton": 5,
          "qtyPcs": 0,
          "price": 200000,
          "discountPercent": 0,
          "netPrice": 200000,
          "ppnbm": 0,
          "total": 1000000,
          "ket": "Excellent quality"
        }
      ],
      "pricing": {
        "totalPurchasePrice": 2000000,
        "totalDiscount": 50000,
        "netAfterDiscount": 1950000,
        "ppnInput": 195000,
        "grandTotal": 2145000,
        "grandTotalWords": "Dua juta seratus empat puluh lima ribu rupiah"
      },
      "payment": {
        "method": "T/T BCA",
        "bankAccount": "1234567890",
        "accountName": "PT Supplier ABC"
      },
      "laporanPenerimaanBarangId": "clx1p0d3j000108l8g2f3d9b4",
      "savedToDatabase": true,
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
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Laporan Penerimaan Barang not found",
  "error": "Not Found"
}
```

**Response Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Could not parse the converted file content.",
  "error": "Internal Server Error"
}
```

**Response Error (502 Bad Gateway):**
```json
{
  "success": false,
  "message": "Failed to get a response from the conversion service.",
  "error": "Bad Gateway"
}
```

**Features:**
- ✅ Upload file dengan multipart/form-data
- ✅ Konversi otomatis ke JSON menggunakan Google Gemini AI
- ✅ Pembuatan data LPB otomatis dari hasil konversi
- ✅ Custom prompt support
- ✅ Error handling dengan rollback
- ✅ Authentication required
- ✅ Validation schema
- ✅ Support berbagai format file (PDF, DOC, XLS, Images)

---

### 8. Upload Bulk Files dan Konversi
Mengupload multiple files sekaligus, melakukan konversi otomatis ke format JSON menggunakan Google Gemini AI, dan membuat data LPB (Laporan Penerimaan Barang) dari hasil konversi. Proses dilakukan di background.

**Endpoint:** `POST /upload-bulk`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Content-Type:** `multipart/form-data`

**Request Body (multipart/form-data):**
- `files` (required): Multiple files yang akan diupload dan dikonversi
- `prompt` (optional): Custom prompt untuk konversi file

**Supported File Types:**
- PDF (.pdf) 
- EDI (.EDI) 

**Example Request:**
```
POST /api/v1/laporan-penerimaan-barang/upload-bulk
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Form Data:
- files: [binary file data 1]
- files: [binary file data 2]
- files: [binary file data 3]
- prompt: Convert these documents into structured JSON format for goods receipt report
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "message": "Bulk upload berhasil. 3 file akan diproses di background.",
  "data": {
    "batchId": "clx1p0d3j000108l8g2f3d9b4",
    "totalFiles": 3
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "No files uploaded",
  "error": "Bad Request"
}
```

---

### 9. Get Bulk Processing Status
Mendapatkan status progress dari bulk processing.

**Endpoint:** `GET /bulk-status/:batchId`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `batchId` (required): ID batch processing

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "batchId": "clx1p0d3j000108l8g2f3d9b4",
    "type": "LAPORAN_PENERIMAAN_BARANG",
    "status": "COMPLETED",
    "totalFiles": 3,
    "processedFiles": 3,
    "successFiles": 2,
    "errorFiles": 1,
    "createdAt": "2024-09-24T10:00:00.000Z",
    "completedAt": "2024-09-24T10:05:00.000Z",
    "files": [
      {
        "id": "file1",
        "filename": "lpb1.pdf",
        "laporanPenerimaanBarangId": "lpb1",
        "createdAt": "2024-09-24T10:00:00.000Z"
      },
      {
        "id": "file2",
        "filename": "lpb2.pdf",
        "laporanPenerimaanBarangId": "lpb2",
        "createdAt": "2024-09-24T10:00:00.000Z"
      },
      {
        "id": "file3",
        "filename": "lpb3.pdf",
        "laporanPenerimaanBarangId": null,
        "createdAt": "2024-09-24T10:00:00.000Z"
      }
    ]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Batch not found",
  "error": "Not Found"
}
```

**Batch Status Values:**
- `PENDING`: Batch baru dibuat, belum mulai diproses
- `PROCESSING`: Batch sedang diproses di background
- `COMPLETED`: Batch selesai diproses (berhasil atau ada error)
- `FAILED`: Batch gagal diproses

**Features:**
- ✅ Upload multiple files sekaligus
- ✅ Background processing untuk performa yang lebih baik
- ✅ Progress tracking dengan batch status
- ✅ Konversi otomatis ke JSON menggunakan Google Gemini AI
- ✅ Pembuatan data LPB otomatis dari hasil konversi
- ✅ Custom prompt support
- ✅ Error handling dengan rollback
- ✅ Authentication required
- ✅ Support berbagai format file (PDF, DOC, XLS, Images)

**Default Prompt:**
Jika tidak ada custom prompt yang diberikan, sistem akan menggunakan prompt default:
```
"Convert this document into structured JSON format for goods receipt report. Extract relevant information such as FPP number, order date, delivery details, supplier information, items, pricing, and payment information."
```

**Notes:**
- File akan otomatis tersimpan di database dengan relasi ke laporan penerimaan barang
- Jika konversi gagal, file yang sudah diupload akan dihapus otomatis
- Response JSON akan mengikuti schema yang telah didefinisikan di ConversionService
- Data LPB akan otomatis dibuat dari hasil konversi file
- Jika pembuatan data LPB gagal, proses upload dan konversi tetap berhasil
- File path akan disimpan dalam format: `/uploads/laporan-penerimaan-barang/{laporan_id}/{timestamp}.{extension}`

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
  - Nama file yang diupload
  - Nomor purchase order
  - Nama customer
  - Alamat pengiriman customer
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
- File dapat diupload menggunakan dua cara:
  1. **Manual Upload**: File harus diupload terlebih dahulu menggunakan endpoint file upload, kemudian ID file ditambahkan ke laporan
  2. **Upload dengan Konversi**: Menggunakan endpoint `POST /upload` untuk upload file sekaligus konversi otomatis ke JSON dan pembuatan LPB
- File yang sudah terhubung dengan laporan lain tidak dapat digunakan
- Saat update, array files akan mengganti semua file yang ada
- Upload dengan konversi akan otomatis menyimpan file, melakukan konversi menggunakan Google Gemini AI, dan membuat data LPB

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
