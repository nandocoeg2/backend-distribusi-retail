# Invoice Pengiriman API Documentation

Dokumentasi lengkap untuk endpoint Invoice Pengiriman pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/invoice-pengiriman
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Invoice Pengiriman
Membuat data invoice pengiriman baru.

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
  "no_invoice": "INV-2024-001",
  "deliver_to": "Customer ABC",
  "sub_total": 1000000,
  "total_discount": 50000,
  "total_price": 950000,
  "ppn_percentage": 11,
  "ppn_rupiah": 104500,
  "grand_total": 1054500,
  "expired_date": "2024-12-31",
  "TOP": "30 days",
  "type": "PEMBAYARAN",
  "invoiceDetails": [
    {
      "nama_barang": "Product A",
      "PLU": "PLU001",
      "quantity": 10,
      "satuan": "pcs",
      "harga": 100000,
      "total": 1000000,
      "discount_percentage": 5,
      "discount_rupiah": 50000,
      "PPN_pecentage": 11,
      "ppn_rupiah": 104500
    }
  ]
}
```

**Validation Rules:**
- `no_invoice`: **Required** - Nomor invoice
- `deliver_to`: **Required** - Alamat pengiriman
- `sub_total`: **Required** - Subtotal amount
- `total_discount`: **Required** - Total discount amount
- `total_price`: **Required** - Total price after discount
- `ppn_percentage`: **Required** - VAT percentage
- `ppn_rupiah`: **Required** - VAT amount in Rupiah
- `grand_total`: **Required** - Grand total amount
- `tanggal`: Optional - Tanggal invoice (default: current date)
- `expired_date`: Optional - Tanggal expired invoice
- `TOP`: Optional - Term of payment
- `type`: Optional - Type invoice (PEMBAYARAN/PENGIRIMAN, default: PEMBAYARAN)
- `statusPembayaranId`: Optional - Payment status ID
- `purchaseOrderId`: Optional - Purchase Order ID
- `invoiceDetails`: Optional - Array detail invoice

**Invoice Details Validation:**
- `nama_barang`: **Required** - Nama barang
- `PLU`: **Required** - Price Look-Up code
- `quantity`: **Required** - Quantity (integer)
- `satuan`: **Required** - Unit of item
- `harga`: **Required** - Price per item
- `total`: **Required** - Total price for item
- `discount_percentage`: **Required** - Discount percentage
- `discount_rupiah`: **Required** - Discount amount in Rupiah
- `PPN_pecentage`: **Required** - VAT percentage for item
- `ppn_rupiah`: **Required** - VAT amount in Rupiah for item

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "no_invoice": "INV-2024-001",
    "tanggal": "2024-01-01T00:00:00.000Z",
    "deliver_to": "Customer ABC",
    "sub_total": 1000000,
    "total_discount": 50000,
    "total_price": 950000,
    "ppn_percentage": 11,
    "ppn_rupiah": 104500,
    "grand_total": 1054500,
    "expired_date": "2024-12-31T00:00:00.000Z",
    "TOP": "30 days",
    "type": "PEMBAYARAN",
    "statusPembayaranId": null,
    "purchaseOrderId": null,
    "invoicePenagihanId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoiceDetails": [
      {
        "id": "invoice-detail-uuid",
        "invoiceId": "invoice-uuid",
        "nama_barang": "Product A",
        "PLU": "PLU001",
        "quantity": 10,
        "satuan": "pcs",
        "harga": 100000,
        "total": 1000000,
        "discount_percentage": 5,
        "discount_rupiah": 50000,
        "PPN_pecentage": 11,
        "ppn_rupiah": 104500,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      }
    ],
    "statusPembayaran": null,
    "purchaseOrder": null,
    "invoicePenagihan": null
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Invoice number is required"
  }
}
```

