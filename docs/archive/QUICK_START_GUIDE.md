# Quick Start Guide - New Architecture

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (30 seconds)
```bash
cd /var/www/apps/topaythepub
npm install express-validator
```

### Step 2: Test the Refactored Router (2 minutes)

Add to `app.js` (after existing routes, before `app.listen`):

```javascript
// Test new architecture (temporary - for testing only)
const routerClientV2 = require('./routes/router_client_refactored');
app.use('/client-v2', sessionClassMW(100), routerClientV2);

// Add global error handler (must be last, after ALL routes)
const { errorHandler } = require('./module/middleware/errorHandler');
global.errorLogger = errorLogger; // Make logger available
app.use(errorHandler);
```

### Step 3: Test with curl (2 minutes)

First, get a session cookie by logging in through the web interface, then:

```bash
# Test client search (replace YOUR_SESSION_COOKIE)
curl -X POST http://localhost:3000/client-v2/searchName/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=YOUR_SESSION_COOKIE" \
  -d '{"name": "test"}'

# Expected response:
# {"success":true,"data":[...]}

# Test with invalid data (should get validation error)
curl -X POST http://localhost:3000/client-v2/searchName/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=YOUR_SESSION_COOKIE" \
  -d '{"name": ""}'

# Expected response:
# {"success":false,"error":"Validation failed","details":[...]}
```

### Step 4: Compare Responses

**Old endpoint** (`/client/searchName/`):
```json
[{"id":1,"name":"שם","nick":"כינוי"}]
```

**New endpoint** (`/client-v2/searchName/`):
```json
{
  "success": true,
  "data": [{"id":1,"name":"שם","nick":"כינוי"}]
}
```

Notice the standardized format!

## 📝 Quick Reference: How to Use New Components

### Using Models
```javascript
const Client = require('../module/models/Client');

// From database
const client = Client.fromDatabase(dbRow);

// Access data
console.log(client.name);  // Type-safe!

// Transform for API
res.json(client.toClientResponse(messageClient.logged));
```

### Using Services
```javascript
const ClientService = require('../module/services/ClientService');
const clientService = new ClientService(pool);

// Get client (throws error if not found)
const client = await clientService.getClientById(123);

// Search clients
const results = await clientService.searchClients('test');
```

### Using Validation
```javascript
const { schemas, validate } = require('../module/validation/schemas');

router.post('/endpoint',
    validate(schemas.clientLogin),  // Middleware
    async (req, res) => {
        const { id } = req.validatedBody;  // Already validated!
        // ... your logic ...
    }
);
```

### Using Response Helper
```javascript
const ResponseHelper = require('../module/utils/responseHelper');

// Success
return ResponseHelper.success(res, data, 'Optional message');

// Error
return ResponseHelper.error(res, 'Error message', 400);

// Not found
return ResponseHelper.notFound(res, 'Client not found');
```

### Using Error Handler
```javascript
const { asyncHandler, AppError } = require('../module/middleware/errorHandler');

router.post('/endpoint',
    asyncHandler(async (req, res) => {
        // No try-catch needed!
        const client = await getClient();
        
        if (!client) {
            throw new AppError('CLIENT_NOT_FOUND', 404);
        }
        
        return ResponseHelper.success(res, client);
    })
);
```

### Using Events
```javascript
const appEvents = require('../module/events/appEvents');

// Emit event
appEvents.emitClientChange('updated', clientId, { field: 'nick' });

// Listen for event
appEvents.onClientChange((data) => {
    console.log('Client changed:', data);
});
```

## 🔄 Migration Pattern: One Endpoint at a Time

### Example: Migrate `/userLogin/`

**Step 1 - Original Route** (keep as backup):
```javascript
routerClient.post('/userLogin/', async(req, res) => {
    if (!req.body.id || req.body.id == null) { res.end(); return; }
    let loggedUserDetails = [];
    loggedUserDetails = await db.dbGetClientDetailsById(req.body.id);
    loggedUserDetails = JSON.stringify({
        'id': req.body.id,
        'name': loggedUserDetails[0].name,
        'nick': loggedUserDetails[0].nick,
        'account': loggedUserDetails[0].account,
        'message': messageClient.logged
    });
    res.send(loggedUserDetails);
    return;
});
```

