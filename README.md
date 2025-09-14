# Backend Distribusi Retail

Backend untuk aplikasi distribusi retail yang komprehensif, dibangun dengan Fastify, Prisma, TypeScript, Redis, dan PostgreSQL. Sistem ini menyediakan manajemen lengkap untuk operasi distribusi retail termasuk pengelolaan inventory, purchase order, invoice, dan tracking pengiriman.

## 🚀 Fitur Utama

### Autentikasi & Otorisasi
- Registrasi dan login pengguna
- JWT-based session management dengan refresh token
- Role-based access control (RBAC)
- Manajemen menu berdasarkan role

### Manajemen Data Master
- **Pengguna**: CRUD operations untuk manajemen pengguna
- **Pelanggan**: Manajemen data pelanggan retail
- **Supplier**: Manajemen data pemasok
- **Inventory**: Tracking stok produk dan barang
- **Role & Menu**: Sistem hak akses berbasis role

### Operasi Bisnis
- **Purchase Order**: Pembuatan dan manajemen pesanan pembelian
  - Bulk upload purchase order
  - Processing dan tracking status
  - History perubahan
- **Packing**: Manajemen proses packing barang
- **Surat Jalan**: Sistem delivery note untuk pengiriman
- **Invoice**: Manajemen faktur dan billing
- **History Pengiriman**: Tracking riwayat pengiriman

### Fitur Tambahan
- **File Upload/Download**: Sistem manajemen file
- **Konversi Data**: Utilitas konversi format data
- **Notifikasi**: Sistem alert dan notifikasi
- **Status Management**: Centralized status tracking
- Caching dengan Redis untuk performa optimal
- Structured logging dengan Winston
- Request validation dengan Zod
- Rate limiting dan security headers
- Dockerized environment untuk deployment mudah
- Comprehensive testing dengan Jest

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

```
backend-distribusi-retail/
├── src/
│   ├── controllers/        # Business logic controllers
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic services
│   ├── schemas/           # Zod validation schemas
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── __tests__/        # Test files
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   ├── seed-roles.ts     # Seed roles data
│   ├── seed-menus.ts     # Seed menus data
│   ├── seed-role-menus.ts # Assign menus to roles
│   ├── seed-master-data.ts # Seed customers, suppliers, inventories
│   ├── seed-statuses.ts  # Seed status data
│   ├── seed-purchase-order.ts # Seed purchase orders
│   └── README.md         # Prisma documentation
├── backend-distribusi-retail-collection/
│   └── ...              # Bruno API collections
├── logs/                # Application logs
├── fileuploaded/        # Uploaded files directory
└── docker-compose.yml   # Docker services
```

## 📚 API Documentation

Dokumentasi API lengkap tersedia melalui Swagger UI di `http://localhost:5050/docs` ketika aplikasi berjalan.

## 🔧 Detail Penggunaan Service

### 🔐 Service Autentikasi & Otorisasi

#### Registrasi Pengguna (`POST /api/auth/register`)
**Requirements:**
- Body request harus berisi: `username`, `email`, `password`, `fullName`, `roleId`
- Email harus unik dan valid format
- Password minimal 8 karakter
- RoleId harus valid (ada di database)

**Kondisi:**
- ✅ Berhasil: User baru dibuat, return user data tanpa password
- ❌ Gagal: Email sudah terdaftar, role tidak valid, validasi gagal

