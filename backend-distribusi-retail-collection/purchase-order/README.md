# Purchase Order API Collection

## Base Configuration
- **Base URL**: `http://localhost:5050/api/v1`
- **Authentication**: Bearer Token
- **Content-Type**: `application/json` (kecuali multipart untuk upload file)

---

## 1. Create Purchase Order

### Endpoint Details
- **Method**: `POST`
- **URL**: `/purchase-orders/`
- **Description**: Membuat purchase order baru dengan file upload
- **File**: `create.bru`

### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
customerId: string (required)
po_number: string (required)
total_items: number (optional)
tanggal_masuk_po: string (optional, ISO date)
tanggal_batas_kirim: string (optional, ISO date)
termin_bayar: string (optional)
po_type: "BULK" | "SINGLE" (required)
status_code: string (optional, default: "PENDING PURCHASE ORDER")
files: File[] (optional, untuk BULK type)
```

### Sample Request
```bash
curl -X POST http://localhost:5050/api/v1/purchase-orders/ \
  -H "Authorization: Bearer your_token_here" \
  -F "customerId=customer_123" \
  -F "po_number=PO-001" \
  -F "po_type=BULK" \
  -F "files=@document.pdf"
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "id": "po_123",
    "po_number": "PO-001",
    "customerId": "customer_123",
    "po_type": "BULK",
    "statusId": "status_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 2. Get All Purchase Orders

### Endpoint Details
- **Method**: `GET`
- **URL**: `/purchase-orders/`
- **Description**: Mendapatkan daftar semua purchase orders dengan pagination
- **File**: `get-all.bru`

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

### Sample Request
```bash
curl -X GET "http://localhost:5050/api/v1/purchase-orders/?page=1&limit=10" \
  -H "Authorization: Bearer your_token_here"
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "po_123",
        "po_number": "PO-001",
        "customer": {
          "id": "customer_123",
          "namaCustomer": "PT Example"
        },
        "status": {
          "id": "status_123",
          "status_code": "PENDING PURCHASE ORDER"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

## 3. Get Purchase Order by ID

### Endpoint Details
- **Method**: `GET`
- **URL**: `/api/purchase-orders/:id`
- **Description**: Mendapatkan detail purchase order berdasarkan ID
- **File**: `get-by-id.bru`

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
```
id: string (required) - Purchase Order ID
```

### Sample Request
```bash
curl -X GET http://localhost:5050/api/v1/purchase-orders/po_123 \
  -H "Authorization: Bearer your_token_here"
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "id": "po_123",
    "po_number": "PO-001",
    "customer": {
      "id": "customer_123",
      "namaCustomer": "PT Example"
    },
    "purchaseOrderDetails": [
      {
        "id": "detail_123",
        "plu": "PLU001",
        "nama_barang": "Product Name",
        "quantity": 100,
        "harga": 50000
      }
    ],
    "files": [
      {
        "id": "file_123",
        "filename": "document.pdf",
        "path": "/uploads/document.pdf"
      }
    ],
    "status": {
      "id": "status_123",
      "status_code": "PENDING PURCHASE ORDER"
    }
  }
}
```

---

## 4. Update Purchase Order

### Endpoint Details
- **Method**: `PUT`
- **URL**: `/api/purchase-orders/:id`
- **Description**: Mengupdate purchase order
- **File**: `update.bru`

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters
```
id: string (required) - Purchase Order ID
```

### Request Body
```json
{
  "customerId": "string (optional)",
  "po_number": "string (optional)",
  "total_items": "number (optional)",
  "tanggal_masuk_po": "string (optional, ISO date)",
  "tanggal_batas_kirim": "string (optional, ISO date)",
  "termin_bayar": "string (optional)",
  "po_type": "BULK | SINGLE (optional)",
  "status_code": "string (optional)",
  "purchaseOrderDetails": [
    {
      "plu": "string (required)",
      "nama_barang": "string (required)",
      "quantity": "number (required)",
      "isi": "number (required)",
      "harga": "number (required)",
      "harga_netto": "number (required)",
      "total_pembelian": "number (required)"
    }
  ]
}
```

### Sample Request
```bash
curl -X PUT http://localhost:5050/api/v1/purchase-orders/po_123 \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "po_number": "PO-001-UPDATED",
    "purchaseOrderDetails": [
      {
        "plu": "PLU001",
        "nama_barang": "Updated Product",
        "quantity": 150,
        "isi": 12,
        "harga": 55000,
        "harga_netto": 55000,
        "total_pembelian": 8250000
      }
    ]
  }'
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "id": "po_123",
    "po_number": "PO-001-UPDATED",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "purchaseOrderDetails": [
      {
        "id": "detail_123",
        "plu": "PLU001",
        "nama_barang": "Updated Product",
        "quantity": 150
      }
    ]
  }
}
```

---

## 5. Delete Purchase Order

### Endpoint Details
- **Method**: `DELETE`
- **URL**: `/api/purchase-orders/:id`
- **Description**: Menghapus purchase order
- **File**: `delete.bru`

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
```
id: string (required) - Purchase Order ID
```

### Sample Request
```bash
curl -X DELETE http://localhost:5050/api/v1/purchase-orders/po_123 \
  -H "Authorization: Bearer your_token_here"
