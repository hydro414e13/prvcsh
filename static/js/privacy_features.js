/**
 * Privacy Features Module
 * Integrates all privacy enhancement features and provides unified access
 */

// Initialize global namespace for privacy features
window.privacyFeatures = window.privacyFeatures || {};

// Reference to privacy feature components - create default implementations if not already set
// For fingerprintRandomization
window.fingerprintRandomization = window.fingerprintRandomization || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For httpsUpgradeChecker
window.httpsUpgradeChecker = window.httpsUpgradeChecker || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For dnsPrivacyChecker
window.dnsPrivacyChecker = window.dnsPrivacyChecker || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For trackerBlocker
window.trackerBlocker = window.trackerBlocker || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For cookieManager
window.cookieManager = window.cookieManager || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For socialMediaDetector
window.socialMediaDetector = window.socialMediaDetector || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For vpnAssessor
window.vpnAssessor = window.vpnAssessor || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For websocketLeakDetector
window.websocketLeakDetector = window.websocketLeakDetector || {
    init: function() { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [] }; }
};

// For anonymityTimeline
window.anonymityTimeline = window.anonymityTimeline || {
    init: function(score) { return Promise.resolve(); },
    getResults: function() { return { tested: false, recommendations: [], trend: 'stable' }; }
};

class PrivacyFeatures {
    constructor() {
        this.initialized = false;
        this.features = {
            fingerprintRandomization: window.fingerprintRandomization,
            httpsUpgradeChecker: window.httpsUpgradeChecker,
            dnsPrivacyChecker: window.dnsPrivacyChecker,
            trackerBlocker: window.trackerBlocker,
            cookieManager: window.cookieManager,
            socialMediaDetector: window.socialMediaDetector,
            vpnAssessor: window.vpnAssessor,
            websocketLeakDetector: window.websocketLeakDetector,
            anonymityTimeline: window.anonymityTimeline
        };
        
        this.results = {
            allTested: false,
            featureResults: {},
            overallScore: 0,
            riskLevel: 'unknown',
            priorityRecommendations: []
        };
    }
    
    /**
     * Initialize all privacy features
     */
    async init(anonymityScore) {
        if (this.initialized) return;
        
        console.log('Initializing privacy features...');
        
        // Initialize each feature module safely
        const initPromises = [];
        
        // Only call init() if it exists for each feature
        if (this.features.fingerprintRandomization && typeof this.features.fingerprintRandomization.init === 'function') {
            initPromises.push(this.features.fingerprintRandomization.init());
        }
        
        if (this.features.httpsUpgradeChecker && typeof this.features.httpsUpgradeChecker.init === 'function') {
            initPromises.push(this.features.httpsUpgradeChecker.init());
        }
        
        if (this.features.dnsPrivacyChecker && typeof this.features.dnsPrivacyChecker.init === 'function') {
            initPromises.push(this.features.dnsPrivacyChecker.init());
        }
        
        if (this.features.trackerBlocker && typeof this.features.trackerBlocker.init === 'function') {
            initPromises.push(this.features.trackerBlocker.init());
        }
        
        if (this.features.cookieManager && typeof this.features.cookieManager.init === 'function') {
            initPromises.push(this.features.cookieManager.init());
        }
        
        if (this.features.socialMediaDetector && typeof this.features.socialMediaDetector.init === 'function') {
            initPromises.push(this.features.socialMediaDetector.init());
        }
        
        if (this.features.vpnAssessor && typeof this.features.vpnAssessor.init === 'function') {
            initPromises.push(this.features.vpnAssessor.init());
        }
        
        if (this.features.websocketLeakDetector && typeof this.features.websocketLeakDetector.init === 'function') {
            initPromises.push(this.features.websocketLeakDetector.init());
        }
        
        // Wait for all features to initialize
        await Promise.all(initPromises);
        
        // Initialize anonymity timeline with current score if available
        if (this.features.anonymityTimeline && typeof this.features.anonymityTimeline.init === 'function') {
            await this.features.anonymityTimeline.init(anonymityScore);
        }
        
        // Collect results from all features
        this.collectResults();
        
        // Calculate overall score
        this.calculateOverallScore();
        
        // Collect top recommendations
        this.collectTopRecommendations();
        
        this.initialized = true;
        this.results.allTested = true;
        
        console.log('Privacy features initialized');
    }
    
    /**
     * Collect results from all feature modules
     */
    collectResults() {
        for (const [name, feature] of Object.entries(this.features)) {
            // Only call getResults() if it exists
            if (feature && typeof feature.getResults === 'function') {
                this.results.featureResults[name] = feature.getResults();
            } else {
                // Use a default empty results object
                this.results.featureResults[name] = {
                    tested: false,
                    recommendations: []
                };
            }
        }
    }
    
