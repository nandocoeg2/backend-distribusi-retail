# Bulk Purchase Order Collection

Collection ini berisi endpoint-endpoint untuk mengelola bulk upload purchase order.

## Endpoints

### 1. Bulk Upload Purchase Order
- **Method**: POST
- **URL**: `/api/v1/purchase-orders/bulk`
- **Description**: Upload file Excel untuk bulk create purchase order
- **Authentication**: Bearer Token
- **Content-Type**: multipart/form-data

**Request Body:**
- `file`: File Excel (.xlsx) yang berisi data purchase order

**Response:**
```json
{
  "success": true,
  "message": "X files uploaded successfully and are pending processing.",
  "data": {
    "files": [
      {
        "id": "uuid",
        "filename": "original_filename.xlsx",
        "path": "file_path",
        "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "size": 12345,
        "statusId": "uuid",
        "userId": "uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. Get Bulk Upload Status
- **Method**: GET
- **URL**: `/api/v1/purchase-orders/bulk/status/:id`
- **Description**: Mendapatkan status dari bulk upload berdasarkan ID
- **Authentication**: Bearer Token

**Path Parameters:**
- `id`: ID dari bulk upload job

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "original_filename.xlsx",
    "path": "file_path",
    "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "size": 12345,
    "statusId": "uuid",
    "userId": "uuid",
    "status": {
      "id": "uuid",
      "status_code": "PENDING BULK FILE",
      "description": "File sedang menunggu proses"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get All Bulk Uploads
- **Method**: GET
- **URL**: `/api/v1/purchase-orders/bulk/all`
- **Description**: Mendapatkan semua file bulk upload dengan optional filter status
- **Authentication**: Bearer Token

**Query Parameters:**
- `status` (optional): Filter berdasarkan status
  - `PENDING BULK FILE`: File menunggu proses
  - `PROCESSING BULK FILE`: File sedang diproses
  - `PROCESSED BULK FILE`: File sudah selesai diproses
  - `FAILED BULK FILE`: File gagal diproses

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "original_filename.xlsx",
      "path": "file_path",
      "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "size": 12345,
      "statusId": "uuid",
      "userId": "uuid",
      "status": {
        "id": "uuid",
        "status_code": "PENDING BULK FILE",
        "description": "File sedang menunggu proses"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Environment Variables

Pastikan environment variables berikut sudah diset di Bruno:
- `baseUrl`: Base URL dari API (contoh: `http://localhost:3000`)
- `access_token`: Bearer token untuk authentication
- `bulk_upload_id`: ID dari bulk upload untuk testing get status

## Status Codes

- `PENDING BULK FILE`: File baru diupload, menunggu proses
- `PROCESSING BULK FILE`: File sedang diproses
- `PROCESSED BULK FILE`: File berhasil diproses
- `FAILED BULK FILE`: File gagal diproses

## Error Handling

Semua endpoint menggunakan standard error response format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Testing

Setiap endpoint sudah dilengkapi dengan test cases untuk:
- Status code validation
- Response structure validation
- Data type validation
- Required properties validation
