/**
 * Privacy Extensions Analyzer
 * Analyzes browser extensions and their impact on privacy and authenticity
 */
class PrivacyExtensionsAnalyzer {
    constructor() {
        this.extensionsDetected = [];
        this.possibleExtensions = [];
        this.extensionPrivacyImpact = 0;
        this.extensionAuthenticityImpact = 0;
        this.extensionCompatibilityImpact = 0;
        this.recommendations = [];
        
        // Known privacy extension signatures
        this.knownExtensions = {
            'uBlock Origin': { 
                privacyImpact: 15, 
                authenticityImpact: -5,
                compatibilityImpact: -2,
                detection: () => typeof window.uBlock0 !== 'undefined' || 
                               document.querySelector('html.ua-ublock-origin') !== null
            },
            'Adblock Plus': { 
                privacyImpact: 10, 
                authenticityImpact: -5,
                compatibilityImpact: -2,
                detection: () => typeof window.ABP !== 'undefined' || 
                               typeof window.adblockplus !== 'undefined'
            },
            'Privacy Badger': { 
                privacyImpact: 20, 
                authenticityImpact: -10,
                compatibilityImpact: -5,
                detection: () => typeof window.PRIVACY_BADGER_ROLLOUT_STATUS !== 'undefined'
            },
            'HTTPS Everywhere': { 
                privacyImpact: 8, 
                authenticityImpact: -3,
                compatibilityImpact: -1,
                detection: () => document.querySelector('link[href*="chrome-extension://gcbommkclmclpchllfjekcdonpmejbdp"]') !== null
            },
            'NoScript': { 
                privacyImpact: 25, 
                authenticityImpact: -20,
                compatibilityImpact: -15,
                detection: () => typeof window.__noscriptStorage !== 'undefined' ||
                               document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null
            },
            'Ghostery': { 
                privacyImpact: 12, 
                authenticityImpact: -8,
                compatibilityImpact: -3,
                detection: () => typeof window.Ghostery !== 'undefined'
            },
            'Disconnect': { 
                privacyImpact: 10, 
                authenticityImpact: -5,
                compatibilityImpact: -2,
                detection: () => typeof window.DISCONNECT !== 'undefined'
            },
            'Canvas Blocker': { 
                privacyImpact: 18, 
                authenticityImpact: -25,
                compatibilityImpact: -10,
                detection: () => {
                    // Test if canvas fingerprinting is blocked
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.textBaseline = "top";
                    ctx.font = "14px Arial";
                    ctx.fillText("fingerprint test", 0, 0);
                    
                    const fp1 = canvas.toDataURL();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillText("fingerprint test", 0, 0);
                    const fp2 = canvas.toDataURL();
                    
                    // If the fingerprints are different for the same content, 
                    // a canvas blocker is likely active
                    return fp1 !== fp2;
                }
            },
            'User-Agent Switcher': { 
                privacyImpact: 5, 
                authenticityImpact: -15,
                compatibilityImpact: -5,
                detection: () => {
                    // Look for inconsistencies in navigator and user agent
                    const ua = navigator.userAgent;
                    if (ua.includes('Firefox') && typeof InstallTrigger === 'undefined') {
                        return true;
                    }
                    if (ua.includes('Chrome') && typeof window.chrome === 'undefined') {
                        return true;
                    }
                    return false;
                }
            },
            'Cookie AutoDelete': { 
                privacyImpact: 10, 
                authenticityImpact: -5,
                compatibilityImpact: -10,
                detection: () => {
                    // Try to set and immediately check a cookie
                    const testName = `test_${Date.now()}`;
                    document.cookie = `${testName}=1; path=/`;
                    // If cookie disappears immediately, Cookie AutoDelete might be active
                    return !document.cookie.includes(testName);
                }
            }
        };
    }

    /**
     * Analyze privacy extensions and their impact
     * @returns {Object} Results of the privacy extensions analysis
     */
    async analyzePrivacyExtensions() {
        try {
            // Detect installed privacy extensions
            this.detectExtensions();
            
            // For extensions we couldn't definitively detect,
            // add likely possibilities based on behavior
            this.inferPossibleExtensions();
            
            // Calculate impact scores
            this.calculateImpactScores();
            
            // Generate recommendations
            this.generateRecommendations();
            
            return {
                tested: true,
                extensions_detected: this.extensionsDetected,
                possible_extensions: this.possibleExtensions,
                extension_privacy_impact: this.extensionPrivacyImpact,
                extension_authenticity_impact: this.extensionAuthenticityImpact,
                extension_compatibility_impact: this.extensionCompatibilityImpact,
                extension_recommendations: this.recommendations
            };
        } catch (error) {
            console.error("Error in privacy extensions analysis:", error);
            return {
                tested: false,
                error: error.message
            };
        }
    }