    /**
     * Calculate overall privacy score based on all feature results
     */
    calculateOverallScore() {
        // Weight factors for each feature
        const weights = {
            fingerprintRandomization: 15,
            httpsUpgradeChecker: 10,
            dnsPrivacyChecker: 12,
            trackerBlocker: 15, 
            cookieManager: 10,
            socialMediaDetector: 8,
            vpnAssessor: 18,
            websocketLeakDetector: 8,
            anonymityTimeline: 4
        };
        
        let totalScore = 0;
        let totalWeight = 0;
        
        // Calculate weighted score for each feature
        for (const [name, feature] of Object.entries(this.features)) {
            // Get results safely
            let results = {tested: false};
            
            // Only try to get results if the feature and method exist
            if (feature && typeof feature.getResults === 'function') {
                try {
                    results = feature.getResults();
                } catch (e) {
                    console.warn(`Failed to get results for ${name}:`, e);
                }
            }
            
            let featureScore = 0;
            
            // Only process results if the feature was tested
            if (results.tested) {
                switch (name) {
                    case 'fingerprintRandomization':
                        featureScore = results.currentlyRandomized ? 100 : 0;
                        break;
                        
                    case 'httpsUpgradeChecker':
                        featureScore = results.secureConnection ? 80 : 0;
                        if (results.hstsEnabled) featureScore += 20;
                        break;
                        
                    case 'dnsPrivacyChecker':
                        featureScore = results.usingEncryptedDNS ? 80 : 0;
                        if (!results.dnsRebindingVulnerable) featureScore += 20;
                        break;
                        
                    case 'trackerBlocker':
                        featureScore = results.blockingActive ? 60 : 0;
                        featureScore += Math.min(40, results.blockingEffectiveness || 0);
                        break;
                        
                    case 'cookieManager':
                        if (results.cookieConsentQuality === 'good') featureScore = 100;
                        else if (results.cookieConsentQuality === 'partial') featureScore = 60;
                        else if (results.cookieConsentQuality === 'poor') featureScore = 30;
                        else featureScore = 0;
                        break;
                        
                    case 'socialMediaDetector':
                        featureScore = results.connectionsBlocked ? 100 : 
                                     (!results.socialPlatformsDetected || results.socialPlatformsDetected.length === 0) ? 100 : 
                                     Math.max(0, 100 - (results.socialPlatformsDetected.length * 20));
                        break;
                        
                    case 'vpnAssessor':
                        featureScore = results.vpnQualityScore || 0;
                        if (!results.usingVPN && !results.usingProxy && !results.usingTor) {
                            featureScore = 40; // Base score for not using VPN
                        }
                        break;
                        
                    case 'websocketLeakDetector':
                        featureScore = !results.leakDetected ? 100 : 0;
                        if (!results.bypassesProxy) featureScore += 30;
                        break;
                        
                    case 'anonymityTimeline':
                        featureScore = results.trend === 'improving' ? 100 : 
                                     results.trend === 'stable' ? 70 : 50;
                        break;
                    
                    default:
                        featureScore = 50; // Default middle score
                }
            } else {
                // If the feature wasn't tested, give a neutral score
                featureScore = 50;
            }
            
            totalScore += featureScore * weights[name];
            totalWeight += weights[name];
        }
        
        // Calculate weighted average
        this.results.overallScore = Math.round(totalWeight > 0 ? totalScore / totalWeight : 0);
        
        // Determine risk level
        if (this.results.overallScore >= 80) {
            this.results.riskLevel = 'low';
        } else if (this.results.overallScore >= 50) {
            this.results.riskLevel = 'medium';
        } else {
            this.results.riskLevel = 'high';
        }
    }
    
    /**
     * Collect top recommendations from all features
     */
    collectTopRecommendations() {
        const allRecommendations = [];
        
        // Collect recommendations from all features
        for (const [name, feature] of Object.entries(this.features)) {
            // Only try to get results if the feature and method exist
            if (feature && typeof feature.getResults === 'function') {
                try {
                    const results = feature.getResults();
                    
                    if (results && results.recommendations && Array.isArray(results.recommendations) && results.recommendations.length > 0) {
                        // Add feature name to each recommendation
                        const featRecommendations = results.recommendations.map(rec => ({
                            ...rec,
                            feature: name
                        }));
                        
                        allRecommendations.push(...featRecommendations);
                    }
                } catch (e) {
                    console.warn(`Failed to get recommendations for ${name}:`, e);
                }
            }
        }
        
        // Sort by priority (high, medium, low)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        allRecommendations.sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        // Take the top 5 recommendations
        this.results.priorityRecommendations = allRecommendations.slice(0, 5);
    }
    
    /**
     * Get the feature results
     */
    getResults() {
        return this.results;
    }
    
    /**
     * Get a specific feature by name
     */
    getFeature(name) {
        return this.features[name] || null;
    }
    
    /**
     * Get all feature instances
     */
    getAllFeatures() {
        return this.features;
    }
}

// Create instance and add to global namespace
window.privacyFeatures = new PrivacyFeatures();