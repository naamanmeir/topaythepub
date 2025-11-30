# Safe Migration & Testing Plan

## Current Status ❌

**The app is STILL using OLD routers!** The refactored files exist but are not integrated.

### Current app.js imports (line 52-59):
```javascript
const routerAdmin = require('./routes/router_admin');              // OLD
const routerManage = require('./routes/router_manage');            // OLD
const routerAccountant = require('./routes/router_accountant');    // OLD
const routerClient = require('./routes/router_client');            // OLD
const routerClientEvents = require('./routes/router_client_events'); // OLD
const routerApp = require('./routes/router_app');
const routerMessageBoard = require('./routes/router_messageBoard'); // OLD
const routerRemoteMessageBoard = require('./routes/router_messageRemote'); // OLD
```

### What we have refactored:
- ✅ `router_accountant.js` → `router_accountant_refactored.js`
- ✅ `router_client.js` → `router_client_controllers.js`
- ✅ `router_manage.js` → `router_manage_refactored.js`

### Not yet refactored:
- ❌ `router_admin.js`
- ❌ `router_messageBoard.js`
- ❌ `router_messageRemote.js`
- ❌ `router_client_events.js`
- ✅ `router_app.js` (no refactoring needed - just renders main page)

---

## 🎯 Safe Migration Plan

### Phase 1: Test Refactored Routers (30 minutes)

#### Step 1: Add parallel routes to test

```bash
# Open app.js
cd /var/www/apps/topaythepub
nano app.js
```

Add these imports after line 59:

```javascript
// TESTING: New refactored routers
const routerAccountantNew = require('./routes/router_accountant_refactored');
const routerClientNew = require('./routes/router_client_controllers');
const routerManageNew = require('./routes/router_manage_refactored');
```

Then find where routes are mounted (around line 380-400) and add:

```javascript
// TESTING: Mount new routers at different paths
app.use('/accountant-test', sessionClassMW(75), routerAccountantNew);
app.use('/client-test', sessionClassMW(100), validatorClient(), routerClientNew);
app.use('/manage-test', sessionClassMW(50), routerManageNew);
```

#### Step 2: Test endpoints

```bash
# Restart app
npm start

# Test in another terminal:

# 1. Test accountant routes
curl -v http://localhost:3090/accountant-test/ 2>&1 | grep "HTTP"

# 2. Test client routes (need session cookie from browser)
# Open browser first, login, then get cookie from dev tools

# 3. Test management routes
curl -v http://localhost:3090/manage-test/ 2>&1 | grep "HTTP"
```

#### Step 3: Compare with old routes

```bash
# Compare responses:
curl http://localhost:3090/accountant/createFileReportOrders/ > old_report.csv
curl http://localhost:3090/accountant-test/createFileReportOrders/ > new_report.csv
diff old_report.csv new_report.csv
# Should be identical!
```

---

### Phase 2: Switch to Refactored Routers (10 minutes)

Once testing passes:

```bash
# Backup original files
cd /var/www/apps/topaythepub/routes
cp router_accountant.js router_accountant.OLD.js
cp router_client.js router_client.OLD.js
cp router_manage.js router_manage.OLD.js
```

Then update `app.js` imports (lines 52-59):

```javascript
// OLD:
// const routerManage = require('./routes/router_manage');
// const routerAccountant = require('./routes/router_accountant');
// const routerClient = require('./routes/router_client');

// NEW:
const routerManage = require('./routes/router_manage_refactored');
const routerAccountant = require('./routes/router_accountant_refactored');
const routerClient = require('./routes/router_client_controllers');
```

Restart and test production paths:
```bash
npm start

# Test original URLs now use new controllers
curl http://localhost:3090/accountant/createFileReportOrders/
curl http://localhost:3090/manage/getProducts/
# etc...
```

---

### Phase 3: Clean Up Old Files (5 minutes)

**ONLY after Phase 2 works perfectly:**

```bash
cd /var/www/apps/topaythepub/routes

# Move old files to backup directory
mkdir -p .archive
mv router_accountant.OLD.js .archive/
mv router_client.OLD.js .archive/
mv router_manage.OLD.js .archive/

# Or delete if you're confident (can always restore from git)
# rm router_accountant.OLD.js router_client.OLD.js router_manage.OLD.js
```

---

## 🧪 Testing Checklist

### Accountant Routes
```bash
# All these should work on /accountant-test first, then /accountant
curl http://localhost:3090/accountant-test/
curl http://localhost:3090/accountant-test/createFileReportOrders/
curl http://localhost:3090/accountant-test/createFileReportClients/
curl -X POST http://localhost:3090/accountant-test/getAllData/1
```

### Client Routes (need authenticated session)
```bash
# Login via browser first, get cookie, then:
curl -X POST http://localhost:3090/client-test/searchName/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionName=YOUR_SESSION" \
  -d '{"name": "test"}'
```

### Management Routes
```bash
curl http://localhost:3090/manage-test/
curl http://localhost:3090/manage-test/getProducts/
```

---

## ⚠️ IMPORTANT: Do NOT Delete Yet

**Do NOT delete these files until Phase 2 is complete:**
- `router_accountant.js`
- `router_client.js`
- `router_manage.js`

These are still actively used by your running application!

---

## 🔄 Rollback Plan

If something goes wrong after switching:

```bash
# Quick rollback in app.js
cd /var/www/apps/topaythepub

# Restore old imports
nano app.js
# Change back to:
const routerManage = require('./routes/router_manage');
const routerAccountant = require('./routes/router_accountant');
const routerClient = require('./routes/router_client');

# Restart
npm start
```

Or restore from backup:
```bash
cd /var/www/apps/topaythepub/routes
cp .archive/router_accountant.OLD.js router_accountant.js
cp .archive/router_client.OLD.js router_client.js
cp .archive/router_manage.OLD.js router_manage.js
```

---

## 📊 Summary

| Phase | Action | Risk | Time |
|-------|--------|------|------|
| **Phase 1** | Test at `/xxx-test` paths | LOW | 30 min |
| **Phase 2** | Switch imports in app.js | MEDIUM | 10 min |
| **Phase 3** | Delete old files | LOW | 5 min |

**Current Status**: Phase 0 (Not yet started)
**Next Step**: Run Phase 1 testing

---

## 🚀 Quick Start

```bash
# 1. Open app.js
cd /var/www/apps/topaythepub
nano app.js

# 2. Add test routes (see Phase 1 above)

# 3. Restart and test
npm start

# 4. In another terminal, test endpoints
curl http://localhost:3090/accountant-test/
curl http://localhost:3090/manage-test/getProducts/

# 5. If all works, proceed to Phase 2
```

---

**Ready to start?** Begin with Phase 1 - Testing! 🧪
