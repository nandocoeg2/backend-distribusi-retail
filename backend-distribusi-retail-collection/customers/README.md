# Customer API Endpoints

This document provides a summary of the API endpoints for managing customers.

## Base URL

`{{base_url}}/api/customers`

## Authentication

All endpoints require a Bearer token in the Authorization header.

`Authorization: Bearer {{token}}`

---

## 1. Create Customer

Creates a new customer.

*   **Method:** `POST`
*   **URL:** `/`
*   **Bruno File:** `create.bru`

### Request Body

```json
{
  "namaCustomer": "string",
  "kodeCustomer": "string",
  "groupCustomerId": "string",
  "NPWP": "string" (optional),
  "alamatNPWP": "string" (optional),
  "regionId": "string",
  "alamatPengiriman": "string",
  "description": "string" (optional),
  "phoneNumber": "string",
  "email": "string" (optional)
}
```

### Response

**Success (201 Created)**

```json
{
    "id": "clx0f1q2w000508l9h2g4k6j8",
    "namaCustomer": "PT. Sejahtera Abadi",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "clwz4q1r4000108l9g7h3d5f2",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "clwz4q1r4000308l9h2g4k6j8",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "createdAt": "2025-09-17T17:50:00.000Z",
    "updatedAt": "2025-09-17T17:50:00.000Z",
    "createdBy": "system",
    "updatedBy": "system",
    "email": "contact@sejahteraabadi.com",
    "phoneNumber": "081234567890"
}
```

**Error (409 Conflict)**

If a customer with the same `kodeCustomer` already exists.

```json
{
    "statusCode": 409,
    "error": "Conflict",
    "message": "Customer with this code already exists"
}
```

---

## 2. Get All Customers

Retrieves a paginated list of all customers.

*   **Method:** `GET`
*   **URL:** `/?page=1&limit=10`
*   **Bruno File:** `getAll.bru`

### Query Parameters

*   `page` (optional, number, default: 1): The page number to retrieve.
*   `limit` (optional, number, default: 10): The number of items per page.

### Response

**Success (200 OK)**

```json
{
    "data": [
        {
            "id": "clx0f1q2w000508l9h2g4k6j8",
            "namaCustomer": "PT. Sejahtera Abadi",
            "kodeCustomer": "CUST-001",
            "groupCustomerId": "clwz4q1r4000108l9g7h3d5f2",
            "NPWP": "99.888.777.6-555.000",
            "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
            "regionId": "clwz4q1r4000308l9h2g4k6j8",
            "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
            "description": "Pelanggan VIP",
            "createdAt": "2025-09-17T17:50:00.000Z",
            "updatedAt": "2025-09-17T17:50:00.000Z",
            "createdBy": "system",
            "updatedBy": "system",
            "email": "contact@sejahteraabadi.com",
            "phoneNumber": "081234567890",
            "groupCustomer": {
                "id": "clwz4q1r4000108l9g7h3d5f2",
                "kode_group": "GRP-001",
                "nama_group": "Retail Jakarta"
            },
            "region": {
                "id": "clwz4q1r4000308l9h2g4k6j8",
                "kode_region": "JKT",
                "nama_region": "Jakarta"
            }
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalItems": 1,
        "itemsPerPage": 10
    }
}
```

---

## 3. Get Customer by ID

Retrieves a single customer by its ID.

*   **Method:** `GET`
*   **URL:** `/:id`
*   **Bruno File:** `getById.bru`

### URL Parameters

*   `id`: The unique identifier of the customer.

### Response

**Success (200 OK)**

```json
{
    "id": "clx0f1q2w000508l9h2g4k6j8",
    "namaCustomer": "PT. Sejahtera Abadi",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "clwz4q1r4000108l9g7h3d5f2",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "clwz4q1r4000308l9h2g4k6j8",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "createdAt": "2025-09-17T17:50:00.000Z",
    "updatedAt": "2025-09-17T17:50:00.000Z",
    "createdBy": "system",
    "updatedBy": "system",
    "email": "contact@sejahteraabadi.com",
    "phoneNumber": "081234567890",
    "purchaseOrders": [],
    "groupCustomer": {
        "id": "clwz4q1r4000108l9g7h3d5f2",
        "kode_group": "GRP-001",
        "nama_group": "Retail Jakarta",
        "alamat": "Jl. Grup No. 1, Jakarta",
        "npwp": "11.222.333.4-444.000",
        "createdAt": "2025-09-17T17:40:00.000Z",
        "updatedAt": "2025-09-17T17:40:00.000Z",
        "createdBy": "system",
        "updatedBy": "system"
    },
    "region": {
        "id": "clwz4q1r4000308l9h2g4k6j8",
        "kode_region": "JKT",
        "nama_region": "Jakarta",
        "createdAt": "2025-09-17T17:45:00.000Z",
        "updatedAt": "2025-09-17T17:45:00.000Z",
        "createdBy": "system",
        "updatedBy": "system"
    }
}
```

