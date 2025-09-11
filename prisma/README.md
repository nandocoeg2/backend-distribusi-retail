# Prisma Database Management

Folder ini berisi semua file yang berkaitan dengan manajemen database menggunakan Prisma ORM.

## 📁 Struktur File

```
prisma/
├── schema.prisma              # Database schema definition
├── migrations/                # Database migration files
├── seed-roles.ts             # Seed data untuk roles
├── seed-menus.ts             # Seed data untuk menus
├── seed-role-menus.ts        # Assignment menus ke roles
├── seed-master-data.ts       # Seed data master (customers, suppliers, inventories)
├── seed-statuses.ts          # Seed data untuk status
├── seed-purchase-order.ts    # Seed data untuk purchase orders
└── README.md                 # Dokumentasi ini
```

## 🗄️ Database Schema

File `schema.prisma` berisi definisi lengkap struktur database termasuk:
- **Models**: User, Role, Menu, Customer, Supplier, Inventory, PurchaseOrder, dll.
- **Relations**: Relasi antar tabel dengan foreign keys
- **Enums**: Status codes, user types, dll.
- **Indexes**: Index untuk optimasi query

## 🌱 Seeding Data

Sistem seeding dibagi menjadi beberapa file terpisah untuk fleksibilitas dan modularitas:

### 1. Roles (`seed-roles.ts`)
Membuat 3 role dasar:
- **super admin**: Super Administrator dengan akses penuh
- **admin**: Administrator dengan akses terbatas
- **user**: Regular User dengan akses minimal

```bash
npm run seed:roles
```

### 2. Menus (`seed-menus.ts`)
Membuat struktur menu:
- **Master Data** (parent dengan url `#`)
  - Customers (`/master/customers`)
  - Suppliers (`/master/suppliers`) 
  - Inventories (`/master/inventories`)
- **Role Management** (`/role-management`)

```bash
npm run seed:menus
```

### 3. Role-Menu Assignment (`seed-role-menus.ts`)
Memberikan akses semua menu ke semua role yang ada.

```bash
npm run seed:role-menus
```

### 4. Master Data (`seed-master-data.ts`)
Membuat data master:
- **1 Customer**: Customer One
- **1 Supplier**: Supplier One
- **10 Inventory Items**: BRG-001 sampai BRG-010 dengan data lengkap

```bash
npm run seed:master-data
```

### 5. Statuses (`seed-statuses.ts`)
Membuat status codes untuk sistem:
- **Order Status**: PENDING, APPROVED, PROCESSED, FAILED, PROCESSING
- **Bulk File Status**: PENDING BULK FILE, PROCESSING BULK FILE, PROCESSED BULK FILE, FAILED BULK FILE

```bash
npm run seed:statuses
```

### 6. Purchase Orders (`seed-purchase-order.ts`)
Membuat sample purchase order (memerlukan master data terlebih dahulu).

```bash
npm run seed:purchase-order
```

## 🚀 Cara Menjalankan Seeding

### Seeding Lengkap (Urutan yang Disarankan)
```bash
# 1. Seed roles terlebih dahulu
npm run seed:roles

# 2. Seed master data
npm run seed:master-data

# 3. Seed menus
npm run seed:menus

# 4. Assign menus ke roles
npm run seed:role-menus

# 5. Seed statuses
npm run seed:statuses

# 6. Seed purchase orders (opsional)
npm run seed:purchase-order
```

### Seeding Individual
Anda dapat menjalankan seeding individual sesuai kebutuhan:

```bash
# Hanya roles
npm run seed:roles

# Hanya master data
npm run seed:master-data

# Hanya menus
npm run seed:menus

# Hanya assignment role-menu
npm run seed:role-menus

# Hanya statuses
npm run seed:statuses

# Hanya purchase orders
npm run seed:purchase-order
```

## 🔄 Migration Management

### Menjalankan Migration
```bash
# Generate migration baru
npx prisma migrate dev --name migration_name

# Reset database dan jalankan semua migration
npx prisma migrate reset

# Deploy migration ke production
npx prisma migrate deploy
```

### Generate Prisma Client
```bash
# Generate client setelah perubahan schema
npx prisma generate
```

## 📊 Data yang Disediakan

### Roles
- **super admin**: Akses penuh ke semua fitur
- **admin**: Akses terbatas untuk operasional
- **user**: Akses minimal untuk end user

### Menus
- **Master Data** (parent menu)
  - Customers management
  - Suppliers management  
  - Inventories management
- **Role Management**: Manajemen role dan permission

### Master Data
- **Customer**: 1 sample customer dengan data lengkap
- **Supplier**: 1 sample supplier dengan data lengkap
- **Inventory**: 10 sample items dengan berbagai kategori:
  - Laptop Dell Inspiron 15
  - Keyboard Logitech K380
  - Mouse Wireless Logitech M720
  - Monitor Samsung 24 inch
  - Printer Epson L3150
  - Harddisk External 1TB WD
  - Flashdisk 64GB SanDisk
  - Kabel HDMI 2m UGREEN
  - Webcam Logitech C920
  - Router TP-Link Archer C6

### Status Codes
- **PENDING**: Order menunggu persetujuan
- **APPROVED**: Order sudah disetujui
- **PROCESSED**: File berhasil diproses
- **FAILED**: File gagal diproses
- **PROCESSING**: File sedang diproses
- **PENDING BULK FILE**: Bulk file menunggu diproses
- **PROCESSING BULK FILE**: Bulk file sedang diproses
- **PROCESSED BULK FILE**: Bulk file berhasil diproses
- **FAILED BULK FILE**: Bulk file gagal diproses

## ⚠️ Catatan Penting

1. **Urutan Seeding**: Selalu jalankan `seed:roles` dan `seed:master-data` sebelum seeding lainnya
2. **Dependencies**: `seed:purchase-order` memerlukan master data (customers) terlebih dahulu
3. **Reset Data**: Seeding akan menghapus data yang sudah ada untuk menghindari duplikasi
4. **Environment**: Pastikan database connection sudah benar di `.env`

## 🛠️ Troubleshooting

### Error: "No roles found"
```bash
# Jalankan seed roles terlebih dahulu
npm run seed:roles
```

### Error: "No customer found"
```bash
# Jalankan seed master data terlebih dahulu
npm run seed:master-data
```

### Error: "No menus found"
```bash
# Jalankan seed menus terlebih dahulu
npm run seed:menus
```

### Database Connection Error
Pastikan `DATABASE_URL` di file `.env` sudah benar dan database server berjalan.

## 📝 Customization

Anda dapat memodifikasi file seeding sesuai kebutuhan:

1. **Tambah Data**: Edit file `.ts` yang sesuai untuk menambah data
2. **Ubah Struktur**: Modifikasi `schema.prisma` dan jalankan migration
3. **Custom Seeding**: Buat file seeding baru dan tambahkan script di `package.json`

## 🔗 Referensi

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