**Response Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "message": "InvoicePengiriman with this number already exists"
  }
}
```

---

### 2. Get All Invoice Pengiriman
Mengambil daftar semua invoice pengiriman dengan pagination.

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
GET /api/v1/invoice-pengiriman?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "invoice-uuid",
        "no_invoice": "INV-2024-001",
        "tanggal": "2024-01-01T00:00:00.000Z",
        "deliver_to": "Customer ABC",
        "sub_total": 1000000,
        "total_discount": 50000,
        "total_price": 950000,
        "ppn_percentage": 11,
        "ppn_rupiah": 104500,
        "grand_total": 1054500,
        "expired_date": "2024-12-31T00:00:00.000Z",
        "TOP": "30 days",
        "type": "PEMBAYARAN",
        "statusPembayaranId": null,
        "purchaseOrderId": null,
        "invoicePenagihanId": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "invoiceDetails": [...],
        "statusPembayaran": null,
        "purchaseOrder": null,
        "invoicePenagihan": null
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

### 3. Get Invoice Pengiriman By ID
Mengambil data invoice pengiriman berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID invoice pengiriman

**Example Request:**
```
GET /api/v1/invoice-pengiriman/invoice-uuid
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "no_invoice": "INV-2024-001",
    "tanggal": "2024-01-01T00:00:00.000Z",
    "deliver_to": "Customer ABC",
    "sub_total": 1000000,
    "total_discount": 50000,
    "total_price": 950000,
    "ppn_percentage": 11,
    "ppn_rupiah": 104500,
    "grand_total": 1054500,
    "expired_date": "2024-12-31T00:00:00.000Z",
    "TOP": "30 days",
    "type": "PEMBAYARAN",
    "statusPembayaranId": null,
    "purchaseOrderId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoiceDetails": [...],
    "statusPembayaran": null,
    "purchaseOrder": {
      "id": "po-uuid",
      "no_purchase_order": "PO-2024-001",
      "customer": {
        "id": "customer-uuid",
        "name": "Customer ABC"
      },
      "supplier": {
        "id": "supplier-uuid",
        "name": "Supplier XYZ"
      }
    },
    "invoicePenagihan": {
      "id": "invoice-penagihan-uuid",
      "no_invoice_penagihan": "IPN-2024-001",
      "status": {
        "id": "status-uuid",
        "status_code": "PAID",
        "status_name": "Paid"
      },
      "termOfPayment": {
        "id": "top-uuid",
        "kode_top": "TOP30",
        "batas_hari": 30
      },
      "invoicePenagihanDetails": [...]
    },
    "suratJalan": [],
    "auditTrails": [
      {
        "id": "audit-uuid",
        "tableName": "InvoicePengiriman",
        "recordId": "invoice-uuid",
        "action": "CREATE",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "username": "johndoe",
          "firstName": "John",
          "lastName": "Doe"
        },
        "changes": {...}
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
    "message": "InvoicePengiriman not found"
  }
}
```

---

### 4. Update Invoice Pengiriman
Memperbarui data invoice pengiriman berdasarkan ID.

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
- `id` (required): ID invoice pengiriman

**Request Body:**
```json
{
  "deliver_to": "Customer Updated",
  "sub_total": 1200000,
  "total_discount": 60000,
  "total_price": 1140000,
  "ppn_percentage": 11,
  "ppn_rupiah": 125400,
  "grand_total": 1265400
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `no_invoice`: Optional - Nomor invoice
- `tanggal`: Optional - Tanggal invoice
- `deliver_to`: Optional - Alamat pengiriman
- `sub_total`: Optional - Subtotal amount
- `total_discount`: Optional - Total discount amount
- `total_price`: Optional - Total price after discount
- `ppn_percentage`: Optional - VAT percentage
- `ppn_rupiah`: Optional - VAT amount in Rupiah
- `grand_total`: Optional - Grand total amount
- `expired_date`: Optional - Tanggal expired invoice
- `TOP`: Optional - Term of payment
- `type`: Optional - Type invoice (PEMBAYARAN/PENGIRIMAN)
- `statusPembayaranId`: Optional - Payment status ID
- `purchaseOrderId`: Optional - Purchase Order ID
- `invoiceDetails`: Optional - Array detail invoice

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "no_invoice": "INV-2024-001",
    "tanggal": "2024-01-01T00:00:00.000Z",
    "deliver_to": "Customer Updated",
    "sub_total": 1200000,
    "total_discount": 60000,
    "total_price": 1140000,
    "ppn_percentage": 11,
    "ppn_rupiah": 125400,
    "grand_total": 1265400,
    "expired_date": "2024-12-31T00:00:00.000Z",
    "TOP": "30 days",
    "type": "PEMBAYARAN",
    "statusPembayaranId": null,
    "purchaseOrderId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoiceDetails": [...],
    "statusPembayaran": null,
    "purchaseOrder": null
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "InvoicePengiriman not found"
  }
}
```

**Response Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "message": "Failed to update InvoicePengiriman"
  }
}
```

