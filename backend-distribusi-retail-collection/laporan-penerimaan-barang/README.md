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
- `status_code` (optional): Filter berdasarkan kode status LPB secara exact
- `purchaseOrderId` (optional): Filter berdasarkan ID purchase order
- `customerId` (optional): Filter berdasarkan ID customer
- `termin_bayar` (optional): Filter berdasarkan ID term of payment
- `q` (optional): Keyword pencarian teks lintas relasi
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/laporan-penerimaan-barang/search?status_code=COMPLETED%20LAPORAN%20PENERIMAAN%20BARANG&q=jakarta&page=1&limit=10
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

**Endpoint:** `POST /bulk`

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
POST /api/v1/laporan-penerimaan-barang/bulk
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
    "bulkId": "bulk_lpb_clx0d0d0d0000000000000000",
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

**Endpoint:** `GET /bulk-status/:bulkId`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `bulkId` (required): ID bulk processing

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "bulkId": "bulk_lpb_clx0d0d0d0000000000000000",
    "type": "LAPORAN_PENERIMAAN_BARANG",
    "status": "COMPLETED BULK LAPORAN PENERIMAAN BARANG",
    "totalFiles": 3,
    "processedFiles": 3,
    "successFiles": 2,
    "errorFiles": 1,
    "processingFiles": 0,
    "pendingFiles": 0,
    "statusBreakdown": {
      "COMPLETED BULK LAPORAN PENERIMAAN BARANG": 2,
      "FAILED BULK LAPORAN PENERIMAAN BARANG": 1
    },
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
  "message": "Bulk not found",
  "error": "Not Found"
}
```

---

### 10. Get All Bulk Files
Mendapatkan daftar semua file bulk upload dengan filter status.

**Endpoint:** `GET /bulk-files`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `status` (optional): Filter berdasarkan status (`processed` atau `pending`)

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "file_123",
      "filename": "lpb1.pdf",
      "path": "/uploads/laporan-penerimaan-barang/bulk/2024-01-15/bulk_lpb_xxx_lpb1.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "category": "laporan_penerimaan_barang",
      "bulkId": "bulk_lpb_clx0d0d0d0000000000000000",
      "laporanPenerimaanBarangId": "lpb_456",
      "status": {
        "status_code": "COMPLETED BULK LAPORAN PENERIMAAN BARANG",
        "status_name": "Completed Bulk Laporan Penerimaan Barang"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:05:00.000Z",
      "createdBy": "user_123"
    }
  ]
}
```

**Bulk Status Values:**
- `PENDING BULK LAPORAN PENERIMAAN BARANG`: File baru diupload, belum diproses
- `PROCESSING BULK LAPORAN PENERIMAAN BARANG`: File sedang diproses di background
- `COMPLETED BULK LAPORAN PENERIMAAN BARANG`: File berhasil diproses dan LPB dibuat
- `FAILED BULK LAPORAN PENERIMAAN BARANG`: File gagal diproses

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

### 11. Process Laporan Penerimaan Barang (Bulk)
Memproses beberapa LPB sekaligus dan mengubah statusnya menjadi `PROCESSING LAPORAN PENERIMAAN BARANG`.

**Endpoint:** `PATCH /process`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
```json
{
  "ids": [
    "clx1otn7p000108l82e7ke2j9",
    "clx1otn81000308l89p8y5a2m"
  ]
}
```

**Validation Rules:**
- `ids`: **Required** - Minimal satu ID LPB
- Setiap LPB harus sudah memiliki `purchaseOrderId`, `tanggal_po`, `customerId`, dan `termin_bayar`
- Status `PROCESSING LAPORAN PENERIMAAN BARANG` harus tersedia di master status kategori LPB

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": [
      {
        "id": "clx1otn7p000108l82e7ke2j9",
        "purchaseOrderId": "clx1otn7p000108l82e7ke2j0",
        "status": {
          "status_code": "PROCESSING LAPORAN PENERIMAAN BARANG",
          "status_name": "Processing Laporan Penerimaan Barang"
        },
        "updatedAt": "2024-09-28T12:00:00.000Z"
      }
    ],
    "failed": []
  }
}
```

**Notes:**
- Response selalu mengembalikan dua array: `success` dan `failed`
- LPB yang gagal diproses akan berada di array `failed` dengan detail field yang belum terpenuhi
- Audit log otomatis dibuat dengan aksi `ProcessLaporanPenerimaanBarang`

### 12. Process Laporan Penerimaan Barang (Single)
Memproses satu LPB berdasarkan ID dan mengubah statusnya menjadi `PROCESSING LAPORAN PENERIMAAN BARANG`.

**Endpoint:** `PATCH /:id/process`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": [
      {
        "id": "clx1otn7p000108l82e7ke2j9",
        "status": {
          "status_code": "PROCESSING LAPORAN PENERIMAAN BARANG"
        },
        "customer": {
          "namaCustomer": "PT Contoh Mitra"
        }
      }
    ],
    "failed": []
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Term of payment (termin_bayar) is required before processing LPB",
    "details": {
      "field": "termin_bayar"
    }
  }
}
```

**Notes:**
- Endpoint single menggunakan service yang sama dengan proses bulk dan tetap mengembalikan struktur `success` dan `failed`
- Cocok digunakan saat ingin memproses LPB langsung dari detail view
- Jika status sudah `PROCESSING`, sistem akan mengembalikan data yang sama tanpa error

---

### 13. Complete Laporan Penerimaan Barang (Bulk)
Menyelesaikan beberapa LPB sekaligus dengan mengubah statusnya menjadi `COMPLETED LAPORAN PENERIMAAN BARANG` dan status Purchase Order terkait menjadi `COMPLETED PURCHASE ORDER`.