```

### Sample Response
```
HTTP 204 No Content
```

---

## 6. Search Purchase Orders

### Endpoint Details
- **Method**: `GET`
- **URL**: `/api/purchase-orders/search`
- **Description**: Mencari purchase orders berdasarkan kriteria tertentu
- **File**: `search.bru`

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
```
tanggal_masuk_po: string (optional, ISO date)
customer_name: string (optional)
customerId: string (optional)
po_number: string (optional)
supplierId: string (optional)
status_code: string (optional)
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

### Sample Request
```bash
curl -X GET "http://localhost:5050/api/v1/purchase-orders/search?customer_name=PT%20Example&page=1&limit=10" \
  -H "Authorization: Bearer your_token_here"
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "po_123",
        "po_number": "PO-001",
        "customer": {
          "namaCustomer": "PT Example"
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

## 7. Get History Purchase Orders

### Endpoint Details
- **Method**: `GET`
- **URL**: `/api/purchase-orders/history`
- **Description**: Mendapatkan riwayat purchase orders yang sudah approved/failed
- **File**: `history.bru`

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
```
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

### Sample Request
```bash
curl -X GET "http://localhost:5050/api/v1/purchase-orders/history?page=1&limit=10" \
  -H "Authorization: Bearer your_token_here"
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "po_123",
        "po_number": "PO-001",
        "status": {
          "status_code": "APPROVED PURCHASE ORDER"
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

## 8. Process Purchase Order

### Endpoint Details
- **Method**: `PATCH`
- **URL**: `/purchase-orders/process`
- **Description**: Memproses single atau multiple purchase orders dengan mengirimkan array ID dalam body
- **Files**: `process.bru` (single), `bulk-process.bru` (bulk)

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "ids": ["string[] (required, min: 1)"],
  "status_code": "string (required)"
}
```

### Sample Requests

#### Single Processing (1 ID)
```bash
curl --request PATCH \
  --url http://localhost:5050/api/v1/purchase-orders/process \
  --header 'accept: application/json' \
  --header 'authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'content-type: application/json' \
  --data '{
    "ids": ["po_123"],
    "status_code": "PROCESSED PURCHASE ORDER"
  }'
```