**Contoh Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "roleId": 1
}
```

#### Login (`POST /api/auth/login`)
**Requirements:**
- Body request: `email` dan `password`
- Email harus terdaftar di sistem
- Password harus benar

**Kondisi:**
- ✅ Berhasil: Return access token dan refresh token
- ❌ Gagal: Email tidak ditemukan, password salah, akun tidak aktif

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### 👥 Service Manajemen Pengguna

#### Mendapatkan Semua Pengguna (`GET /api/users`)
**Requirements:**
- Header Authorization dengan Bearer token
- User harus memiliki role yang memiliki akses ke menu users

**Query Parameters:**
- `page` (optional): Halaman data (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Pencarian berdasarkan nama atau email

**Kondisi:**
- ✅ Berhasil: Return list pengguna dengan pagination
- ❌ Gagal: Token tidak valid, tidak ada akses, server error

#### Membuat Pengguna Baru (`POST /api/users`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_USER
- Body request: `username`, `email`, `password`, `fullName`, `roleId`

**Kondisi:**
- ✅ Berhasil: User baru dibuat, return user data
- ❌ Gagal: Email sudah ada, role tidak valid, permission denied

### 🏢 Service Manajemen Role & Menu

#### Mendapatkan Semua Role (`GET /api/roles`)
**Requirements:**
- Header Authorization dengan Bearer token
- User harus memiliki akses ke menu roles

**Kondisi:**
- ✅ Berhasil: Return list semua role dengan menu yang terkait
- ❌ Gagal: Token tidak valid, tidak ada akses

#### Update Menu untuk Role (`PUT /api/roles/:id/menus`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission MANAGE_ROLES
- Body request: array menu IDs

**Contoh Request:**
```json
{
  "menuIds": [1, 2, 3, 5, 8]
}
```

**Kondisi:**
- ✅ Berhasil: Menu role diupdate, return role dengan menu baru
- ❌ Gagal: Role tidak ditemukan, menu tidak valid, permission denied

### 🛒 Service Manajemen Pelanggan

#### Pencarian Pelanggan (`GET /api/customers/search`)
**Requirements:**
- Header Authorization dengan Bearer token
- Query parameter `q` untuk keyword pencarian

**Query Parameters:**
- `q` (required): Keyword pencarian
- `page` (optional): Halaman data
- `limit` (optional): Jumlah data per halaman

**Kondisi:**
- ✅ Berhasil: Return list pelanggan yang match dengan keyword
- ❌ Gagal: Token tidak valid, parameter tidak valid

#### Membuat Pelanggan Baru (`POST /api/customers`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_CUSTOMER
- Body request: `name`, `email`, `phone`, `address`, `city`, `postalCode`

**Kondisi:**
- ✅ Berhasil: Pelanggan baru dibuat, return data pelanggan
- ❌ Gagal: Email sudah ada, data tidak valid, permission denied

### 🚚 Service Manajemen Supplier

#### Pencarian Supplier (`GET /api/suppliers/search`)
**Requirements:**
- Header Authorization dengan Bearer token
- Query parameter `q` untuk keyword pencarian

**Kondisi:**
- ✅ Berhasil: Return list supplier yang match
- ❌ Gagal: Token tidak valid, parameter tidak valid

#### Membuat Supplier Baru (`POST /api/suppliers`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_SUPPLIER
- Body request: `name`, `email`, `phone`, `address`, `contactPerson`, `taxNumber`

**Kondisi:**
- ✅ Berhasil: Supplier baru dibuat
- ❌ Gagal: Email sudah ada, data tidak valid, permission denied

### 📦 Service Manajemen Inventory

#### Pencarian Inventory (`GET /api/inventories/search`)
**Requirements:**
- Header Authorization dengan Bearer token
- Query parameter `q` untuk keyword pencarian

**Kondisi:**
- ✅ Berhasil: Return list inventory yang match
- ❌ Gagal: Token tidak valid, parameter tidak valid

#### Membuat Inventory Baru (`POST /api/inventories`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_INVENTORY
- Body request: `name`, `description`, `sku`, `category`, `unitPrice`, `stockQuantity`, `minStockLevel`

**Kondisi:**
- ✅ Berhasil: Inventory baru dibuat
- ❌ Gagal: SKU sudah ada, data tidak valid, permission denied

### 📋 Service Purchase Order Management

#### Membuat Purchase Order (`POST /api/purchase-orders`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_PURCHASE_ORDER
- Body request: `supplierId`, `items` (array), `notes` (optional)

**Contoh Request:**
```json
{
  "supplierId": 1,
  "items": [
    {
      "inventoryId": 1,
      "quantity": 10,
      "unitPrice": 50000
    }
  ],
  "notes": "Pesanan urgent"
}
```

**Kondisi:**
- ✅ Berhasil: PO dibuat dengan status DRAFT
- ❌ Gagal: Supplier tidak ditemukan, inventory tidak valid, permission denied

#### Process Purchase Order (`POST /api/purchase-orders/:id/process`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission PROCESS_PURCHASE_ORDER
- PO harus dalam status DRAFT

**Kondisi:**
- ✅ Berhasil: Status PO berubah menjadi PROCESSING
- ❌ Gagal: PO tidak ditemukan, status tidak valid, permission denied

#### Bulk Upload Purchase Order (`POST /api/purchase-orders/bulk-create`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission BULK_CREATE_PURCHASE_ORDER
- File Excel dengan format yang sesuai

**Format Excel:**
- Kolom: Supplier Name, Item SKU, Quantity, Unit Price, Notes
- Header row harus ada
- Data mulai dari row 2

**Kondisi:**
- ✅ Berhasil: File diproses, return job ID untuk tracking
- ❌ Gagal: Format file salah, data tidak valid, permission denied

#### Status Bulk Upload (`GET /api/purchase-orders/bulk-status/:id`)
**Requirements:**
- Header Authorization dengan Bearer token
- Job ID harus valid

**Kondisi:**
- ✅ Berhasil: Return status processing (PENDING, PROCESSING, COMPLETED, FAILED)
- ❌ Gagal: Job ID tidak ditemukan, token tidak valid

### 📦 Service Manajemen Packing

#### Membuat Packing (`POST /api/packings`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_PACKING
- Body request: `purchaseOrderId`, `items` (array), `packedBy`, `notes`

**Contoh Request:**
```json
{
  "purchaseOrderId": 1,
  "items": [
    {
      "inventoryId": 1,
      "quantity": 10,
      "packedQuantity": 8
    }
  ],
  "packedBy": "John Doe",
  "notes": "Packing selesai"
}
```

**Kondisi:**
- ✅ Berhasil: Packing dibuat dengan status PACKED
- ❌ Gagal: PO tidak ditemukan, quantity tidak valid, permission denied

### 📄 Service Manajemen Surat Jalan

#### Membuat Surat Jalan (`POST /api/surat-jalan`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_SURAT_JALAN
- Body request: `packingId`, `customerId`, `deliveryAddress`, `driverName`, `vehicleNumber`

**Kondisi:**
- ✅ Berhasil: Surat jalan dibuat dengan status READY
- ❌ Gagal: Packing tidak ditemukan, customer tidak valid, permission denied

#### Pencarian Surat Jalan (`GET /api/surat-jalan/search`)
**Requirements:**
- Header Authorization dengan Bearer token
- Query parameter `q` untuk keyword pencarian

**Kondisi:**
- ✅ Berhasil: Return list surat jalan yang match
- ❌ Gagal: Token tidak valid, parameter tidak valid

### 🧾 Service Manajemen Invoice

#### Membuat Invoice (`POST /api/invoices`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission CREATE_INVOICE
- Body request: `suratJalanId`, `invoiceNumber`, `dueDate`, `taxRate`

**Kondisi:**
- ✅ Berhasil: Invoice dibuat dengan status PENDING
- ❌ Gagal: Surat jalan tidak ditemukan, data tidak valid, permission denied

### 📊 Service History Pengiriman

#### History Berdasarkan Status (`GET /api/history-pengiriman/status/:code`)
**Requirements:**
- Header Authorization dengan Bearer token
- Status code harus valid (READY, IN_TRANSIT, DELIVERED, RETURNED)

**Kondisi:**
- ✅ Berhasil: Return list history dengan status tersebut
- ❌ Gagal: Status code tidak valid, token tidak valid

#### History Berdasarkan Tanggal (`GET /api/history-pengiriman/date`)
**Requirements:**
- Header Authorization dengan Bearer token
- Query parameter `startDate` dan `endDate` (format: YYYY-MM-DD)

**Kondisi:**
- ✅ Berhasil: Return list history dalam rentang tanggal
- ❌ Gagal: Format tanggal salah, token tidak valid

### 📁 Service Manajemen File

#### Upload File (`POST /api/files/upload`)
**Requirements:**
- Header Authorization dengan Bearer token
- Content-Type: multipart/form-data
- File size maksimal 10MB
- Format file yang diizinkan: .pdf, .jpg, .jpeg, .png, .xlsx, .xls

**Kondisi:**
- ✅ Berhasil: File tersimpan, return file info
- ❌ Gagal: File terlalu besar, format tidak didukung, permission denied

#### Download File (`GET /api/files/download/:filename`)
**Requirements:**
- Header Authorization dengan Bearer token
- Filename harus valid dan file harus ada

**Kondisi:**
- ✅ Berhasil: File terdownload
- ❌ Gagal: File tidak ditemukan, token tidak valid

### 🔄 Service Konversi Data

#### Upload dan Konversi Data (`POST /api/conversions/upload`)
**Requirements:**
- Header Authorization dengan Bearer token
- File Excel dengan format yang sesuai
- Role harus memiliki permission DATA_CONVERSION

**Kondisi:**
- ✅ Berhasil: Data dikonversi, return hasil konversi
- ❌ Gagal: Format file salah, data tidak valid, permission denied

### 🔔 Service Sistem Notifikasi

#### Mendapatkan Notifikasi (`GET /api/notifications`)
**Requirements:**
- Header Authorization dengan Bearer token
- Query parameter `page` dan `limit` untuk pagination

**Kondisi:**
- ✅ Berhasil: Return list notifikasi dengan pagination
- ❌ Gagal: Token tidak valid

#### Notifikasi Belum Dibaca (`GET /api/notifications/unread`)
**Requirements:**
- Header Authorization dengan Bearer token

**Kondisi:**
- ✅ Berhasil: Return list notifikasi yang belum dibaca
- ❌ Gagal: Token tidak valid

#### Tandai Semua Dibaca (`POST /api/notifications/mark-all-read`)
**Requirements:**
- Header Authorization dengan Bearer token

**Kondisi:**
- ✅ Berhasil: Semua notifikasi ditandai sebagai dibaca
- ❌ Gagal: Token tidak valid

#### Periksa Alert Sistem (`POST /api/notifications/check-alerts`)
**Requirements:**
- Header Authorization dengan Bearer token
- Role harus memiliki permission SYSTEM_ALERTS

**Kondisi:**
- ✅ Berhasil: Alert diperiksa, notifikasi dibuat jika ada alert
- ❌ Gagal: Token tidak valid, permission denied

### 📊 Service Status Management

#### Mendapatkan Semua Status (`GET /api/statuses`)
**Requirements:**
- Header Authorization dengan Bearer token

**Kondisi:**
- ✅ Berhasil: Return list semua status yang tersedia
- ❌ Gagal: Token tidak valid

## 🚨 Error Handling

### Format Error Response
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
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

### 🔐 Autentikasi

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registrasi pengguna baru |
| `POST` | `/api/auth/login` | Login dan mendapatkan access token |
| `POST` | `/api/auth/logout` | Logout pengguna |

### 👥 Manajemen Pengguna

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Mendapatkan semua pengguna |
| `GET` | `/api/users/:id` | Mendapatkan pengguna berdasarkan ID |
| `POST` | `/api/users` | Membuat pengguna baru |
| `PUT` | `/api/users/:id` | Update data pengguna |
| `DELETE` | `/api/users/:id` | Menghapus pengguna |

### 🏢 Manajemen Role & Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/roles` | Mendapatkan semua role |
| `POST` | `/api/roles` | Membuat role baru |
| `PUT` | `/api/roles/:id` | Update role |
| `DELETE` | `/api/roles/:id` | Menghapus role |
| `PUT` | `/api/roles/:id/menus` | Update menu untuk role tertentu |
| `GET` | `/api/menus` | Mendapatkan semua menu |

