/**
 * Advanced DNS Privacy Checker
 * Detects DNS privacy features and potential DNS leaks
 */
class DNSPrivacyChecker {
    constructor() {
        this.initialized = false;
        this.results = {
            tested: false,
            dnsOverHttpsSupported: false,
            dnsOverTlsSupported: false,
            usingEncryptedDNS: false,
            dnsLeakDetected: false,
            dnsRebindingVulnerable: false,
            dnsProviders: [],
            recommendations: []
        };
    }
    
    /**
     * Initialize the DNS privacy checker
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Check for DoH (DNS over HTTPS) support
        await this.checkDoHSupport();
        
        // Check for DoT (DNS over TLS) support - this is harder to detect from browser
        this.checkDoTSupport();
        
        // Check for DNS rebinding vulnerability
        await this.checkDNSRebinding();
        
        // Detect if using encrypted DNS
        this.detectEncryptedDNS();
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Check for DNS over HTTPS support
     */
    async checkDoHSupport() {
        try {
            // Helper function to add timeouts to fetch requests
            const timeoutFetch = (url, options, timeout = 2000) => {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('DNS lookup timeout')), timeout)
                    )
                ]);
            };
            
            // Try to detect Firefox's DoH settings
            if (navigator.userAgent.includes("Firefox")) {
                // We can't directly access Firefox settings, but we can make some guesses
                // based on timing of DNS lookups to known DoH providers vs regular DNS
                
                // Create a unique subdomain to test resolution time
                const testDomain = `test-${Date.now()}-${Math.floor(Math.random() * 1000000)}.example.com`;
                
                // Test how fast regular DNS lookup happens (will fail, but that's fine)
                const regularStart = performance.now();
                try {
                    await timeoutFetch(`https://${testDomain}`, { mode: 'no-cors', cache: 'no-store' });
                } catch (e) {
                    // Expected to fail
                }
                const regularEnd = performance.now();
                const regularTime = regularEnd - regularStart;
                
                // Now test with known DoH provider domain
                const dohDomain = `test-${Date.now()}-${Math.floor(Math.random() * 1000000)}.cloudflare-dns.com`;
                const dohStart = performance.now();
                try {
                    await timeoutFetch(`https://${dohDomain}`, { mode: 'no-cors', cache: 'no-store' });
                } catch (e) {
                    // Expected to fail
                }
                const dohEnd = performance.now();
                const dohTime = dohEnd - dohStart;
                
                // If regular lookup is much slower than DoH lookup, might be using DoH
                this.results.dnsOverHttpsSupported = dohTime < regularTime * 0.7; // 30% faster would suggest DoH
            } else if (navigator.userAgent.includes("Chrome")) {
                // Chrome supports DoH but is harder to detect if enabled
                // We'll make a conservative guess based on performance timing similar to above
                
                const testDomain = `test-${Date.now()}-${Math.floor(Math.random() * 1000000)}.example.com`;
                const googleDohDomain = `test-${Date.now()}-${Math.floor(Math.random() * 1000000)}.dns.google`;
                
                const regularStart = performance.now();
                try {
                    await timeoutFetch(`https://${testDomain}`, { mode: 'no-cors', cache: 'no-store' });
                } catch (e) {
                    // Expected to fail
                }
                const regularEnd = performance.now();
                const regularTime = regularEnd - regularStart;
                
                const dohStart = performance.now();
                try {
                    await timeoutFetch(`https://${googleDohDomain}`, { mode: 'no-cors', cache: 'no-store' });
                } catch (e) {
                    // Expected to fail
                }
                const dohEnd = performance.now();
                const dohTime = dohEnd - dohStart;
                
                this.results.dnsOverHttpsSupported = dohTime < regularTime * 0.7;
            } else {
                // For other browsers, make a simplified check
                // Just check if DNS resolution happens reasonably quickly
                this.results.dnsOverHttpsSupported = false; // Default to false for other browsers
            }
        } catch (e) {
            console.warn('Error checking DoH support, skipping test:', e);
            this.results.dnsOverHttpsSupported = false;
        }
    }
    
    /**
     * Check for DNS over TLS support
     * Note: This is very difficult to detect from browser JavaScript
     */
    checkDoTSupport() {
        // DoT runs on port 853 and can't be directly accessed from the browser
        // We can only check the browser and OS to guess if DoT might be supported
        
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        
        // Android 9+ supports DoT natively
        if (ua.includes('Android') && !ua.includes('Android 8') && !ua.includes('Android 7') && !ua.includes('Android 6')) {
            this.results.dnsOverTlsSupported = true;
            this.results.usingEncryptedDNS = true; // Android 9+ uses DoT by default
        }
        // iOS 14+ supports DoT but not enabled by default
        else if ((ua.includes('iPhone') || ua.includes('iPad')) && ua.includes('OS 14_') || ua.includes('OS 15_') || ua.includes('OS 16_')) {
            this.results.dnsOverTlsSupported = true;
            this.results.usingEncryptedDNS = false; // Not enabled by default
        }
        // Modern macOS and Linux likely support DoT but need configuration
        else if (platform.includes('Mac') || platform.includes('Linux')) {
            this.results.dnsOverTlsSupported = true;
            this.results.usingEncryptedDNS = false; // Not enabled by default
        }
        // Windows 11 supports DoH natively
        else if (ua.includes('Windows NT 10.0') && ua.includes('Win64')) {
            this.results.dnsOverTlsSupported = true;
            this.results.usingEncryptedDNS = false; // Not enabled by default
        }
        else {
            this.results.dnsOverTlsSupported = false;
            this.results.usingEncryptedDNS = false;
        }
    }
    
    /**
     * Check for DNS rebinding vulnerability
     */
    async checkDNSRebinding() {
        // This is difficult to test directly from the browser
        // We'll perform a simplified test by checking if the browser maintains
        // DNS cache entries for a reasonable period
        
        try {
            // Create a unique test domain
            const timestamp = Date.now();
            const testDomain = `test-${timestamp}.example.com`;
            
            // Since we expect DNS failures for non-existent domains, let's use a timeout
            // to prevent getting stuck waiting for resolutions
            const dnsTestTimeout = (promise) => {
                return Promise.race([
                    promise,
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('DNS lookup timeout')), 2000)
                    )
                ]);
            };
            
            // First request - should fail but cache the DNS lookup failure
            const startTime = performance.now();
            try {
                await dnsTestTimeout(fetch(`https://${testDomain}`, { 
                    mode: 'no-cors', 
                    cache: 'no-store' 
                }));
            } catch (e) {
                // Expected to fail - this is normal
            }
            const firstRequestTime = performance.now() - startTime;
            
            // Wait a short period
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Second request to the same domain - should be faster if DNS is cached
            const secondStart = performance.now();
            try {
                await dnsTestTimeout(fetch(`https://${testDomain}`, { 
                    mode: 'no-cors', 
                    cache: 'no-store' 
                }));
            } catch (e) {
                // Expected to fail - this is normal
            }
            const secondRequestTime = performance.now() - secondStart;
            
            // If second request is significantly faster, DNS caching is working
            // which reduces DNS rebinding vulnerability
            this.results.dnsRebindingVulnerable = secondRequestTime > firstRequestTime * 0.8;
        } catch (e) {
            console.warn('Error checking DNS rebinding vulnerability, skipping test:', e);
            // Don't assume vulnerability if the test fails entirely
            this.results.dnsRebindingVulnerable = false;
        }
    }
    
    /**
     * Detect if using encrypted DNS based on previous tests
     */
    detectEncryptedDNS() {
        // If we already determined encrypted DNS is in use, keep that result
        if (this.results.usingEncryptedDNS) {
            return;
        }
        
        // Check for common browser extensions that might provide DNS privacy
        const commonDNSProvidersExtensions = [
            { name: 'Cloudflare', id: 'cloudflareInPageExtension' },
            { name: 'NextDNS', id: 'nextdns-browser-extension' },
            { name: 'AdGuard', id: 'adguard-popup-dummy' }
        ];
        
        for (const provider of commonDNSProvidersExtensions) {
            if (document.getElementById(provider.id) !== null) {
                this.results.usingEncryptedDNS = true;
                this.results.dnsProviders.push(provider.name);
                break;
            }
        }
        
        // Final determination based on DoH support
        if (this.results.dnsOverHttpsSupported) {
            this.results.usingEncryptedDNS = true;
            if (this.results.dnsProviders.length === 0) {
                // Make an educated guess based on browser
                if (navigator.userAgent.includes("Firefox")) {
                    this.results.dnsProviders.push("Cloudflare (Firefox default)");
                } else if (navigator.userAgent.includes("Chrome")) {
                    this.results.dnsProviders.push("Google DNS (likely)");
                }
            }
        }
    }
    
    /**
     * Prepare recommendations based on detected issues
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (!this.results.usingEncryptedDNS) {
            if (navigator.userAgent.includes("Firefox")) {
                recommendations.push({
                    title: "Enable DNS over HTTPS in Firefox",
                    description: "Encrypted DNS prevents your internet provider from seeing which websites you visit.",
                    priority: "high",
                    implementation: "Open Firefox Settings > General > Network Settings > Enable DNS over HTTPS > Choose a provider like Cloudflare or NextDNS."
                });
            } else if (navigator.userAgent.includes("Chrome")) {
                recommendations.push({
                    title: "Enable DNS over HTTPS in Chrome",
                    description: "Encrypted DNS prevents your internet provider from seeing which websites you visit.",
                    priority: "high",
                    implementation: "Open Chrome Settings > Privacy and security > Security > Use secure DNS > Choose a provider."
                });
            } else if (navigator.userAgent.includes("Edge")) {
                recommendations.push({
                    title: "Enable DNS over HTTPS in Edge",
                    description: "Encrypted DNS prevents your internet provider from seeing which websites you visit.",
                    priority: "high",
                    implementation: "Open Edge Settings > Privacy, search, and services > Security > Use secure DNS > Choose a provider."
                });
            } else {
                recommendations.push({
                    title: "Enable encrypted DNS in your browser",
                    description: "DNS over HTTPS (DoH) or DNS over TLS (DoT) encrypts your DNS requests.",
                    priority: "high",
                    implementation: "Check your browser's security settings for DNS options, or install an extension like Cloudflare's 1.1.1.1."
                });
            }
        }
        
        if (this.results.dnsRebindingVulnerable) {
            recommendations.push({
                title: "Protect against DNS rebinding attacks",
                description: "DNS rebinding can allow attackers to bypass your browser's same-origin policy.",
                priority: "medium",
                implementation: "Use a DNS provider with rebinding protection like NextDNS, Pi-hole with appropriate settings, or the dnsmasq DNS resolver with proper configuration."
            });
        }
        
        // General recommendations
        recommendations.push({
            title: "Consider using a privacy-focused DNS resolver",
            description: "Some DNS providers offer additional privacy features and malware blocking.",
            priority: "medium",
            implementation: "Popular privacy-focused DNS providers include Cloudflare (1.1.1.1), Quad9 (9.9.9.9), or NextDNS. Many can be configured at the device or browser level."
        });
        
        if (navigator.platform.includes('Linux') || navigator.platform.includes('Mac')) {
            recommendations.push({
                title: "Configure system-wide DNS over TLS",
                description: "Encrypting DNS at the system level protects all applications, not just your browser.",
                priority: "medium",
                implementation: "On Linux, use systemd-resolved or stubby. On macOS, third-party apps like DNSCloak can configure system-wide encrypted DNS."
            });
        }
        
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
window.dnsPrivacyChecker = new DNSPrivacyChecker();