**Step 2 - Refactored Route** (add alongside):
```javascript
const { asyncHandler } = require('../module/middleware/errorHandler');
const ResponseHelper = require('../module/utils/responseHelper');
const { schemas, validate } = require('../module/validation/schemas');
const ClientService = require('../module/services/ClientService');
const appEvents = require('../module/events/appEvents');

const clientService = new ClientService(pool);

routerClient.post('/userLogin-v2/',  // Temporary different endpoint
    validate(schemas.clientLogin),
    asyncHandler(async (req, res) => {
        const { id } = req.validatedBody;
        const client = await clientService.getClientById(id);
        appEvents.emitClientLoggedIn(client.id, client.name);
        return ResponseHelper.success(
            res, 
            client.toClientResponse(messageClient.logged)
        );
    })
);
```

**Step 3 - Test Both**:
- Test `/userLogin-v2/` thoroughly
- Compare responses
- Verify error handling

**Step 4 - Switch**:
```javascript
// Comment out old
// routerClient.post('/userLogin/', async(req, res) => { ... });

// Rename new
routerClient.post('/userLogin/',  // Remove -v2
    validate(schemas.clientLogin),
    asyncHandler(async (req, res) => {
        // ... refactored code ...
    })
);
```

## ⚡ Performance Tips

### Singleton Services (Recommended)
Instead of creating services in every route:

```javascript
// At top of router file
const pool = require('mariadb').createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    connectionLimit: 25
});

const clientService = new ClientService(pool);  // Create once
const orderService = new OrderService(pool);    // Create once

// Use in routes
router.post('/endpoint', asyncHandler(async (req, res) => {
    const client = await clientService.getClientById(id);  // Reuse service
}));
```

## 🐛 Debugging Tips

### Enable Event Logging
```javascript
const appEvents = require('../module/events/appEvents');

// Log all events
appEvents.logEventStatus();

// Or listen to specific events
appEvents.onDataChange((data) => {
    console.log('Data changed:', data);
});
```

### Check Validation Errors
Validation errors return detailed messages:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "ID must be at least 1",
    "ID must be a number"
  ]
}
```

### Error Stack Traces
In development mode (APP_MODE=development), errors include stack traces:
```json
{
  "success": false,
  "error": "CLIENT_NOT_FOUND",
  "stack": "Error: CLIENT_NOT_FOUND\n    at ..."
}
```

## 📚 Common Patterns

### Pattern: Get Client with Error Handling
```javascript
// Old way
const result = await db.dbGetClientDetailsById(id);
if (!result || result.length === 0) {
    res.status(404).send('Not found');
    return;
}
const client = result[0];

// New way
const client = await clientService.getClientById(id);
// Throws error automatically if not found
```

### Pattern: Create Order with Transaction
```javascript
// Old way
try {
    await db.dbInsertOrderToOrders(...);
    await db.dbInsertOrderToClient(...);
} catch (error) {
    console.log(error);
}

// New way
const result = await orderService.createOrder(clientId, orderItems);
// Automatic transaction + logging + error handling
```

### Pattern: Validate and Respond
```javascript
// Old way
if (!req.body || !req.body.id) {
    res.end();
    return;
}
if (req.body.id < 1 || req.body.id > 99999) {
    res.send('Invalid ID');
    return;
}

// New way
validate(schemas.clientLogin),  // Middleware handles all validation
```

## 🎯 Next Steps

1. ✅ Test refactored router at `/client-v2/`
2. ✅ Compare responses with original
3. ✅ Migrate one route per day
4. ✅ Update frontend to use new endpoints
5. ✅ Remove old routes after testing

## 📞 Need Help?

- **Architecture Guide**: `/.github/copilot-instructions.md`
- **Migration Guide**: `/ARCHITECTURE_MIGRATION_GUIDE.md`
- **Implementation Summary**: `/ARCHITECTURE_IMPLEMENTATION_SUMMARY.md`
- **Example Router**: `/routes/router_client_refactored.js`

---

**Start Time**: ~5 minutes to see results  
**Full Migration**: 2-4 weeks (gradual)  
**Risk Level**: Low (side-by-side approach)
