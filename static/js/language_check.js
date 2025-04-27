/**
 * Language Location Check - Checks if browser language settings match the IP location
 */
class LanguageDetector {
    constructor() {
        // Initialize state
        this.testComplete = false;
        this.langData = {};
    }
    
    /**
     * Check language settings for location mismatch
     * @returns {Promise} Promise resolving to language test results
     */
    async checkLanguageLocation() {
        // Get the browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        
        // Get the system languages (if available)
        let systemLanguages = [];
        if (navigator.languages && navigator.languages.length) {
            systemLanguages = Array.from(navigator.languages);
        }
        
        this.testComplete = true;
        this.langData = {
            "tested": true,
            "browserLanguage": browserLanguage,
            "systemLanguage": systemLanguages.length > 0 ? systemLanguages[0] : browserLanguage,
            "system_languages": systemLanguages
        };
        
        return this.langData;
    }
    
    /**
     * Get the language test results
     * @returns {Object} Language test results
     */
    getResults() {
        return this.langData;
    }
}

// Add to window.privacyChecks
if (typeof window.privacyChecks === 'undefined') {
    window.privacyChecks = {};
}

// Initialize immediately
const browserLanguage = navigator.language || navigator.userLanguage;
let systemLanguages = [];
if (navigator.languages && navigator.languages.length) {
    systemLanguages = Array.from(navigator.languages);
}

window.privacyChecks.language = {
    tested: true,
    browserLanguage: browserLanguage,
    systemLanguage: systemLanguages.length > 0 ? systemLanguages[0] : browserLanguage,
    system_languages: systemLanguages
};