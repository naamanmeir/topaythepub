# Immediate Actions (Integration Guide)

**Goal**: Get the new architecture running and testable alongside the old code.

---

## Step 1: Export Database Pool
Open `/var/www/apps/topaythepub/db.js` and add at the very end:

```javascript
// Export pool for new architecture
exports.pool = pool;
```

**Verify**:
```bash
node -e "const db = require('./db'); console.log(db.pool ? '✅ Pool exported' : '❌ Not found')"
```

---

## Step 2: Add Error Handler
Open `/var/www/apps/topaythepub/app.js`.

**Find**: The end of the route definitions (around line 400-420).
**Add** (Before `app.listen()`):

```javascript
// ======================== NEW ARCHITECTURE ========================

// Import error handlers
const { errorHandler, notFoundHandler } = require('./module/middleware/errorHandler');

// 404 handler for unknown routes (must be before error handler)
app.use(notFoundHandler);

// Global error handler (MUST be last)
app.use(errorHandler);

console.log('✅ Error handlers loaded');
```

---

## Step 3: Mount Refactored Router
In `app.js`:

**1. Import**:
Find the router imports section (around line 45) and add:
```javascript
// NEW ARCHITECTURE - Refactored routers
const routerClientV2 = require('./routes/router_client_refactored');
```

**2. Mount**:
Find where routers are mounted (around line 380) and add AFTER the original client router:
```javascript
// V2 routes (new architecture)
app.use('/client-v2', sessionClassMW(100), routerClientV2);
console.log('✅ Refactored client router mounted at /client-v2');
```

---

## Step 4: Start & Test
Restart the server:
```bash
npm start
```

**Test Endpoint**:
```bash
curl -X POST http://localhost:3000/client-v2/searchName/ \
  -d '{"name":"test"}' -H "Content-Type: application/json"
```
