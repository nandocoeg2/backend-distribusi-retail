# API Documentation - Customers

## Overview
Endpoint untuk mengelola data customers/pelanggan dalam sistem distribusi retail.

## Base URL
```
http://localhost:5050/api/v1/customers
```

## Authentication
Semua endpoint memerlukan Bearer Token authentication.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

## 1. Create Customer

### Endpoint
```
POST /api/v1/customers
```

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Request Body
```json
{
  "namaCustomer": "PT. Sejahtera Abadi",
  "kodeCustomer": "CUST-001",
  "groupCustomerId": "cmfmughol0000150k0uj8xy77",
  "NPWP": "99.888.777.6-555.000",
  "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
  "regionId": "cmfmuh9ew0005150khebb706u",
  "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
  "description": "Pelanggan VIP",
  "phoneNumber": "081234567890",
  "email": "contact@sejahteraabadi.com"
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| namaCustomer | string | Yes | Nama lengkap customer |
| kodeCustomer | string | Yes | Kode unik customer |
| groupCustomerId | string | Yes | ID dari group customer |
| NPWP | string | No | Nomor NPWP customer |
| alamatNPWP | string | No | Alamat sesuai NPWP |
| regionId | string | Yes | ID dari region/wilayah |
| alamatPengiriman | string | No | Alamat untuk pengiriman |
| description | string | No | Deskripsi tambahan |
| phoneNumber | string | No | Nomor telepon customer |
| email | string | No | Email customer |

### Response
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "cmfmuhffu0009150k3vk7la40",
    "namaCustomer": "PT. Sejahtera Abadi",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "cmfmughol0000150k0uj8xy77",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "cmfmuh9ew0005150khebb706u",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "phoneNumber": "081234567890",
    "email": "contact@sejahteraabadi.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "namaCustomer",
      "message": "Nama customer is required"
    }
  ]
}
```

---

## 2. Get All Customers

### Endpoint
```
GET /api/v1/customers
```

### Headers
```
Authorization: Bearer {access_token}
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Nomor halaman |
| limit | number | No | 10 | Jumlah data per halaman |

### Example Request
```
GET /api/v1/customers?page=1&limit=10
```

### Response
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [
      {
        "id": "cmfmuhffu0009150k3vk7la40",
        "namaCustomer": "PT. Sejahtera Abadi",
        "kodeCustomer": "CUST-001",
        "groupCustomerId": "cmfmughol0000150k0uj8xy77",
        "NPWP": "99.888.777.6-555.000",
        "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
        "regionId": "cmfmuh9ew0005150khebb706u",
        "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
        "description": "Pelanggan VIP",
        "phoneNumber": "081234567890",
        "email": "contact@sejahteraabadi.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Unauthorized access",
  "error": "Invalid token"
}
```

---

## 3. Get Customer by ID

### Endpoint
```
GET /api/v1/customers/{customerId}
```

### Headers
```
Authorization: Bearer {access_token}
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | ID unik customer |

### Example Request
```
GET /api/v1/customers/cmfmuhffu0009150k3vk7la40
```

### Response
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id": "cmfmuhffu0009150k3vk7la40",
    "namaCustomer": "PT. Sejahtera Abadi",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "cmfmughol0000150k0uj8xy77",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "cmfmuh9ew0005150khebb706u",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "phoneNumber": "081234567890",
    "email": "contact@sejahteraabadi.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Customer not found",
  "error": "Customer with ID cmfmuhffu0009150k3vk7la40 not found"
}
```

---

## 4. Update Customer

### Endpoint
```
PUT /api/v1/customers/{customerId}
```

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | ID unik customer |

