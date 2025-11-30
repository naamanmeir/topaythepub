const fs = require('fs');
const path = require('path');

class LocalizationService {
    constructor() {
        this.languages = {};
        this.defaultLanguage = 'he';
        this.uiPath = path.join(__dirname, '../../ui');
        this.loadLanguages();
    }

    loadLanguages() {
        if (!fs.existsSync(this.uiPath)) {
            console.error(`Localization directory not found: ${this.uiPath}`);
            return;
        }

        const files = fs.readdirSync(this.uiPath);
        files.forEach(file => {
            if (path.extname(file) === '.json') {
                const langCode = path.basename(file, '.json');
                try {
                    const content = fs.readFileSync(path.join(this.uiPath, file), 'utf8');
                    this.languages[langCode] = JSON.parse(content);
                    console.log(`Loaded language: ${langCode}`);
                } catch (err) {
                    console.error(`Error loading language file ${file}:`, err);
                }
            }
        });
    }

    getMessages(lang = this.defaultLanguage) {
        if (!this.languages[lang]) {
            console.warn(`Language '${lang}' not found, falling back to '${this.defaultLanguage}'`);
            return this.languages[this.defaultLanguage];
        }
        return this.languages[lang];
    }

    // Helper to get specific sections like the old code did
    getUiMessages(lang) {
        const msgs = this.getMessages(lang);
        return msgs && msgs.ui ? msgs.ui[0] : {};
    }

    getClientMessages(lang) {
        const msgs = this.getMessages(lang);
        return msgs && msgs.client ? msgs.client[0] : {};
    }

    getErrorMessages(lang) {
        const msgs = this.getMessages(lang);
        return msgs && msgs.error ? msgs.error[0] : {};
    }
}

const localizationService = new LocalizationService();
module.exports = localizationService;
