/**
 * Cookie Consent Manager
 * Analyzes and helps manage cookies for privacy
 */
class CookieManager {
    constructor() {
        this.initialized = false;
        this.results = {
            tested: false,
            cookiesFound: 0,
            cookiesByType: {
                necessary: [],
                preference: [],
                analytics: [],
                marketing: [],
                unclassified: []
            },
            thirdPartyCookies: [],
            longLivedCookies: [],
            tracingCookies: [],
            cookieConsentActive: false,
            cookieConsentQuality: 'unknown', // 'good', 'partial', 'poor'
            supercookiesDetected: false,
            recommendations: []
        };
    }
    
    /**
     * Initialize the cookie manager
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Analyze all cookies
        this.analyzeCookies();
        
        // Check for cookie consent implementation
        this.checkCookieConsent();
        
        // Check for supercookies and alternative tracking methods
        this.checkSupercookies();
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Analyze all cookies in the browser
     */
    analyzeCookies() {
        // Get all cookies as a string
        const cookieString = document.cookie;
        
        // Parse cookies into array
        const cookies = cookieString.split(';').map(cookie => {
            const parts = cookie.trim().split('=');
            return {
                name: parts[0],
                value: parts.slice(1).join('='),
                domain: this.guessCookieDomain(parts[0]),
                expiry: this.guessCookieExpiry(parts[0]),
                type: this.guessCookieType(parts[0])
            };
        });
        
        // Update results
        this.results.cookiesFound = cookies.length;
        
        // Categorize cookies
        cookies.forEach(cookie => {
            // Add to type category
            if (cookie.type in this.results.cookiesByType) {
                this.results.cookiesByType[cookie.type].push(cookie);
            } else {
                this.results.cookiesByType.unclassified.push(cookie);
            }
            
            // Check if third-party cookie
            if (this.isThirdPartyCookie(cookie)) {
                this.results.thirdPartyCookies.push(cookie);
            }
            
            // Check if long-lived cookie (over 1 month)
            if (cookie.expiry && cookie.expiry > 30) {
                this.results.longLivedCookies.push(cookie);
            }
            
            // Check if it's a known tracking cookie
            if (this.isTrackingCookie(cookie)) {
                this.results.tracingCookies.push(cookie);
            }
        });
    }
    
    /**
     * Guess the domain of a cookie based on its name
     */
    guessCookieDomain(name) {
        // This is a heuristic, as we can't directly see the domain of a cookie from JS
        // We'll make educated guesses based on cookie naming conventions
        
        const currentDomain = window.location.hostname;
        
        // Common third-party cookie prefixes
        const thirdPartyPrefixes = {
            '_ga': 'google-analytics.com',
            '_gid': 'google-analytics.com',
            '_fbp': 'facebook.com',
            '_pin_': 'pinterest.com',
            '__utm': 'google-analytics.com',
            'AWSALB': 'amazonaws.com',
            'IDE': 'doubleclick.net',
            'fr': 'facebook.com',
            'NID': 'google.com',
            'PREF': 'youtube.com',
            'APISID': 'google.com',
            'SSID': 'google.com',
            'SID': 'google.com',
            'CONSENT': 'google.com',
            'VISITOR_INFO1_LIVE': 'youtube.com',
            'YSC': 'youtube.com',
            'UID': 'scorecardresearch.com',
            'JSESSIONID': 'various'
        };
        
        // Check if cookie matches known patterns
        for (const prefix in thirdPartyPrefixes) {
            if (name.startsWith(prefix)) {
                return thirdPartyPrefixes[prefix];
            }
        }
        
        // Default to current domain
        return currentDomain;
    }
    
    /**
     * Guess cookie expiry based on known patterns
     * Returns estimated days until expiry, or null if unknown
     */
    guessCookieExpiry(name) {
        // Common cookie expiration patterns
        const expiryPatterns = {
            '_ga': 730, // Google Analytics - typically 2 years
            '_gid': 1, // Google Analytics - typically 24 hours
            '_fbp': 90, // Facebook Pixel - typically 3 months
            '_pin_': 90, // Pinterest - typically 3 months
            'AWSALB': 7, // AWS load balancer - typically 7 days
            'IDE': 390, // DoubleClick - typically 13 months
            'fr': 90, // Facebook - typically 3 months
            'NID': 180, // Google - typically 6 months
            'CONSENT': 7300, // Google consent - typically 20 years
            'VISITOR_INFO1_LIVE': 180, // YouTube - typically 6 months
            'YSC': 0, // YouTube - session cookie
            'JSESSIONID': 0 // Various - session cookie
        };
        
        // Check if cookie matches known patterns
        for (const prefix in expiryPatterns) {
            if (name.startsWith(prefix)) {
                return expiryPatterns[prefix];
            }
        }
        
        // Default to unknown
        return null;
    }
    
