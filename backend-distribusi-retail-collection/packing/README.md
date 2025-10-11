# Packing API Documentation

Dokumentasi lengkap untuk endpoint Packing API pada sistem Backend Distribusi Retail.

## Base URL

```
http://localhost:5050/api/v1/packings
```

## Authentication

Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Packing

Membuat data packing baru.

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
  "tanggal_packing": "2025-09-06T00:00:00.000Z",
  "statusId": "status-uuid",
  "purchaseOrderId": "purchase-order-uuid",
  "packingItems": [
    {
      "nama_barang": "Product Name",
      "total_qty": 100,
      "jumlah_carton": 10,
      "isi_per_carton": 10,
      "no_box": "BOX001",
      "inventoryId": "inventory-uuid"
    }
  ]
}
```

**Validation Rules:**

- `tanggal_packing`: **Required** - Tanggal packing
- `statusId`: **Required** - ID status packing
- `purchaseOrderId`: **Required** - ID purchase order
- `packingItems`: **Required** - Array item packing

**Response Success (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "packing-uuid",
    "packing_number": "PKG-2024-001",
    "tanggal_packing": "2025-09-06T00:00:00.000Z",
    "statusId": "status-uuid",
    "purchaseOrderId": "purchase-order-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "status": {...},
    "purchaseOrder": {...},
    "packingItems": [...]
  }
}
```

---

### 2. Get All Packings

Mengambil daftar semua packing dengan pagination.

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

### 3. Get Packing By ID

Mengambil data packing berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**

```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**

- `id` (required): ID packing

**Response Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "packing-uuid",
    "packing_number": "PKG-2024-001",
    "tanggal_packing": "2025-09-06T00:00:00.000Z",
    "statusId": "status-uuid",
    "purchaseOrderId": "purchase-order-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "status": {...},
    "purchaseOrder": {...},
    "packingItems": [...]
  }
}
```

---

### 4. Update Packing

Memperbarui data packing berdasarkan ID.

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

- `id` (required): ID packing

**Request Body:**

```json
{
  "tanggal_packing": "2025-09-06T00:00:00.000Z",
  "statusId": "status-uuid",
  "packingItems": [
    {
      "nama_barang": "Updated Product Name",
      "total_qty": 200,
      "jumlah_carton": 20,
      "isi_per_carton": 10,
      "no_box": "BOX002",
      "inventoryId": "inventory-uuid"
    }
  ]
}
```

**Response Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "packing-uuid",
    "packing_number": "PKG-2024-001",
    "tanggal_packing": "2025-09-06T00:00:00.000Z",
    "statusId": "status-uuid",
    "purchaseOrderId": "purchase-order-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "status": {...},
    "purchaseOrder": {...},
    "packingItems": [...]
  }
}
```

---

### 5. Delete Packing

Menghapus data packing berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**

```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**

- `id` (required): ID packing

**Response Success (204 No Content):**

```
Status: 204 No Content
Body: (empty)
```

---

### 6. Search Packings

Mencari packing berdasarkan berbagai filter dengan pagination.

**Endpoint:** `GET /search`

**Headers:**

```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**

- `packing_number` (optional): Pencarian berdasarkan nomor packing
- `tanggal_packing` (optional): Pencarian berdasarkan tanggal packing
- `status_code` (optional): Pencarian berdasarkan status code (contoh: "PENDING PACKING", "PROCESSING PACKING")
- `purchaseOrderId` (optional): Pencarian berdasarkan Purchase Order ID
- `is_printed` (optional): Filter berdasarkan status cetak (true/false)
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**

```
GET /search?status_code=PENDING%20PACKING&page=1&limit=10
GET /search?status_code=PROCESSING%20PACKING&packing_number=PKG-2024-001
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

### 7. Process Packing

Memproses packing dari status "PENDING PACKING" menjadi "PROCESSING PACKING" dan mengubah status semua packing item menjadi "PROCESSING ITEM". Audit log dicatat untuk packing dan purchase order yang terkait.

**Endpoint:** `POST /process`

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
  "ids": ["packing_id_1", "packing_id_2", "packing_id_3"]
}
```

**Validation Rules:**

- `ids`: **Required** - Array ID packing yang akan diproses (minimal 1 ID)

**Response Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Packing berhasil diproses",
    "processedCount": 2,
    "processedPackingItemsCount": 4,
    "packings": [
      {
        "id": "packing-uuid-1",
        "packing_number": "PKG-2024-001",
        "tanggal_packing": "2025-09-06T00:00:00.000Z",
        "statusId": "processing-packing-status-uuid",
        "purchaseOrderId": "purchase-order-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "status": {
          "id": "processing-packing-status-uuid",
          "status_code": "PROCESSING PACKING",
          "status_name": "Processing Packing",
          "status_description": "Packing is currently being processed"
        },
        "purchaseOrder": {...},
        "packingItems": [
          {
            "id": "packing-item-uuid",
            "nama_barang": "Product Name",
            "total_qty": 100,
            "jumlah_carton": 10,
            "isi_per_carton": 10,
            "no_box": "BOX001",
            "packingId": "packing-uuid-1",
            "inventoryId": "inventory-uuid",
            "statusId": "processing-item-status-uuid",
            "status": {
              "id": "processing-item-status-uuid",
              "status_code": "PROCESSING ITEM",
              "status_name": "Processing Item",
              "status_description": "Packing detail item is currently being processed."
            }
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Status:**

```json
{
  "success": false,
  "error": {
    "message": "Packing dengan ID packing_id_1 tidak memiliki status PENDING PACKING"
  }
}
```

**400 Bad Request - Invalid Purchase Order Status:**

```json
{
  "success": false,
  "error": {
    "message": "Purchase Order untuk Packing packing_id_1 harus memiliki status PROCESSING PURCHASE ORDER"
  }
}
```

**404 Not Found - Packing Not Found:**

```json
{
  "success": false,
  "error": {
    "message": "Packing not found: packing_id_1, packing_id_2"
  }
}
```

**404 Not Found - Status Not Found:**

```json
{
  "success": false,
  "error": {
    "message": "PENDING PACKING status not found"
  }
}
```

---

### 8. Complete Packing

Menyelesaikan proses packing dari status "PROCESSING PACKING" menjadi "COMPLETED PACKING", mengubah status semua packing item menjadi "PROCESSED ITEM", dan mengubah status purchase order menjadi "PROCESSED PURCHASE ORDER".

**Endpoint:** `POST /complete`

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
  "ids": ["packing_id_1", "packing_id_2", "packing_id_3"]
}
```

