# Invoice Penagihan API Documentation

Dokumentasi lengkap untuk endpoint Invoice Penagihan pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/invoice-penagihan
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Invoice Penagihan
Membuat data invoice penagihan baru.

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
  "purchaseOrderId": "purchase-order-id",
  "kw": false,
  "fp": true,
  "tanggal": "2024-01-01",
  "kepada": "Customer ABC",
  "sub_total": 1000000,
  "total_discount": 50000,
  "total_price": 950000,
  "ppn_percentage": 11,
  "ppn_rupiah": 104500,
  "grand_total": 1054500,
  "termOfPaymentId": "term-of-payment-id",
  "statusId": "status-id",
  "invoicePenagihanDetails": [
    {
      "nama_barang": "Product A",
      "PLU": "PLU001",
      "quantity": 10,
      "satuan": "pcs",
      "harga": 100000,
      "total": 1000000,
      "discount_percentage": 5,
      "discount_rupiah": 50000
    }
  ]
}
```

**Validation Rules:**
- `purchaseOrderId`: **Required** - ID Purchase Order
- `kepada`: **Required** - Nama penerima invoice
- `sub_total`: **Required** - Subtotal amount
- `total_discount`: **Required** - Total discount amount
- `total_price`: **Required** - Total price after discount
- `ppn_percentage`: **Required** - VAT percentage
- `ppn_rupiah`: **Required** - VAT amount in Rupiah
- `grand_total`: **Required** - Grand total amount
- `termOfPaymentId`: **Required** - Term of payment ID
- `statusId`: **Required** - Status ID
- `kw`: Optional - KW status (boolean, default: false)
- `fp`: Optional - FP status (boolean, default: false)
- `tanggal`: Optional - Tanggal invoice (default: current date)
- `invoicePenagihanDetails`: Optional - Array detail invoice

**Invoice Details Validation:**
- `nama_barang`: **Required** - Nama barang
- `PLU`: **Required** - Price Look-Up code
- `quantity`: **Required** - Quantity (integer)
- `satuan`: **Required** - Unit of item
- `harga`: **Required** - Price per item
- `total`: **Required** - Total price for item
- `discount_percentage`: **Required** - Discount percentage
- `discount_rupiah`: **Required** - Discount amount in Rupiah

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "purchaseOrderId": "purchase-order-id",
    "no_invoice_penagihan": "IPN-2024-01-PO-12345",
    "kw": false,
    "fp": true,
    "tanggal": "2024-01-01T00:00:00.000Z",
    "kepada": "Customer ABC",
    "sub_total": 1000000,
    "total_discount": 50000,
    "total_price": 950000,
    "ppn_percentage": 11,
    "ppn_rupiah": 104500,
    "grand_total": 1054500,
    "termOfPaymentId": "term-of-payment-id",
    "statusId": "status-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoicePenagihanDetails": [
      {
        "id": "invoice-detail-uuid",
        "invoicePenagihanId": "invoice-uuid",
        "nama_barang": "Product A",
        "PLU": "PLU001",
        "quantity": 10,
        "satuan": "pcs",
        "harga": 100000,
        "total": 1000000,
        "discount_percentage": 5,
        "discount_rupiah": 50000,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      }
    ],
    "status": {
      "id": "status-id",
      "status_code": "PENDING INVOICE PENAGIHAN",
      "status_name": "Pending Invoice Penagihan",
      "category": "Invoice Penagihan"
    },
    "termOfPayment": {
      "id": "term-of-payment-id",
      "kode_top": "TOP001",
      "batas_hari": 30
    },
    "purchaseOrder": {
      "id": "purchase-order-id",
      "po_number": "PO-2024-001",
      "customer": {
        "id": "customer-id",
        "namaCustomer": "Customer ABC",
        "kodeCustomer": "CUST001"
      }
    }
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

### 2. Get All Invoice Penagihan
Mengambil daftar semua invoice penagihan dengan pagination.

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
GET /api/v1/invoice-penagihan?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "invoice-uuid",
        "purchaseOrderId": "purchase-order-id",
        "no_invoice_penagihan": "IPN-2024-01-PO-12345",
        "kw": false,
        "fp": true,
        "tanggal": "2024-01-01T00:00:00.000Z",
        "kepada": "Customer ABC",
        "sub_total": 1000000,
        "total_discount": 50000,
        "total_price": 950000,
        "ppn_percentage": 11,
        "ppn_rupiah": 104500,
        "grand_total": 1054500,
        "termOfPaymentId": "term-of-payment-id",
        "statusId": "status-id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "invoicePenagihanDetails": [...],
        "status": {...},
        "termOfPayment": {...},
        "purchaseOrder": {...}
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

### 3. Get Invoice Penagihan By ID
Mengambil data invoice penagihan berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID invoice penagihan

**Example Request:**
```
GET /api/v1/invoice-penagihan/invoice-uuid
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "purchaseOrderId": "purchase-order-id",
    "no_invoice_penagihan": "IPN-2024-01-PO-12345",
    "kw": false,
    "fp": true,
    "tanggal": "2024-01-01T00:00:00.000Z",
    "kepada": "Customer ABC",
    "sub_total": 1000000,
    "total_discount": 50000,
    "total_price": 950000,
    "ppn_percentage": 11,
    "ppn_rupiah": 104500,
    "grand_total": 1054500,
    "termOfPaymentId": "term-of-payment-id",
    "statusId": "status-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoicePenagihanDetails": [...],
    "status": {...},
    "termOfPayment": {...},
    "purchaseOrder": {...},
    "auditTrails": [...]
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "InvoicePenagihan not found"
  }
}
```

---

### 4. Update Invoice Penagihan
Memperbarui data invoice penagihan berdasarkan ID.

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
- `id` (required): ID invoice penagihan

**Request Body:**
```json
{
  "kepada": "Updated Customer",
  "total_discount": 75000,
  "kw": true,
  "fp": false,
  "statusId": "new-status-id"
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `purchaseOrderId`: Optional - Purchase Order ID
- `kw`: Optional - KW status
- `fp`: Optional - FP status
- `tanggal`: Optional - Tanggal invoice
- `kepada`: Optional - Nama penerima
- `sub_total`: Optional - Subtotal amount
- `total_discount`: Optional - Total discount amount
- `total_price`: Optional - Total price after discount
- `ppn_percentage`: Optional - VAT percentage
- `ppn_rupiah`: Optional - VAT amount in Rupiah
- `grand_total`: Optional - Grand total amount
- `termOfPaymentId`: Optional - Term of payment ID
- `statusId`: Optional - Status ID
- `invoicePenagihanDetails`: Optional - Array detail invoice

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "purchaseOrderId": "purchase-order-id",
    "no_invoice_penagihan": "IPN-2024-01-PO-12345",
    "kw": true,
    "fp": false,
    "tanggal": "2024-01-01T00:00:00.000Z",
    "kepada": "Updated Customer",
    "sub_total": 1000000,
    "total_discount": 75000,
    "total_price": 925000,
    "ppn_percentage": 11,
    "ppn_rupiah": 101750,
    "grand_total": 1026750,
    "termOfPaymentId": "term-of-payment-id",
    "statusId": "new-status-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoicePenagihanDetails": [...],
    "status": {...},
    "termOfPayment": {...},
    "purchaseOrder": {...}
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "InvoicePenagihan not found"
  }
}
```

---

### 5. Delete Invoice Penagihan
Menghapus data invoice penagihan berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID invoice penagihan

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
    "message": "InvoicePenagihan not found"
  }
}
```