    /**
     * Guess cookie type based on name
     */
    guessCookieType(name) {
        // Cookie categories:
        // - necessary: Required for the website to function
        // - preference: Store user preferences
        // - analytics: Track user behavior for analytics
        // - marketing: Track user behavior for advertising
        
        // Necessary cookies
        if (name.match(/^(JSESSIONID|PHPSESSID|ASP\.NET_SessionId|SESS\w*|session|csrf|XSRF-TOKEN|__Host-)/) || 
            name === 'cookieConsent' || 
            name === 'gdpr' || 
            name === 'cc_cookie' ||
            name === 'CookieConsent' ||
            name.includes('session') ||
            name.includes('auth') ||
            name.includes('login')) {
            return 'necessary';
        }
        
        // Preference cookies
        if (name.match(/^(theme|layout|display|font|accessibility|language|country|currency|pref|display)/) ||
            name.includes('consent') ||
            name.includes('cookie') ||
            name.includes('pref')) {
            return 'preference';
        }
        
        // Analytics cookies
        if (name.match(/^(_ga|_gid|_gat|__utm\w+|_pk_|_hjSession|_hjid|_hjFirstSeen|AMP_TOKEN)/) ||
            name.includes('analytics') ||
            name.includes('stats') ||
            name.includes('visitor') ||
            name.includes('monitor')) {
            return 'analytics';
        }
        
        // Marketing cookies
        if (name.match(/^(_fbp|fr|_pin_|IDE|MUID|ANID|DSID|__gads|tuuid|uid|_gcl_|_kuid_|__qca)/) ||
            name.includes('advert') ||
            name.includes('tracking') ||
            name.includes('targeting') ||
            name.includes('campaign') ||
            name.includes('visitor')) {
            return 'marketing';
        }
        
        // Default to unclassified
        return 'unclassified';
    }
    
    /**
     * Check if a cookie is from a third-party
     */
    isThirdPartyCookie(cookie) {
        const currentDomain = window.location.hostname;
        
        // If domain doesn't match current domain, it's third-party
        return cookie.domain !== currentDomain && 
               !cookie.domain.endsWith('.' + currentDomain) && 
               !currentDomain.endsWith('.' + cookie.domain);
    }
    
    /**
     * Check if a cookie is a known tracking cookie
     */
    isTrackingCookie(cookie) {
        // Known tracking cookie patterns
        const trackingPatterns = [
            /^_ga/,
            /^_gid/,
            /^_fbp/,
            /^_pin_/,
            /^IDE/,
            /^fr/,
            /^__utm/,
            /^_gcl_/,
            /^_kuid_/,
            /^uid/,
            /^tuuid/,
            /^visitor_id/,
            /^personalization_id/,
            /^DSID/,
            /^ANID/,
            /^MUID/
        ];
        
        return trackingPatterns.some(pattern => pattern.test(cookie.name)) ||
               cookie.name.includes('track') ||
               cookie.name.includes('target') ||
               cookie.type === 'marketing';
    }
    
