# Term of Payment API Documentation

API untuk mengelola data term of payment (syarat pembayaran) dalam sistem distribusi retail.

## Base URL
```
http://localhost:5050/api/v1/term-of-payments
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

### 1. Get All Term of Payments
Mengambil daftar semua term of payment dengan pagination.

**Request:**
```http
GET /api/v1/term-of-payments/?page=1&limit=10
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
  "message": "Term of payments retrieved successfully",
  "data": {
    "termOfPayments": [
      {
        "id": "top_id_1",
        "kode_top": "TOP001",
        "batas_hari": 30,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "top_id_2",
        "kode_top": "TOP002",
        "batas_hari": 60,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

### 2. Create Term of Payment
Membuat term of payment baru.

**Request:**
```http
POST /api/v1/term-of-payments/
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "kode_top": "TOP001",
  "batas_hari": 30
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| kode_top | string | Yes | Kode unik term of payment |
| batas_hari | integer | Yes | Batas hari pembayaran (dalam hari) |

**Response:**
```json
{
  "success": true,
  "message": "Term of payment created successfully",
  "data": {
    "id": "top_id_1",
    "kode_top": "TOP001",
    "batas_hari": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Term of Payment by ID
Mengambil data term of payment berdasarkan ID.

**Request:**
```http
GET /api/v1/term-of-payments/{term_of_payment_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| term_of_payment_id | string | Yes | ID unik term of payment |

**Response:**
```json
{
  "success": true,
  "message": "Term of payment retrieved successfully",
  "data": {
    "id": "top_id_1",
    "kode_top": "TOP001",
    "batas_hari": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update Term of Payment
Memperbarui data term of payment.

**Request:**
```http
PUT /api/v1/term-of-payments/{term_of_payment_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| term_of_payment_id | string | Yes | ID unik term of payment |

**Body:**
```json
{
  "batas_hari": 45
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| batas_hari | integer | Yes | Batas hari pembayaran yang diperbarui (dalam hari) |

**Response:**
```json
{
  "success": true,
  "message": "Term of payment updated successfully",
  "data": {
    "id": "top_id_1",
    "kode_top": "TOP001",
    "batas_hari": 45,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Delete Term of Payment
Menghapus term of payment.

**Request:**
```http
DELETE /api/v1/term-of-payments/{term_of_payment_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| term_of_payment_id | string | Yes | ID unik term of payment |

**Response:**
```json
{
  "success": true,
  "message": "Term of payment deleted successfully"
}
```

---

### 6. Search Term of Payments
Mencari term of payment berdasarkan kode.

**Request:**
```http
GET /api/v1/term-of-payments/search/{query}?page=1&limit=10
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Kode term of payment yang dicari |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |

**Response:**
```json
{
  "success": true,
  "message": "Term of payments search completed",
  "data": {
    "termOfPayments": [
      {
        "id": "top_id_1",
        "kode_top": "TOP001",
        "batas_hari": 30,
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
      "field": "kode_top",
      "message": "Kode term of payment is required"
    },
    {
      "field": "batas_hari",
      "message": "Batas hari must be a positive number"
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
  "message": "Term of payment not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Kode term of payment already exists"
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

## Common Term of Payment Examples

Berikut adalah contoh-contoh term of payment yang umum digunakan:

| Kode | Batas Hari | Deskripsi |
|------|------------|-----------|
| TOP001 | 30 | Net 30 - Pembayaran dalam 30 hari |
| TOP002 | 60 | Net 60 - Pembayaran dalam 60 hari |
| TOP003 | 90 | Net 90 - Pembayaran dalam 90 hari |
| TOP004 | 15 | Net 15 - Pembayaran dalam 15 hari |
| TOP005 | 0 | Cash on Delivery (COD) |
| TOP006 | 7 | Net 7 - Pembayaran dalam 7 hari |

---

## Notes

- Kode term of payment harus unik
- Batas hari harus berupa angka positif
- Term of payment tidak dapat dihapus jika masih digunakan oleh invoice atau purchase order
- Search akan mencari berdasarkan kode term of payment
- Batas hari dihitung dari tanggal invoice dibuat
- Term of payment digunakan untuk menentukan jatuh tempo pembayaran
