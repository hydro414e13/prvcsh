/**
 * HTTP/3 and QUIC Protocol Support Detection
 * Tests if the browser supports modern HTTP/3 and QUIC protocols
 */
class HTTP3SupportChecker {
    constructor() {
        this.results = {
            tested: false,
            http3Supported: false,
            quicSupported: false,
            http2Supported: false,
            transportSecurity: 'Unknown',
            performanceScore: 0
        };
    }

    /**
     * Check for HTTP/3 and QUIC support
     * @returns {Object} Results of the HTTP/3 support check
     */
    async checkSupport() {
        try {
            this.results.tested = true;
            
            // Check if the browser appears to support HTTP/3
            this.checkHTTP3BrowserSupport();
            
            // Check for HTTP/2 support
            this.checkHTTP2Support();
            
            // Perform connection test
            await this.performConnectionTest();
            
            // Calculate performance score
            this.calculatePerformanceScore();
            
            return this.results;
            
        } catch (error) {
            console.error('HTTP/3 support check error:', error);
            this.results.error = error.message;
            return this.results;
        }
    }

    /**
     * Check for HTTP/3 support based on browser detection
     * Note: This is a simplified implementation as direct detection isn't always possible
     */
    checkHTTP3BrowserSupport() {
        const ua = navigator.userAgent.toLowerCase();
        
        // Chrome 85+, Edge 85+, Opera 71+, and Firefox 88+ have some HTTP/3 support
        let supported = false;
        
        if (ua.includes('chrome/')) {
            const version = parseInt(ua.match(/chrome\/(\d+)/)[1], 10);
            supported = version >= 85;
        } else if (ua.includes('edg/')) {
            const version = parseInt(ua.match(/edg\/(\d+)/)[1], 10);
            supported = version >= 85;
        } else if (ua.includes('opr/') || ua.includes('opera/')) {
            const version = parseInt(ua.match(/(?:opr|opera)\/(\d+)/)[1], 10);
            supported = version >= 71;
        } else if (ua.includes('firefox/')) {
            const version = parseInt(ua.match(/firefox\/(\d+)/)[1], 10);
            supported = version >= 88;
        } else if (ua.includes('safari/') && !ua.includes('chrome/') && !ua.includes('edg/')) {
            const version = parseInt(ua.match(/version\/(\d+)/)[1], 10);
            supported = version >= 14;
        }
        
        this.results.http3Supported = supported;
        this.results.quicSupported = supported; // QUIC is the transport protocol for HTTP/3
        
        this.results.browserSupport = {
            name: this.getBrowserName(ua),
            version: this.getBrowserVersion(ua),
            supportsHTTP3: supported
        };
    }

    /**
     * Get browser name from user agent string
     * @param {string} ua - User agent string
     * @returns {string} Browser name
     */
    getBrowserName(ua) {
        if (ua.includes('edg/')) return 'Edge';
        if (ua.includes('chrome/')) return 'Chrome';
        if (ua.includes('firefox/')) return 'Firefox';
        if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
        if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
        return 'Unknown';
    }

    /**
     * Get browser version from user agent string
     * @param {string} ua - User agent string
     * @returns {string} Browser version
     */
    getBrowserVersion(ua) {
        let match;
        if (ua.includes('edg/')) {
            match = ua.match(/edg\/(\d+(\.\d+)?)/);
        } else if (ua.includes('chrome/')) {
            match = ua.match(/chrome\/(\d+(\.\d+)?)/);
        } else if (ua.includes('firefox/')) {
            match = ua.match(/firefox\/(\d+(\.\d+)?)/);
        } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
            match = ua.match(/version\/(\d+(\.\d+)?)/);
        } else if (ua.includes('opr/')) {
            match = ua.match(/opr\/(\d+(\.\d+)?)/);
        } else if (ua.includes('opera/')) {
            match = ua.match(/opera\/(\d+(\.\d+)?)/);
        }
        
        return match ? match[1] : 'Unknown';
    }

    /**
     * Check for HTTP/2 support
     */
    checkHTTP2Support() {
        // In browsers we can't directly check for HTTP/2 support with JavaScript
        // We'll use a simplified detection based on browser version
        const ua = navigator.userAgent.toLowerCase();
        
        // Most modern browsers support HTTP/2
        let supported = true;
        
        // Internet Explorer doesn't support HTTP/2
        if (ua.includes('msie ') || ua.includes('trident/')) {
            supported = false;
        }
        // Very old browsers likely won't support HTTP/2
        else if (ua.includes('chrome/')) {
            const version = parseInt(ua.match(/chrome\/(\d+)/)[1], 10);
            supported = version >= 41;
        } else if (ua.includes('firefox/')) {
            const version = parseInt(ua.match(/firefox\/(\d+)/)[1], 10);
            supported = version >= 36;
        } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
            const version = parseInt(ua.match(/version\/(\d+)/)[1], 10);
            supported = version >= 9;
        }
        
        this.results.http2Supported = supported;
    }

    /**
     * Simulate a connection test for HTTP/3
     * In a real implementation, this would make actual connection attempts
     */
    async performConnectionTest() {
        // This is a simulated test since direct protocol detection isn't
        // possible with client-side JavaScript alone
        
        // For demonstration purposes only
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real implementation, this would be determined by actual
                // connection attempts to HTTP/3 enabled servers
                
                const protocol = this.results.http3Supported ? 'HTTP/3' : 
                                (this.results.http2Supported ? 'HTTP/2' : 'HTTP/1.1');
                                
                this.results.connectionProtocol = protocol;
                this.results.transportSecurity = 'TLS 1.3'; // Assuming modern browser
                
                resolve();
            }, 500);
        });
    }

    /**
     * Calculate performance score based on protocol support
     */
    calculatePerformanceScore() {
        let score = 0;
        
        // HTTP protocol impacts performance
        if (this.results.http3Supported) {
            score += 40; // HTTP/3 is fastest
        } else if (this.results.http2Supported) {
            score += 30; // HTTP/2 is still good
        } else {
            score += 10; // HTTP/1.1 is significantly slower
        }
        
        // Transport security also matters for performance
        if (this.results.transportSecurity === 'TLS 1.3') {
            score += 30; // TLS 1.3 has improved handshake times
        } else if (this.results.transportSecurity === 'TLS 1.2') {
            score += 20; // TLS 1.2 is acceptable
        } else {
            score += 10; // Older TLS versions are slower
        }
        
        // Browser impacts protocol efficiency
        const modernBrowser = this.isBrowserModern();
        if (modernBrowser) {
            score += 30;
        } else {
            score += 10;
        }
        
        // Scale to 100
        this.results.performanceScore = Math.min(100, score);
    }

    /**
     * Determine if the browser is modern based on user agent
     * @returns {boolean} Whether the browser is considered modern
     */
    isBrowserModern() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.includes('chrome/')) {
            const version = parseInt(ua.match(/chrome\/(\d+)/)[1], 10);
            return version >= 85;
        } else if (ua.includes('firefox/')) {
            const version = parseInt(ua.match(/firefox\/(\d+)/)[1], 10);
            return version >= 80;
        } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
            const version = parseInt(ua.match(/version\/(\d+)/)[1], 10);
            return version >= 14;
        } else if (ua.includes('edg/')) {
            const version = parseInt(ua.match(/edg\/(\d+)/)[1], 10);
            return version >= 85;
        }
        
        return false;
    }
}