---

### 6. Search Invoice Penagihan
Mencari invoice penagihan berdasarkan berbagai filter dengan pagination.

**Endpoint:** `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `no_invoice_penagihan` (optional): Pencarian berdasarkan nomor invoice penagihan
- `kepada` (optional): Pencarian berdasarkan nama penerima
- `statusId` (optional): Pencarian berdasarkan status ID
- `purchaseOrderId` (optional): Pencarian berdasarkan Purchase Order ID
- `termOfPaymentId` (optional): Pencarian berdasarkan Term of Payment ID
- `kw` (optional): Pencarian berdasarkan KW status (true/false)
- `fp` (optional): Pencarian berdasarkan FP status (true/false)
- `tanggal_start` (optional): Pencarian berdasarkan tanggal mulai (YYYY-MM-DD)
- `tanggal_end` (optional): Pencarian berdasarkan tanggal akhir (YYYY-MM-DD)
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/invoice-penagihan/search?no_invoice_penagihan=IPN&kepada=Customer&kw=true&fp=false&tanggal_start=2024-01-01&tanggal_end=2024-12-31&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "invoice-uuid",
        "purchaseOrderId": "purchase-order-id",
        "no_invoice_penagihan": "IPN-2024-01-PO-12345",
        "kw": true,
        "fp": false,
        "tanggal": "2024-01-01T00:00:00.000Z",
        "kepada": "Customer ABC",
        "sub_total": 1000000,
        "total_discount": 50000,
        "total_price": 950000,
        "ppn_percentage": 11,
        "ppn_rupiah": 104500,
        "grand_total": 1054500,
        "termOfPaymentId": "term-of-payment-id",
        "statusId": "status-id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "invoicePenagihanDetails": [...],
        "status": {...},
        "termOfPayment": {...},
        "purchaseOrder": {...}
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

- **Multiple Filters**: Mendukung pencarian berdasarkan berbagai kriteria
- **Date Range**: Pencarian berdasarkan rentang tanggal
- **Boolean Filters**: Pencarian berdasarkan status KW dan FP
- **Status Filter**: Pencarian berdasarkan status invoice penagihan
- **Combined Filters**: Dapat menggabungkan multiple filter dalam satu request

## Data Structure

### Invoice Penagihan Object
```json
{
  "id": "string (UUID)",
  "purchaseOrderId": "string (UUID)",
  "no_invoice_penagihan": "string (unique, auto-generated)",
  "kw": "boolean",
  "fp": "boolean",
  "tanggal": "DateTime (ISO 8601)",
  "kepada": "string",
  "sub_total": "number",
  "total_discount": "number",
  "total_price": "number",
  "ppn_percentage": "number",
  "ppn_rupiah": "number",
  "grand_total": "number",
  "termOfPaymentId": "string (UUID)",
  "statusId": "string (UUID)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)",
  "invoicePenagihanDetails": "InvoicePenagihanDetail[]",
  "status": "Status Object",
  "termOfPayment": "TermOfPayment Object",
  "purchaseOrder": "PurchaseOrder Object"
}
```

### Invoice Penagihan Detail Object
```json
{
  "id": "string (UUID)",
  "invoicePenagihanId": "string (UUID)",
  "nama_barang": "string",
  "PLU": "string",
  "quantity": "number (integer)",
  "satuan": "string",
  "harga": "number",
  "total": "number",
  "discount_percentage": "number",
  "discount_rupiah": "number",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)"
}
```

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Nomor invoice penagihan akan otomatis dibuat dengan format: `IPN-YYYY-MM-{PO_NUMBER}-{RANDOM}`
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Invoice penagihan details akan otomatis dibuat saat membuat invoice penagihan baru
- Sistem memiliki audit log untuk semua operasi CRUD
- Pencarian mendukung multiple filter yang dapat dikombinasikan
- Date format untuk search menggunakan YYYY-MM-DD
- Field `kw` dan `fp` adalah boolean flags untuk status khusus
- Relasi dengan Purchase Order, Term of Payment, dan Status adalah required
