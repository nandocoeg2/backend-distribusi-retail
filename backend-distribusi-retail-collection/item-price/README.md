# Item Price API Documentation

Dokumentasi lengkap untuk endpoint Item Price API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/item-prices
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Create Item Price
Membuat data harga item baru untuk customer tertentu.

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
  "inventoryId": "clx1otn7p000108l82e7ke2j9",
  "customerId": "clx1otn81000308l89p8y5a2k",
  "harga": 10000,
  "pot1": 10,
  "harga1": 9000,
  "pot2": 5,
  "harga2": 8550,
  "ppn": 11
}
```

**Validation Rules:**
- `inventoryId`: **Required** - ID inventory item
- `customerId`: **Required** - ID customer
- `harga`: **Required** - Harga dasar item
- `pot1`: Optional - Potongan pertama (persentase)
- `harga1`: Optional - Harga setelah potongan pertama
- `pot2`: Optional - Potongan kedua (persentase)
- `harga2`: Optional - Harga setelah potongan kedua
- `ppn`: Optional - Persentase PPN
- `createdBy`: Optional - User yang membuat (auto-generated)
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "item-price-uuid",
    "inventoryId": "clx1otn7p000108l82e7ke2j9",
    "customerId": "clx1otn81000308l89p8y5a2k",
    "harga": 10000,
    "pot1": 10,
    "harga1": 9000,
    "pot2": 5,
    "harga2": 8550,
    "ppn": 11,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "inventory": {
      "id": "clx1otn7p000108l82e7ke2j9",
      "plu": "PLU001",
      "nama_barang": "Product Name",
      "stok_c": 10,
      "stok_q": 50,
      "harga_barang": 10000,
      "min_stok": 5
    },
    "customer": {
      "id": "clx1otn81000308l89p8y5a2k",
      "namaCustomer": "Customer Name",
      "kodeCustomer": "CUST001"
    }
  }
}
```

**Response Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error: Inventory ID is required"
  }
}
```

---

### 2. Get All Item Prices
Mengambil daftar semua item price dengan pagination.

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
GET /api/v1/item-prices?page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "item-price-uuid",
        "inventoryId": "clx1otn7p000108l82e7ke2j9",
        "customerId": "clx1otn81000308l89p8y5a2k",
        "harga": 10000,
        "pot1": 10,
        "harga1": 9000,
        "pot2": 5,
        "harga2": 8550,
        "ppn": 11,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "inventory": {...},
        "customer": {...}
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

### 3. Get Item Price By ID
Mengambil data item price berdasarkan ID.

**Endpoint:** `GET /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID item price

**Example Request:**
```
GET /api/v1/item-prices/clx1p0d3j000108l8g2f3d9b4
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "item-price-uuid",
    "inventoryId": "clx1otn7p000108l82e7ke2j9",
    "customerId": "clx1otn81000308l89p8y5a2k",
    "harga": 10000,
    "pot1": 10,
    "harga1": 9000,
    "pot2": 5,
    "harga2": 8550,
    "ppn": 11,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "inventory": {...},
    "customer": {...}
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Item price not found"
  }
}
```

---

### 4. Update Item Price
Memperbarui data item price berdasarkan ID.

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
- `id` (required): ID item price

**Request Body:**
```json
{
  "harga": 11000,
  "pot1": 15,
  "harga1": 9350
}
```

**Validation Rules:**
Semua field bersifat optional, hanya field yang ingin diupdate yang perlu dikirim:
- `inventoryId`: Optional - ID inventory item
- `customerId`: Optional - ID customer
- `harga`: Optional - Harga dasar item
- `pot1`: Optional - Potongan pertama
- `harga1`: Optional - Harga setelah potongan pertama
- `pot2`: Optional - Potongan kedua
- `harga2`: Optional - Harga setelah potongan kedua
- `ppn`: Optional - Persentase PPN
- `updatedBy`: Optional - User yang mengupdate (auto-generated)

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "item-price-uuid",
    "inventoryId": "clx1otn7p000108l82e7ke2j9",
    "customerId": "clx1otn81000308l89p8y5a2k",
    "harga": 11000,
    "pot1": 15,
    "harga1": 9350,
    "pot2": 5,
    "harga2": 8550,
    "ppn": 11,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "inventory": {...},
    "customer": {...}
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Item price not found"
  }
}
```

---

### 5. Delete Item Price
Menghapus data item price berdasarkan ID.

**Endpoint:** `DELETE /:id`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID item price

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
    "message": "Item price not found"
  }
}
```

---

### 6. Search Item Prices
Mencari item price berdasarkan query dengan pagination.

**Endpoint:** `GET /search`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters:**
- `q` (optional): Query pencarian
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Example Request:**
```
GET /api/v1/item-prices/search?q=test&page=1&limit=10
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "item-price-uuid",
        "inventoryId": "clx1otn7p000108l82e7ke2j9",
        "customerId": "clx1otn81000308l89p8y5a2k",
        "harga": 10000,
        "pot1": 10,
        "harga1": 9000,
        "pot2": 5,
        "harga2": 8550,
        "ppn": 11,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "createdBy": "user-uuid",
        "updatedBy": "user-uuid",
        "inventory": {...},
        "customer": {...}
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

- Search akan mencari berdasarkan nama barang dan nama customer
- Search bersifat case-insensitive
- Mendukung partial matching (contains)

## Data Structure

### Item Price Object
```json
{
  "id": "string (UUID)",
  "inventoryId": "string (UUID)",
  "customerId": "string (UUID)",
  "harga": "number",
  "pot1": "number (optional)",
  "harga1": "number (optional)",
  "pot2": "number (optional)",
  "harga2": "number (optional)",
  "ppn": "number (optional)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "createdBy": "string (UUID)",
  "updatedBy": "string (UUID)",
  "inventory": "Inventory Object",
  "customer": "Customer Object"
}
```

## Pricing Structure

- `harga`: Harga dasar item
- `pot1`: Potongan pertama (persentase)
- `harga1`: Harga setelah potongan pertama
- `pot2`: Potongan kedua (persentase)
- `harga2`: Harga setelah potongan kedua (harga final)
- `ppn`: Persentase PPN yang akan dikenakan

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Field `createdBy` dan `updatedBy` akan otomatis diisi berdasarkan user yang sedang login
- Timestamp `createdAt` dan `updatedAt` akan otomatis diatur oleh sistem
- Untuk update, hanya field yang ingin diubah yang perlu dikirim dalam request body
- Item price digunakan untuk mengatur harga khusus per customer
- Sistem mendukung multiple level discount (pot1 dan pot2)
- Search mendukung pencarian berdasarkan nama barang dan nama customer
- Data include relasi dengan inventory dan customer
