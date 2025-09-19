# Notification API Documentation

Dokumentasi lengkap untuk endpoint Notification API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/notifications
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Get All Notifications
Mengambil daftar semua notifikasi.

**Endpoint:** `GET /`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "title": "Low Stock Alert",
      "message": "Product ABC is running low on stock",
      "type": "LOW_STOCK",
      "isRead": false,
      "inventoryId": "inventory-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "inventory": {
        "id": "inventory-uuid",
        "plu": "PLU001",
        "nama_barang": "Product ABC",
        "stok_c": 2,
        "stok_q": 10,
        "min_stok": 5
      }
    },
    {
      "id": "notification-uuid-2",
      "title": "System Update",
      "message": "System will be updated tonight at 2 AM",
      "type": "SYSTEM",
      "isRead": true,
      "inventoryId": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "inventory": null
    }
  ]
}
```

---

### 2. Get Unread Notifications
Mengambil daftar notifikasi yang belum dibaca.

**Endpoint:** `GET /unread`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "title": "Low Stock Alert",
      "message": "Product ABC is running low on stock",
      "type": "LOW_STOCK",
      "isRead": false,
      "inventoryId": "inventory-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "inventory": {
        "id": "inventory-uuid",
        "plu": "PLU001",
        "nama_barang": "Product ABC",
        "stok_c": 2,
        "stok_q": 10,
        "min_stok": 5
      }
    }
  ]
}
```

---

### 3. Get Notification Count
Mengambil jumlah notifikasi yang belum dibaca.

**Endpoint:** `GET /count`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5,
    "totalCount": 15
  }
}
```

---

### 4. Check All Inventory Alerts
Memeriksa semua alert inventory dan membuat notifikasi jika diperlukan.

**Endpoint:** `GET /alerts`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "checkedItems": 50,
    "alertsGenerated": 3,
    "alerts": [
      {
        "inventoryId": "inventory-uuid-1",
        "plu": "PLU001",
        "nama_barang": "Product A",
        "currentStock": 2,
        "minStock": 5,
        "alertType": "LOW_STOCK"
      },
      {
        "inventoryId": "inventory-uuid-2",
        "plu": "PLU002",
        "nama_barang": "Product B",
        "currentStock": 0,
        "minStock": 3,
        "alertType": "OUT_OF_STOCK"
      }
    ]
  }
}
```

---

### 5. Mark One Notification as Read
Menandai satu notifikasi sebagai sudah dibaca.

**Endpoint:** `PATCH /:id/read`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Path Parameters:**
- `id` (required): ID notifikasi

**Request Body:**
Tidak ada body yang diperlukan.

**Example Request:**
```
PATCH /api/v1/notifications/clvovamli000008l41j9g7w4s/read
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clvovamli000008l41j9g7w4s",
    "title": "Low Stock Alert",
    "message": "Product ABC is running low on stock",
    "type": "LOW_STOCK",
    "isRead": true,
    "inventoryId": "inventory-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "inventory": {...}
  }
}
```

**Response Error (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Notification not found"
  }
}
```

---

### 6. Mark All Notifications as Read
Menandai semua notifikasi sebagai sudah dibaca.

**Endpoint:** `PATCH /read-all`

**Headers:**
```json
{
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
Tidak ada body yang diperlukan.

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "updatedCount": 5,
    "message": "All notifications marked as read"
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
- `400 Bad Request`: Request tidak valid
- `401 Unauthorized`: Tidak terautentikasi atau token tidak valid
- `404 Not Found`: Resource tidak ditemukan
- `500 Internal Server Error`: Error server internal

## Notification Types

Sistem mendukung beberapa tipe notifikasi:

- `GENERAL`: Notifikasi umum
- `LOW_STOCK`: Alert stok rendah
- `OUT_OF_STOCK`: Alert stok habis
- `STOCK_ALERT`: Alert stok lainnya
- `PRICE_DIFFERENCE`: Alert perbedaan harga
- `SYSTEM`: Notifikasi sistem

## Data Structure

### Notification Object
```json
{
  "id": "string (UUID)",
  "title": "string",
  "message": "string",
  "type": "enum (GENERAL|LOW_STOCK|OUT_OF_STOCK|STOCK_ALERT|PRICE_DIFFERENCE|SYSTEM)",
  "isRead": "boolean",
  "inventoryId": "string (UUID, optional)",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "inventory": "Inventory Object (optional)"
}
```

### Inventory Object (Included)
```json
{
  "id": "string (UUID)",
  "plu": "string",
  "nama_barang": "string",
  "stok_c": "number",
  "stok_q": "number",
  "min_stok": "number"
}
```

## Alert System

### Low Stock Alert
- Dipicu ketika stok item di bawah `min_stok`
- Tipe notifikasi: `LOW_STOCK`

### Out of Stock Alert
- Dipicu ketika stok item mencapai 0
- Tipe notifikasi: `OUT_OF_STOCK`

### Price Difference Alert
- Dipicu ketika ada perbedaan harga yang signifikan
- Tipe notifikasi: `PRICE_DIFFERENCE`

### System Alert
- Notifikasi dari sistem (maintenance, update, dll)
- Tipe notifikasi: `SYSTEM`

## Notes

- Semua endpoint memerlukan autentikasi Bearer Token
- Notifikasi dapat dikaitkan dengan inventory item tertentu
- Sistem otomatis memeriksa alert inventory
- Notifikasi yang sudah dibaca tetap tersimpan untuk referensi
- Alert system berjalan otomatis berdasarkan kondisi stok
- Notifikasi dapat difilter berdasarkan tipe
- Count endpoint berguna untuk menampilkan badge notifikasi
