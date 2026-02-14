const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config/ui-config.json');
const defaults = {
    theme: 'default',
    backgroundMode: 'none',
    backgroundImage: '',
    backgroundImageOpacity: 0.08,
    backgroundOverlayColor: '',
    backgroundPattern: 'none',
    backgroundRandomEnabled: false,
    backgroundRandomAll: false,
    backgroundRandomIntervalMin: 10,
    backgroundRandomPool: [],
    backgroundFolderAllowList: [],
    scrollEnabled: true,
    scrollSpeed: 'medium',
    scrollTextColor: 'default',
    scrollTextColorCustom: '',
    scrollTextSizePx: 18,
    scrollTextWeight: '400',
    scrollTextSpacing: 0,
    scrollLocation: 'bottom',
    scrollDelayMs: 10,
    scrollOrderMode: 'random'
};

function readConfigFile() {
    try {
        if (!fs.existsSync(configPath)) {
            return { ...defaults };
        }
        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = JSON.parse(raw);
        return { ...defaults, ...parsed };
    } catch (error) {
        return { ...defaults };
    }
}

function writeConfigFile(config) {
    const payload = { ...defaults, ...config };
    fs.writeFileSync(configPath, JSON.stringify(payload, null, 2));
    return payload;
}

function getConfig() {
    return readConfigFile();
}

function setConfig(config) {
    return writeConfigFile(config);
}

module.exports = {
    getConfig,
    setConfig
};