---

### 5. Delete Invoice Pengiriman
Menghapus data invoice pengiriman berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID invoice pengiriman

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
    "message": "InvoicePengiriman not found"
  }
}
```

**Response Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "message": "Failed to delete InvoicePengiriman"
  }
}
```

---

### 6. Search Invoice Pengiriman
Mencari invoice pengiriman berdasarkan berbagai filter dengan pagination.

**Endpoint:** `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `no_invoice` (optional): Pencarian berdasarkan nomor invoice
- `deliver_to` (optional): Pencarian berdasarkan alamat pengiriman
- `type` (optional): Pencarian berdasarkan tipe invoice (PEMBAYARAN/PENGIRIMAN)
- `status_code` (optional): Pencarian berdasarkan kode status pembayaran (mis. PAYMENT_PENDING)
- `purchaseOrderId` (optional): Pencarian berdasarkan Purchase Order ID
- `tanggal_start` (optional): Pencarian berdasarkan tanggal mulai (YYYY-MM-DD)
- `tanggal_end` (optional): Pencarian berdasarkan tanggal akhir (YYYY-MM-DD)
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/invoice-pengiriman/search?no_invoice=INV-2024&type=PEMBAYARAN&status_code=PAYMENT_PENDING&tanggal_start=2024-01-01&tanggal_end=2024-12-31&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "invoice-uuid",
        "no_invoice": "INV-2024-001",
        "tanggal": "2024-01-01T00:00:00.000Z",
        "deliver_to": "Customer ABC",
        "sub_total": 1000000,
        "total_discount": 50000,
        "total_price": 950000,
        "ppn_percentage": 11,
        "ppn_rupiah": 104500,
        "grand_total": 1054500,
        "expired_date": "2024-12-31T00:00:00.000Z",
        "TOP": "30 days",
        "type": "PEMBAYARAN",
        "statusPembayaranId": null,
        "purchaseOrderId": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "invoiceDetails": [...],
        "statusPembayaran": null,
        "purchaseOrder": {
          "id": "po-uuid",
          "no_purchase_order": "PO-2024-001",
          "customer": {
            "id": "customer-uuid",
            "name": "Customer ABC"
          }
        }
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

### 7. Create Invoice Penagihan from Invoice Pengiriman
Membuat invoice penagihan baru berdasarkan data invoice pengiriman yang sudah ada.

**Endpoint:** `POST /:id/create-penagihan`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID invoice pengiriman yang akan digunakan sebagai basis

**Request Body:**
```json
{
  "statusId": "status-uuid-optional"
}
```

**Validation Rules:**
- `statusId`: Optional - Status ID untuk invoice penagihan (jika tidak diisi, akan menggunakan status "PENDING INVOICE PENAGIHAN")

**Available Status for Invoice Penagihan (category: "Invoice Penagihan"):**
- `PENDING INVOICE PENAGIHAN` - **Default** - Menunggu pembayaran
- `PROCESSING INVOICE PENAGIHAN` - Invoice sedang diproses
- `PAID INVOICE PENAGIHAN` - Sudah dibayar
- `OVERDUE INVOICE PENAGIHAN` - Telah jatuh tempo
- `CANCELLED INVOICE PENAGIHAN` - Dibatalkan
- `COMPLETED INVOICE PENAGIHAN` - Selesai

**Example Request:**
```
POST /api/v1/invoice-pengiriman/invoice-uuid/create-penagihan
```

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-penagihan-uuid",
    "purchaseOrderId": "po-uuid",
    "no_invoice_penagihan": "IPN-2024-001",
    "kw": false,
    "fp": false,
    "tanggal": "2024-01-15T10:30:00.000Z",
    "kepada": "Customer ABC",
    "sub_total": 1000000,
    "total_discount": 50000,
    "total_price": 950000,
    "ppn_percentage": 11,
    "ppn_rupiah": 104500,
    "grand_total": 1054500,
    "termOfPaymentId": "top-uuid",
    "statusId": "status-uuid",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "invoicePenagihanDetails": [
      {
        "id": "detail-uuid",
        "invoicePenagihanId": "invoice-penagihan-uuid",
        "nama_barang": "Product A",
        "PLU": "PLU001",
        "quantity": 10,
        "satuan": "pcs",
        "harga": 100000,
        "total": 1000000,
        "discount_percentage": 5,
        "discount_rupiah": 50000,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid"
      }
    ],
    "status": {
      "id": "status-uuid",
      "status_code": "PENDING",
      "category": "invoice_penagihan",
      "status_name": "Pending"
    },
    "termOfPayment": {
      "id": "top-uuid",
      "kode_top": "TOP30",
      "batas_hari": 30
    },
    "purchaseOrder": {
      "id": "po-uuid",
      "po_number": "PO-2024-001",
      "customer": {
        "id": "customer-uuid",
        "namaCustomer": "Customer ABC"
      },
      "supplier": {
        "id": "supplier-uuid",
        "name": "Supplier XYZ"
      }
    }
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "InvoicePengiriman not found"
  }
}
```

