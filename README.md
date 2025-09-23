# Backend Distribusi Retail

Backend untuk aplikasi distribusi retail yang komprehensif, dibangun dengan Fastify, Prisma, TypeScript, Redis, dan PostgreSQL. Sistem ini menyediakan manajemen lengkap untuk operasi distribusi retail termasuk pengelolaan inventory, purchase order, invoice, dan tracking pengiriman.

## 🚀 Fitur

- **Autentikasi & Otorisasi**: Registrasi, login, JWT, RBAC, dan manajemen menu.
- **Manajemen Data Master**: Pengguna, pelanggan, supplier, inventory, role, dan menu.
- **Operasi Bisnis**: Purchase order (termasuk bulk upload), packing, surat jalan, invoice, dan history pengiriman.
- **Fitur Lanjutan**:
  - Upload/download file
  - Konversi data
  - Notifikasi dan alert sistem
  - Manajemen status terpusat
  - Caching dengan Redis untuk performa
  - Logging terstruktur dengan Winston
  - Validasi request dengan Zod
  - Rate limiting dan header keamanan
  - Lingkungan Docker untuk deployment
  - Pengujian komprehensif dengan Jest

## 🛠️ Teknologi Stack

- **Runtime**: Node.js v18+
- **Framework**: Fastify
- **Database**: PostgreSQL dengan Prisma ORM
- **Cache**: Redis
- **Language**: TypeScript
- **Testing**: Jest
- **Validation**: Zod
- **Logging**: Winston
- **Authentication**: JWT
- **Container**: Docker & Docker Compose

## 📋 Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 atau lebih tinggi)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## 🚀 Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/backend-distribusi-retail.git
cd backend-distribusi-retail
```

### 2. Environment Configuration
Buat file `.env` di root directory dengan konfigurasi berikut:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=5050
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 5. Seeding Data
Sistem ini menyediakan seeding data yang terpisah untuk fleksibilitas:

```bash
# Seed roles (super admin, admin, user)
npm run seed:roles

# Seed master data (customers, suppliers, inventories)
npm run seed:master-data

# Seed menus (Master Data, Role Management)
npm run seed:menus

# Assign all menus to all roles
npm run seed:role-menus

# Seed statuses (PENDING, APPROVED, PROCESSED, etc.)
npm run seed:statuses

# Seed purchase orders (requires master data first)
npm run seed:purchase-order
```

**Urutan seeding yang disarankan:**
```bash
npm run seed:roles
npm run seed:master-data
npm run seed:menus
npm run seed:role-menus
npm run seed:statuses
npm run seed:purchase-order
```

## ▶️ Menjalankan Aplikasi

### Dengan Docker (Recommended)
```bash
# Jalankan semua services
docker-compose up -d

# Lihat logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Secara Lokal
```bash
# Development mode dengan hot reload
npm run dev

# Production build
npm run build
npm start
```

### Testing
```bash
# Jalankan semua test
npm test

# Jalankan test dengan coverage
npm test -- --coverage
```

## 📁 Struktur Proyek

| Path | Deskripsi |
| --- | --- |
| `src/controllers/` | Kontroler untuk business logic |
| `src/routes/` | Definisi rute API |
| `src/services/` | Layanan untuk business logic |
| `src/schemas/` | Skema validasi Zod |
| `src/middleware/` | Middleware kustom |
| `src/config/` | File konfigurasi |
| `src/utils/` | Fungsi utilitas |
| `src/types/` | Definisi tipe TypeScript |
| `src/__tests__/` | File pengujian |
| `prisma/` | Skema, migrasi, dan data seed Prisma |
| `backend-distribusi-retail-collection/` | Koleksi API Bruno |
| `logs/` | Log aplikasi |
| `fileuploaded/` | Direktori file yang diunggah |
| `docker-compose.yml` | Layanan Docker |

## 📚 API Documentation

Dokumentasi API lengkap tersedia melalui Swagger UI di `http://localhost:5050/docs` ketika aplikasi berjalan.

