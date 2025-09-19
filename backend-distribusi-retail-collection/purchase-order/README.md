# Purchase Order API Documentation

Dokumentasi lengkap untuk endpoint Purchase Order API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/purchase-orders
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Purchase Order
Membuat data purchase order baru dengan file upload.

**Endpoint:** `POST /`

**Headers:**
```json
{
  "Content-Type": "multipart/form-data",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body (Multipart Form):**
```
customerId: cmefvhhvs000010vnooob5yrn
po_number: PO-2025-08-18-0033123323
total_items: 10
tanggal_order: 2025-08-18T10:00:00.000Z
po_type: SINGLE
statusId: cmegql5sq000qsmj3g6v8y4gw
suratJalan: SJ/2025/08/18/001
invoicePengiriman: INV/2025/08/18/001
suratPO: SPO/2025/08/18/001
suratPenagihan: SPN/2025/08/18/001
file: [FILE] (PDF files)
```

**Validation Rules:**
- `customerId`: **Required** - ID customer
- `po_number`: **Required** - Nomor purchase order
- `total_items`: Optional - Total jumlah item (integer)
- `tanggal_order`: Optional - Tanggal order (default: current date)
- `po_type`: **Required** - Tipe PO (SINGLE/BULK)
- `statusId`: Optional - ID status
- `suratJalan`: Optional - Nomor surat jalan
- `invoicePengiriman`: Optional - Nomor invoice pengiriman
- `suratPO`: Optional - Nomor surat PO
- `suratPenagihan`: Optional - Nomor surat penagihan
- `file`: Optional - File PDF (multiple files allowed)

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "purchase-order-uuid",
    "customerId": "cmefvhhvs000010vnooob5yrn",
    "po_number": "PO-2025-08-18-0033123323",
    "total_items": 10,
    "tanggal_order": "2025-08-18T10:00:00.000Z",
    "po_type": "SINGLE",
    "statusId": "cmegql5sq000qsmj3g6v8y4gw",
    "suratJalan": "SJ/2025/08/18/001",
    "invoicePengiriman": "INV/2025/08/18/001",
    "suratPO": "SPO/2025/08/18/001",
    "suratPenagihan": "SPN/2025/08/18/001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "customer": {
      "id": "cmefvhhvs000010vnooob5yrn",
      "namaCustomer": "Customer Name",
      "kodeCustomer": "CUST001"
    },
    "status": {
      "id": "cmegql5sq000qsmj3g6v8y4gw",
      "status_code": "PENDING",
      "status_name": "Pending",
      "status_description": "Purchase order is pending"
    },
    "purchaseOrderDetails": [],
    "files": [
      {
        "id": "file-uuid",
        "filename": "ERP_PO.pdf",
        "path": "/fileuploaded/2024-01-01/PO_1234567890_ERP_PO.pdf",
        "mimetype": "application/pdf",
        "size": 1024000,
        "createdAt": "2024-01-01T00:00:00.000Z"
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
    "message": "Request is not multipart"
  }
}
```

---

### 2. Get All Purchase Orders
Mengambil daftar semua purchase order dengan pagination.

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
GET /api/v1/purchase-orders?page=1&limit=1
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "purchase-order-uuid",
        "customerId": "cmefvhhvs000010vnooob5yrn",
        "po_number": "PO-2025-08-18-0033123323",
        "total_items": 10,
        "tanggal_order": "2025-08-18T10:00:00.000Z",
        "po_type": "SINGLE",
        "statusId": "cmegql5sq000qsmj3g6v8y4gw",
        "suratJalan": "SJ/2025/08/18/001",
        "invoicePengiriman": "INV/2025/08/18/001",
        "suratPO": "SPO/2025/08/18/001",
        "suratPenagihan": "SPN/2025/08/18/001",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "customer": {...},
        "status": {...},
        "purchaseOrderDetails": [...],
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

### 3. Get Purchase Order By ID
Mengambil data purchase order berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID purchase order

**Example Request:**
```
GET /api/v1/purchase-orders/cmflbqg2t000mxxm6h0loisni
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "purchase-order-uuid",
    "customerId": "cmefvhhvs000010vnooob5yrn",
    "po_number": "PO-2025-08-18-0033123323",
    "total_items": 10,
    "tanggal_order": "2025-08-18T10:00:00.000Z",
    "po_type": "SINGLE",
    "statusId": "cmegql5sq000qsmj3g6v8y4gw",
    "suratJalan": "SJ/2025/08/18/001",
    "invoicePengiriman": "INV/2025/08/18/001",
    "suratPO": "SPO/2025/08/18/001",
    "suratPenagihan": "SPN/2025/08/18/001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "customer": {...},
    "status": {...},
    "purchaseOrderDetails": [...],
    "files": [...]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Purchase order not found"
  }
}
```

---

### 4. Update Purchase Order
Memperbarui data purchase order berdasarkan ID.

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
- `id` (required): ID purchase order

