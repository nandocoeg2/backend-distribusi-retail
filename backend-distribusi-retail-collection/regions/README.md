# Regions API Documentation

API untuk mengelola data region/wilayah dalam sistem distribusi retail.

## Base URL
```
http://localhost:5050/api/v1/regions
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

### 1. Get All Regions
Mengambil daftar semua region dengan pagination.

**Request:**
```http
GET /api/v1/regions/?page=1&limit=10
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
  "message": "Regions retrieved successfully",
  "data": {
    "regions": [
      {
        "id": "region_id_1",
        "kode_region": "REG001",
        "nama_region": "Region Name",
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

### 2. Create Region
Membuat region baru.

**Request:**
```http
POST /api/v1/regions/
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "kode_region": "REG001",
  "nama_region": "Region Name"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| kode_region | string | Yes | Kode unik region |
| nama_region | string | Yes | Nama region |

**Response:**
```json
{
  "success": true,
  "message": "Region created successfully",
  "data": {
    "id": "region_id_1",
    "kode_region": "REG001",
    "nama_region": "Region Name",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Region by ID
Mengambil data region berdasarkan ID.

**Request:**
```http
GET /api/v1/regions/{region_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| region_id | string | Yes | ID unik region |

**Response:**
```json
{
  "success": true,
  "message": "Region retrieved successfully",
  "data": {
    "id": "region_id_1",
    "kode_region": "REG001",
    "nama_region": "Region Name",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update Region
Memperbarui data region.

**Request:**
```http
PUT /api/v1/regions/{region_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| region_id | string | Yes | ID unik region |

**Body:**
```json
{
  "nama_region": "Updated Region Name"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nama_region | string | Yes | Nama region yang diperbarui |

**Response:**
```json
{
  "success": true,
  "message": "Region updated successfully",
  "data": {
    "id": "region_id_1",
    "kode_region": "REG001",
    "nama_region": "Updated Region Name",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Delete Region
Menghapus region.

**Request:**
```http
DELETE /api/v1/regions/{region_id}
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| region_id | string | Yes | ID unik region |

**Response:**
```json
{
  "success": true,
  "message": "Region deleted successfully"
}
```

---

### 6. Search Regions
Mencari region berdasarkan kode region.

**Request:**
```http
GET /api/v1/regions/search/{query}?page=1&limit=10
```

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Kode region yang dicari |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Nomor halaman |
| limit | integer | No | 10 | Jumlah data per halaman |

**Response:**
```json
{
  "success": true,
  "message": "Regions search completed",
  "data": {
    "regions": [
      {
        "id": "region_id_1",
        "kode_region": "REG001",
        "nama_region": "Region Name",
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
      "field": "kode_region",
      "message": "Kode region is required"
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
  "message": "Region not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