**Response Error (404 Not Found - PurchaseOrder):**
```json
{
  "success": false,
  "error": {
    "message": "PurchaseOrder not found for this InvoicePengiriman"
  }
}
```

**Response Error (400 Bad Request - No Term of Payment):**
```json
{
  "success": false,
  "error": {
    "message": "Term of Payment (termin_bayar) not found in PurchaseOrder"
  }
}
```

**Response Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "message": "InvoicePenagihan already exists for this InvoicePengiriman"
  }
}
```

**Response Error (400 Bad Request - No Status):**
```json
{
  "success": false,
  "error": {
    "message": "Default status \"PENDING INVOICE PENAGIHAN\" not found. Please provide statusId or create status with category \"Invoice Penagihan\" and status_code \"PENDING INVOICE PENAGIHAN\""
  }
}
```

**Response Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "message": "Failed to create InvoicePenagihan from InvoicePengiriman"
  }
}
```

**Business Logic:**
1. Sistem akan mengambil semua data dari InvoicePengiriman (header + details)
2. Field mapping:
   - `tanggal` → menggunakan current timestamp (saat pembuatan invoice penagihan)
   - `kepada` → dari `deliver_to` invoice pengiriman
   - `termOfPaymentId` → dari `purchaseOrder.termin_bayar`
   - `kw` dan `fp` → default `false`
   - Semua nilai finansial (sub_total, total_discount, dll) → copy dari invoice pengiriman
   - Invoice details → copy semua item dari invoice pengiriman (kecuali field PPN per item)
3. Sistem akan membuat nomor invoice penagihan unik dengan prefix `IPN`
4. Sistem akan membuat relasi 1-to-1 antara InvoicePengiriman dan InvoicePenagihan
5. Audit trail akan tercatat untuk kedua invoice (CREATE untuk penagihan, UPDATE untuk pengiriman)
6. Jika sudah pernah dibuat invoice penagihan dari invoice pengiriman ini sebelumnya, akan mengembalikan error 409

