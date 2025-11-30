# express-validator Quick Reference Card

## Installation
```bash
# Already installed in your package.json!
npm list express-validator
# Output: express-validator@6.15.0
```

## Basic Usage

### 1. Import
```javascript
const { validators, validate } = require('../module/validation/schemas');
```

### 2. Apply to Route
```javascript
router.post('/endpoint', 
    validate(validators.validatorName),
    asyncHandler(async (req, res) => {
        const data = req.validatedBody;  // Validated data here
        // Your logic
    })
);
```

## All Available Validators

```javascript
// Client operations
validators.clientLogin       // { id: number(1-99999) }
validators.clientSearch      // { name: string(1-40, Hebrew/English) }
validators.clientUpdate      // { id: number, newNick: string(1-40) }
validators.clientCreate      // { name, nick, account }

// Order operations  
validators.orderCreate       // { userId: number, order: object }

// Product operations
validators.productCreate     // { name, price, stock, imgpath, order }
validators.productUpdate     // { id, field, value }

// Message board
validators.postCreate        // { post: string(1-1000), user: string }
validators.postAction        // { postid: number }

// Admin operations
validators.userCreate        // { username, password, class }

// Generic
validators.deleteById        // { id: number }
```

## Common Patterns

### Basic Field
```javascript
body('fieldName')
    .notEmpty().withMessage('Field cannot be empty')
    .isLength({ min: 1, max: 100 })
```

### Number
```javascript
body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be 0-150')
```

### Hebrew Text
```javascript
const hebrewEnglishPattern = /^[a-zA-Z0-9\u0590-\u05FF\s]+$/;

body('name')
    .matches(hebrewEnglishPattern)
    .withMessage('Only Hebrew, English, numbers, and spaces')
```

### Enum
```javascript
body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
```

### Custom Validation
```javascript
body('order')
    .custom((value) => {
        if (Object.keys(value).length === 0) {
            throw new Error('Order must have items');
        }
        return true;
    })
```

## Error Response Format

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "ID must be a number between 1 and 99999",
    "Name cannot be empty"
  ],
  "data": null
}
```

### Success Response
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful"
}
```

## Testing with curl

### Valid Request
```bash
curl -X POST http://localhost:3000/client-v2/searchName/ \
  -H "Content-Type: application/json" \
  -d '{"name": "יוסי"}'
```

### Invalid Request
```bash
curl -X POST http://localhost:3000/client-v2/searchName/ \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'
```

## Validator Methods

### Type Checks
- `.isInt()` - Integer
- `.isFloat()` - Float
- `.isBoolean()` - Boolean
- `.isString()` - String
- `.isObject()` - Object
- `.isArray()` - Array

### String Validation
- `.notEmpty()` - Not empty
- `.isLength({ min, max })` - Length range
- `.matches(pattern)` - Regex match
- `.isEmail()` - Valid email
- `.isAlphanumeric()` - Alphanumeric only
- `.isURL()` - Valid URL

### Number Validation
- `.isInt({ min, max })` - Integer range
- `.isFloat({ min, max })` - Float range
- `.min(value)` - Minimum value
- `.max(value)` - Maximum value

### Sanitization
- `.trim()` - Remove whitespace
- `.escape()` - HTML escape
- `.normalizeEmail()` - Normalize email
- `.toInt()` - Convert to int
- `.toLowerCase()` - Convert to lowercase

### Custom
- `.custom(fn)` - Custom validation function
- `.optional()` - Field is optional
- `.withMessage(msg)` - Custom error message

## Integration with Architecture

### With asyncHandler
```javascript
router.post('/endpoint',
    validate(validators.something),
    asyncHandler(async (req, res) => {
        // No try-catch needed!
        const result = await service.doSomething(req.validatedBody);
        return ResponseHelper.success(res, result);
    })
);
```

### With Services
```javascript
router.post('/placeOrder/',
    validate(validators.orderCreate),
    asyncHandler(async (req, res) => {
        const { userId, order } = req.validatedBody;
        const result = await orderService.createOrder(userId, order);
        return ResponseHelper.success(res, result);
    })
);
```

### With Events
```javascript
router.post('/updateProduct/',
    validate(validators.productUpdate),
    asyncHandler(async (req, res) => {
        const result = await productService.update(req.validatedBody);
        appEvents.emitProductChange('updated', result.id);
        return ResponseHelper.success(res, result);
    })
);
```

## Performance Tips

1. **Reuse validators** - Don't recreate them on each request
2. **Use .trim()** - Sanitize early
3. **Fail fast** - Most specific validations first
4. **Avoid complex regex** - Use simple patterns

## Common Mistakes

### ❌ Not using withMessage
```javascript
body('id').isInt()  // Generic error message
```

### ✅ Use withMessage
```javascript
body('id')
    .isInt()
    .withMessage('ID must be an integer')
```

### ❌ Forgetting to spread
```javascript
router.post('/route', validators.something)  // Wrong!
```

### ✅ Use validate() wrapper
```javascript
router.post('/route', validate(validators.something))
```

### ❌ Wrong field location
```javascript
body('id')  // For request body
param('id') // For URL params
query('id') // For query strings
```

## Debugging

### Check validation errors
```javascript
const errors = validationResult(req);
console.log(errors.array());
```

### Test in isolation
```javascript
const result = await body('id').isInt().run(req);
console.log(result);
```

## Complete Example

```javascript
const express = require('express');
const router = express.Router();
const { validators, validate } = require('../module/validation/schemas');
const { asyncHandler } = require('../module/middleware/errorHandler');
const ResponseHelper = require('../module/utils/responseHelper');
const ClientService = require('../module/services/ClientService');

const clientService = new ClientService(pool);

router.post('/searchName/',
    validate(validators.clientSearch),
    asyncHandler(async (req, res) => {
        const { name } = req.validatedBody;
        const clients = await clientService.searchClients(name);
        
        if (clients.length === 0) {
            return ResponseHelper.notFound(res, 'No clients found');
        }
        
        return ResponseHelper.success(res, clients);
    })
);

module.exports = router;
```

## Resources

- **Local file**: `/var/www/apps/topaythepub/module/validation/schemas.js`
- **Migration guide**: `EXPRESS_VALIDATOR_MIGRATION.md`
- **Complete guide**: `EXPRESS_VALIDATOR_COMPLETE.md`
- **Official docs**: https://express-validator.github.io/docs/

## Quick Start

1. Import validators: `const { validators, validate } = require('../module/validation/schemas')`
2. Apply to route: `validate(validators.clientLogin)`
3. Access validated data: `req.validatedBody`
4. Done! ✅