#### Bulk Processing (Multiple IDs)
```bash
curl --request PATCH \
  --url http://localhost:5050/api/v1/purchase-orders/process \
  --header 'accept: application/json' \
  --header 'authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'content-type: application/json' \
  --data '{
    "ids": [
      "po_123",
      "po_124",
      "po_125"
    ],
    "status_code": "PROCESSED PURCHASE ORDER"
  }'
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "success": [
      {
        "id": "po_123",
        "po_number": "PO-001",
        "status": {
          "status_code": "PROCESSED PURCHASE ORDER"
        },
        "packings": [
          {
            "id": "packing_123",
            "packing_number": "PKG-PO-001-001"
          }
        ],
        "invoices": [
          {
            "id": "invoice_123",
            "no_invoice": "INV-PO-001-001"
          }
        ]
      },
      {
        "id": "po_124",
        "po_number": "PO-002",
        "status": {
          "status_code": "PROCESSED PURCHASE ORDER"
        }
      }
    ],
    "failed": [
      {
        "id": "po_125",
        "error": "Purchase Order not found"
      }
    ]
  }
}
```

---

## Status Codes yang Didukung

### Purchase Order Status
- `PENDING_PURCHASE_ORDER` - Menunggu proses (default)
- `PROCESSING_PURCHASE_ORDER` - Sedang diproses
- `PROCESSED_PURCHASE_ORDER` - Sudah diproses
- `APPROVED_PURCHASE_ORDER` - Disetujui
- `FAILED_PURCHASE_ORDER` - Gagal

### Status Code Usage
- Gunakan `status_code` dalam request body/form data
- Jika tidak disediakan, akan menggunakan default `PENDING_PURCHASE_ORDER`
- Status code harus valid dan ada di database
- Case sensitive - gunakan format yang tepat

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Catatan Penting

### Process Purchase Order
- Endpoint ini menggunakan **array ID** dalam body untuk semua processing (single maupun bulk)
- **Single Processing**: Kirim array dengan 1 ID: `"ids": ["po_123"]`
- **Bulk Processing**: Kirim array dengan multiple ID: `"ids": ["po_123", "po_124", "po_125"]`
- Setiap purchase order akan diproses secara individual
- Jika ada error pada salah satu purchase order, yang lainnya tetap akan diproses
- Response akan menampilkan array `success` untuk yang berhasil dan array `failed` untuk yang gagal
- Setiap purchase order yang berhasil diproses akan otomatis membuat:
  - Packing dengan status `PENDING PACKING`
  - Invoice dengan status `PENDING INVOICE`
  - Surat Jalan dengan status `PENDING SURAT JALAN`

### File Upload
- Hanya untuk purchase order dengan `po_type: "BULK"`
- Mendukung multiple file upload
- File akan disimpan di folder `fileuploaded/{date}/`
- Format file yang didukung: PDF, Excel, Word

### Authentication
- Semua endpoint memerlukan Bearer token
- Token harus valid dan tidak expired
- User harus memiliki permission yang sesuai

---

## Testing Status Codes

### Collection Files untuk Testing
- `test-status-codes.bru` - Test create dengan berbagai status codes
- `search-by-status.bru` - Test search berdasarkan status code
- `update-status.bru` - Test update status purchase order

### Contoh Testing Status Codes

#### Create dengan Status Code Spesifik
```bash
curl --request POST \
  --url http://localhost:5050/api/v1/purchase-orders/ \
  --header 'authorization: Bearer YOUR_TOKEN' \
  --header 'content-type: multipart/form-data' \
  --form 'customerId=YOUR_CUSTOMER_ID' \
  --form po_number=PO-TEST-001 \
  --form po_type=SINGLE \
  --form status_code=PROCESSING_PURCHASE_ORDER
```

#### Search berdasarkan Status Code
```bash
curl --request GET \
  --url "http://localhost:5050/api/v1/purchase-orders/search?status_code=PENDING_PURCHASE_ORDER" \
  --header 'authorization: Bearer YOUR_TOKEN'
```

#### Update Status Code
```bash
curl --request PUT \
  --url http://localhost:5050/api/v1/purchase-orders/PO_ID \
  --header 'authorization: Bearer YOUR_TOKEN' \
  --header 'content-type: application/json' \
  --data '{
    "status_code": "APPROVED_PURCHASE_ORDER"
  }'
```