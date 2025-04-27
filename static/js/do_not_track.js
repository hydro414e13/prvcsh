/**
 * Do Not Track Check - Checks if the browser's Do Not Track setting is enabled
 */
class DoNotTrackDetector {
    constructor() {
        // Initialize state
        this.testComplete = false;
        this.dntData = {};
    }
    
    /**
     * Check if Do Not Track is enabled
     * @returns {Promise} Promise resolving to DNT test results
     */
    async checkStatus() {
        let dntEnabled = false;
        
        // Check if DNT is enabled in the browser
        if (navigator.doNotTrack === "1" || 
            window.doNotTrack === "1" || 
            navigator.doNotTrack === "yes" || 
            navigator.msDoNotTrack === "1") {
            dntEnabled = true;
        }
        
        this.testComplete = true;
        this.dntData = {
            "tested": true,
            "enabled": dntEnabled
        };
        
        return this.dntData;
    }
    
    /**
     * Get the DNT test results
     * @returns {Object} DNT test results
     */
    getResults() {
        return this.dntData;
    }
}

// Add to window.privacyChecks
if (typeof window.privacyChecks === 'undefined') {
    window.privacyChecks = {};
}

// Initialize immediately
let dntEnabled = false;
if (navigator.doNotTrack === "1" || 
    window.doNotTrack === "1" || 
    navigator.doNotTrack === "yes" || 
    navigator.msDoNotTrack === "1") {
    dntEnabled = true;
}

window.privacyChecks.doNotTrack = {
    tested: true,
    enabled: dntEnabled
};