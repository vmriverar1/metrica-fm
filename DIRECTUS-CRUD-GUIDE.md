# Directus CRUD Operations - Complete Guide

## Overview
This guide demonstrates the complete implementation of CRUD (Create, Read, Update, Delete) operations with Directus CMS integrated into a Next.js application. All operations have been tested and verified to work correctly.

## Prerequisites

### 1. Directus Setup
- **URL**: http://localhost:8055
- **Admin Credentials**: admin@metrica-dip.com / MetricaDIP2024!
- **Database**: SQLite (already configured)

### 2. Start Directus
```bash
cd directus-local/
npm start
```

## Step 1: Authentication

Always authenticate first to get an access token:

```javascript
const authResponse = await axios.post('http://localhost:8055/auth/login', {
  email: 'admin@metrica-dip.com',
  password: 'MetricaDIP2024!'
});

const token = authResponse.data.data.access_token;
```

## Step 2: Create Collection with Fields

Create a complete collection with all fields in a single request:

```javascript
const collectionPayload = {
  collection: 'test_products',
  fields: [
    {
      field: 'id',
      type: 'integer',
      meta: {
        interface: 'input',
        readonly: true,
        hidden: true,
        special: ['auto-increment']
      },
      schema: {
        is_primary_key: true,
        has_auto_increment: true,
        is_nullable: false
      }
    },
    {
      field: 'name',
      type: 'string',
      meta: { interface: 'input', required: true },
      schema: { is_nullable: false, max_length: 255 }
    },
    {
      field: 'description',
      type: 'text',
      meta: { interface: 'input-multiline' },
      schema: { is_nullable: true }
    },
    {
      field: 'price',
      type: 'decimal',
      meta: { interface: 'input' },
      schema: { numeric_precision: 10, numeric_scale: 2 }
    },
    {
      field: 'category',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Electronics', value: 'electronics' },
            { text: 'Clothing', value: 'clothing' },
            { text: 'Books', value: 'books' },
            { text: 'Home', value: 'home' },
            { text: 'Sports', value: 'sports' }
          ]
        }
      }
    },
    {
      field: 'is_active',
      type: 'boolean',
      meta: { interface: 'boolean' },
      schema: { default_value: true }
    }
  ],
  meta: {
    collection: 'test_products',
    icon: 'shopping_cart',
    note: 'Test collection for CRUD operations',
    accountability: 'all'
  }
};

await api.post('/collections', collectionPayload);
```

## Step 3: CRUD Operations

### CREATE - Add New Record
```javascript
const newProduct = {
  name: 'Test Smartphone',
  description: 'Latest model with advanced features',
  price: 899.99,
  category: 'electronics',
  is_active: true
};

const response = await api.post('/items/test_products', newProduct);
```

### READ - Fetch Records
```javascript
// Get all products
const response = await api.get('/items/test_products');
const products = response.data.data;

// Get single product
const product = await api.get('/items/test_products/1');
```

### UPDATE - Modify Record
```javascript
const updateData = {
  price: 799.99,
  description: 'Updated description'
};

await api.patch('/items/test_products/1', updateData);
```

### DELETE - Remove Record
```javascript
await api.delete('/items/test_products/1');
```

## Step 4: Next.js Integration

### Complete CRUD Component
Location: `/src/app/test-crud/page.tsx`

Key features:
- Real-time form for creating/updating products
- Product list with edit/delete actions
- Visual feedback for all operations
- Error handling and loading states

### Component Structure
```typescript
interface TestProduct {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  is_active?: boolean;
}

// Main operations
const fetchProducts = async () => { /* READ */ };
const createProduct = async (data) => { /* CREATE */ };
const updateProduct = async (id, data) => { /* UPDATE */ };
const deleteProduct = async (id) => { /* DELETE */ };
```

## Step 5: Testing

Run the automated test to verify all operations:

```bash
node test-crud-operations.js
```

Expected output:
```
✅ CREATE: Product created successfully
✅ READ: Products fetched successfully
✅ UPDATE: Product updated successfully
✅ DELETE: Product deleted successfully
```

## Access Points

### Directus Admin Panel
- URL: http://localhost:8055/admin
- Navigate to: Content → Test Products
- Full GUI for managing records

### API Endpoints
- Base URL: http://localhost:8055
- Products: `/items/test_products`
- Authentication: `/auth/login`

### Next.js Interface
- URL: http://localhost:9002/test-crud
- Interactive UI for all CRUD operations
- Real-time updates and feedback

## Key Success Factors

1. **Authentication First**: Always get a fresh token before operations
2. **Complete Collection Creation**: Include all fields when creating the collection
3. **Proper Field Types**: Match field types with their intended use
4. **Error Handling**: Check response status and handle errors gracefully
5. **Admin Access**: Ensure the admin role has `admin_access: true`

## Common Field Types

- `integer`: Whole numbers (IDs, counts)
- `string`: Short text (names, categories)
- `text`: Long text (descriptions)
- `decimal`: Numbers with decimals (prices)
- `boolean`: True/false values (active status)
- `timestamp`: Date and time values
- `json`: Complex data structures

## Interface Options

- `input`: Basic text input
- `input-multiline`: Textarea for longer text
- `select-dropdown`: Dropdown with predefined options
- `boolean`: Checkbox or toggle
- `datetime`: Date and time picker

## Troubleshooting

### Permission Errors
If you get "You don't have permission to access this":
1. Ensure admin role has `admin_access: true`
2. Get a fresh authentication token
3. Check collection permissions in admin panel

### Field Creation Failures
If fields fail to create:
1. Include fields in the initial collection creation
2. Ensure proper field schema configuration
3. Check for conflicting field names

### Data Not Showing
If data doesn't appear:
1. Verify the collection exists in Directus
2. Check authentication token validity
3. Ensure proper API endpoint usage

## Complete Working Example

All code is available in these files:
- `/recreate-test-products.js` - Collection setup
- `/test-crud-operations.js` - CRUD testing
- `/src/app/test-crud/page.tsx` - Next.js interface

## Summary

This implementation provides:
- ✅ Full CRUD functionality
- ✅ Directus CMS integration
- ✅ Next.js frontend interface
- ✅ Complete error handling
- ✅ Visual feedback for all operations
- ✅ Tested and verified working code

The system is production-ready and can be extended with additional features like:
- File uploads
- Relationships between collections
- Custom validations
- Advanced filtering and sorting
- Real-time updates via WebSockets