### 🛒 Manajemen Pelanggan

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers` | Mendapatkan semua pelanggan |
| `GET` | `/api/customers/:id` | Mendapatkan pelanggan berdasarkan ID |
| `POST` | `/api/customers` | Membuat pelanggan baru |
| `PUT` | `/api/customers/:id` | Update data pelanggan |
| `DELETE` | `/api/customers/:id` | Menghapus pelanggan |
| `GET` | `/api/customers/search` | Pencarian pelanggan |

### 🚚 Manajemen Supplier

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/suppliers` | Mendapatkan semua supplier |
| `GET` | `/api/suppliers/:id` | Mendapatkan supplier berdasarkan ID |
| `POST` | `/api/suppliers` | Membuat supplier baru |
| `PUT` | `/api/suppliers/:id` | Update data supplier |
| `DELETE` | `/api/suppliers/:id` | Menghapus supplier |
| `GET` | `/api/suppliers/search` | Pencarian supplier |

### 📦 Manajemen Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventories` | Mendapatkan semua inventory |
| `GET` | `/api/inventories/:id` | Mendapatkan inventory berdasarkan ID |
| `POST` | `/api/inventories` | Membuat inventory baru |
| `PUT` | `/api/inventories/:id` | Update data inventory |
| `DELETE` | `/api/inventories/:id` | Menghapus inventory |
| `GET` | `/api/inventories/search` | Pencarian inventory |