> **Catatan format respons**
>
> * Semua endpoint sukses mengembalikan struktur `{"success": true, "data": ...}`.
> * Ketika terjadi kesalahan, respons akan mengikuti struktur `{"success": false, "error": { "message": "..." } }`.

### 🔐 Autentikasi & Otorisasi

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/auth/register` | `POST` | Registrasi pengguna baru | - | `{ "email": "john@example.com", "username": "john_doe", "firstName": "John", "lastName": "Doe", "password": "password123" }` | `{ "success": true, "data": { "id": "uuid", "email": "john@example.com", "username": "john_doe", "firstName": "John", "lastName": "Doe", "roleId": "..." } }` |
| `/api/auth/login` | `POST` | Login dan mendapatkan access token | - | `{ "email": "john@example.com", "password": "password123" }` | `{ "success": true, "data": { "user": { "id": "uuid", "email": "john@example.com", "username": "john_doe", "role": { "id": "...", "name": "admin" }, "menus": [{ "id": "...", "name": "Dashboard", "children": [] }] }, "accessToken": "<JWT>" } }` |
| `/api/auth/logout` | `POST` | Logout pengguna | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Logged out successfully" } }` |

### 👥 Manajemen Pengguna

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/users` | `GET` | Mendapatkan semua pengguna | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": "uuid", "email": "john@example.com", "username": "john_doe", ... }] }` |
| `/api/users/:id` | `GET` | Mendapatkan pengguna berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": "uuid", "email": "john@example.com", "username": "john_doe", ... } }` |

### 🏢 Manajemen Role & Menu

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/roles` | `GET` | Mendapatkan semua role | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": "1", "name": "admin", ... }] }` |
| `/api/roles` | `POST` | Membuat role baru | `Authorization: Bearer <token>` | `{ "name": "new_role" }` | `{ "success": true, "data": { "id": "2", "name": "new_role" } }` |
| `/api/roles/:roleId/menus` | `PUT` | Update menu untuk role tertentu | `Authorization: Bearer <token>` | `{ "menuIds": ["menu_dashboard", "menu_reports"] }` | `{ "success": true, "data": { "id": "1", "name": "admin", "menus": [{ "id": "menu_dashboard", "name": "Dashboard", ... }] } }` |
| `/api/roles/:roleId` | `DELETE` | Menghapus role | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Role deleted" } }` |
| `/api/menus` | `GET` | Mendapatkan semua menu | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": "menu_dashboard", "name": "Dashboard", ... }] }` |

### 🛒 Manajemen Pelanggan

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/customers` | `GET` | Mendapatkan semua pelanggan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Customer A", ... }] }` |
| `/api/customers/:id` | `GET` | Mendapatkan pelanggan berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "Customer A", ... } }` |
| `/api/customers` | `POST` | Membuat pelanggan baru | `Authorization: Bearer <token>` | `{ "name": "Customer B", ... }` | `{ "success": true, "data": { "id": 2, "name": "Customer B", ... } }` |
| `/api/customers/:id` | `PUT` | Update data pelanggan | `Authorization: Bearer <token>` | `{ "name": "Updated Customer A", ... }` | `{ "success": true, "data": { "id": 1, "name": "Updated Customer A", ... } }` |
| `/api/customers/:id` | `DELETE` | Menghapus pelanggan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Customer deleted" } }` |
| `/api/customers/search` | `GET` | Pencarian pelanggan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Customer A", ... }] }` |

### 🚚 Manajemen Supplier

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/suppliers` | `GET` | Mendapatkan semua supplier | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Supplier A", ... }] }` |
| `/api/suppliers/:id` | `GET` | Mendapatkan supplier berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "Supplier A", ... } }` |
| `/api/suppliers` | `POST` | Membuat supplier baru | `Authorization: Bearer <token>` | `{ "name": "Supplier B", ... }` | `{ "success": true, "data": { "id": 2, "name": "Supplier B", ... } }` |
| `/api/suppliers/:id` | `PUT` | Update data supplier | `Authorization: Bearer <token>` | `{ "name": "Updated Supplier A", ... }` | `{ "success": true, "data": { "id": 1, "name": "Updated Supplier A", ... } }` |
| `/api/suppliers/:id` | `DELETE` | Menghapus supplier | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Supplier deleted" } }` |
| `/api/suppliers/search` | `GET` | Pencarian supplier | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Supplier A", ... }] }` |

