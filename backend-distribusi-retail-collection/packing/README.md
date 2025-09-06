# Packing API Collection

This collection contains requests for managing packing operations in the backend-distribusi-retail system.

## Endpoints

1. **Create Packing** - POST `/packings/`
   Creates a new packing record for a purchase order with associated packing items.

2. **Get All Packings** - GET `/packings/`
   Retrieves a paginated list of all packings.

3. **Get Packing by ID** - GET `/packings/{{packingId}}`
   Retrieves a specific packing by its ID.

4. **Update Packing** - PUT `/packings/{{packingId}}`
   Updates an existing packing record and its associated items.

5. **Delete Packing** - DELETE `/packings/{{packingId}}`
   Deletes a packing record.

6. **Search Packings** - GET `/packings/search`
   Searches for packings based on specific criteria such as status, date, etc.

## Required Environment Variables

- `baseUrl` - The base URL of the API (e.g., http://localhost:5050/api/v1)
- `access_token` - JWT token for authentication
- `statusId` - ID of a status record
- `purchaseOrderId` - ID of a purchase order record
- `inventoryId` - ID of an inventory record
- `packingId` - ID of a packing record (for update, get by ID, and delete operations)

## Usage

1. First, authenticate using the auth endpoints to get an access token
2. Set the required environment variables
3. Execute the requests in the desired order
4. For operations that require a packingId (update, get by ID, delete), first create a packing and then use the returned ID
