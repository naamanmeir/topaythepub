# Migration & Safety Guide

## 🛡️ Safe Migration Strategy
We use a **Parallel Run** strategy to ensure zero downtime and easy rollback.

1.  **Refactor**: Create new controller/router files (e.g., `router_manage_refactored.js`).
2.  **Mount Parallel**: Mount the new router at a test path (e.g., `/manage-test`) in `app.js`.
3.  **Verify**: Test the new endpoints extensively.
4.  **Switch**: Update `app.js` to point the main path (e.g., `/manage`) to the new router.
5.  **Cleanup**: Remove the old router file after a stability period.

---

## 🔄 How to Refactor a Router

### 1. Analyze the Old Router
Identify all:
- Database calls
- Validation logic
- Response formatting
- Logging calls

### 2. Create Controller
Create a new file in `controllers/<area>/<name>Controller.js`.
- Move business logic here.
- Use `ResponseHelper` for responses.
- Use `AppError` for error handling.

**Example**:
```javascript
// controllers/client/authController.js
exports.login = asyncHandler(async (req, res) => {
    const { id } = req.validatedBody;
    const client = await clientRepo.findById(id);
    if (!client) throw new AppError('Client not found', 404);
    return ResponseHelper.success(res, client);
});
```

### 3. Create Thin Router
Create `routes/router_<name>_refactored.js`.
- Import the controller.
- Define routes using `express-validator` schemas.

**Example**:
```javascript
const router = express.Router();
const authController = require('../controllers/client/authController');
const { validate, validators } = require('../module/validation/schemas');

router.post('/login', validate(validators.clientLogin), authController.login);

module.exports = router;
```

---

## 🧪 Testing Plan

### Phase 1: Parallel Test
Add to `app.js`:
```javascript
const routerManageNew = require('./routes/router_manage_refactored');
app.use('/manage-test', sessionClassMW(50), routerManageNew);
```

Run tests:
```bash
curl -v http://localhost:3000/manage-test/some-endpoint
```

### Phase 2: Switch Over
Update `app.js`:
```javascript
// app.use('/manage', ... routerManage); // OLD
app.use('/manage', sessionClassMW(50), routerManageNew); // NEW
```
