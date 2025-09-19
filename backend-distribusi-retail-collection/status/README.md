# Status API Documentation

API untuk mengelola data status dalam sistem distribusi retail. Status digunakan untuk melacak status berbagai entitas seperti purchase order, invoice, packing, surat jalan, dan bulk file.

## Base URL
```
{{baseUrl}}/statuses
```

## Authentication
Semua endpoint memerlukan Bearer Token authentication.

**Header:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

## Endpoints

### 1. Get All Statuses
Mengambil daftar semua status yang tersedia.

**Request:**
```http
GET {{baseUrl}}/statuses
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_1",
      "name": "Pending",
      "code": "PENDING",
      "description": "Status pending",
      "entity_type": "purchase_order",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_2",
      "name": "Approved",
      "code": "APPROVED",
      "description": "Status approved",
      "entity_type": "purchase_order",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Statuses by Purchase Order
Mengambil status yang terkait dengan purchase order.

**Request:**
```http
GET {{baseUrl}}/statuses/purchase_order
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_1",
      "name": "Draft",
      "code": "DRAFT",
      "description": "Purchase order in draft status",
      "entity_type": "purchase_order",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_2",
      "name": "Submitted",
      "code": "SUBMITTED",
      "description": "Purchase order submitted for approval",
      "entity_type": "purchase_order",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_3",
      "name": "Approved",
      "code": "APPROVED",
      "description": "Purchase order approved",
      "entity_type": "purchase_order",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Statuses by Bulk File
Mengambil status yang terkait dengan bulk file upload.

**Request:**
```http
GET {{baseUrl}}/statuses/bulk_file
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk file statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_4",
      "name": "Uploading",
      "code": "UPLOADING",
      "description": "Bulk file is being uploaded",
      "entity_type": "bulk_file",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_5",
      "name": "Processing",
      "code": "PROCESSING",
      "description": "Bulk file is being processed",
      "entity_type": "bulk_file",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_6",
      "name": "Completed",
      "code": "COMPLETED",
      "description": "Bulk file processing completed",
      "entity_type": "bulk_file",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Get Statuses by Packing
Mengambil status yang terkait dengan packing.

**Request:**
```http
GET {{baseUrl}}/statuses/packing
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Packing statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_7",
      "name": "Ready to Pack",
      "code": "READY_TO_PACK",
      "description": "Items ready for packing",
      "entity_type": "packing",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_8",
      "name": "Packed",
      "code": "PACKED",
      "description": "Items have been packed",
      "entity_type": "packing",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Statuses by Invoice
Mengambil status yang terkait dengan invoice.

**Request:**
```http
GET {{baseUrl}}/statuses/invoice
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_9",
      "name": "Draft",
      "code": "DRAFT",
      "description": "Invoice in draft status",
      "entity_type": "invoice",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_10",
      "name": "Sent",
      "code": "SENT",
      "description": "Invoice has been sent",
      "entity_type": "invoice",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_11",
      "name": "Paid",
      "code": "PAID",
      "description": "Invoice has been paid",
      "entity_type": "invoice",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Get Statuses by Surat Jalan
Mengambil status yang terkait dengan surat jalan.

**Request:**
```http
GET {{baseUrl}}/statuses/surat_jalan
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Surat jalan statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_12",
      "name": "Draft",
      "code": "DRAFT",
      "description": "Surat jalan in draft status",
      "entity_type": "surat_jalan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_13",
      "name": "Ready to Ship",
      "code": "READY_TO_SHIP",
      "description": "Surat jalan ready to ship",
      "entity_type": "surat_jalan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_14",
      "name": "Shipped",
      "code": "SHIPPED",
      "description": "Surat jalan has been shipped",
      "entity_type": "surat_jalan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_15",
      "name": "Delivered",
      "code": "DELIVERED",
      "description": "Surat jalan has been delivered",
      "entity_type": "surat_jalan",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 7. Get Statuses by Packing Item
Mengambil status yang terkait dengan packing item.

**Request:**
```http
GET {{baseUrl}}/statuses/packing_item
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Packing item statuses retrieved successfully",
  "data": [
    {
      "id": "status_id_16",
      "name": "Not Packed",
      "code": "NOT_PACKED",
      "description": "Item not yet packed",
      "entity_type": "packing_item",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_17",
      "name": "Packed",
      "code": "PACKED",
      "description": "Item has been packed",
      "entity_type": "packing_item",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "status_id_18",
      "name": "Shipped",
      "code": "SHIPPED",
      "description": "Item has been shipped",
      "entity_type": "packing_item",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Status entity type not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Entity Types

Status dapat dikategorikan berdasarkan entity type berikut:

- **purchase_order**: Status untuk purchase order
- **bulk_file**: Status untuk bulk file upload
- **packing**: Status untuk packing
- **invoice**: Status untuk invoice
- **surat_jalan**: Status untuk surat jalan
- **packing_item**: Status untuk item dalam packing

---

## Notes

- Status bersifat read-only dan dikelola oleh sistem
- Setiap entity type memiliki status yang spesifik
- Status dapat digunakan untuk melacak progress dan workflow
- Status code harus unik untuk setiap entity type