**Notes:**
- Invoice pengiriman harus sudah memiliki relasi dengan purchase order
- Purchase order harus memiliki term of payment (termin_bayar)
- Setiap invoice pengiriman hanya bisa membuat satu invoice penagihan
- Audit trail otomatis tercatat untuk tracking
- **Default Status**: Jika `statusId` tidak disediakan, sistem akan menggunakan status dengan:
  - `category`: "Invoice Penagihan"
  - `status_code`: "PENDING INVOICE PENAGIHAN"
- Pastikan status default tersebut sudah ada di database, atau sertakan `statusId` di request body

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
- `409 Conflict`: Conflict - Nomor invoice sudah ada
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
- **Type Filter**: Pencarian berdasarkan tipe invoice
- **Status Filter**: Pencarian berdasarkan status pembayaran menggunakan parameter `status_code`
- **Combined Filters**: Dapat menggabungkan multiple filter dalam satu request

## Invoice Types

- `PEMBAYARAN`: Invoice untuk pembayaran
- `PENGIRIMAN`: Invoice untuk pengiriman

## Data Structure

### Invoice Pengiriman Object
```json
{
  "id": "string (UUID)",
  "no_invoice": "string (unique)",
  "tanggal": "DateTime (ISO 8601)",
  "deliver_to": "string",
  "sub_total": "number",
  "total_discount": "number",
  "total_price": "number",
  "ppn_percentage": "number",
  "ppn_rupiah": "number",
  "grand_total": "number",
  "expired_date": "DateTime (ISO 8601, optional)",
  "TOP": "string (optional)",
  "type": "enum (PEMBAYARAN/PENGIRIMAN)",
  "statusPembayaranId": "string (UUID, optional)",
  "purchaseOrderId": "string (UUID, optional)",
  "invoicePenagihanId": "string (UUID, optional)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)",
  "invoiceDetails": "InvoicePengirimanDetail[]",
  "statusPembayaran": "Status Object (optional)",
  "purchaseOrder": "PurchaseOrder Object with nested customer and supplier (optional)",
  "invoicePenagihan": "InvoicePenagihan Object (optional)",
  "suratJalan": "SuratJalan[] (only in Get By ID)",
  "auditTrails": "AuditTrail[] (only in Get By ID)"
}
```

**Note:**
- Field `purchaseOrder` pada endpoint Get By ID include nested relations: `customer` dan `supplier`
- Field `purchaseOrder` pada endpoint Search include nested relation: `customer` saja
- Field `invoicePenagihan` berisi detail invoice penagihan yang sudah dibuat (jika ada), include: `status`, `termOfPayment`, dan `invoicePenagihanDetails` (hanya pada Get By ID)
- Field `suratJalan` dan `auditTrails` hanya ada pada response Get By ID
- Relasi `invoicePenagihan` bersifat 1-to-1, artinya setiap invoice pengiriman maksimal memiliki 1 invoice penagihan

### Invoice Pengiriman Detail Object
```json
{
  "id": "string (UUID)",
  "invoiceId": "string (UUID)",
  "nama_barang": "string",
  "PLU": "string",
  "quantity": "number (integer)",
  "satuan": "string",
  "harga": "number",
  "total": "number",
  "discount_percentage": "number",
  "discount_rupiah": "number",
  "PPN_pecentage": "number",
  "ppn_rupiah": "number",
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
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Nomor invoice harus unik dalam sistem
- Invoice details akan otomatis dibuat saat membuat invoice pengiriman baru
- Sistem memiliki audit log untuk semua operasi CRUD
- Pencarian mendukung multiple filter yang dapat dikombinasikan
- Date format untuk search menggunakan YYYY-MM-DD
