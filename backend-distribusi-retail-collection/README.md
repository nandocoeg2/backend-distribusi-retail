# Backend Distribusi Retail - Bruno API Collection

This Bruno API collection provides comprehensive testing and documentation for the Backend Distribusi Retail system. The collection is organized by functional modules and includes all necessary authentication and environment configurations.

## Collection Structure

### 🔐 Authentication (`auth/`)
- Login, register, and logout endpoints
- JWT token management

### 🏢 Customer Management (`customers/`)
- CRUD operations for customer management
- Customer search functionality

### 🚚 Supplier Management (`suppliers/`)
- CRUD operations for supplier management
- Supplier search functionality

### 📦 Inventory Management (`inventory/`)
- CRUD operations for inventory items
- Inventory search and tracking

### 📋 Purchase Order Management (`purchase-order/`)
- Purchase order lifecycle management
- Bulk upload operations
- Purchase order processing and status tracking

### 📦 Packing Operations (`packing/`)
- Packing creation and management
- Packing item tracking with status integration
- Search and filtering capabilities

### 📄 Surat Jalan (Delivery Notes) (`surat-jalan/`)
- Delivery note creation and management
- Status tracking for delivery lifecycle
- Batch processing from DRAFT SURAT JALAN to READY TO SHIP SURAT JALAN

### 🧾 Invoice Management (`invoice/`)
- Invoice creation and management
- Payment status tracking

### 📊 Status Management (`status/`)
- Comprehensive status retrieval endpoints
- Category-specific status filtering
- Support for packing items, purchase orders, invoices, and delivery notes

### 📈 History & Tracking (`history-pengiriman/`)
- Delivery history tracking
- Status change monitoring

### 🔔 Notifications (`notification/`)
- System notification management
- Alert handling

### 👥 User & Role Management (`user/`, `role/`, `menu/`)
- User account management
- Role-based access control
- Menu and permission management

### 📁 File Operations (`file/`)
- File upload and download
- Document management

### 🔄 Data Conversion (`conversion/`)
- Data import and conversion utilities

## Environment Configuration

The collection uses the following environment variables (configured in `environments/backend-distribusi-retail.bru`):

- `baseUrl`: API base URL (default: http://localhost:5050/api/v1)
- `access_token`: JWT authentication token
- `customerId`: Sample customer ID for testing
- `statusId`: Sample status ID for testing
- `purchaseOrderId`: Sample purchase order ID for testing
- `inventoryId`: Sample inventory ID for testing
- `packingId`: Sample packing ID for testing

## Key Features

### Status Integration
The collection includes comprehensive status management for:
- **Packing Items**: PENDING ITEM, PROCESSING ITEM, PROCESSED ITEM, FAILED ITEM
- **Purchase Orders**: PENDING PURCHASE ORDER, PROCESSING PURCHASE ORDER, etc.
- **Surat Jalan**: PENDING SURAT JALAN, SENT SURAT JALAN, DELIVERED SURAT JALAN
- **Invoices**: PENDING INVOICE, PAID INVOICE, OVERDUE INVOICE

### Workflow Support
The collection supports end-to-end testing of business workflows:
1. Create Purchase Order
2. Process Purchase Order (auto-creates Packing, Invoice, Surat Jalan)
3. Track status changes across all documents
4. Manage delivery and payment lifecycle

### Authentication Flow
All endpoints require proper JWT authentication:
1. Login to get access token
2. Use token in subsequent requests
3. Handle token refresh as needed

## Getting Started

1. **Import Collection**: Import this Bruno collection into your Bruno client
2. **Set Environment**: Configure the backend-distribusi-retail environment
3. **Authenticate**: Use the auth endpoints to get an access token
4. **Update Variables**: Set the access_token in your environment
5. **Test Endpoints**: Execute requests in logical order

## Recent Updates

- ✅ Added Packing Item status relationship support
- ✅ Enhanced purchase order processing with automatic document creation
- ✅ Integrated status tracking across all business entities
- ✅ Added comprehensive status filtering endpoints
- ✅ Added Surat Jalan processing endpoint for draft-to-ready workflow

## Usage Notes

- Always authenticate before using other endpoints
- Many entities are created automatically through purchase order processing
- Status values are automatically assigned during document creation
- Use search endpoints for complex filtering requirements
- Check individual folder README files for detailed endpoint documentation