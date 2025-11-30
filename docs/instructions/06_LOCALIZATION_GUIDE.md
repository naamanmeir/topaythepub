# Localization Guide

## 🌍 Overview
The application uses a file-based localization system to support multiple languages.
All text presented to the user is stored in JSON files within the `ui/` directory.

## 📂 File Structure
```
/var/www/apps/topaythepub/
├── ui/
│   ├── he.json       # Hebrew (Default)
│   ├── en.json       # English (Example)
│   └── es.json       # Spanish (Example)
│
└── module/
    └── localization/
        └── LocalizationService.js  # Service to load and retrieve messages
```

## 🛠️ Usage

### 1. Adding a New Language
Simply create a new JSON file in the `ui/` folder with the language code as the filename (e.g., `fr.json`).
The file structure must match the default `he.json`:

```json
{
    "ui": [ { "loginMessage": "...", ... } ],
    "client": [ { "notExist": "...", ... } ],
    "error": [ { "database": "...", ... } ]
}
```

### 2. Using in Code
Import the service and retrieve messages:

```javascript
const localizationService = require('../module/localization/LocalizationService');

// Get default language (Hebrew)
const messages = localizationService.getMessages();

// Get specific language
const enMessages = localizationService.getMessages('en');

// Access specific sections
const uiText = messages.ui[0];
const clientText = messages.client[0];
const errorText = messages.error[0];
```

### 3. Switching Languages
The system supports dynamic language switching via session.

**Route**: `GET /lang/:lang`
- Sets `req.session.lang` to the requested language code.
- Redirects the user back to the page they came from.

**Implementation**:
In your router, retrieve the language from the session:
```javascript
function getMessages(req) {
    const lang = req.session && req.session.lang ? req.session.lang : 'he';
    return localizationService.getMessages(lang);
}

router.get('/', (req, res) => {
    const messages = getMessages(req);
    // ...
});
```

## 🔄 Migration Note
The original `messages.json` file has been moved to `ui/he.json`.
All references in the code have been updated to use `LocalizationService` dynamically.
Helper functions in `router_messageBoard.js` now accept `messageUi` as an argument to support this.
