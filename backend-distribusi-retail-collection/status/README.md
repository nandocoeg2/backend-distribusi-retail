# Status API Collection

This collection contains requests for retrieving different types of statuses used throughout the backend-distribusi-retail system.

The status system is used to track the lifecycle of various entities including Purchase Orders, Packing operations, Invoices, Surat Jalan (delivery notes), and Packing Items.

## Endpoints

1. **Get All Statuses** - GET `/statuses/`
   Retrieves all available statuses in the system.

2. **Get Purchase Order Statuses** - GET `/statuses/purchase_order`
   Retrieves statuses that contain "Purchase Order" in their name.

3. **Get Bulk File Statuses** - GET `/statuses/bulk_file`
   Retrieves statuses that contain "Bulk File" in their name.

4. **Get Packing Statuses** - GET `/statuses/packing`
   Retrieves statuses that contain "Packing" in their name.

5. **Get Packing Item Statuses** - GET `/statuses/packing_item`
   Retrieves statuses that contain "Item" in their name (e.g., "Pending Item", "Processing Item").

6. **Get Invoice Statuses** - GET `/statuses/invoice`
   Retrieves statuses that contain "Invoice" in their name.

7. **Get Surat Jalan Statuses** - GET `/statuses/surat_jalan`
   Retrieves statuses that contain "Surat Jalan" in their name.

## Status Categories

### Packing Item Statuses
- **PENDING ITEM**: Packing detail item is pending processing
- **PROCESSING ITEM**: Packing detail item is currently being processed
- **PROCESSED ITEM**: Packing detail item has been processed
- **FAILED ITEM**: Packing detail item processing has failed

### Purchase Order Statuses
- **PENDING PURCHASE ORDER**: Purchase order is pending approval
- **PROCESSING PURCHASE ORDER**: Purchase order is being processed
- **PROCESSED PURCHASE ORDER**: Purchase order has been processed
- **APPROVED PURCHASE ORDER**: Purchase order has been approved
- **FAILED PURCHASE ORDER**: Purchase order processing failed

### Packing Statuses
- **PENDING PACKING**: Packing is pending processing
- **PROCESSING PACKING**: Packing is currently being processed
- **COMPLETED PACKING**: Packing has been completed
- **FAILED PACKING**: Packing processing failed

### Surat Jalan Statuses
- **PENDING SURAT JALAN**: Surat jalan is pending processing
- **SENT SURAT JALAN**: Surat jalan has been sent
- **DELIVERED SURAT JALAN**: Surat jalan has been delivered
- **RETURNED SURAT JALAN**: Surat jalan has been returned

## Required Environment Variables

- `baseUrl` - The base URL of the API (e.g., http://localhost:5050/api/v1)
- `access_token` - JWT token for authentication

## Usage

1. First, authenticate using the auth endpoints to get an access token
2. Set the required environment variables
3. Use the appropriate endpoint based on what type of statuses you need
4. The filtered endpoints return only statuses that match the specific category
5. Use these statuses when creating or updating related entities (packing items, purchase orders, etc.)

## Integration with Entity Creation

- **Packing Items**: Automatically assigned "PENDING ITEM" status when created through purchase order processing
- **Surat Jalan**: Automatically assigned "PENDING SURAT JALAN" status when created through purchase order processing
- **Purchase Orders**: Should use "PENDING PURCHASE ORDER" status for new orders

## Notes

- All endpoints require authentication
- Status filtering is based on case-insensitive string matching in the status name
- The status system supports workflow tracking across all major business entities