**Error (404 Not Found)**

If no customer is found with the given ID.

```json
{
    "statusCode": 404,
    "error": "Not Found",
    "message": "Customer not found"
}
```

---

## 4. Update Customer

Updates an existing customer's information.

*   **Method:** `PUT`
*   **URL:** `/:id`
*   **Bruno File:** `update.bru`

### URL Parameters

*   `id`: The unique identifier of the customer to update.

### Request Body

Any of the customer fields can be provided for update.

```json
{
  "namaCustomer": "PT. Sejahtera Abadi Jaya",
  "phoneNumber": "089876543210"
}
```

### Response

**Success (200 OK)**

Returns the updated customer object.

```json
{
    "id": "clx0f1q2w000508l9h2g4k6j8",
    "namaCustomer": "PT. Sejahtera Abadi Jaya",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "clwz4q1r4000108l9g7h3d5f2",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "clwz4q1r4000308l9h2g4k6j8",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "createdAt": "2025-09-17T17:50:00.000Z",
    "updatedAt": "2025-09-17T17:55:00.000Z",
    "createdBy": "system",
    "updatedBy": "system",
    "email": "contact@sejahteraabadi.com",
    "phoneNumber": "089876543210"
}
```

**Error (404 Not Found)**

If no customer is found with the given ID.

---

## 5. Delete Customer

Deletes a customer by its ID.

*   **Method:** `DELETE`
*   **URL:** `/:id`
*   **Bruno File:** `delete.bru`

### URL Parameters

*   `id`: The unique identifier of the customer to delete.

### Response

**Success (200 OK)**

Returns the deleted customer object.

```json
{
    "id": "clx0f1q2w000508l9h2g4k6j8",
    "namaCustomer": "PT. Sejahtera Abadi Jaya",
    "kodeCustomer": "CUST-001",
    "groupCustomerId": "clwz4q1r4000108l9g7h3d5f2",
    "NPWP": "99.888.777.6-555.000",
    "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
    "regionId": "clwz4q1r4000308l9h2g4k6j8",
    "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
    "description": "Pelanggan VIP",
    "createdAt": "2025-09-17T17:50:00.000Z",
    "updatedAt": "2025-09-17T17:55:00.000Z",
    "createdBy": "system",
    "updatedBy": "system",
    "email": "contact@sejahteraabadi.com",
    "phoneNumber": "089876543210"
}
```

**Error (404 Not Found)**

If no customer is found with the given ID.

---

## 6. Search Customers

Searches for customers based on a query string.

*   **Method:** `GET`
*   **URL:** `/search/:q` or `/search`
*   **Bruno File:** `search.bru`

### URL Parameters

*   `q` (optional, string): The search query. It searches in `namaCustomer`, `kodeCustomer`, `email`, `alamatPengiriman`, and `phoneNumber` fields.

### Query Parameters

*   `page` (optional, number, default: 1): The page number to retrieve.
*   `limit` (optional, number, default: 10): The number of items per page.

### Response

**Success (200 OK)**

Returns a paginated list of customers that match the search query.

```json
{
    "data": [
        {
            "id": "clx0f1q2w000508l9h2g4k6j8",
            "namaCustomer": "PT. Sejahtera Abadi",
            "kodeCustomer": "CUST-001",
            "groupCustomerId": "clwz4q1r4000108l9g7h3d5f2",
            "NPWP": "99.888.777.6-555.000",
            "alamatNPWP": "Jl. Pajak No. 1, Jakarta",
            "regionId": "clwz4q1r4000308l9h2g4k6j8",
            "alamatPengiriman": "Jl. Kirim No. 2, Jakarta",
            "description": "Pelanggan VIP",
            "createdAt": "2025-09-17T17:50:00.000Z",
            "updatedAt": "2025-09-17T17:50:00.000Z",
            "createdBy": "system",
            "updatedBy": "system",
            "email": "contact@sejahteraabadi.com",
            "phoneNumber": "081234567890",
            "groupCustomer": {
                "id": "clwz4q1r4000108l9g7h3d5f2",
                "kode_group": "GRP-001",
                "nama_group": "Retail Jakarta"
            },
            "region": {
                "id": "clwz4q1r4000308l9h2g4k6j8",
                "kode_region": "JKT",
                "nama_region": "Jakarta"
            }
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalItems": 1,
        "itemsPerPage": 10
    }
}
```

