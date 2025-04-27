/**
 * HTTPS Upgrade Checker
 * Analyzes if connections can be forced to use HTTPS and security of certificates
 */
class HttpsUpgradeChecker {
    constructor() {
        this.initialized = false;
        this.results = {
            tested: false,
            secureConnection: false,
            forcedHttps: false,
            hstsEnabled: false,
            certificateStrength: 'unknown',
            tlsVersion: 'unknown',
            issues: [],
            recommendations: []
        };
    }
    
    /**
     * Initialize the HTTPS upgrade checker
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Check if current connection is secure
        this.checkSecureConnection();
        
        // Check for HSTS header
        await this.checkHSTS();
        
        // Check TLS version and certificate (can only be approximated on client side)
        this.checkTLSandCert();
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Check if the current connection is using HTTPS
     */
    checkSecureConnection() {
        // Check if the current page is loaded over HTTPS
        this.results.secureConnection = window.location.protocol === 'https:';
        
        if (!this.results.secureConnection) {
            this.results.issues.push({
                severity: 'high',
                description: 'Current connection is not using HTTPS'
            });
        }
    }
    
    /**
     * Check for HSTS (HTTP Strict Transport Security) header
     */
    async checkHSTS() {
        try {
            // Try to detect HSTS by making a fetch request and checking the headers
            // Note: This is an approximation as we can't directly inspect response headers from different origin
            // due to CORS restrictions
            
            // Check if we're already on HTTPS
            if (this.results.secureConnection) {
                // For same-origin requests, we can check headers
                const response = await fetch(window.location.href, { 
                    method: 'HEAD',
                    cache: 'no-store'
                });
                
                // Check for HSTS header
                let hstsHeader = response.headers.get('strict-transport-security');
                this.results.hstsEnabled = !!hstsHeader;
                
                // Check if HSTS includes subdomains and has a long max-age
                if (hstsHeader) {
                    this.results.forcedHttps = true;
                    
                    // Parse the header to extract max-age and includeSubDomains
                    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
                    const includesSubdomains = hstsHeader.includes('includeSubDomains');
                    
                    if (maxAgeMatch) {
                        const maxAge = parseInt(maxAgeMatch[1], 10);
                        // HSTS is considered strong if max-age is at least 6 months (in seconds)
                        if (maxAge < 15768000) {  // 6 months in seconds
                            this.results.issues.push({
                                severity: 'medium',
                                description: 'HSTS max-age is less than 6 months'
                            });
                        }
                    }
                    
                    if (!includesSubdomains) {
                        this.results.issues.push({
                            severity: 'low',
                            description: 'HSTS does not include subdomains'
                        });
                    }
                } else {
                    this.results.issues.push({
                        severity: 'medium',
                        description: 'HSTS is not enabled'
                    });
                }
            } else {
                // If not on HTTPS, check if the site redirects to HTTPS
                // We can make a test request to the HTTP version
                const httpUrl = new URL(window.location.href);
                httpUrl.protocol = 'http:';
                
                try {
                    // This might fail due to CORS if redirecting to HTTPS
                    await fetch(httpUrl.toString(), { 
                        method: 'HEAD',
                        mode: 'no-cors',
                        cache: 'no-store'
                    });
                    
                    // If we get here, the site did not redirect to HTTPS
                    this.results.forcedHttps = false;
                    this.results.issues.push({
                        severity: 'high',
                        description: 'Site does not redirect from HTTP to HTTPS'
                    });
                } catch (e) {
                    // If we get a network error, it might be due to redirect to HTTPS
                    // This is a heuristic as we can't be sure from client-side only
                    this.results.forcedHttps = true;
                }
            }
        } catch (e) {
            console.error('Error checking HSTS:', e);
            this.results.issues.push({
                severity: 'medium',
                description: 'Could not check HSTS configuration'
            });
        }
    }
    