    /**
     * Check for cookie consent implementation
     */
    checkCookieConsent() {
        // Check for common cookie consent implementations
        const consentElements = [
            'CookieConsent',
            'cookie-consent',
            'cookie-banner',
            'cookie-notice',
            'cookie-law-info',
            'cookie-info',
            'gdpr',
            'gdpr-consent',
            'consent-manager',
            'consent-popup',
            'onetrust-consent',
            'privacy-consent',
            'cc-window',
            'cookieconsent'
        ];
        
        let consentFound = false;
        
        // Check for elements with these IDs or classes
        for (const name of consentElements) {
            if (document.getElementById(name) || document.getElementsByClassName(name).length > 0) {
                consentFound = true;
                break;
            }
        }
        
        // Check for common cookie consent cookies
        const consentCookies = [
            'cookieConsent',
            'CookieConsent',
            'cookie_notice_accepted',
            'cookies_accepted',
            'cookies_policy',
            'cc_cookie',
            'cc_cookie_accept',
            'gdpr',
            'gdpr-accepted',
            'euconsent',
            'eupubconsent',
            'OptanonConsent',
            'OptanonAlertBoxClosed'
        ];
        
        const cookieString = document.cookie;
        
        for (const name of consentCookies) {
            if (cookieString.includes(name + '=')) {
                consentFound = true;
                break;
            }
        }
        
        // Evaluate quality of cookie consent if found
        if (consentFound) {
            this.results.cookieConsentActive = true;
            
            // Check for reject all option
            const rejectAllPresent = this.checkForRejectAll();
            
            // Check for granular controls
            const granularControlsPresent = this.checkForGranularControls();
            
            // Determine consent quality
            if (rejectAllPresent && granularControlsPresent) {
                this.results.cookieConsentQuality = 'good';
            } else if (rejectAllPresent || granularControlsPresent) {
                this.results.cookieConsentQuality = 'partial';
            } else {
                this.results.cookieConsentQuality = 'poor';
            }
        } else {
            this.results.cookieConsentActive = false;
            this.results.cookieConsentQuality = 'none';
        }
    }
    
