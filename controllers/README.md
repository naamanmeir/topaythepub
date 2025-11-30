# Controllers Directory

## Purpose
Controllers handle the HTTP request/response logic for each functional area. They act as the bridge between routers (which define routes) and services (which contain business logic).

## Structure

```
/controllers/
├── accounting/          # Accounting & reporting controllers
│   ├── reportController.js
│   └── dataQueryController.js
├── client/              # Client-facing operations
│   ├── authController.js
│   ├── orderController.js
│   └── userPageController.js
├── management/          # Admin/management operations
│   ├── productController.js
│   ├── clientManagementController.js
│   └── inventoryController.js
├── admin/               # System admin operations
│   └── adminController.js
├── messageBoard/        # Message board operations
│   ├── postController.js
│   └── remoteBoardController.js
└── events/              # SSE events
    └── sseController.js
```

## Controller Responsibilities

Controllers should:
- ✅ Extract and validate request data
- ✅ Call appropriate service methods
- ✅ Handle response formatting
- ✅ Log important actions
- ✅ Handle errors appropriately

Controllers should NOT:
- ❌ Contain business logic (that's in services)
- ❌ Make direct database calls (use repositories via services)
- ❌ Handle file system operations directly (use utilities)
- ❌ Contain validation logic (use validation middleware)

## Pattern Example

### Bad (Old Pattern) - Everything in Router
```javascript
router.post('/create', async (req, res) => {
    // Validation
    if (!req.body.name) return res.status(400).send('Name required');
    
    // Business logic
    const name = req.body.name.trim();
    const exists = await db.checkExists(name);
    if (exists) return res.status(409).send('Already exists');
    
    // Database call
    const result = await db.insert(name);
    
    // Response
    res.json({ id: result.insertId });
});
```

### Good (New Pattern) - Separated Concerns
```javascript
// Router (routes/router_example.js)
const { createItem } = require('../controllers/example/exampleController');
router.post('/create', validate(validators.itemCreate), createItem);

// Controller (controllers/example/exampleController.js)
async function createItem(req, res, next) {
    try {
        const result = await itemService.create(req.validatedBody);
        return ResponseHelper.success(res, result);
    } catch (error) {
        next(error);
    }
}

// Service (module/services/itemService.js)
async function create(itemData) {
    const exists = await itemRepo.findByName(itemData.name);
    if (exists) throw new AppError('Item already exists', 409);
    return await itemRepo.create(itemData);
}
```

## Hebrew Support
All controllers must maintain full Hebrew (עברית) support for:
- Error messages
- Log entries
- Response data
- File names (reports)

## Migration Checklist

When refactoring a router:
- [ ] Create controller file in appropriate subdirectory
- [ ] Extract route handler logic to controller functions
- [ ] Update router to import controller functions
- [ ] Keep original route order
- [ ] Test all endpoints
- [ ] Update documentation
- [ ] Remove old code once verified