**Validation Rules:**

- `ids`: **Required** - Array ID packing yang akan diselesaikan (minimal 1 ID)

**Response Success (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Packing berhasil diselesaikan",
    "completedCount": 2,
    "completedPackingItemsCount": 4,
    "packings": [
      {
        "id": "packing-uuid-1",
        "packing_number": "PKG-2024-001",
        "tanggal_packing": "2025-09-06T00:00:00.000Z",
        "statusId": "completed-packing-status-uuid",
        "purchaseOrderId": "purchase-order-uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "status": {
          "id": "completed-packing-status-uuid",
          "status_code": "COMPLETED PACKING",
          "status_name": "Completed Packing",
          "status_description": "Packing has been completed"
        },
        "purchaseOrder": {
          "id": "purchase-order-uuid",
          "status": {
            "status_code": "PROCESSED PURCHASE ORDER"
          }
        },
        "packingItems": [
          {
            "id": "packing-item-uuid",
            "nama_barang": "Product Name",
            "total_qty": 100,
            "jumlah_carton": 10,
            "isi_per_carton": 10,
            "no_box": "BOX001",
            "packingId": "packing-uuid-1",
            "inventoryId": "inventory-uuid",
            "statusId": "processed-item-status-uuid",
            "status": {
              "id": "processed-item-status-uuid",
              "status_code": "PROCESSED ITEM",
              "status_name": "Processed Item",
              "status_description": "Packing detail item has been processed."
            }
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Status:**

```json
{
  "success": false,
  "error": {
    "message": "Packing dengan ID packing_id_1 tidak memiliki status PROCESSING PACKING"
  }
}
```

**400 Bad Request - Invalid Purchase Order Status:**

```json
{
  "success": false,
  "error": {
    "message": "Purchase Order untuk Packing packing_id_1 harus memiliki status PROCESSING PURCHASE ORDER"
  }
}
```

**404 Not Found - Packing Not Found:**

```json
{
  "success": false,
  "error": {
    "message": "Packing not found: packing_id_1, packing_id_2"
  }
}
```

**404 Not Found - Status Not Found:**

```json
{
  "success": false,
  "error": {
    "message": "PROCESSING PACKING status not found"
  }
}
```

---

### 9. Record Print Packing

Mencatat aktivitas print packing. Endpoint ini akan mengupdate field `is_printed` menjadi `true` dan menambah counter `print_counter`.

**Endpoint:** `POST /:id/record-print`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**

- `id` (required): ID packing

**Example Request:**

```
POST /api/v1/packings/packing-uuid/record-print
```

**Response Success (200 OK):**

```json
{
  "success": true,
  "message": "Print recorded successfully",
  "data": {
    "id": "packing-uuid",
    "packing_number": "PKG-2024-001",
    "is_printed": true,
    "print_counter": 1,
    "tanggal_packing": "2025-09-06T00:00:00.000Z",
    "statusId": "status-uuid",
    "purchaseOrderId": "purchase-order-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "status": {...},
    "purchaseOrder": {...},
    "packingItems": [...]
  }
}
```

**Response Error (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "message": "Packing not found"
  }
}
```

**Response Error (500 Internal Server Error):**

```json
{
  "success": false,
  "error": {
    "message": "Failed to record print for packing"
  }
}
```

**Business Logic:**
- Field `is_printed` akan di-set menjadi `true`
- Field `print_counter` akan bertambah 1 setiap kali endpoint ini dipanggil
- Audit trail otomatis tercatat untuk tracking aktivitas print dengan action `RECORD_PRINT`
- Endpoint ini dapat dipanggil berkali-kali untuk mencatat multiple print

**Use Case:**
- Tracking berapa kali packing list telah dicetak
- Identifikasi packing yang sudah/belum pernah dicetak
- Monitoring aktivitas print untuk audit dan quality control
- Integrasi dengan sistem warehouse management

**Notes:**
- Endpoint ini tidak membatasi status packing, bisa dipanggil pada status apapun
- Tidak ada limit berapa kali packing bisa dicetak
- Print counter akan terus bertambah setiap kali record print dipanggil
- Berguna untuk tracking compliance dalam proses packing dan shipping

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

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Nomor packing akan otomatis di-generate jika tidak disediakan
- Packing terintegrasi dengan Purchase Order dan Inventory
- Sistem mendukung multiple items dalam satu packing
- Search mendukung multiple filter yang dapat dikombinasikan
- Parameter `status_code` adalah case-insensitive untuk kemudahan pencarian
