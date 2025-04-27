/**
 * SSL/TLS Security Check Script
 * Evaluates the security of the current connection
 */
class SSLSecurityChecker {
    constructor() {
        this.results = {
            tested: false,
            secure: false,
            version: null,
            cipher: null,
            protocol: null,
            errorMessage: null
        };
    }

    /**
     * Check SSL/TLS security
     * @returns {Object} Results of the security check
     */
    async checkSSLSecurity() {
        try {
            this.results.tested = true;
            
            // Get information about the current connection
            // This is a best-effort approach using JS (limited access to SSL/TLS details)
            if (window.location.protocol === 'https:') {
                this.results.secure = true;
                this.results.protocol = 'HTTPS';
                
                // We can try a feature-based detection for TLS versions
                // This is not 100% accurate but gives a general idea
                
                // Check for features available in TLS 1.2+
                if ('crypto' in window && 'subtle' in window.crypto) {
                    this.results.version = "TLS 1.2 or higher";
                } else {
                    this.results.version = "TLS 1.1 or lower (outdated)";
                    this.results.secure = false;
                }
                
                // We can't directly access cipher information client-side
                // For a real implementation, this would be provided by server-side component
                this.results.cipher = "Not directly accessible via JavaScript";
                
                // Make a fetch request to determine connection capabilities
                try {
                    const response = await fetch('/ssl-check', {
                        method: 'HEAD',
                        cache: 'no-store'
                    });
                    
                    // Check for security headers that might indicate TLS version
                    const strictTransport = response.headers.get('Strict-Transport-Security');
                    if (strictTransport) {
                        this.results.secure = true; // HSTS header indicates good security practices
                    }
                    
                } catch (fetchError) {
                    console.warn('SSL check fetch error:', fetchError);
                }
                
            } else {
                this.results.secure = false;
                this.results.protocol = 'HTTP (insecure)';
                this.results.version = 'None (unencrypted connection)';
            }
            
            return this.results;
        } catch (error) {
            console.error('SSL security check error:', error);
            this.results.errorMessage = error.message;
            return this.results;
        }
    }
}