### 📦 Manajemen Inventory

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/inventories` | `GET` | Mendapatkan semua inventory | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Product A", ... }] }` |
| `/api/inventories/:id` | `GET` | Mendapatkan inventory berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "Product A", ... } }` |
| `/api/inventories` | `POST` | Membuat inventory baru | `Authorization: Bearer <token>` | `{ "name": "Product B", ... }` | `{ "success": true, "data": { "id": 2, "name": "Product B", ... } }` |
| `/api/inventories/:id` | `PUT` | Update data inventory | `Authorization: Bearer <token>` | `{ "name": "Updated Product A", ... }` | `{ "success": true, "data": { "id": 1, "name": "Updated Product A", ... } }` |
| `/api/inventories/:id` | `DELETE` | Menghapus inventory | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Inventory deleted" } }` |
| `/api/inventories/search` | `GET` | Pencarian inventory | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Product A", ... }] }` |

### 📋 Purchase Order Management

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/purchase-orders` | `GET` | Mendapatkan semua purchase order | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "poNumber": "PO-001", ... }] }` |
| `/api/purchase-orders/:id` | `GET` | Mendapatkan PO berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "poNumber": "PO-001", ... } }` |
| `/api/purchase-orders` | `POST` | Membuat purchase order baru | `Authorization: Bearer <token>` | `{ "supplierId": 1, "items": [...] }` | `{ "success": true, "data": { "id": 2, "poNumber": "PO-002", ... } }` |
| `/api/purchase-orders/:id` | `PUT` | Update purchase order | `Authorization: Bearer <token>` | `{ "notes": "Updated notes" }` | `{ "success": true, "data": { "id": 1, "notes": "Updated notes", ... } }` |
| `/api/purchase-orders/:id` | `DELETE` | Menghapus purchase order | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Purchase Order deleted" } }` |
| `/api/purchase-orders/search` | `GET` | Pencarian purchase order | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "poNumber": "PO-001", ... }] }` |
| `/api/purchase-orders/:id/history` | `GET` | History perubahan PO | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "change": "Status updated", ... }] }` |
| `/api/purchase-orders/:id/process` | `POST` | Process purchase order | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Purchase Order processed" } }` |
| `/api/purchase-orders/bulk` | `POST` | Bulk upload purchase order | `Authorization: Bearer <token>` | (multipart/form-data) | `{ "success": true, "data": { "jobId": "..." } }` |
| `/api/purchase-orders/bulk/status/:id`| `GET` | Status bulk upload | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "status": "COMPLETED" } }` |
| `/api/purchase-orders/bulk/all` | `GET` | Mendapatkan semua bulk uploads | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "fileName": "...", ... }] }` |