    /**
     * Detect known privacy extensions
     */
    detectExtensions() {
        // Iterate through known extensions and check if they're installed
        for (const [extensionName, extensionInfo] of Object.entries(this.knownExtensions)) {
            try {
                if (extensionInfo.detection()) {
                    this.extensionsDetected.push({
                        name: extensionName,
                        privacy_impact: extensionInfo.privacyImpact,
                        authenticity_impact: extensionInfo.authenticityImpact,
                        compatibility_impact: extensionInfo.compatibilityImpact
                    });
                }
            } catch (error) {
                console.error(`Error detecting ${extensionName}:`, error);
            }
        }
    }

    /**
     * Infer possible extensions based on browser behavior
     */
    inferPossibleExtensions() {
        // Check for content blocking behavior
        this.checkContentBlocking();
        
        // Check for fingerprinting protection
        this.checkFingerprintingProtection();
        
        // Check for referrer blocking
        this.checkReferrerBlocking();
    }

    /**
     * Check for content blocking behavior
     */
    checkContentBlocking() {
        // This is a simplified check - in a real implementation
        // we'd test loading known ad URLs or trackers
        
        // If we haven't definitively detected an ad blocker but
        // see signs of content blocking
        if (!this.extensionsDetected.some(ext => 
            ext.name === 'uBlock Origin' || 
            ext.name === 'Adblock Plus')) {
            
            // Check for common ad blocker div hiding
            const testDiv = document.createElement('div');
            testDiv.className = 'ad-unit adsbox banner-ad';
            testDiv.style.height = '1px';
            testDiv.style.width = '1px';
            testDiv.style.position = 'absolute';
            testDiv.style.top = '-10000px';
            document.body.appendChild(testDiv);
            
            // Wait briefly for potential blockers to act
            setTimeout(() => {
                // If div was hidden, likely an ad blocker
                if (testDiv.offsetHeight === 0) {
                    this.possibleExtensions.push({
                        name: "Ad Blocker (unknown)",
                        privacy_impact: 10,
                        authenticity_impact: -5,
                        compatibility_impact: -2
                    });
                }
                
                // Clean up test div
                if (testDiv.parentNode) {
                    testDiv.parentNode.removeChild(testDiv);
                }
            }, 100);
        }
    }