### 📋 Purchase Order Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/purchase-orders` | Mendapatkan semua purchase order |
| `GET` | `/api/purchase-orders/:id` | Mendapatkan PO berdasarkan ID |
| `POST` | `/api/purchase-orders` | Membuat purchase order baru |
| `PUT` | `/api/purchase-orders/:id` | Update purchase order |
| `DELETE` | `/api/purchase-orders/:id` | Menghapus purchase order |
| `GET` | `/api/purchase-orders/search` | Pencarian purchase order |
| `GET` | `/api/purchase-orders/:id/history` | History perubahan PO |
| `POST` | `/api/purchase-orders/:id/process` | Process purchase order |

#### Bulk Purchase Order Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/purchase-orders/bulk-create` | Bulk upload purchase order |
| `GET` | `/api/purchase-orders/bulk-upload` | Mendapatkan semua bulk uploads |
| `GET` | `/api/purchase-orders/bulk-status/:id` | Status bulk upload |

### 📦 Manajemen Packing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/packings` | Mendapatkan semua packing |
| `GET` | `/api/packings/:id` | Mendapatkan packing berdasarkan ID |
| `POST` | `/api/packings` | Membuat packing baru |
| `PUT` | `/api/packings/:id` | Update data packing |
| `DELETE` | `/api/packings/:id` | Menghapus packing |
| `GET` | `/api/packings/search` | Pencarian packing |