    /**
     * Check TLS version and certificate strength (approximation)
     */
    checkTLSandCert() {
        if (!this.results.secureConnection) {
            this.results.tlsVersion = 'none';
            this.results.certificateStrength = 'none';
            return;
        }
        
        // We can't directly get TLS version and certificate details from JavaScript
        // But we can use User-Agent and other browser capabilities to estimate
        
        // Get browser details to estimate TLS support
        const ua = navigator.userAgent;
        
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            const versionMatch = ua.match(/Chrome\/(\d+)/);
            if (versionMatch && versionMatch[1]) {
                const version = parseInt(versionMatch[1], 10);
                if (version >= 70) {
                    this.results.tlsVersion = 'TLS 1.3';
                    this.results.certificateStrength = 'strong';
                } else if (version >= 30) {
                    this.results.tlsVersion = 'TLS 1.2';
                    this.results.certificateStrength = 'moderate';
                } else {
                    this.results.tlsVersion = 'TLS 1.0/1.1';
                    this.results.certificateStrength = 'weak';
                    this.results.issues.push({
                        severity: 'high',
                        description: 'Browser using outdated TLS version'
                    });
                }
            }
        } else if (ua.includes('Firefox')) {
            const versionMatch = ua.match(/Firefox\/(\d+)/);
            if (versionMatch && versionMatch[1]) {
                const version = parseInt(versionMatch[1], 10);
                if (version >= 63) {
                    this.results.tlsVersion = 'TLS 1.3';
                    this.results.certificateStrength = 'strong';
                } else if (version >= 27) {
                    this.results.tlsVersion = 'TLS 1.2';
                    this.results.certificateStrength = 'moderate';
                } else {
                    this.results.tlsVersion = 'TLS 1.0/1.1';
                    this.results.certificateStrength = 'weak';
                    this.results.issues.push({
                        severity: 'high',
                        description: 'Browser using outdated TLS version'
                    });
                }
            }
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            const versionMatch = ua.match(/Version\/(\d+)/);
            if (versionMatch && versionMatch[1]) {
                const version = parseInt(versionMatch[1], 10);
                if (version >= 12) {
                    this.results.tlsVersion = 'TLS 1.3';
                    this.results.certificateStrength = 'strong';
                } else if (version >= 7) {
                    this.results.tlsVersion = 'TLS 1.2';
                    this.results.certificateStrength = 'moderate';
                } else {
                    this.results.tlsVersion = 'TLS 1.0/1.1';
                    this.results.certificateStrength = 'weak';
                    this.results.issues.push({
                        severity: 'high',
                        description: 'Browser using outdated TLS version'
                    });
                }
            }
        } else if (ua.includes('Edg')) {
            // Edge Chromium
            this.results.tlsVersion = 'TLS 1.3';
            this.results.certificateStrength = 'strong';
        } else {
            // Default for unknown browsers
            this.results.tlsVersion = 'unknown';
            this.results.certificateStrength = 'unknown';
            this.results.issues.push({
                severity: 'medium',
                description: 'Could not determine TLS version for your browser'
            });
        }
    }
    
    /**
     * Prepare recommendations based on detected issues
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (!this.results.secureConnection) {
            recommendations.push({
                title: "Always use HTTPS connections",
                description: "Non-secure HTTP connections can be intercepted and modified.",
                priority: "high",
                implementation: "Install the HTTPS Everywhere browser extension to force HTTPS where available, or manually type 'https://' before website URLs."
            });
        }
        
        if (!this.results.hstsEnabled) {
            recommendations.push({
                title: "Use websites with HSTS enabled",
                description: "HTTP Strict Transport Security (HSTS) forces browsers to use secure connections.",
                priority: "medium",
                implementation: "Prefer websites that implement HSTS. For website owners: add the 'Strict-Transport-Security' header to your responses."
            });
        }
        
        if (this.results.tlsVersion === 'TLS 1.0/1.1' || this.results.tlsVersion === 'unknown') {
            recommendations.push({
                title: "Upgrade to a modern browser",
                description: "Your browser may be using outdated TLS protocols that are less secure.",
                priority: "high",
                implementation: "Download and install the latest version of Firefox, Chrome, or Safari to ensure you have support for TLS 1.3."
            });
        }
        
        if (!this.results.forcedHttps) {
            recommendations.push({
                title: "Prefer websites that enforce HTTPS",
                description: "Websites should automatically redirect HTTP connections to HTTPS.",
                priority: "medium",
                implementation: "Be cautious with websites that don't automatically switch to HTTPS. Consider contacting site owners about implementing proper redirects."
            });
        }
        
        // Add general recommendations
        recommendations.push({
            title: "Check for the padlock icon",
            description: "Always verify that websites display a padlock icon in the address bar before entering sensitive information.",
            priority: "high",
            implementation: "Look for the padlock icon next to the URL in your browser before entering passwords or personal data."
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
window.httpsUpgradeChecker = new HttpsUpgradeChecker();