**Request Body:**
```json
{
  "total_items": 15,
  "po_number": "2PZ1POC2500302312312311"
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `customerId`: Optional - ID customer
- `po_number`: Optional - Nomor purchase order
- `total_items`: Optional - Total jumlah item
- `tanggal_order`: Optional - Tanggal order
- `po_type`: Optional - Tipe PO (SINGLE/BULK)
- `statusId`: Optional - ID status
- `suratJalan`: Optional - Nomor surat jalan
- `invoicePengiriman`: Optional - Nomor invoice pengiriman
- `suratPO`: Optional - Nomor surat PO
- `suratPenagihan`: Optional - Nomor surat penagihan
- `purchaseOrderDetails`: Optional - Array detail purchase order

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "purchase-order-uuid",
    "customerId": "cmefvhhvs000010vnooob5yrn",
    "po_number": "2PZ1POC2500302312312311",
    "total_items": 15,
    "tanggal_order": "2025-08-18T10:00:00.000Z",
    "po_type": "SINGLE",
    "statusId": "cmegql5sq000qsmj3g6v8y4gw",
    "suratJalan": "SJ/2025/08/18/001",
    "invoicePengiriman": "INV/2025/08/18/001",
    "suratPO": "SPO/2025/08/18/001",
    "suratPenagihan": "SPN/2025/08/18/001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "customer": {...},
    "status": {...},
    "purchaseOrderDetails": [...],
    "files": [...]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Purchase order not found"
  }
}
```

---

### 5. Delete Purchase Order
Menghapus data purchase order berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID purchase order

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
    "message": "Purchase order not found"
  }
}
```

---

### 6. Search Purchase Orders
Mencari purchase order berdasarkan berbagai filter dengan pagination.

**Endpoint:** `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `tanggal_order` (optional): Pencarian berdasarkan tanggal order
- `customer_name` (optional): Pencarian berdasarkan nama customer
- `customerId` (optional): Pencarian berdasarkan customer ID
- `suratPO` (optional): Pencarian berdasarkan surat PO
- `invoicePengiriman` (optional): Pencarian berdasarkan invoice pengiriman
- `po_number` (optional): Pencarian berdasarkan nomor PO
- `supplierId` (optional): Pencarian berdasarkan supplier ID
- `statusId` (optional): Pencarian berdasarkan status ID
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/purchase-orders/search?customer_name=Customer One&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [...],
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

### 7. Get History Purchase Orders
Mengambil history purchase order dengan pagination.

**Endpoint:** `GET /history`

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

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [...],
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

### 8. Process Purchase Order
Memproses purchase order dengan mengubah status.

**Endpoint:** `PATCH /process/:id`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID purchase order

**Request Body:**
```json
{
  "status_code": "PROCESSED"
}
```

**Validation Rules:**
- `status_code`: **Required** - Kode status untuk memproses PO

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "purchase-order-uuid",
    "customerId": "cmefvhhvs000010vnooob5yrn",
    "po_number": "PO-2025-08-18-0033123323",
    "total_items": 10,
    "tanggal_order": "2025-08-18T10:00:00.000Z",
    "po_type": "SINGLE",
    "statusId": "new-status-uuid",
    "suratJalan": "SJ/2025/08/18/001",
    "invoicePengiriman": "INV/2025/08/18/001",
    "suratPO": "SPO/2025/08/18/001",
    "suratPenagihan": "SPN/2025/08/18/001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "customer": {...},
    "status": {...},
    "purchaseOrderDetails": [...],
    "files": [...]
  }
}
```

---

## Bulk Purchase Order Endpoints

### 9. Bulk Create Purchase Order
Membuat purchase order secara bulk dengan file upload.

**Endpoint:** `POST /bulk`

**Headers:**
```json
{
  "Content-Type": "multipart/form-data",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body (Multipart Form):**
```
file: [FILE] (PDF files for bulk processing)
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "fileId": "bulk-file-uuid",
    "message": "Bulk upload initiated",
    "status": "PENDING",
    "totalFiles": 2,
    "processedFiles": 0
  }
}
```

---

### 10. Get Bulk Upload Status
Mengambil status upload bulk berdasarkan file ID.

**Endpoint:** `GET /bulk/status/:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID file bulk upload

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "fileId": "bulk-file-uuid",
    "status": "PROCESSING",
    "totalFiles": 2,
    "processedFiles": 1,
    "successCount": 1,
    "errorCount": 0,
    "errors": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 11. Get All Bulk Uploads
Mengambil daftar semua bulk upload dengan filter status.

**Endpoint:** `GET /bulk/all`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `status` (optional): Filter berdasarkan status (PENDING, PROCESSING, COMPLETED, FAILED)

**Example Request:**
```
GET /api/v1/purchase-orders/bulk/all?status=PENDING
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "fileId": "bulk-file-uuid",
      "status": "PENDING",
      "totalFiles": 2,
      "processedFiles": 0,
      "successCount": 0,
      "errorCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
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

## PO Types

- `SINGLE`: Purchase order tunggal
- `BULK`: Purchase order bulk/mass

## File Upload

- Mendukung multiple file upload
- File akan disimpan dengan prefix "PO_" dan timestamp
- File disimpan dalam folder berdasarkan tanggal upload
- Mendukung file PDF untuk dokumen purchase order

## Bulk Processing

- Upload file untuk processing bulk
- Status tracking untuk monitoring progress
- Error handling untuk file yang gagal diproses
- Support untuk multiple file dalam satu bulk upload

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- File upload menggunakan multipart/form-data
- Bulk processing berjalan secara asynchronous
- Search mendukung multiple filter yang dapat dikombinasikan
- Purchase order terintegrasi dengan customer, status, dan file management