### Request Body
```json
{
  "namaCustomer": "PT. Sejahtera Abadi Jaya",
  "phoneNumber": "089876543210"
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| namaCustomer | string | No | Nama lengkap customer |
| kodeCustomer | string | No | Kode unik customer |
| groupCustomerId | string | No | ID dari group customer |
| NPWP | string | No | Nomor NPWP customer |
| alamatNPWP | string | No | Alamat sesuai NPWP |
| regionId | string | No | ID dari region/wilayah |
| alamatPengiriman | string | No | Alamat untuk pengiriman |
| description | string | No | Deskripsi tambahan |
| phoneNumber | string | No | Nomor telepon customer |
| email | string | No | Email customer |

### Example Request
```
PUT /api/v1/customers/cmfmuhffu0009150k3vk7la40
```

### Response
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": "cmfmuhffu0009150k3vk7la40",
    "namaCustomer": "PT. Sejahtera Abadi Jaya",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "cmfmughol0000150k0uj8xy77",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "cmfmuh9ew0005150khebb706u",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "phoneNumber": "089876543210",
    "email": "contact@sejahteraabadi.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Customer not found",
  "error": "Customer with ID cmfmuhffu0009150k3vk7la40 not found"
}
```

---

## 5. Delete Customer

### Endpoint
```
DELETE /api/v1/customers/{customerId}
```

### Headers
```
Authorization: Bearer {access_token}
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | ID unik customer |

### Example Request
```
DELETE /api/v1/customers/cmfmuhffu0009150k3vk7la40
```

### Response
```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": {
    "id": "cmfmuhffu0009150k3vk7la40"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Customer not found",
  "error": "Customer with ID cmfmuhffu0009150k3vk7la40 not found"
}
```

---

## 6. Search Customers

### Endpoint
```
GET /api/v1/customers/search/{query}
```

### Headers
```
Authorization: Bearer {access_token}
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Kata kunci pencarian |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Nomor halaman |
| limit | number | No | 10 | Jumlah data per halaman |

### Example Request
```
GET /api/v1/customers/search/sejahtera?page=1&limit=10
```

### Response
```json
{
  "success": true,
  "message": "Customers search results",
  "data": {
    "customers": [
      {
        "id": "cmfmuhffu0009150k3vk7la40",
        "namaCustomer": "PT. Sejahtera Abadi",
        "kodeCustomer": "CUST-001",
        "groupCustomerId": "cmfmughol0000150k0uj8xy77",
        "NPWP": "99.888.777.6-555.000",
        "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
        "regionId": "cmfmuh9ew0005150khebb706u",
        "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
        "description": "Pelanggan VIP",
        "phoneNumber": "081234567890",
        "email": "contact@sejahteraabadi.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNext": false,
      "hasPrev": false
    },
    "searchQuery": "sejahtera"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Search query is required",
  "error": "Query parameter cannot be empty"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Bad request",
  "error": "Invalid request format"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access",
  "error": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden",
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "The requested resource was not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "An unexpected error occurred"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

---

## Notes

1. **Authentication**: Semua endpoint memerlukan Bearer Token yang valid
2. **Pagination**: Endpoint yang mengembalikan list data mendukung pagination dengan parameter `page` dan `limit`
3. **Search**: Endpoint search akan mencari berdasarkan nama customer, kode customer, dan email
4. **Validation**: Semua field yang required harus diisi saat create, sedangkan untuk update bersifat optional
5. **Soft Delete**: Delete operation kemungkinan menggunakan soft delete (tidak menghapus data secara permanen)

---

## Example Usage

### Create Customer
```bash
curl -X POST http://localhost:5050/api/v1/customers \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "namaCustomer": "PT. Sejahtera Abadi",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "cmfmughol0000150k0uj8xy77",
    "regionId": "cmfmuh9ew0005150khebb706u"
  }'
```

### Get All Customers
```bash
curl -X GET "http://localhost:5050/api/v1/customers?page=1&limit=10" \
  -H "Authorization: Bearer your_access_token"
```

### Search Customers
```bash
curl -X GET "http://localhost:5050/api/v1/customers/search/sejahtera?page=1&limit=10" \
  -H "Authorization: Bearer your_access_token"
```