# Validation Reference (express-validator)

## 📦 Installation
`express-validator` is installed and configured.

## 🛠️ Usage
Import validators from the centralized schema file:
```javascript
const { validators, validate } = require('../module/validation/schemas');
```

Apply to a route:
```javascript
router.post('/endpoint', 
    validate(validators.validatorName),
    controller.method
);
```

Access validated data in controller:
```javascript
const data = req.validatedBody;
```

---

## 📜 Available Validators

| Validator | Fields | Description |
|-----------|--------|-------------|
| `clientLogin` | `id` | Client ID (1-99999) |
| `clientSearch` | `name` | Name (1-40 chars, Hebrew/English) |
| `clientUpdate` | `id`, `newNick` | Update nickname |
| `clientCreate` | `name`, `nick`, `account` | Create new client |
| `orderCreate` | `userId`, `order` | Create order |
| `productCreate` | `name`, `price`, `stock`, `imgpath`, `order` | Create product |
| `productUpdate` | `id`, `field`, `value` | Update product field |
| `postCreate` | `post`, `user` | Create message board post |
| `postAction` | `postid` | Pin/Delete post |
| `userCreate` | `username`, `password`, `class` | Create admin user |
| `deleteById` | `id` | Generic ID deletion |

---

## 🧩 Common Patterns

### Hebrew Text
```javascript
const hebrewEnglishPattern = /^[a-zA-Z0-9\u0590-\u05FF\s]+$/;
body('name').matches(hebrewEnglishPattern)
```

### Numbers
```javascript
body('age').isInt({ min: 0, max: 150 })
```

### Enums
```javascript
body('status').isIn(['active', 'inactive'])
```
