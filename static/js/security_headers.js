/**
 * Security Headers Check Script
 * Analyzes HTTP security headers to assess connection security
 */
class SecurityHeadersChecker {
    constructor() {
        this.results = {
            tested: false,
            score: 0,
            headers: {},
            missingHeaders: [],
            errorMessage: null
        };
        
        // Important security headers to check for
        this.importantHeaders = [
            {
                name: 'Strict-Transport-Security',
                description: 'Enforces secure (HTTPS) connections',
                importance: 'high'
            },
            {
                name: 'Content-Security-Policy',
                description: 'Controls which resources can be loaded',
                importance: 'high'
            },
            {
                name: 'X-Content-Type-Options',
                description: 'Prevents MIME type sniffing',
                importance: 'medium'
            },
            {
                name: 'X-Frame-Options',
                description: 'Prevents clickjacking attacks',
                importance: 'high'
            },
            {
                name: 'X-XSS-Protection',
                description: 'Adds a layer of XSS protection in some browsers',
                importance: 'medium'
            },
            {
                name: 'Referrer-Policy',
                description: 'Controls how much referrer information is sent',
                importance: 'medium'
            },
            {
                name: 'Permissions-Policy',
                description: 'Controls which browser features can be used',
                importance: 'medium'
            },
            {
                name: 'Cache-Control',
                description: 'Directs caching behavior for browsers',
                importance: 'low'
            },
            {
                name: 'Access-Control-Allow-Origin',
                description: 'Controls cross-origin resource sharing',
                importance: 'medium'
            }
        ];
    }

    /**
     * Check for security headers
     * @returns {Object} Results of the security headers check
     */
    async checkSecurityHeaders() {
        try {
            this.results.tested = true;
            
            // Make a fetch request to get header information
            // Note: This will only show headers available to JavaScript
            // A complete implementation would check headers server-side
            const response = await fetch('/security-headers-check', {
                method: 'HEAD',
                cache: 'no-store'
            });
            
            // Extract headers from response
            const headers = {};
            response.headers.forEach((value, name) => {
                headers[name.toLowerCase()] = value;
            });
            
            this.results.headers = headers;
            
            // Check for missing headers
            this.results.missingHeaders = [];
            
            // Calculate security score based on headers present
            let score = 0;
            const maxScore = 100;
            
            // Check each important header
            for (const header of this.importantHeaders) {
                const headerName = header.name.toLowerCase();
                
                if (headers[headerName]) {
                    // Header is present, award points based on importance
                    switch (header.importance) {
                        case 'high':
                            score += 15;
                            break;
                        case 'medium':
                            score += 10;
                            break;
                        case 'low':
                            score += 5;
                            break;
                    }
                    
                    // Additional points for strong configurations
                    if (headerName === 'strict-transport-security') {
                        // Check for strong HSTS configuration
                        if (headers[headerName].includes('max-age=') && 
                            !headers[headerName].includes('max-age=0') &&
                            headers[headerName].includes('includeSubDomains')) {
                            score += 5;
                        }
                    }
                    
                    if (headerName === 'content-security-policy') {
                        // Check for strong CSP configuration (simplified)
                        if (headers[headerName].includes("default-src 'self'") && 
                            !headers[headerName].includes("unsafe-inline") && 
                            !headers[headerName].includes("unsafe-eval")) {
                            score += 5;
                        }
                    }
                } else {
                    // Header is missing
                    this.results.missingHeaders.push({
                        name: header.name,
                        description: header.description,
                        importance: header.importance
                    });
                    
                    // Penalty for missing important headers
                    if (header.importance === 'high' && 
                       (headerName === 'strict-transport-security' || 
                        headerName === 'content-security-policy')) {
                        score -= 10;
                    }
                }
            }
            
            // Check for HTTPS vs HTTP
            if (window.location.protocol === 'https:') {
                score += 15;
            } else {
                score -= 30; // Major penalty for not using HTTPS
                this.results.missingHeaders.push({
                    name: 'HTTPS',
                    description: 'Secure connection protocol',
                    importance: 'high'
                });
            }
            
            // Ensure score is between 0 and 100
            this.results.score = Math.max(0, Math.min(maxScore, score));
            
            return this.results;
            
        } catch (error) {
            console.error('Security headers check error:', error);
            this.results.errorMessage = error.message;
            return this.results;
        }
    }
}