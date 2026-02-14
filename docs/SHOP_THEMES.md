# Shop Themes

This document describes how shop UI themes are stored and how to add new ones.

## Current Themes

- `default`: Base theme from `public/css/style.css`
- `aurora`: Warm, light theme in `public/css/themes/aurora.css`
- `dark-night`: Dark Night Disco theme in `public/css/themes/dark-night.css`
- `earth-bound`: Earthy palette theme in `public/css/themes/earth-bound.css`
- `forest-mist`: Nature-forward theme in `public/css/themes/forest-mist.css`

## How Theme Selection Works

1. Manager selects a theme in the Manage panel.
2. The selection is saved to `config/theme.json`.
3. The shop app loads the selected theme at startup via `/app/theme`.

Background mode is also stored and can be set to:

- `none` (no image)
- `static` (subtle static image)
- `animated` (slow drift animation)

## Theme Editor (Manage Panel)

The Manage panel has a new "Shop Theme" tab that lets you:

- Switch theme
- Choose background mode
- Toggle the scrolling display bar
- Adjust scroll speed
- Change scroll text color

Changes are saved to `config/ui-config.json` and broadcast instantly to all clients.

## Adding a New Theme

1. Create a new CSS file under `public/css/themes/`.
2. Add the theme option to the Manage selector in `views/manage.ejs`.
3. Use a unique value and ensure the file name matches that value.

Example:

- Selector value: `midnight`
- File path: `public/css/themes/midnight.css`

## Notes

- Theme CSS overrides variables and key UI selectors.
- The base layout still comes from `style.css` and `content.css`.
- Background images are controlled via CSS variables `--bg-image` and `--bg-image-opacity`.
