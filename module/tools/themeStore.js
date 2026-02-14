const fs = require('fs');
const path = require('path');

const themePath = path.join(__dirname, '../../config/theme.json');
const defaultTheme = 'default';
const defaultBackgroundMode = 'none';

function readThemeFile() {
    try {
        if (!fs.existsSync(themePath)) {
            return { theme: defaultTheme, backgroundMode: defaultBackgroundMode };
        }
        const raw = fs.readFileSync(themePath, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        return { theme: defaultTheme, backgroundMode: defaultBackgroundMode };
    }
}

function writeThemeFile(theme, backgroundMode) {
    const payload = {
        theme: theme || defaultTheme,
        backgroundMode: backgroundMode || defaultBackgroundMode
    };
    fs.writeFileSync(themePath, JSON.stringify(payload, null, 2));
    return payload;
}

function getTheme() {
    const data = readThemeFile();
    return data.theme || defaultTheme;
}

function getBackgroundMode() {
    const data = readThemeFile();
    return data.backgroundMode || defaultBackgroundMode;
}

function setTheme(theme, backgroundMode) {
    return writeThemeFile(theme, backgroundMode);
}

module.exports = {
    getTheme,
    getBackgroundMode,
    setTheme
};
