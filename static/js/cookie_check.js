/**
 * Cookie Tracking Check Script
 * Detects and analyzes cookies that could be tracking user activity
 */
class CookieTrackingDetector {
    constructor() {
        // Known tracking cookie prefixes and sources
        this.knownTrackingCookies = {
            '_ga': 'Google Analytics',
            '_gid': 'Google Analytics',
            '_fbp': 'Facebook',
            '_hjid': 'Hotjar',
            '_hjFirstSeen': 'Hotjar',
            '_pk_id': 'Matomo',
            '_pk_ses': 'Matomo',
            'ajs_': 'Segment',
            'amplitude': 'Amplitude',
            'intercom': 'Intercom',
            'hubspotutk': 'HubSpot',
            '__hstc': 'HubSpot',
            '__hssc': 'HubSpot',
            'SESSIONID': 'Various Trackers',
            'sid': 'Various Trackers',
            'VISITOR_INFO': 'YouTube',
            'NID': 'Google',
            '__cfduid': 'Cloudflare'
        };
    }

    /**
     * Check for tracking cookies in the browser
     * @returns {Object} Results of the cookie check
     */
    async detectTrackingCookies() {
        try {
            // Parse document cookies
            const cookies = this.parseCookies();
            const cookieCount = Object.keys(cookies).length;
            
            // Identify tracking cookies
            const trackingCookies = [];
            for (const [name, value] of Object.entries(cookies)) {
                const source = this.identifyCookieType(name);
                if (source !== 'Unknown') {
                    trackingCookies.push({
                        name: name,
                        value: this.truncateCookieValue(value),
                        source: source
                    });
                }
            }

            // Check if third-party cookies are enabled
            const thirdPartyCookiesEnabled = await this.checkThirdPartyCookieSupport();

            return {
                tested: true,
                trackingCookiesFound: trackingCookies.length > 0,
                cookieCount: cookieCount,
                trackingCookies: trackingCookies,
                thirdPartyCookiesEnabled: thirdPartyCookiesEnabled
            };
        } catch (error) {
            console.error('Error detecting cookie tracking:', error);
            return {
                tested: true,
                trackingCookiesFound: false,
                cookieCount: 0,
                trackingCookies: [],
                thirdPartyCookiesEnabled: false,
                error: error.message
            };
        }
    }

    /**
     * Parse document.cookie into an object
     * @returns {Object} Parsed cookies
     */
    parseCookies() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            if (cookie.trim()) {
                const parts = cookie.trim().split('=');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    // Join with = in case the value itself contains = signs
                    const value = parts.slice(1).join('=');
                    cookies[name] = value;
                }
            }
        });
        return cookies;
    }

    /**
     * Identify the type/source of the tracking cookie
     * @param {string} cookieName - The name of the cookie
     * @returns {string} The identified type or 'Unknown'
     */
    identifyCookieType(cookieName) {
        for (const [prefix, source] of Object.entries(this.knownTrackingCookies)) {
            if (cookieName.startsWith(prefix)) {
                return source;
            }
        }
        
        // Additional heuristics for identifying tracking cookies
        if (
            cookieName.includes('track') || 
            cookieName.includes('sess') || 
            cookieName.includes('visitor') ||
            cookieName.includes('uid') ||
            cookieName.includes('analytics') ||
            cookieName.includes('pixel')
        ) {
            return 'Potential Tracker';
        }
        
        return 'Unknown';
    }

    /**
     * Truncate long cookie values for display
     * @param {string} value - The cookie value
     * @returns {string} Truncated value
     */
    truncateCookieValue(value) {
        return value.length > 25 ? value.substring(0, 22) + '...' : value;
    }

    /**
     * Check if browser supports third-party cookies
     * This is a simplified check - real implementations would be more complex
     * @returns {Promise<boolean>} Whether third-party cookies appear to be supported
     */
    async checkThirdPartyCookieSupport() {
        return new Promise(resolve => {
            // For simplicity, we'll just check based on the browser
            const userAgent = navigator.userAgent.toLowerCase();
            
            // Safari has third-party cookies disabled by default in recent versions
            const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
            
            // Firefox has enhanced tracking protection that blocks some third-party cookies
            const isFirefox = userAgent.includes('firefox');
            
            // Brave has shields that block third-party cookies by default
            const isBrave = userAgent.includes('brave');
            
            // Simplistic check - in a real implementation, this would be more accurate
            // with an actual test of setting a cookie from another domain
            if (isSafari || isFirefox || isBrave) {
                // These browsers likely have some third-party cookie blocking
                resolve(false);
            } else {
                // Other browsers likely have third-party cookies enabled by default
                resolve(true);
            }
        });
    }
}