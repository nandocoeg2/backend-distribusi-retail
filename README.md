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
│   └── seed.ts          # Database seeding
├── backend-distribusi-retail-collection/
│   └── ...              # Bruno API collections
├── logs/                # Application logs
├── fileuploaded/        # Uploaded files directory
└── docker-compose.yml   # Docker services
```

## 📚 API Documentation

Dokumentasi API lengkap tersedia melalui Swagger UI di `http://localhost:5050/docs` ketika aplikasi berjalan.

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