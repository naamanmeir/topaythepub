# Version Tracking Method

This document defines how versions are recorded and updated for this project. The goal is a low-friction, consistent record that is updated alongside code changes.

## Version Format

Use CalVer with a daily increment:

- Format: YYYY.MM.DD.N
- Example: 2026.02.13.1

Rules:

- YYYY.MM.DD is the calendar date of the change
- N is a counter starting at 1 for each date
- Increment N for additional changes on the same day

## When to Bump the Version

Bump the version and add a log entry when any of the following change:

- API routes or request/response behavior
- Database schema or data migration steps
- Business logic in services, controllers, or repositories
- Client-facing UI behavior or localization text
- Auth/session behavior, permissions, or security configuration

Do not bump for:

- Comments or formatting-only changes
- Documentation-only edits that do not affect behavior

## How to Record a Version

1. Add a new entry to the Version Log below.
2. Include the date, version, and a short summary (1-3 bullets).
3. List the primary files touched (paths only).

## Optional Tagging (Future)

If you later want git tags, tag with the same version string:

- Example: git tag 2026.02.13.1

## Version Log

### 2026.02.13.2

- Show app version in management panel footer
- Pass app version from manage route to view
- Files: routes/router_manage.js, views/manage.ejs, public/css/manage.css

### 2026.02.13.3

- Render manage panel version via JS on page load
- Add data attribute for version in manage view
- Files: views/manage.ejs, public/js/script-manage.js

### 2026.02.13.4

- Move version display into shared footer partial
- Render footer version in manage JS
- Files: views/manage.ejs, views/partials/footer.ejs, public/js/script-manage.js, public/css/manage.css

### 2026.02.13.5

- Render footer version text server-side as a fallback
- Files: views/partials/footer.ejs

### 2026.02.13.6

- Expose appVersion via app.locals for all views
- Remove per-route version plumbing in manage router
- Files: app.js, routes/router_manage.js

### 2026.02.13.7

- Allow footer to auto-size so version line is visible
- Files: public/css/manage.css

### 2026.02.13.8

- Add version display to legacy footer template
- Files: views/footer.ejs

### 2026.02.13.9

- Simplify footer version rendering to server-side text only
- Remove JS version injection
- Files: views/partials/footer.ejs, views/footer.ejs, public/js/script-manage.js

### 2026.02.13.10

- Remove legacy product edit panel in manage UI
- Tighten mobile layout for product list
- Files: views/manage.ejs, public/js/script-manage.js, public/css/manage.css

### 2026.02.13.11

- Remove legacy product edit JS functions
- Files: public/js/script-manage.js

### 2026.02.13.12

- Normalize product image filenames before edit requests
- Files: public/js/script-manage.js

### 2026.02.13.13

- Add quick add, hide out-of-stock, and undo toast for products
- Files: views/manage.ejs, public/js/script-manage.js, public/css/manage.css

### 2026.02.13.14

- Improve product image picker with selected state and label
- Files: views/manage.ejs, public/js/script-manage.js, public/css/manage.css

### 2026.02.13.15

- Add theme selection for shop UI and new Aurora theme
- Files: config/theme.json, module/tools/themeStore.js, views/index.ejs, routes/router_app.js, routes/router_manage.js, views/manage.ejs, public/js/script_main.js, public/js/script-manage.js, public/css/manage.css, public/css/themes/aurora.css

### 2026.02.13.16

- Compact theme selector styling in manage panel
- Files: public/css/manage.css

### 2026.02.13.17

- Add Dark Night Disco theme and theme docs
- Files: public/css/themes/dark-night.css, views/manage.ejs, docs/SHOP_THEMES.md

### 2026.02.13.18

- Add Forest Mist theme and background image modes
- Files: public/css/themes/forest-mist.css, public/css/themes/dark-night.css, public/css/themes/aurora.css, public/css/style.css, config/theme.json, module/tools/themeStore.js, routes/router_app.js, routes/router_manage.js, views/manage.ejs, public/js/script_main.js, public/js/script-manage.js, docs/SHOP_THEMES.md

### 2026.02.13.19

- Add shop theme editor tab and ui-config broadcast
- Enable scroll display controls
- Files: config/ui-config.json, module/tools/uiConfigStore.js, routes/router_app.js, routes/router_manage.js, views/manage.ejs, public/js/script_main.js, public/js/script-manage.js, views/content.ejs, public/css/content.css, public/js/script_content.js, docs/SHOP_THEMES.md

### 2026.02.13.1

- Initial documentation baseline for runtime map and workflows
- Added version tracking method
- Files: docs/PROJECT_OVERVIEW_2026-02-13.md, docs/VERSION_TRACKING.md

