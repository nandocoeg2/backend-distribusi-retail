# Surat Jalan API Documentation

API untuk mengelola data surat jalan dalam sistem distribusi retail. Surat jalan digunakan untuk melacak pengiriman barang dari gudang ke customer.

## Base URL

```
http://localhost:5050/api/v1/surat-jalan
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

### 1. Get All Surat Jalan

Mengambil daftar semua surat jalan dengan pagination.

**Request:**

```http
GET /api/v1/surat-jalan?page=1&limit=10
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
  "message": "Surat jalan retrieved successfully",
  "data": {
    "suratJalan": [
      {
        "id": "surat_jalan_id_1",
        "no_surat_jalan": "SJ-2024-001",
        "deliver_to": "Customer ABC",
        "PIC": "John Doe",
        "alamat_tujuan": "Jl. Example No. 123, Jakarta",
        "invoiceId": null,
        "status": "DRAFT",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "suratJalanDetails": [
          {
            "id": "detail_id_1",
            "no_box": "BOX-001",
            "total_quantity_in_box": 100,
            "isi_box": 10,
            "sisa": 0,
            "total_box": 10,
            "suratJalanDetailItems": [
              {
                "id": "item_id_1",
                "nama_barang": "Product A",
                "PLU": "PLU001",
                "quantity": 50,
                "satuan": "pcs",
                "total_box": 5,
                "keterangan": "Fragile"
              }
            ]
          }
        ]
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

### 2. Create Surat Jalan

Membuat surat jalan baru.

**Request:**

```http
POST /api/v1/surat-jalan
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "no_surat_jalan": "SJ-2024-001",
  "deliver_to": "Customer ABC",
  "PIC": "John Doe",
  "alamat_tujuan": "Jl. Example No. 123, Jakarta",
  "invoiceId": null,
  "checklistSuratJalan": {
    "tanggal": "2024-01-15T10:00:00.000Z",
    "checker": "Ahmad Wijaya",
    "driver": "Budi Santoso",
    "mobil": "B 1234 XYZ",
    "kota": "Jakarta"
  },
  "suratJalanDetails": [
    {
      "no_box": "BOX-001",
      "total_quantity_in_box": 100,
      "isi_box": 10,
      "sisa": 0,
      "total_box": 10,
      "items": [
        {
          "nama_barang": "Product A",
          "PLU": "PLU001",
          "quantity": 50,
          "satuan": "pcs",
          "total_box": 5,
          "keterangan": "Fragile"
        },
        {
          "nama_barang": "Product B",
          "PLU": "PLU002",
          "quantity": 50,
          "satuan": "pcs",
          "total_box": 5,
          "keterangan": "Handle with care"
        }
      ]
    }
  ]
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| no_surat_jalan | string | Yes | Nomor surat jalan |
| deliver_to | string | Yes | Nama penerima |
| PIC | string | Yes | Person in Charge |
| alamat_tujuan | string | Yes | Alamat tujuan pengiriman |
| invoiceId | string | No | ID invoice terkait (opsional) |
| checklistSuratJalan | object | No | Checklist data surat jalan |
| checklistSuratJalan.tanggal | string (ISO 8601) | Yes* | Tanggal checklist |
| checklistSuratJalan.checker | string | Yes* | Nama checker/pemeriksa |
| checklistSuratJalan.driver | string | Yes* | Nama driver |
| checklistSuratJalan.mobil | string | Yes* | Nomor kendaraan |
| checklistSuratJalan.kota | string | Yes* | Kota tujuan |
| suratJalanDetails | array | Yes | Detail barang dalam surat jalan |
| suratJalanDetails[].no_box | string | Yes | Nomor box |
| suratJalanDetails[].total_quantity_in_box | integer | Yes | Total quantity dalam box |
| suratJalanDetails[].isi_box | integer | Yes | Isi per box |
| suratJalanDetails[].sisa | integer | Yes | Sisa quantity |
| suratJalanDetails[].total_box | integer | Yes | Total box |
| suratJalanDetails[].items | array | Yes | Daftar item dalam box |
| suratJalanDetails[].items[].nama_barang | string | Yes | Nama barang |
| suratJalanDetails[].items[].PLU | string | Yes | Product Lookup Unit |
| suratJalanDetails[].items[].quantity | integer | Yes | Quantity barang |
| suratJalanDetails[].items[].satuan | string | Yes | Satuan barang |
| suratJalanDetails[].items[].total_box | integer | Yes | Total box untuk item |
| suratJalanDetails[].items[].keterangan | string | No | Keterangan tambahan |

\* Required if checklistSuratJalan object is provided

**Response:**

```json
{
  "success": true,
  "message": "Surat jalan created successfully",
  "data": {
    "id": "surat_jalan_id_1",
    "no_surat_jalan": "SJ-2024-001",
    "deliver_to": "Customer ABC",
    "PIC": "John Doe",
    "alamat_tujuan": "Jl. Example No. 123, Jakarta",
    "invoiceId": null,
    "status": "DRAFT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "checklistSuratJalan": {
      "id": "checklist_id_1",
      "suratJalanId": "surat_jalan_id_1",
      "tanggal": "2024-01-15T10:00:00.000Z",
      "checker": "Ahmad Wijaya",
      "driver": "Budi Santoso",
      "mobil": "B 1234 XYZ",
      "kota": "Jakarta",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "suratJalanDetails": [
      {
        "id": "detail_id_1",
        "no_box": "BOX-001",
        "total_quantity_in_box": 100,
        "isi_box": 10,
        "sisa": 0,
        "total_box": 10,
        "suratJalanDetailItems": [
          {
            "id": "item_id_1",
            "nama_barang": "Product A",
            "PLU": "PLU001",
            "quantity": 50,
            "satuan": "pcs",
            "total_box": 5,
            "keterangan": "Fragile"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Create Surat Jalan with Valid Invoice

Membuat surat jalan dengan invoice yang valid.

**Request:**

```http
POST /api/v1/surat-jalan
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "no_surat_jalan": "SJ-2024-002",
  "deliver_to": "Customer XYZ",
  "PIC": "Jane Smith",
  "alamat_tujuan": "Jl. Test No. 456, Bandung",
  "invoiceId": "cmfi41jra000512j7pt27ziog",
  "suratJalanDetails": [
    {
      "no_box": "BOX-002",
      "total_quantity_in_box": 200,
      "isi_box": 20,
      "sisa": 0,
      "total_box": 10,
      "items": [
        {
          "nama_barang": "Product C",
          "PLU": "PLU003",
          "quantity": 100,
          "satuan": "pcs",
          "total_box": 5,
          "keterangan": "Handle with care"
        },
        {
          "nama_barang": "Product D",
          "PLU": "PLU004",
          "quantity": 100,
          "satuan": "pcs",
          "total_box": 5,
          "keterangan": "Fragile"
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Surat jalan created successfully with valid invoice",
  "data": {
    "id": "surat_jalan_id_2",
    "no_surat_jalan": "SJ-2024-002",
    "deliver_to": "Customer XYZ",
    "PIC": "Jane Smith",
    "alamat_tujuan": "Jl. Test No. 456, Bandung",
    "invoiceId": "cmfi41jra000512j7pt27ziog",
    "status": "READY_TO_SHIP",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "suratJalanDetails": [
      {
        "id": "detail_id_2",
        "no_box": "BOX-002",
        "total_quantity_in_box": 200,
        "isi_box": 20,
        "sisa": 0,
        "total_box": 10,
        "suratJalanDetailItems": [
          {
            "id": "item_id_2",
            "nama_barang": "Product C",
            "PLU": "PLU003",
            "quantity": 100,
            "satuan": "pcs",
            "total_box": 5,
            "keterangan": "Handle with care"
          }
        ]
      }
    ]
  }
}
```

---

### 4. Get Surat Jalan by ID

Mengambil data surat jalan berdasarkan ID.

**Request:**

```http
GET /api/v1/surat-jalan/{surat_jalan_id}
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| surat_jalan_id | string | Yes | ID unik surat jalan |

**Response:**

```json
{
  "success": true,
  "message": "Surat jalan retrieved successfully",
  "data": {
    "id": "surat_jalan_id_1",
    "no_surat_jalan": "SJ-2024-001",
    "deliver_to": "Customer ABC",
    "PIC": "John Doe",
    "alamat_tujuan": "Jl. Example No. 123, Jakarta",
    "invoiceId": "invoice_id_1",
    "status": {
      "id": "status_id_1",
      "status_code": "DRAFT SURAT JALAN",
      "category": "Surat Jalan"
    },
    "invoice": {
      "id": "invoice_id_1",
      "no_invoice": "INV-2024-001",
      "purchaseOrder": {
        "id": "po_id_1",
        "no_purchase_order": "PO-2024-001",
        "customer": {
          "id": "customer_id_1",
          "nama_customer": "Customer ABC"
        },
        "supplier": {
          "id": "supplier_id_1",
          "nama_supplier": "Supplier XYZ"
        }
      }
    },
    "historyPengiriman": [
      {
        "id": "history_id_1",
        "surat_jalan_id": "surat_jalan_id_1",
        "status": {
          "id": "status_id_1",
          "status_code": "DRAFT SURAT JALAN",
          "category": "Surat Jalan"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "checklistSuratJalan": {
      "id": "checklist_id_1",
      "suratJalanId": "surat_jalan_id_1",
      "tanggal": "2024-01-15T10:00:00.000Z",
      "checker": "Ahmad Wijaya",
      "driver": "Budi Santoso",
      "mobil": "B 1234 XYZ",
      "kota": "Jakarta",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "suratJalanDetails": [
      {
        "id": "detail_id_1",
        "no_box": "BOX-001",
        "total_quantity_in_box": 100,
        "isi_box": 10,
        "sisa": 0,
        "total_box": 10,
        "suratJalanDetailItems": [
          {
            "id": "item_id_1",
            "nama_barang": "Product A",
            "PLU": "PLU001",
            "quantity": 50,
            "satuan": "pcs",
            "total_box": 5,
            "keterangan": "Fragile"
          }
        ]
      }
    ],
    "auditTrails": [
      {
        "id": "audit_id_1",
        "entityType": "SuratJalan",
        "entityId": "surat_jalan_id_1",
        "action": "CREATE",
        "performedBy": "user_id_1",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Update Surat Jalan

Memperbarui data surat jalan.

**Request:**

```http
PUT /api/v1/surat-jalan/{surat_jalan_id}
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| surat_jalan_id | string | Yes | ID unik surat jalan |

**Body:**

```json
{
  "no_surat_jalan": "SJ-2024-001-UPDATED",
  "deliver_to": "Customer ABC Updated",
  "PIC": "Jane Doe",
  "alamat_tujuan": "Jl. Updated No. 456, Jakarta",
  "checklistSuratJalan": {
    "tanggal": "2024-01-16T14:30:00.000Z",
    "checker": "Siti Nurhaliza",
    "driver": "Eko Prasetyo",
    "mobil": "B 5678 ABC",
    "kota": "Bandung"
  },
  "suratJalanDetails": [
    {
      "no_box": "BOX-001-UPDATED",
      "total_quantity_in_box": 150,
      "isi_box": 15,
      "sisa": 0,
      "total_box": 10,
      "items": [
        {
          "nama_barang": "Product A Updated",
          "PLU": "PLU001",
          "quantity": 75,
          "satuan": "pcs",
          "total_box": 5,
          "keterangan": "Updated description"
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Surat jalan updated successfully",
  "data": {
    "id": "surat_jalan_id_1",
    "no_surat_jalan": "SJ-2024-001-UPDATED",
    "deliver_to": "Customer ABC Updated",
    "PIC": "Jane Doe",
    "alamat_tujuan": "Jl. Updated No. 456, Jakarta",
    "invoiceId": null,
    "status": "DRAFT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "checklistSuratJalan": {
      "id": "checklist_id_1",
      "suratJalanId": "surat_jalan_id_1",
      "tanggal": "2024-01-16T14:30:00.000Z",
      "checker": "Siti Nurhaliza",
      "driver": "Eko Prasetyo",
      "mobil": "B 5678 ABC",
      "kota": "Bandung",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "suratJalanDetails": [
      {
        "id": "detail_id_1",
        "no_box": "BOX-001-UPDATED",
        "total_quantity_in_box": 150,
        "isi_box": 15,
        "sisa": 0,
        "total_box": 10,
        "suratJalanDetailItems": [
          {
            "id": "item_id_1",
            "nama_barang": "Product A Updated",
            "PLU": "PLU001",
            "quantity": 75,
            "satuan": "pcs",
            "total_box": 5,
            "keterangan": "Updated description"
          }
        ]
      }
    ]
  }
}
```

---

### 6. Delete Surat Jalan

Menghapus surat jalan.

**Request:**

```http
DELETE /api/v1/surat-jalan/{surat_jalan_id}
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| surat_jalan_id | string | Yes | ID unik surat jalan |

**Response:**

```json
{
  "success": true,
  "message": "Surat jalan deleted successfully"
}
```

---

### 7. Search Surat Jalan

Mencari surat jalan berdasarkan nomor surat jalan, nama penerima, atau kode status.

**Request:**

```http
GET /api/v1/surat-jalan/search?no_surat_jalan=SJ-2024&deliver_to=Customer&status_code=DRAFT&page=1&limit=10
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| no_surat_jalan | string | No | Nomor surat jalan yang dicari |
| deliver_to | string | No | Nama penerima yang dicari |
| status_code | string | No | Kode status surat jalan yang dicari (e.g., DRAFT, READY_TO_SHIP) |
| page | integer | No | Nomor halaman (default: 1) |
| limit | integer | No | Jumlah data per halaman (default: 10) |

**Response:**

```json
{
  "success": true,
  "message": "Surat jalan search completed",
  "data": {
    "suratJalan": [
      {
        "id": "surat_jalan_id_1",
        "no_surat_jalan": "SJ-2024-001",
        "deliver_to": "Customer ABC",
        "PIC": "John Doe",
        "alamat_tujuan": "Jl. Example No. 123, Jakarta",
        "invoiceId": null,
        "status": "DRAFT",
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

### 8. Process Surat Jalan

Memproses satu atau beberapa surat jalan sekaligus. Endpoint ini mengubah status setiap surat jalan dari `DRAFT SURAT JALAN` menjadi `READY TO SHIP SURAT JALAN` ketika semua validasi terpenuhi.

**Request:**

```http
POST /api/v1/surat-jalan/process
```

**Headers:**

```
Accept: application/json
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**

```json
{
  "ids": ["surat_jalan_id_1", "surat_jalan_id_2"]
}
```

**Validasi utama:**

- Seluruh ID harus valid dan ditemukan di database.
- Setiap surat jalan wajib memiliki status `DRAFT SURAT JALAN`.
- Setiap surat jalan wajib sudah memiliki `checklistSuratJalan`.
- Status akan diperbarui menjadi `READY TO SHIP SURAT JALAN` dan audit log akan tercatat untuk setiap perubahan.

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Surat jalan berhasil diproses",
    "processedCount": 2,
    "suratJalan": [
      {
        "id": "surat_jalan_id_1",
        "status": {
          "status_code": "READY TO SHIP SURAT JALAN"
        },
        "updatedBy": "user_id",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
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
      "field": "no_surat_jalan",
      "message": "Nomor surat jalan is required"
    },
    {
      "field": "deliver_to",
      "message": "Nama penerima is required"
    },
    {
      "field": "PIC",
      "message": "PIC is required"
    },
    {
      "field": "alamat_tujuan",
      "message": "Alamat tujuan is required"
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
  "message": "Surat jalan not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Nomor surat jalan already exists"
}
```

### 422 Unprocessable Entity

```json
{
  "success": false,
  "message": "Invalid invoice ID provided"
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

## Status Values

Surat jalan dapat memiliki status berikut:

- **DRAFT**: Surat jalan dalam status draft
- **READY_TO_SHIP**: Surat jalan siap untuk dikirim
- **SHIPPED**: Surat jalan telah dikirim
- **DELIVERED**: Surat jalan telah diterima
- **CANCELLED**: Surat jalan dibatalkan

---

## Notes

- Nomor surat jalan harus unik
- Invoice ID bersifat opsional, jika disediakan harus valid
- Surat jalan tidak dapat dihapus jika sudah dalam status SHIPPED atau DELIVERED
- Search dapat dilakukan berdasarkan nomor surat jalan dan/atau nama penerima
- Setiap surat jalan dapat memiliki multiple detail box dengan multiple items
- Response API mengembalikan item detail dalam properti `suratJalanDetailItems`; gunakan `items` pada payload request.
- **checklistSuratJalan** adalah field opsional yang dapat disertakan saat create/update:
  - Relasi one-to-one: 1 surat jalan = 1 checklist
  - Berisi informasi: tanggal checklist, nama checker, driver, mobil, dan kota tujuan
  - Jika tidak disertakan, surat jalan tetap dapat dibuat tanpa checklist
  - Saat update, jika checklist sudah ada akan di-update, jika belum ada akan dibuat baru
