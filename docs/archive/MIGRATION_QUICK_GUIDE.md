# Quick Migration Guide - Using Refactored Routers

## 🚀 Test New Routers (Recommended)

Keep old routers working while testing new ones:

### Step 1: Add to app.js

Open `/var/www/apps/topaythepub/app.js` and add:

```javascript
// Find existing router imports (around line 45)
const routerClient = require('./routes/router_client');
const routerManage = require('./routes/router_manage');
const routerAccountant = require('./routes/router_accountant');

// ADD NEW IMPORTS:
const routerClientNew = require('./routes/router_client_controllers');
const routerManageNew = require('./routes/router_manage_refactored');
const routerAccountantNew = require('./routes/router_accountant_refactored');
```

### Step 2: Mount new routers (around line 380)

```javascript
// Keep old routers
app.use('/accountant', sessionClassMW(75), routerAccountant);
app.use('/manage', sessionClassMW(50), routerManage);
app.use('/client', sessionClassMW(100), validatorClient(), routerClient);

// ADD NEW ROUTES FOR TESTING:
app.use('/accountant-new', sessionClassMW(75), routerAccountantNew);
app.use('/manage-new', sessionClassMW(50), routerManageNew);
app.use('/client-new', sessionClassMW(100), validatorClient(), routerClientNew);
```

### Step 3: Test

```bash
# Restart server
cd /var/www/apps/topaythepub
npm start

# Test accountant
curl http://localhost:3090/accountant-new/createFileReportOrders/

# Test client search
curl -X POST http://localhost:3090/client-new/searchName/ \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"name": "test"}'

# Test management
curl http://localhost:3090/manage-new/getProducts/
```

### Step 4: Verify in Browser

1. Open browser dev tools (F12)
2. Change URLs manually in console:
   ```javascript
   // Try new endpoints
   fetch('/accountant-new/getAllData/1', {method: 'POST'})
   fetch('/client-new/searchName/', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({name: 'test'})
   })
   ```

---

## ⚡ Direct Replacement (Production)

Once tested, replace old routers:

### Step 1: Backup old routers

```bash
cd /var/www/apps/topaythepub/routes
cp router_accountant.js router_accountant.backup.js
cp router_client.js router_client.backup.js
cp router_manage.js router_manage.backup.js
```

### Step 2: Update app.js imports

```javascript
// OLD:
const routerClient = require('./routes/router_client');
const routerManage = require('./routes/router_manage');
const routerAccountant = require('./routes/router_accountant');

// NEW:
const routerClient = require('./routes/router_client_controllers');
const routerManage = require('./routes/router_manage_refactored');
const routerAccountant = require('./routes/router_accountant_refactored');
```

### Step 3: Restart and monitor

```bash
npm start

# Monitor logs
tail -f errors.log
tail -f orders.log
tail -f clientLogin.log
```

---

## 🔍 Troubleshooting

### Error: Cannot find module

**Problem**: `Error: Cannot find module '../controllers/...`

**Solution**: Make sure all controller files exist:
```bash
ls -la controllers/accounting/
ls -la controllers/client/
ls -la controllers/management/
```

### Error: Function is not defined

**Problem**: `TypeError: controller.someFunction is not a function`

**Solution**: Check controller exports:
```javascript
// controllers/example/exampleController.js must have:
module.exports = {
    functionName,
    anotherFunction
};
```

### Routes return 404

**Problem**: New routes don't work

**Solution**: 
1. Check router mounting in `app.js`
2. Verify middleware order (sessionClassMW, validatorClient)
3. Check route paths match exactly

### Database errors

**Problem**: `Cannot read property '0' of undefined`

**Solution**: 
- Controllers expect same database responses as old routers
- Check that database functions return expected format
- Add defensive checks for empty results

---

## 📊 Comparison

### File Sizes (Before/After)

| File | Old Size | New Size | Reduction |
|------|----------|----------|-----------|
| router_accountant | 160 lines | 41 lines | -74% |
| router_client | 298 lines | 44 lines | -85% |
| router_manage | 352 lines | 64 lines | -82% |

### Where Did the Code Go?

| Old Router | Controller Files | Total Controller Lines |
|------------|------------------|------------------------|
| router_accountant | 3 files | 326 lines |
| router_client | 3 files | 498 lines |
| router_manage | 3 files | 396 lines |

**Total**: 10 controller files with **1,220 lines** of organized, reusable code.

---

## ✅ Verification Checklist

After migration, verify these work:

### Accountant Routes
- [ ] `/accountant/` - Main page loads
- [ ] `/accountant/createFileReportOrders/` - CSV generates
- [ ] `/accountant/createFileReportClients/` - CSV generates
- [ ] `/accountant/getAllData/:scope` - Data returns
- [ ] `/accountant/getListOfArchiveReport/` - Archive list
- [ ] `/accountant/removeOldBackups/` - Backups removed
- [ ] `/accountant/resetClientsDataAfterRead/` - Reset works
- [ ] `/accountant/backupTable/` - Backup creates

### Client Routes
- [ ] `/client/searchName/` - Search works
- [ ] `/client/userLogin/` - Login works
- [ ] `/client/getUserPage/` - User page loads
- [ ] `/client/requestOrderPage/` - Order confirm loads
- [ ] `/client/placeOrder/` - Order submits
- [ ] `/client/changeNick/` - Nickname changes
- [ ] `/client/deleteLastOrderConfirm/` - Delete confirm loads
- [ ] `/client/deleteLastOrder/` - Order deletes
- [ ] `/client/getDisplayInfo/` - Pinned posts load

### Management Routes
- [ ] `/manage/` - Main page loads
- [ ] `/manage/getProducts/` - Products list
- [ ] `/manage/insertProduct/:data` - Product adds
- [ ] `/manage/editProduct/:data` - Product edits
- [ ] `/manage/deleteProduct/:data` - Product deletes
- [ ] `/manage/uploadItemImg` - Image uploads
- [ ] `/manage/searchNameManage/:data` - Client search
- [ ] `/manage/insertClient/:data` - Client adds
- [ ] `/manage/editClientFields/:data` - Client edits
- [ ] `/manage/deleteClient/:data` - Client deletes
- [ ] `/manage/getAllData/:scope` - Data returns
- [ ] `/manage/removeOldBackups/` - Backups removed

---

## 🎯 Rollback Plan

If something goes wrong:

### Quick Rollback

```bash
cd /var/www/apps/topaythepub

# Restore old routers (if you backed them up)
cp routes/router_accountant.backup.js routes/router_accountant.js
cp routes/router_client.backup.js routes/router_client.js
cp routes/router_manage.backup.js routes/router_manage.js

# Revert app.js changes
git diff app.js  # Review changes
git checkout app.js  # Restore original

# Restart
npm start
```

### Git Rollback

```bash
# If you committed changes
git log --oneline  # Find commit hash before refactoring
git revert <commit-hash>

# Or reset (DANGER - loses uncommitted changes!)
git reset --hard <commit-hash>
```

---

## 💡 Tips

1. **Test one router at a time** - Don't migrate all at once
2. **Use parallel routes first** (`/client-new`) - Safer testing
3. **Monitor logs** - Watch for errors after migration
4. **Test in development first** - Don't go straight to production
5. **Keep backups** - Always backup before major changes
6. **Document issues** - Note any problems for future reference

---

## 📞 Support

If you encounter issues:

1. Check `errors.log` for stack traces
2. Check controller file exists at expected path
3. Verify exports match imports
4. Test database functions still work
5. Check middleware is applied correctly

---

**Ready to migrate?** Start with testing parallel routes first!