    /**
     * Check for fingerprinting protection
     */
    checkFingerprintingProtection() {
        // If we haven't definitively detected a fingerprint blocker
        if (!this.extensionsDetected.some(ext => ext.name === 'Canvas Blocker')) {
            try {
                // Test canvas fingerprinting
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Draw something to the canvas
                    ctx.textBaseline = "top";
                    ctx.font = "14px Arial";
                    ctx.fillStyle = "#f60";
                    ctx.fillRect(10, 10, 100, 30);
                    ctx.fillStyle = "#069";
                    ctx.fillText("test", 15, 15);
                    
                    // Try to read the canvas data
                    try {
                        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        
                        // If we get all zeros or a blank canvas when we shouldn't,
                        // likely fingerprinting protection
                        let allZero = true;
                        for (let i = 0; i < 50; i++) {
                            if (imgData.data[i] !== 0) {
                                allZero = false;
                                break;
                            }
                        }
                        
                        if (allZero) {
                            this.possibleExtensions.push({
                                name: "Fingerprinting Protection (unknown)",
                                privacy_impact: 15,
                                authenticity_impact: -20,
                                compatibility_impact: -8
                            });
                        }
                    } catch (e) {
                        // Error reading canvas data - could indicate protection
                        this.possibleExtensions.push({
                            name: "Fingerprinting Protection (unknown)",
                            privacy_impact: 15,
                            authenticity_impact: -20,
                            compatibility_impact: -8
                        });
                    }
                }
            } catch (e) {
                // Canvas creation/manipulation error
                console.error("Error testing canvas fingerprinting:", e);
            }
        }
    }

    /**
     * Check for referrer blocking
     */
    checkReferrerBlocking() {
        // Not directly testable in client-side JS, but we can check meta tags
        const referrerMeta = document.querySelector('meta[name="referrer"]');
        if (referrerMeta && 
            ['no-referrer', 'same-origin', 'origin'].includes(referrerMeta.getAttribute('content'))) {
            
            // If we haven't already detected an extension that blocks referrers
            if (!this.extensionsDetected.some(ext => 
                ext.name === 'Privacy Badger' || 
                ext.name === 'HTTPS Everywhere')) {
                
                this.possibleExtensions.push({
                    name: "Referrer Blocker (unknown)",
                    privacy_impact: 8,
                    authenticity_impact: -5,
                    compatibility_impact: -2
                });
            }
        }
    }

    /**
     * Calculate impact scores for detected extensions
     */
    calculateImpactScores() {
        // Calculate privacy impact (positive means better privacy)
        this.extensionPrivacyImpact = this.extensionsDetected.reduce(
            (sum, ext) => sum + ext.privacy_impact, 0
        );
        
        // Add possible extensions with reduced certainty
        this.extensionPrivacyImpact += this.possibleExtensions.reduce(
            (sum, ext) => sum + (ext.privacy_impact * 0.5), 0
        );
        
        // Cap at 100
        this.extensionPrivacyImpact = Math.min(100, this.extensionPrivacyImpact);
        
        // Calculate authenticity impact (negative means less authentic looking)
        this.extensionAuthenticityImpact = this.extensionsDetected.reduce(
            (sum, ext) => sum + ext.authenticity_impact, 0
        );
        
        // Add possible extensions with reduced certainty
        this.extensionAuthenticityImpact += this.possibleExtensions.reduce(
            (sum, ext) => sum + (ext.authenticity_impact * 0.5), 0
        );
        
        // Scale to 0-100 range (negative is bad for authenticity)
        // -100 points would be 0, 0 points would be 50, +100 would be 100
        this.extensionAuthenticityImpact = Math.max(-100, Math.min(100, this.extensionAuthenticityImpact));
        this.extensionAuthenticityImpact = 50 + (this.extensionAuthenticityImpact / 2);
        
        // Calculate compatibility impact (negative means worse compatibility)
        this.extensionCompatibilityImpact = this.extensionsDetected.reduce(
            (sum, ext) => sum + ext.compatibility_impact, 0
        );
        
        // Add possible extensions with reduced certainty
        this.extensionCompatibilityImpact += this.possibleExtensions.reduce(
            (sum, ext) => sum + (ext.compatibility_impact * 0.5), 0
        );
        
        // Scale to 0-100 range (negative is bad for compatibility)
        this.extensionCompatibilityImpact = Math.max(-100, Math.min(100, this.extensionCompatibilityImpact));
        this.extensionCompatibilityImpact = 50 + (this.extensionCompatibilityImpact / 2);
    }

    /**
     * Generate recommendations based on extension analysis
     */
    generateRecommendations() {
        // If the user has many privacy extensions
        if (this.extensionsDetected.length >= 3) {
            this.recommendations.push({
                category: "authenticity",
                title: "Reduce Number of Privacy Extensions",
                description: "Using many privacy extensions makes your browser stand out and can be counterproductive. Consider using fewer, more comprehensive extensions.",
                priority: "medium"
            });
        }
        
        // If the user has extensions that significantly affect authenticity
        if (this.extensionAuthenticityImpact < 40) {
            this.recommendations.push({
                category: "authenticity",
                title: "Balance Privacy and Authenticity",
                description: "Your current extensions significantly affect how 'normal' your browser appears. Consider disabling some extensions on websites where appearing authentic is important.",
                priority: "high"
            });
            
            // Specific advice for the most problematic extensions
            const problematicExtensions = this.extensionsDetected
                .filter(ext => ext.authenticity_impact < -15)
                .sort((a, b) => a.authenticity_impact - b.authenticity_impact);
                
            if (problematicExtensions.length > 0) {
                const extensionNames = problematicExtensions
                    .slice(0, 2)
                    .map(ext => ext.name)
                    .join(" and ");
                    
                this.recommendations.push({
                    category: "authenticity",
                    title: `Consider Alternatives to ${extensionNames}`,
                    description: `These extensions significantly impact your browser fingerprint. Consider using more subtle alternatives or enabling them selectively.`,
                    priority: "high"
                });
            }
        }
        
        // If the user has extensions that affect website compatibility
        if (this.extensionCompatibilityImpact < 40) {
            this.recommendations.push({
                category: "authenticity",
                title: "Improve Website Compatibility",
                description: "Your extensions may break functionality on some websites. Consider using a separate browser profile with fewer extensions for sites that require full functionality.",
                priority: "medium"
            });
        }
        
        // If the user doesn't have much privacy protection
        if (this.extensionPrivacyImpact < 20) {
            this.recommendations.push({
                category: "privacy",
                title: "Add Basic Privacy Protection",
                description: "Your browser has minimal privacy protection from extensions. Consider adding a content blocker like uBlock Origin for basic protection with minimal website breakage.",
                priority: "high"
            });
        }
        
        // If no extensions detected but we inferred some
        if (this.extensionsDetected.length === 0 && this.possibleExtensions.length > 0) {
            this.recommendations.push({
                category: "security",
                title: "Check for Unknown Privacy Tools",
                description: "We detected privacy-enhancing behavior but couldn't identify specific extensions. This could be built-in browser protection or extensions we couldn't detect.",
                priority: "low"
            });
        }
    }
}