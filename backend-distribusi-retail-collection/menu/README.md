# Menu API Documentation

Dokumentasi lengkap untuk endpoint Menu API pada sistem Backend Distribusi Retail.

## Base URL
```
http://localhost:5050/api/v1/menus
```

## Authentication
Semua endpoint memerlukan Bearer Token yang valid di header Authorization.

## Endpoints

### 1. Get All Menus
Mengambil daftar semua menu yang tersedia dalam sistem.

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
      "id": "menu-uuid",
      "name": "Dashboard",
      "path": "/dashboard",
      "icon": "dashboard",
      "parentId": null,
      "order": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": [
        {
          "id": "submenu-uuid",
          "name": "Overview",
          "path": "/dashboard/overview",
          "icon": "chart",
          "parentId": "menu-uuid",
          "order": 1,
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    {
      "id": "menu-uuid-2",
      "name": "Inventory",
      "path": "/inventory",
      "icon": "package",
      "parentId": null,
      "order": 2,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": [
        {
          "id": "submenu-uuid-2",
          "name": "Item Management",
          "path": "/inventory/items",
          "icon": "box",
          "parentId": "menu-uuid-2",
          "order": 1,
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        {
          "id": "submenu-uuid-3",
          "name": "Stock Management",
          "path": "/inventory/stock",
          "icon": "layers",
          "parentId": "menu-uuid-2",
          "order": 2,
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    {
      "id": "menu-uuid-3",
      "name": "Sales",
      "path": "/sales",
      "icon": "shopping-cart",
      "parentId": null,
      "order": 3,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": []
    },
    {
      "id": "menu-uuid-4",
      "name": "Purchase Orders",
      "path": "/purchase-orders",
      "icon": "file-text",
      "parentId": null,
      "order": 4,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": []
    },
    {
      "id": "menu-uuid-5",
      "name": "Reports",
      "path": "/reports",
      "icon": "bar-chart",
      "parentId": null,
      "order": 5,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": []
    },
    {
      "id": "menu-uuid-6",
      "name": "Settings",
      "path": "/settings",
      "icon": "settings",
      "parentId": null,
      "order": 6,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": [
        {
          "id": "submenu-uuid-4",
          "name": "User Management",
          "path": "/settings/users",
          "icon": "users",
          "parentId": "menu-uuid-6",
          "order": 1,
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        },
        {
          "id": "submenu-uuid-5",
          "name": "Role Management",
          "path": "/settings/roles",
          "icon": "shield",
          "parentId": "menu-uuid-6",
          "order": 2,
          "isActive": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

**Response Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized access"
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
- `401 Unauthorized`: Tidak terautentikasi atau token tidak valid
- `500 Internal Server Error`: Error server internal

## Data Structure

### Menu Object
```json
{
  "id": "string (UUID)",
  "name": "string",
  "path": "string",
  "icon": "string",
  "parentId": "string (UUID, nullable)",
  "order": "number",
  "isActive": "boolean",
  "createdAt": "DateTime (ISO 8601)",
  "updatedAt": "DateTime (ISO 8601)",
  "children": "Menu[] (nested menus)"
}
```

## Menu Hierarchy

Menu dalam sistem memiliki struktur hierarkis:
- **Parent Menu**: Menu utama yang dapat memiliki submenu
- **Child Menu**: Submenu yang berada di bawah parent menu
- **Order**: Urutan tampilan menu
- **Path**: URL path untuk navigasi
- **Icon**: Icon yang ditampilkan untuk menu

## Common Menu Items

Beberapa menu yang umum tersedia:
- **Dashboard**: Halaman utama dengan overview
- **Inventory**: Manajemen stok dan barang
- **Sales**: Manajemen penjualan
- **Purchase Orders**: Manajemen pesanan pembelian
- **Reports**: Laporan dan analisis
- **Settings**: Pengaturan sistem

## Notes

- Endpoint ini hanya untuk membaca data menu
- Semua endpoint memerlukan autentikasi Bearer Token
- Menu dikembalikan dalam struktur hierarkis dengan children
- Menu yang tidak aktif (`isActive: false`) tidak akan ditampilkan
- Urutan menu berdasarkan field `order`
- Menu digunakan untuk navigasi dan kontrol akses dalam aplikasi
- Parent menu dengan `parentId: null` adalah menu utama
- Child menu memiliki `parentId` yang merujuk ke parent menu