**Endpoint:** `PATCH /complete`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
```json
{
  "ids": [
    "clx1otn7p000108l82e7ke2j9",
    "clx1otn81000308l89p8y5a2m"
  ]
}
```

**Validation Rules:**
- `ids`: **Required** - Minimal satu ID LPB
- Setiap LPB harus sudah terhubung dengan Purchase Order (`purchaseOrderId` tidak boleh null)
- Status `COMPLETED LAPORAN PENERIMAAN BARANG` harus tersedia di master status kategori LPB
- Status `COMPLETED PURCHASE ORDER` harus tersedia di master status kategori Purchase Order

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": [
      {
        "id": "clx1otn7p000108l82e7ke2j9",
        "purchaseOrderId": "clx1otn7p000108l82e7ke2j0",
        "status": {
          "id": "status-uuid",
          "status_code": "COMPLETED LAPORAN PENERIMAAN BARANG",
          "status_name": "Completed Laporan Penerimaan Barang",
          "category": "Laporan Penerimaan Barang"
        },
        "purchaseOrder": {
          "id": "clx1otn7p000108l82e7ke2j0",
          "po_number": "PO-2024-001",
          "status": {
            "id": "po-status-uuid",
            "status_code": "COMPLETED PURCHASE ORDER",
            "status_name": "Completed Purchase Order",
            "category": "Purchase Order"
          }
        },
        "customer": {
          "id": "customer-uuid",
          "namaCustomer": "PT Contoh Mitra"
        },
        "updatedAt": "2024-09-28T12:00:00.000Z"
      }
    ],
    "failed": []
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": true,
  "data": {
    "success": [],
    "failed": [
      {
        "id": "clx1otn81000308l89p8y5a2m",
        "error": "Purchase order must be linked before completing LPB",
        "details": {
          "field": "purchaseOrderId"
        }
      }
    ]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "COMPLETED LAPORAN PENERIMAAN BARANG status not found",
    "details": {
      "status_code": "COMPLETED LAPORAN PENERIMAAN BARANG"
    }
  }
}
```

**Features:**
- ✅ Mengubah status LPB menjadi `COMPLETED`
- ✅ Mengubah status Purchase Order terkait menjadi `COMPLETED`
- ✅ Transaction support untuk memastikan data consistency
- ✅ Batch processing untuk multiple LPB
- ✅ Automatic audit log creation
- ✅ Error handling per item dengan struktur `success` dan `failed`
- ✅ Idempotent - jika sudah completed, tidak akan error

**Notes:**
- Operasi dilakukan dalam transaction untuk memastikan LPB dan Purchase Order terupdate bersamaan
- Jika LPB sudah `COMPLETED`, sistem akan mengembalikan data yang sama tanpa error
- Audit log otomatis dibuat untuk kedua entitas (LPB dan Purchase Order) dengan aksi `CompleteLaporanPenerimaanBarang` dan `CompletePurchaseOrderFromLpb`
- Purchase Order wajib sudah terhubung dengan LPB sebelum dapat di-complete

---

### 14. Complete Laporan Penerimaan Barang (Single)
Menyelesaikan satu LPB berdasarkan ID dengan mengubah statusnya menjadi `COMPLETED LAPORAN PENERIMAAN BARANG` dan status Purchase Order terkait menjadi `COMPLETED PURCHASE ORDER`.

**Endpoint:** `PATCH /:id/complete`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID laporan penerimaan barang

**Example Request:**
```
PATCH /api/v1/laporan-penerimaan-barang/clx1otn7p000108l82e7ke2j9/complete
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": [
      {
        "id": "clx1otn7p000108l82e7ke2j9",
        "purchaseOrderId": "clx1otn7p000108l82e7ke2j0",
        "status": {
          "status_code": "COMPLETED LAPORAN PENERIMAAN BARANG",
          "status_name": "Completed Laporan Penerimaan Barang"
        },
        "purchaseOrder": {
          "id": "clx1otn7p000108l82e7ke2j0",
          "po_number": "PO-2024-001",
          "status": {
            "status_code": "COMPLETED PURCHASE ORDER",
            "status_name": "Completed Purchase Order"
          }
        },
        "customer": {
          "namaCustomer": "PT Contoh Mitra"
        },
        "updatedAt": "2024-09-28T12:00:00.000Z"
      }
    ],
    "failed": []
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Purchase order must be linked before completing LPB",
    "details": {
      "field": "purchaseOrderId"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Laporan Penerimaan Barang not found"
  }
}
```

**Notes:**
- Endpoint single menggunakan service yang sama dengan complete bulk dan tetap mengembalikan struktur `success` dan `failed`
- Cocok digunakan saat ingin menyelesaikan LPB langsung dari detail view
- Jika status sudah `COMPLETED`, sistem akan mengembalikan data yang sama tanpa error
- Transaction support memastikan status LPB dan Purchase Order terupdate secara atomic

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

- Gunakan parameter `status_code` untuk memfilter laporan berdasarkan kode status LPB secara exact.
- Parameter `purchaseOrderId`, `customerId`, dan `termin_bayar` memfilter laporan berdasarkan relasi terkait.
- Parameter `q` akan mencari berdasarkan:
  - Nama file yang diupload
  - Nomor purchase order
  - Nama customer
  - Alamat pengiriman customer
  - Kode term of payment
  - Nama status
- Pencarian teks (`q`) bersifat case-insensitive dan mendukung partial matching (contains).
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