### 📄 Manajemen Surat Jalan

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/surat-jalan` | Mendapatkan semua surat jalan |
| `GET` | `/api/surat-jalan/:id` | Mendapatkan surat jalan berdasarkan ID |
| `POST` | `/api/surat-jalan` | Membuat surat jalan baru |
| `PUT` | `/api/surat-jalan/:id` | Update data surat jalan |
| `DELETE` | `/api/surat-jalan/:id` | Menghapus surat jalan |
| `GET` | `/api/surat-jalan/search` | Pencarian surat jalan |

### 🧾 Manajemen Invoice

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/invoices` | Mendapatkan semua invoice |
| `GET` | `/api/invoices/:id` | Mendapatkan invoice berdasarkan ID |
| `POST` | `/api/invoices` | Membuat invoice baru |
| `PUT` | `/api/invoices/:id` | Update data invoice |
| `DELETE` | `/api/invoices/:id` | Menghapus invoice |
| `GET` | `/api/invoices/search` | Pencarian invoice |

### 📊 History Pengiriman

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history-pengiriman` | Mendapatkan semua history pengiriman |
| `GET` | `/api/history-pengiriman/status/:code` | History berdasarkan status code |
| `GET` | `/api/history-pengiriman/surat-jalan/:id` | History berdasarkan surat jalan ID |
| `GET` | `/api/history-pengiriman/date` | History berdasarkan tanggal kirim |

### 📁 Manajemen File

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/files/upload` | Upload file |
| `GET` | `/api/files/download/:filename` | Download file |

### 🔄 Konversi Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/conversions/upload` | Upload dan konversi data |

### 🔔 Sistem Notifikasi

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Mendapatkan semua notifikasi |
| `GET` | `/api/notifications/unread` | Mendapatkan notifikasi belum dibaca |
| `GET` | `/api/notifications/count` | Jumlah notifikasi |
| `POST` | `/api/notifications/mark-all-read` | Tandai semua sebagai dibaca |
| `POST` | `/api/notifications/:id/mark-read` | Tandai notifikasi tertentu sebagai dibaca |
| `POST` | `/api/notifications/check-alerts` | Periksa alert sistem |

### 📊 Status Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/statuses` | Mendapatkan semua status |
| `GET` | `/api/statuses/purchase_order` | Mendapatkan status untuk Purchase Order |
| `GET` | `/api/statuses/bulk_file` | Mendapatkan status untuk Bulk File |
| `GET` | `/api/statuses/packing` | Mendapatkan status untuk Packing |
| `GET` | `/api/statuses/packing_item` | Mendapatkan status untuk Packing Item |
| `GET` | `/api/statuses/invoice` | Mendapatkan status untuk Invoice |
| `GET` | `/api/statuses/surat_jalan` | Mendapatkan status untuk Surat Jalan |

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