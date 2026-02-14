# Project Overview & Architecture

## 🎯 Executive Summary
**ToPayThePub** is a Node.js/Express application for managing a pub/restaurant. It handles orders, client management, inventory, and reporting.

The project is currently undergoing a major architectural refactoring to move from a monolithic router structure to a **Controller Pattern** with centralized services and validation.

### Current Status (as of Nov 2025)
- ✅ **Refactored Architecture Built**: 18 new files created (Controllers, Services, Repositories).
- ✅ **Validation Migrated**: Switched from Joi to `express-validator`.
- ✅ **Documentation Complete**: Comprehensive guides available.
- ✅ **Localization Implemented**: Dynamic language switching via session.
- ❌ **Integration Pending**: The new architecture exists side-by-side with the old code but is not yet fully integrated into `app.js`.

---

## 🏗️ New Architecture Structure

The new structure separates concerns into distinct layers:

```
/var/www/apps/topaythepub/
│
├── config/                          # Configuration Management
│   └── index.js                     # Centralized env vars
│
├── ui/                              # 🆕 Localization
│   └── he.json                      # Hebrew text (Default)
│
├── module/
│   ├── models/                      # Data Models (Client, Order, Product, User)
│   ├── database/                    # Repository Layer (DB operations)
│   ├── localization/                # 🆕 Localization Service
│   ├── services/                    # Business Logic Layer
│   ├── utils/                       # Utilities (Response helpers)
│   │   └── functions.js             # Shared utility functions
│   ├── middleware/                  # Middleware (Error handling)
│   ├── validation/                  # Validation Layer (Schemas)
│   └── events/                      # Event System
│
├── controllers/                     # Request Handlers
│   ├── accounting/                  # Reporting & Data
│   ├── client/                      # Client operations
│   └── management/                  # Admin operations
│
└── routes/
    ├── router_client.js             # OLD (Legacy)
    └── router_client_refactored.js  # NEW (Refactored)
```

## 🔑 Key Improvements
1.  **Controller Pattern**: Logic moved out of routers into dedicated controllers.
2.  **Centralized Validation**: `express-validator` schemas in `module/validation`.
3.  **Service Layer**: Business logic separated from HTTP handling.
4.  **Repository Pattern**: Database queries isolated in repositories.
5.  **Event-Driven**: Decoupled modules using an event emitter.

## 📂 Documentation Index
- **Immediate Actions**: See `02_IMMEDIATE_ACTIONS.md`
- **Migration Guide**: See `03_MIGRATION_GUIDE.md`
- **Validation**: See `04_VALIDATION_REFERENCE.md`
- **Future Plans**: See `05_FUTURE_PLANS.md`

---

## 2026-02-13 Addendum

This is a current runtime map and workflow summary based on app.js, routes, controllers, and module.

- See `../PROJECT_OVERVIEW_2026-02-13.md`

### Version Tracking (New)

All future code changes should update the version log defined here:

- See `../VERSION_TRACKING.md`