### 📦 Manajemen Packing

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/packings` | `GET` | Mendapatkan semua packing | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "packingNumber": "PACK-001", ... }] }` |
| `/api/packings/:id` | `GET` | Mendapatkan packing berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "packingNumber": "PACK-001", ... } }` |
| `/api/packings` | `POST` | Membuat packing baru | `Authorization: Bearer <token>` | `{ "purchaseOrderId": 1, "items": [...] }` | `{ "success": true, "data": { "id": 2, "packingNumber": "PACK-002", ... } }` |
| `/api/packings/:id` | `PUT` | Update data packing | `Authorization: Bearer <token>` | `{ "notes": "Updated notes" }` | `{ "success": true, "data": { "id": 1, "notes": "Updated notes", ... } }` |
| `/api/packings/:id` | `DELETE` | Menghapus packing | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Packing deleted" } }` |
| `/api/packings/search` | `GET` | Pencarian packing | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "packingNumber": "PACK-001", ... }] }` |

### 📄 Manajemen Surat Jalan

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/surat-jalan` | `GET` | Mendapatkan semua surat jalan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "suratJalanNumber": "SJ-001", ... }] }` |
| `/api/surat-jalan/:id` | `GET` | Mendapatkan surat jalan berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "suratJalanNumber": "SJ-001", ... } }` |
| `/api/surat-jalan` | `POST` | Membuat surat jalan baru | `Authorization: Bearer <token>` | `{ "packingId": 1, "customerId": 1, ... }` | `{ "success": true, "data": { "id": 2, "suratJalanNumber": "SJ-002", ... } }` |
| `/api/surat-jalan/:id` | `PUT` | Update data surat jalan | `Authorization: Bearer <token>` | `{ "driverName": "New Driver" }` | `{ "success": true, "data": { "id": 1, "driverName": "New Driver", ... } }` |
| `/api/surat-jalan/:id` | `DELETE` | Menghapus surat jalan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Surat Jalan deleted" } }` |
| `/api/surat-jalan/search` | `GET` | Pencarian surat jalan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "suratJalanNumber": "SJ-001", ... }] }` |

### 🧾 Manajemen Invoice Pengiriman

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/invoice-pengiriman` | `GET` | Mendapatkan semua invoice pengiriman | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "data": [{ "id": "uuid", "no_invoice": "INV-001", ... }], "pagination": {...} } }` |
| `/api/invoice-pengiriman/:id` | `GET` | Mendapatkan invoice pengiriman berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": "uuid", "no_invoice": "INV-001", ... } }` |
| `/api/invoice-pengiriman` | `POST` | Membuat invoice pengiriman baru | `Authorization: Bearer <token>` | `{ "no_invoice": "INV-001", ... }` | `{ "success": true, "data": { "id": "uuid", "no_invoice": "INV-001", ... } }` |
| `/api/invoice-pengiriman/:id` | `PUT` | Update data invoice pengiriman | `Authorization: Bearer <token>` | `{ "deliver_to": "..." }` | `{ "success": true, "data": { "id": "uuid", "deliver_to": "...", ... } }` |
| `/api/invoice-pengiriman/:id` | `DELETE` | Menghapus invoice pengiriman | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Deleted" } }` |
| `/api/invoice-pengiriman/search` | `GET` | Pencarian invoice pengiriman | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "data": [{ "id": "uuid", "no_invoice": "INV-001", ... }], "pagination": {...} } }` |

### 📊 History Pengiriman

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/history-pengiriman` | `GET` | Mendapatkan semua history pengiriman | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "status": "DELIVERED", ... }] }` |
| `/api/history-pengiriman/status/:statusCode` | `GET` | History berdasarkan status code | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "status": "DELIVERED", ... }] }` |
| `/api/history-pengiriman/surat-jalan/:suratJalanId` | `GET` | History berdasarkan surat jalan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "status": "DELIVERED", ... }] }` |
| `/api/history-pengiriman/tanggal/:tanggalKirim` | `GET` | History berdasarkan tanggal kirim | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "status": "DELIVERED", ... }] }` |

### 📁 Manajemen File

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/files/download/:id` | `GET` | Download file | `Authorization: Bearer <token>` | - | (file stream) |

### 🔄 Konversi Data

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/conversions/upload` | `POST` | Upload dan konversi data | `Authorization: Bearer <token>` | (multipart/form-data) | `{ "success": true, "data": { "message": "File converted" } }` |