    /**
     * Check if cookie consent has a reject all option
     */
    checkForRejectAll() {
        // Look for elements with text suggesting reject all option
        const rejectAllTexts = [
            'reject all',
            'decline all',
            'refuse all',
            'reject cookies',
            'decline cookies',
            'only necessary',
            'necessary only',
            'essential only'
        ];
        
        const pageText = document.body.innerText.toLowerCase();
        
        for (const text of rejectAllTexts) {
            if (pageText.includes(text)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if cookie consent has granular controls
     */
    checkForGranularControls() {
        // Look for elements with text suggesting granular controls
        const granularTexts = [
            'cookie settings',
            'customize',
            'preferences',
            'manage cookies',
            'cookie preferences',
            'manage consent',
            'preference center',
            'manage my cookies'
        ];
        
        const pageText = document.body.innerText.toLowerCase();
        
        for (const text of granularTexts) {
            if (pageText.includes(text)) {
                return true;
            }
        }
        
        // Look for checkboxes in potential consent elements
        const consentContainers = [
            'CookieConsent',
            'cookie-consent',
            'cookie-banner',
            'cookie-notice',
            'gdpr',
            'gdpr-consent',
            'consent-manager',
            'cc-window'
        ];
        
        for (const container of consentContainers) {
            const element = document.getElementById(container) || 
                            document.getElementsByClassName(container)[0];
            
            if (element && element.querySelectorAll('input[type="checkbox"]').length > 0) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for supercookies and alternative tracking methods
     */
    checkSupercookies() {
        // Check for localStorage
        const localStorageItems = Object.keys(localStorage).length;
        
        // Check for sessionStorage
        const sessionStorageItems = Object.keys(sessionStorage).length;
        
        // Check for IndexedDB (presence only)
        const indexedDBPresent = 'indexedDB' in window;
        
        // Check for service workers
        const serviceWorkersPresent = 'serviceWorker' in navigator;
        
        // Check for common supercookie techniques
        const supercookieDetected = this.checkForEtagTracking() || 
                                   this.checkForCacheTracking() || 
                                   this.checkForFontFingerprinting();
        
        this.results.supercookiesDetected = supercookieDetected;
        
        // Store detailed information
        this.results.alternativeStorage = {
            localStorage: {
                present: localStorageItems > 0,
                itemCount: localStorageItems
            },
            sessionStorage: {
                present: sessionStorageItems > 0,
                itemCount: sessionStorageItems
            },
            indexedDB: {
                present: indexedDBPresent
            },
            serviceWorkers: {
                present: serviceWorkersPresent
            },
            supercookieTechniques: {
                etagTracking: this.checkForEtagTracking(),
                cacheTracking: this.checkForCacheTracking(),
                fontFingerprinting: this.checkForFontFingerprinting()
            }
        };
    }
    
    /**
     * Check for ETag tracking (browser cache tracking)
     */
    checkForEtagTracking() {
        // This is a heuristic as we can't directly check for ETags from JavaScript
        // We'll look for suspicious image loading patterns that might indicate ETag tracking
        
        const images = document.querySelectorAll('img[src]');
        let suspiciousCount = 0;
        
        for (const img of images) {
            const src = img.src;
            
            // Check for tracking pixels or suspicious URL patterns
            if ((img.width <= 1 && img.height <= 1) ||
                src.includes('track') ||
                src.includes('beacon') ||
                src.includes('pixel') ||
                src.includes('visitor') ||
                src.includes('uid=') ||
                src.includes('sid=')) {
                suspiciousCount++;
            }
        }
        
        return suspiciousCount > 0;
    }
    
    /**
     * Check for cache tracking
     */
    checkForCacheTracking() {
        // Look for service workers, which can be used for cache-based tracking
        return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    }
    
    /**
     * Check for font fingerprinting
     */
    checkForFontFingerprinting() {
        // Font fingerprinting requires measuring text, so we look for canvas elements
        const canvases = document.querySelectorAll('canvas');
        
        let suspiciousFontOperations = false;
        
        // If there are many canvases, it's suspicious
        if (canvases.length > 3) {
            suspiciousFontOperations = true;
        }
        
        // Check for direct font enumeration
        try {
            if (document.fonts && typeof document.fonts.check === 'function') {
                // List of fonts we'll check for
                const commonFonts = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];
                let detectedFonts = 0;
                
                for (const font of commonFonts) {
                    if (document.fonts.check(`12px "${font}"`)) {
                        detectedFonts++;
                    }
                }
                
                // If most fonts are checked, it might be for fingerprinting
                if (detectedFonts >= 3) {
                    suspiciousFontOperations = true;
                }
            }
        } catch (e) {
            // Error checking fonts
        }
        
        return suspiciousFontOperations;
    }
    
    /**
     * Prepare recommendations based on detected issues
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (this.results.thirdPartyCookies.length > 0) {
            recommendations.push({
                title: "Block third-party cookies",
                description: "Third-party cookies are often used for cross-site tracking of your browsing habits.",
                priority: "high",
                implementation: "Go to your browser's privacy settings and enable 'Block third-party cookies'. In Chrome: Settings > Privacy and security > Cookies > 'Block third-party cookies'. In Firefox: Settings > Privacy & Security > Enhanced Tracking Protection > Custom > Check 'Cookies: Third-party trackers'."
            });
        }
        
        if (this.results.cookiesByType.marketing.length > 0) {
            recommendations.push({
                title: "Reject marketing cookies",
                description: "Marketing cookies track your browsing habits for targeted advertising.",
                priority: "high",
                implementation: "When you see a cookie consent banner, click 'Reject all' or 'Necessary only'. If you've already accepted, clear your browser's cookies and visit the site again, or look for a 'Cookie settings' link in the site's footer."
            });
        }
        
        if (this.results.cookieConsentQuality === 'poor' || this.results.cookieConsentQuality === 'none') {
            recommendations.push({
                title: "Use a cookie consent manager extension",
                description: "Automatically handle cookie consent prompts with your preferences.",
                priority: "medium",
                implementation: "Install extensions like 'I don't care about cookies', 'Consent-O-Matic', or 'Cookie AutoDelete' from your browser's extension store to automatically handle cookie consent prompts."
            });
        }
        
        if (this.results.supercookiesDetected) {
            recommendations.push({
                title: "Protect against supercookies",
                description: "Supercookies use advanced techniques to track you even when regular cookies are blocked.",
                priority: "high",
                implementation: "Use Firefox with the strict Enhanced Tracking Protection enabled, or install the 'Privacy Badger' extension which learns to block supercookies and other trackers as you browse."
            });
        }
        
        if (this.results.longLivedCookies.length > 0) {
            recommendations.push({
                title: "Regularly clear cookies",
                description: "Some cookies on this site are set to last for months or years, allowing long-term tracking.",
                priority: "medium",
                implementation: "Set your browser to clear cookies when you close it, or use the 'Cookie AutoDelete' extension to automatically remove cookies when you leave a site."
            });
        }
        
        // General recommendations
        recommendations.push({
            title: "Use a privacy-focused browser profile",
            description: "Separate your browsing activities to minimize tracking across different contexts.",
            priority: "medium",
            implementation: "Create different browser profiles for different activities, like one for shopping, one for social media, and one for banking. In Firefox: Menu > New Private Window. In Chrome: Profile icon > Add > Create a new profile."
        });
        
        this.results.recommendations = recommendations;
    }
    
    /**
     * Get the test results
     */
    getResults() {
        return this.results;
    }
}

// Create and add to global namespace
window.cookieManager = new CookieManager();