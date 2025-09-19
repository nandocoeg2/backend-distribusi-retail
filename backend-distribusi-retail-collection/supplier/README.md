# Supplier API Documentation

API untuk mengelola data supplier/pemasok dalam sistem distribusi retail.

## Base URL
```
http://localhost:5050/api/v1/suppliers
```

## Authentication
Semua endpoint memerlukan Bearer Token authentication.

**Header:**
```
Authorization: Bearer {access_token}
Accept: application/json
```

---

## Endpoints

### 1. Get All Suppliers
Mengambil daftar semua supplier dengan pagination.

**Request:**
```http
GET /api/v1/suppliers/?page=1&limit=10
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |

**Response:**
```json
{
  "success": true,
  "message": "Suppliers retrieved successfully",
  "data": {
    "suppliers": [
      {
        "id": "supplier_id_1",
        "name": "EFG PT",
        "code": "2PZ1.J.0400.1.F",
        "address": "JAKARTA BARAT",
        "phoneNumber": "555-1234",
        "bank": {
          "name": "BCA",
          "account": "123456789",
          "holder": "EFG PT"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 2. Create Supplier
Membuat supplier baru.

**Request:**
```http
POST /api/v1/suppliers/
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "name": "EFG PT",
  "code": "2PZ1.J.0400.1.F",
  "address": "JAKARTA BARAT",
  "phoneNumber": "555-1234",
  "bank": {
    "name": "BCA",
    "account": "123456789",
    "holder": "EFG PT"
  }
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Nama supplier |
| code | string | Yes | Kode unik supplier |
| address | string | Yes | Alamat supplier |
| phoneNumber | string | No | Nomor telepon supplier |
| bank | object | No | Informasi bank supplier |
| bank.name | string | Yes (if bank provided) | Nama bank |
| bank.account | string | Yes (if bank provided) | Nomor rekening |
| bank.holder | string | Yes (if bank provided) | Nama pemegang rekening |

**Response:**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": "supplier_id_1",
    "name": "EFG PT",
    "code": "2PZ1.J.0400.1.F",
    "address": "JAKARTA BARAT",
    "phoneNumber": "555-1234",
    "bank": {
      "name": "BCA",
      "account": "123456789",
      "holder": "EFG PT"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Supplier by ID
Mengambil data supplier berdasarkan ID.

**Request:**
```http
GET /api/v1/suppliers/{supplier_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supplier_id | string | Yes | ID unik supplier |

**Response:**
```json
{
  "success": true,
  "message": "Supplier retrieved successfully",
  "data": {
    "id": "supplier_id_1",
    "name": "EFG PT",
    "code": "2PZ1.J.0400.1.F",
    "address": "JAKARTA BARAT",
    "phoneNumber": "555-1234",
    "bank": {
      "name": "BCA",
      "account": "123456789",
      "holder": "EFG PT"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update Supplier
Memperbarui data supplier.

**Request:**
```http
PUT /api/v1/suppliers/{supplier_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supplier_id | string | Yes | ID unik supplier |

**Body:**
```json
{
  "name": "Supplier A Updated",
  "address": "456 Supplier Avenue",
  "code": "2PZ1.J.0400.1.F-UPDATED",
  "bank": {
    "name": "BCA",
    "account": "987654321",
    "holder": "EFG PT Updated"
  }
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Nama supplier |
| code | string | No | Kode unik supplier |
| address | string | No | Alamat supplier |
| phoneNumber | string | No | Nomor telepon supplier |
| bank | object | No | Informasi bank supplier |
| bank.name | string | No | Nama bank |
| bank.account | string | No | Nomor rekening |
| bank.holder | string | No | Nama pemegang rekening |

**Response:**
```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": {
    "id": "supplier_id_1",
    "name": "Supplier A Updated",
    "code": "2PZ1.J.0400.1.F-UPDATED",
    "address": "456 Supplier Avenue",
    "phoneNumber": "555-1234",
    "bank": {
      "name": "BCA",
      "account": "987654321",
      "holder": "EFG PT Updated"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Delete Supplier
Menghapus supplier.

**Request:**
```http
DELETE /api/v1/suppliers/{supplier_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| supplier_id | string | Yes | ID unik supplier |

**Response:**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

---

### 6. Search Suppliers
Mencari supplier berdasarkan nama atau kode.

**Request:**
```http
GET /api/v1/suppliers/search/{query}?page=1&limit=10
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Kata kunci pencarian (nama atau kode supplier) |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |

**Response:**
```json
{
  "success": true,
  "message": "Suppliers search completed",
  "data": {
    "suppliers": [
      {
        "id": "supplier_id_1",
        "name": "EFG PT",
        "code": "2PZ1.J.0400.1.F",
        "address": "JAKARTA BARAT",
        "phoneNumber": "555-1234",
        "bank": {
          "name": "BCA",
          "account": "123456789",
          "holder": "EFG PT"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Supplier name is required"
    },
    {
      "field": "code",
      "message": "Supplier code is required"
    },
    {
      "field": "address",
      "message": "Supplier address is required"
    }
  ]
}
```

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
  "message": "Supplier not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Supplier code already exists"
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

## Notes

- Supplier tidak dapat dihapus jika masih memiliki purchase order aktif
- Kode supplier harus unik
- Informasi bank bersifat opsional
- Search akan mencari berdasarkan nama dan kode supplier
- Phone number harus dalam format yang valid