### 🔔 Sistem Notifikasi

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/notifications` | `GET` | Mendapatkan semua notifikasi | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "message": "...", ... }] }` |
| `/api/notifications/unread` | `GET` | Mendapatkan notifikasi belum dibaca | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "message": "...", ... }] }` |
| `/api/notifications/count` | `GET` | Jumlah notifikasi | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "count": 5 } }` |
| `/api/notifications/read-all` | `PATCH` | Tandai semua sebagai dibaca | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "All marked as read" } }` |
| `/api/notifications/:id/read` | `PATCH` | Tandai notifikasi tertentu sebagai dibaca | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Marked as read" } }` |
| `/api/notifications/alerts` | `GET` | Periksa alert sistem | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "message": "...", ... }] }` |
| `/api/notifications/price-differences` | `GET` | Notifikasi perbedaan harga | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "message": "...", ... }] }` |
| `/api/notifications/type/:type` | `GET` | Mendapatkan notifikasi berdasarkan tipe | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "message": "...", ... }] }` |

### 📊 Status Management

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/statuses` | `GET` | Mendapatkan semua status | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |
| `/api/statuses/purchase_order` | `GET` | Mendapatkan status untuk Purchase Order | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |
| `/api/statuses/bulk_file` | `GET` | Mendapatkan status untuk Bulk File | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |
| `/api/statuses/packing` | `GET` | Mendapatkan status untuk Packing | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |
| `/api/statuses/packing_item`| `GET` | Mendapatkan status untuk Packing Item | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |
| `/api/statuses/invoice_pengiriman` | `GET` | Mendapatkan status untuk Invoice Pengiriman | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |
| `/api/statuses/surat_jalan`| `GET` | Mendapatkan status untuk Surat Jalan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "PENDING", ... }] }` |

### 🏢 Manajemen Perusahaan

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/companies` | `GET` | Mendapatkan semua perusahaan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Company A", ... }] }` |
| `/api/companies/:id` | `GET` | Mendapatkan perusahaan berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "Company A", ... } }` |
| `/api/companies` | `POST` | Membuat perusahaan baru | `Authorization: Bearer <token>` | `{ "name": "Company B", ... }` | `{ "success": true, "data": { "id": 2, "name": "Company B", ... } }` |
| `/api/companies/:id` | `PUT` | Update data perusahaan | `Authorization: Bearer <token>` | `{ "name": "Updated Company A", ... }` | `{ "success": true, "data": { "id": 1, "name": "Updated Company A", ... } }` |
| `/api/companies/:id` | `DELETE` | Menghapus perusahaan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Company deleted" } }` |
| `/api/companies/search` | `GET` | Pencarian perusahaan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Company A", ... }] }` |

### 👥 Manajemen Grup Pelanggan

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/group-customers` | `GET` | Mendapatkan semua grup pelanggan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Group A", ... }] }` |
| `/api/group-customers/:id` | `GET` | Mendapatkan grup pelanggan berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "Group A", ... } }` |
| `/api/group-customers` | `POST` | Membuat grup pelanggan baru | `Authorization: Bearer <token>` | `{ "name": "Group B", ... }` | `{ "success": true, "data": { "id": 2, "name": "Group B", ... } }` |
| `/api/group-customers/:id`| `PUT` | Update data grup pelanggan | `Authorization: Bearer <token>` | `{ "name": "Updated Group A", ... }` | `{ "success": true, "data": { "id": 1, "name": "Updated Group A", ... } }` |
| `/api/group-customers/:id`| `DELETE`| Menghapus grup pelanggan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Group Customer deleted" } }` |
| `/api/group-customers/search`| `GET` | Pencarian grup pelanggan | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Group A", ... }] }` |

