/**
 * User Authenticity Check Script
 * Analyzes whether the user's browser environment appears authentic or suspicious
 */
class UserAuthenticityChecker {
    constructor() {
        this.suspiciousFactors = [];
        this.authenticityFactors = [];
        this.recommendations = [];
        this.score = 100;
        this.botDetectionRisk = "Low";
    }

    /**
     * Perform a complete authenticity check
     * @returns {Object} Results of the authenticity check
     */
    async checkUserAuthenticity() {
        try {
            // Check browser environment consistency
            this.checkBrowserConsistency();
            
            // Check for automation indicators
            this.checkAutomationIndicators();
            
            // Check for unusual configurations
            this.checkUnusualConfigurations();
            
            // Calculate final score and risk level
            this.calculateScore();
            
            // Generate recommendations
            this.generateRecommendations();
            
            return {
                tested: true,
                authentic_appearance: this.suspiciousFactors.length === 0,
                authenticity_score: this.score,
                bot_detection_risk: this.botDetectionRisk,
                suspicious_factors: this.suspiciousFactors,
                authenticity_factors: this.authenticityFactors,
                recommendations: this.recommendations
            };
        } catch (error) {
            console.error("Error in authenticity check:", error);
            return {
                tested: false,
                error: error.message
            };
        }
    }

    /**
     * Check for browser environment consistency
     */
    checkBrowserConsistency() {
        // Check if user agent is consistent with browser features
        const userAgent = navigator.userAgent;
        const hasChrome = /Chrome/.test(userAgent);
        const hasFirefox = /Firefox/.test(userAgent);
        
        // Check if Chrome features exist when Chrome is in user agent
        if (hasChrome && typeof window.chrome === 'undefined') {
            this.suspiciousFactors.push("User agent claims Chrome but Chrome object is missing");
        } else if (hasChrome) {
            this.authenticityFactors.push("Chrome browser environment is consistent");
        }
        
        // Check if Firefox features exist when Firefox is in user agent
        if (hasFirefox && typeof InstallTrigger === 'undefined') {
            this.suspiciousFactors.push("User agent claims Firefox but Firefox features are missing");
        } else if (hasFirefox) {
            this.authenticityFactors.push("Firefox browser environment is consistent");
        }
        
        // Check navigator properties consistency
        if (navigator.languages && navigator.languages.length === 0) {
            this.suspiciousFactors.push("Empty navigator.languages array");
        } else if (navigator.languages && navigator.languages.length > 0) {
            this.authenticityFactors.push("Navigator languages properly configured");
        }
    }

    /**
     * Check for automation indicators
     */
    checkAutomationIndicators() {
        // Check for Selenium/WebDriver indicators
        if (navigator.webdriver) {
            this.suspiciousFactors.push("Navigator webdriver flag is true (automation detected)");
        } else {
            this.authenticityFactors.push("No automation flags detected");
        }
        
        // Check for Phantom JS / Headless indicators
        if (/HeadlessChrome/.test(navigator.userAgent)) {
            this.suspiciousFactors.push("Headless Chrome detected in user agent");
        }
        
        // Check if plugins are empty (often the case in headless browsers)
        if (navigator.plugins.length === 0) {
            this.suspiciousFactors.push("No browser plugins detected (common in automation tools)");
        } else {
            this.authenticityFactors.push("Browser has normal plugins configuration");
        }
    }

    /**
     * Check for unusual configurations
     */
    checkUnusualConfigurations() {
        // Check screen dimensions
        if (window.screen.width < 100 || window.screen.height < 100) {
            this.suspiciousFactors.push("Unusual screen dimensions detected");
        } else {
            this.authenticityFactors.push("Normal screen dimensions");
        }
        
        // Check for missing features that real browsers should have
        if (!window.localStorage || !window.sessionStorage) {
            this.suspiciousFactors.push("Storage APIs are missing");
        } else {
            this.authenticityFactors.push("Normal browser storage APIs available");
        }
        
        // Check timezone consistency
        const dateOffset = new Date().getTimezoneOffset();
        if (dateOffset === 0 && navigator.language !== 'en-GB' && navigator.language !== 'ar-EG') {
            // Most UTC+0 locales use en-GB or similar; a mismatch might be suspicious
            this.suspiciousFactors.push("Timezone (UTC+0) doesn't match browser language");
        }
    }

    /**
     * Calculate the authenticity score based on factors
     */
    calculateScore() {
        // Start with a perfect score and reduce based on suspicious factors
        let score = 100;
        
        // Each suspicious factor reduces the score
        score -= (this.suspiciousFactors.length * 10);
        
        // Add a small bonus for each authenticity factor (capped at original 100)
        score += (this.authenticityFactors.length * 2);
        score = Math.min(score, 100);
        
        // Ensure score doesn't go below 0
        this.score = Math.max(score, 0);
        
        // Determine bot detection risk based on score
        if (this.score < 40) {
            this.botDetectionRisk = "High";
        } else if (this.score < 70) {
            this.botDetectionRisk = "Medium";
        } else {
            this.botDetectionRisk = "Low";
        }
    }

    /**
     * Generate recommendations based on suspicious factors
     */
    generateRecommendations() {
        if (this.suspiciousFactors.includes("Navigator webdriver flag is true (automation detected)")) {
            this.recommendations.push({
                category: "authenticity",
                title: "Disable Automation Flags",
                description: "Your browser is reporting automation flags which websites can detect. Consider using a regular browser without automation or testing flags enabled.",
                priority: "high"
            });
        }
        
        if (this.suspiciousFactors.includes("Headless Chrome detected in user agent")) {
            this.recommendations.push({
                category: "authenticity",
                title: "Use Regular Browser Instance",
                description: "Headless browsers are easily detected by websites. Use a standard browser with a GUI for better privacy.",
                priority: "high"
            });
        }
        
        if (this.suspiciousFactors.includes("No browser plugins detected (common in automation tools)")) {
            this.recommendations.push({
                category: "authenticity",
                title: "Add Common Browser Extensions",
                description: "Having zero plugins is unusual for regular users. Consider adding a few common extensions that don't compromise privacy.",
                priority: "medium"
            });
        }
        
        if (this.suspiciousFactors.includes("Empty navigator.languages array")) {
            this.recommendations.push({
                category: "authenticity",
                title: "Configure Browser Language Settings",
                description: "Your browser's language settings appear to be misconfigured. Set appropriate language preferences in your browser settings.",
                priority: "medium"
            });
        }
        
        // Add general recommendations if score is low
        if (this.score < 70) {
            this.recommendations.push({
                category: "authenticity",
                title: "Use a Standard Browser Configuration",
                description: "Your browser has unusual characteristics that make it stand out. Consider using more standard configurations to blend in with regular users.",
                priority: "medium"
            });
        }
    }
}