### 💲 Manajemen Harga Barang

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/item-prices` | `GET` | Mendapatkan semua harga barang | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "price": 10000, ... }] }` |
| `/api/item-prices/:id` | `GET` | Mendapatkan harga barang berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "price": 10000, ... } }` |
| `/api/item-prices` | `POST` | Membuat harga barang baru | `Authorization: Bearer <token>` | `{ "itemId": 1, "price": 12000, ... }` | `{ "success": true, "data": { "id": 2, "price": 12000, ... } }` |
| `/api/item-prices/:id`| `PUT` | Update data harga barang | `Authorization: Bearer <token>` | `{ "price": 11000, ... }` | `{ "success": true, "data": { "id": 1, "price": 11000, ... } }` |
| `/api/item-prices/:id`| `DELETE`| Menghapus harga barang | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Item Price deleted" } }` |
| `/api/item-prices/search`| `GET` | Pencarian harga barang | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "price": 10000, ... }] }` |

### 🌍 Manajemen Wilayah

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/regions` | `GET` | Mendapatkan semua wilayah | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Region A", ... }] }` |
| `/api/regions/:id` | `GET` | Mendapatkan wilayah berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "Region A", ... } }` |
| `/api/regions` | `POST` | Membuat wilayah baru | `Authorization: Bearer <token>` | `{ "name": "Region B", ... }` | `{ "success": true, "data": { "id": 2, "name": "Region B", ... } }` |
| `/api/regions/:id`| `PUT` | Update data wilayah | `Authorization: Bearer <token>` | `{ "name": "Updated Region A", ... }` | `{ "success": true, "data": { "id": 1, "name": "Updated Region A", ... } }` |
| `/api/regions/:id`| `DELETE`| Menghapus wilayah | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Region deleted" } }` |
| `/api/regions/search`| `GET` | Pencarian wilayah | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "Region A", ... }] }` |

### 💳 Manajemen Termin Pembayaran

| Endpoint | Method | Deskripsi | Contoh Request Header | Contoh Request Body | Contoh Response |
| --- | --- | --- | --- | --- | --- |
| `/api/term-of-payments` | `GET` | Mendapatkan semua termin pembayaran | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "30 Days", ... }] }` |
| `/api/term-of-payments/:id` | `GET` | Mendapatkan termin pembayaran berdasarkan ID | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "id": 1, "name": "30 Days", ... } }` |
| `/api/term-of-payments` | `POST` | Membuat termin pembayaran baru | `Authorization: Bearer <token>` | `{ "name": "60 Days", ... }` | `{ "success": true, "data": { "id": 2, "name": "60 Days", ... } }` |
| `/api/term-of-payments/:id`| `PUT` | Update data termin pembayaran | `Authorization: Bearer <token>` | `{ "name": "90 Days", ... }` | `{ "success": true, "data": { "id": 1, "name": "90 Days", ... } }` |
| `/api/term-of-payments/:id`| `DELETE`| Menghapus termin pembayaran | `Authorization: Bearer <token>` | - | `{ "success": true, "data": { "message": "Term of Payment deleted" } }` |
| `/api/term-of-payments/search`| `GET` | Pencarian termin pembayaran | `Authorization: Bearer <token>` | - | `{ "success": true, "data": [{ "id": 1, "name": "30 Days", ... }] }` |

## 🚨 Error Handling

### Format Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Token tidak valid atau tidak ada
- `FORBIDDEN`: Tidak memiliki permission
- `VALIDATION_ERROR`: Data tidak valid
- `NOT_FOUND`: Resource tidak ditemukan
- `CONFLICT`: Data sudah ada (duplicate)
- `INTERNAL_ERROR`: Server error

## 🔒 Security Considerations

### Rate Limiting
- API calls dibatasi 100 requests per menit per IP
- Login attempts dibatasi 5 attempts per menit per IP

### Data Validation
- Semua input data divalidasi menggunakan Zod schema
- SQL injection protection melalui Prisma ORM
- XSS protection dengan sanitization

### Token Management
- Access token expired dalam 15 menit
- Refresh token expired dalam 7 hari
- Token di-blacklist saat logout

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Jalankan development server dengan hot reload |
| `npm run build` | Build aplikasi untuk production |
| `npm start` | Jalankan aplikasi production |
| `npm test` | Jalankan semua test |
| `npm run prisma:migrate` | Jalankan database migration |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:seed` | Seed database dengan data awal |
| `npm run seed:roles` | Seed roles data |
| `npm run seed:menus` | Seed menus data |
| `npm run seed:role-menus` | Assign menus to roles |
| `npm run seed:master-data` | Seed master data (customers, suppliers, inventories) |
| `npm run seed:statuses` | Seed status data |
| `npm run seed:purchase-order` | Seed purchase orders |

## 🌐 Default URLs

- **API Base URL**: `http://localhost:5050`
- **Swagger Documentation**: `http://localhost:5050/docs`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5050` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `15m` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |

## 🤝 Contributing

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

This project is licensed under the ISC License.
