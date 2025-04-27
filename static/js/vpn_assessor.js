/**
 * VPN/Proxy Quality Assessment
 * Tests VPN/proxy for leaks and quality issues
 */
class VPNAssessor {
    constructor() {
        this.initialized = false;
        this.results = {
            tested: false,
            usingVPN: false,
            usingProxy: false,
            usingTor: false,
            dnsLeakDetected: false,
            webRTCLeakDetected: false,
            ipv6LeakDetected: false,
            vpnQualityScore: 0, // 0-100
            serverLocation: null,
            ipReputation: 'unknown', // 'good', 'medium', 'poor'
            leakTypes: [],
            recommendations: []
        };
    }
    
    /**
     * Initialize the VPN assessor
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Check if using VPN/proxy
        await this.checkVPNStatus();
        
        // If using VPN/proxy, perform additional tests
        if (this.results.usingVPN || this.results.usingProxy || this.results.usingTor) {
            // Check for leaks
            await Promise.all([
                this.checkWebRTCLeak(),
                this.checkDNSLeak(),
                this.checkIPv6Leak()
            ]);
            
            // Assess VPN quality
            this.assessVPNQuality();
        }
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Check if the user is connecting through a VPN, proxy or Tor
     */
    async checkVPNStatus() {
        // For this demo, we'll use the information already collected during the scan
        // In a real implementation, this would make additional API calls
        
        try {
            // Get results from parent scan if available
            const parentScanResults = window.privacyScanResults || {};
            
            if (parentScanResults.isVpn !== undefined) {
                this.results.usingVPN = parentScanResults.isVpn;
            }
            
            if (parentScanResults.isProxy !== undefined) {
                this.results.usingProxy = parentScanResults.isProxy;
            }
            
            if (parentScanResults.isTor !== undefined) {
                this.results.usingTor = parentScanResults.isTor;
            }
            
            if (parentScanResults.country) {
                this.results.serverLocation = parentScanResults.country;
            }
            
            // If we couldn't get from parent scan, make a more basic determination
            if (this.results.usingVPN === false && 
                this.results.usingProxy === false && 
                this.results.usingTor === false) {
                
                // Check common VPN port
                const isUsingVPNPort = await this.checkVPNPort();
                if (isUsingVPNPort) {
                    this.results.usingVPN = true;
                }
            }
            
        } catch (e) {
            console.error('Error checking VPN status:', e);
            // Default to safer assumption - no VPN
            this.results.usingVPN = false;
            this.results.usingProxy = false;
            this.results.usingTor = false;
        }
    }
    
    /**
     * Check if user might be connecting through a common VPN port
     */
    async checkVPNPort() {
        // This is a heuristic at best - we can't directly check ports from browser JS
        // We'll use a timing-based approach to guess if traffic might be going through common VPN ports
        
        try {
            // Create a unique request to test with timestamp to avoid caching
            const timestamp = Date.now();
            const testUrl = `https://www.cloudflare.com/cdn-cgi/trace?t=${timestamp}`;
            
            const start = performance.now();
            const response = await fetch(testUrl, { cache: 'no-store' });
            const end = performance.now();
            
            const responseTime = end - start;
            
            // Parse the response text
            const responseText = await response.text();
            
            // Look for indicators in the response
            const usingCloudflareWarp = responseText.includes('warp=on');
            const hasVPNHeaderIndicator = responseText.includes('proxy=1') || 
                                         responseText.includes('vpn=1');
            
            // Typical home connection response time to Cloudflare is < 100ms
            // VPNs often add at least 20-30ms of latency
            const highLatency = responseTime > 150;
            
            return usingCloudflareWarp || hasVPNHeaderIndicator || highLatency;
        } catch (e) {
            console.error('Error checking VPN port:', e);
            return false;
        }
    }
    
    /**
     * Check for WebRTC leaks
     */
    async checkWebRTCLeak() {
        try {
            // If we have parent scan results, use those
            const parentScanResults = window.privacyScanResults || {};
            
            if (parentScanResults.hasWebrtcLeak !== undefined) {
                this.results.webRTCLeakDetected = parentScanResults.hasWebrtcLeak;
                
                if (this.results.webRTCLeakDetected) {
                    this.results.leakTypes.push('WebRTC');
                }
                
                return;
            }
            
            // If no parent results, perform our own check
            
            // Create a promise that will resolve with the WebRTC IPs
            const getWebRTCIPs = () => {
                return new Promise((resolve) => {
                    // Set a timeout in case the STUN requests hang
                    const timeoutId = setTimeout(() => {
                        resolve({ publicIP: null, privateIPs: [] });
                    }, 5000);
                    
                    // Only run this test if the browser supports WebRTC
                    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                        clearTimeout(timeoutId);
                        resolve({ publicIP: null, privateIPs: [] });
                        return;
                    }
                    
                    try {
                        // Create peer connection
                        const pc = new RTCPeerConnection({
                            iceServers: [
                                { urls: "stun:stun.l.google.com:19302" }
                            ]
                        });
                        
                        // Initialize arrays for IPs
                        const publicIPs = new Set();
                        const privateIPs = new Set();
                        
                        // Add dummy data channel
                        pc.createDataChannel('');
                        
                        // Create an offer to activate the candidate generation
                        pc.createOffer()
                            .then(offer => pc.setLocalDescription(offer))
                            .catch(() => {});
                        
                        // Listen for candidate events
                        pc.onicecandidate = (event) => {
                            if (event.candidate && event.candidate.candidate) {
                                const candidate = event.candidate.candidate;
                                
                                // Extract IP from candidate string
                                const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(candidate);
                                if (ipMatch) {
                                    const ip = ipMatch[1];
                                    
                                    // Categorize IP
                                    if (this.isPrivateIP(ip)) {
                                        privateIPs.add(ip);
                                    } else {
                                        publicIPs.add(ip);
                                    }
                                }
                            } else if (!event.candidate) {
                                // ICE gathering complete
                                clearTimeout(timeoutId);
                                pc.close();
                                
                                resolve({
                                    publicIP: publicIPs.size > 0 ? Array.from(publicIPs)[0] : null,
                                    privateIPs: Array.from(privateIPs)
                                });
                            }
                        };
                    } catch (e) {
                        clearTimeout(timeoutId);
                        resolve({ publicIP: null, privateIPs: [] });
                    }
                });
            };
            
            // Get the WebRTC IPs
            const { publicIP, privateIPs } = await getWebRTCIPs();
            
            // Compare to claimed IP address
            const parentIP = parentScanResults.ipAddress || '';
            
            // If the WebRTC public IP is different from the IP used for HTTP requests,
            // that indicates a WebRTC leak
            if (publicIP && parentIP && publicIP !== parentIP) {
                this.results.webRTCLeakDetected = true;
                this.results.leakTypes.push('WebRTC');
            } else if (privateIPs.length > 0 && this.results.usingVPN) {
                // If we're using a VPN and private IPs are exposed, that's also a leak
                this.results.webRTCLeakDetected = true;
                this.results.leakTypes.push('WebRTC (private IPs)');
            } else {
                this.results.webRTCLeakDetected = false;
            }
        } catch (e) {
            console.error('Error checking WebRTC leak:', e);
            this.results.webRTCLeakDetected = false;
        }
    }
    
    /**
     * Check if an IP address is private
     */
    isPrivateIP(ip) {
        const parts = ip.split('.');
        
        // Check for local IPs
        return (parts[0] === '10') ||
               (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) ||
               (parts[0] === '192' && parts[1] === '168') ||
               (ip === '127.0.0.1');
    }
    
    /**
     * Check for DNS leaks
     */
    async checkDNSLeak() {
        try {
            // If we have parent scan results, use those
            const parentScanResults = window.privacyScanResults || {};
            
            if (parentScanResults.hasDnsLeak !== undefined) {
                this.results.dnsLeakDetected = parentScanResults.hasDnsLeak;
                
                if (this.results.dnsLeakDetected) {
                    this.results.leakTypes.push('DNS');
                }
                
                return;
            }
            
            // If no parent results, we'll have to do a best-effort guess
            // True DNS leak testing requires server-side components
            
            // We'll check if DNS resolution is abnormally fast compared to general connection time
            // which might indicate local DNS rather than VPN DNS
            
            const testDomain = `test-${Date.now()}.example.com`;
            
            // Measure time to make a request that will fail due to DNS resolution
            const dnsStart = performance.now();
            try {
                await fetch(`https://${testDomain}`, { mode: 'no-cors', cache: 'no-store' });
            } catch (e) {
                // Expected to fail
            }
            const dnsEnd = performance.now();
            const dnsTime = dnsEnd - dnsStart;
            
            // Now make a request to a known domain
            const knownStart = performance.now();
            try {
                await fetch('https://www.google.com', { mode: 'no-cors', cache: 'no-store' });
            } catch (e) {
                // Ignore errors
            }
            const knownEnd = performance.now();
            const knownTime = knownEnd - knownStart;
            
            // If DNS resolution is very fast compared to connection time,
            // it might be bypassing the VPN's DNS servers
            if (this.results.usingVPN && dnsTime < knownTime * 0.3) {
                this.results.dnsLeakDetected = true;
                this.results.leakTypes.push('DNS (suspected)');
            } else {
                this.results.dnsLeakDetected = false;
            }
        } catch (e) {
            console.error('Error checking DNS leak:', e);
            this.results.dnsLeakDetected = false;
        }
    }
    
    /**
     * Check for IPv6 leaks
     */
    async checkIPv6Leak() {
        try {
            // If we have parent scan results, use those
            const parentScanResults = window.privacyScanResults || {};
            
            if (parentScanResults.hasIPv6Leak !== undefined) {
                this.results.ipv6LeakDetected = parentScanResults.hasIPv6Leak;
                
                if (this.results.ipv6LeakDetected) {
                    this.results.leakTypes.push('IPv6');
                }
                
                return;
            }
            
            // If no parent results, we'll have to do a best-effort guess
            
            // Check if we have IPv6 connectivity when using a VPN
            // Many VPNs only tunnel IPv4 traffic, leaving IPv6 traffic exposed
            
            // This requires a server-side component to check both the IPv4 and IPv6 addresses
            // We'll have to approximate with client-side detection
            
            if (this.results.usingVPN || this.results.usingProxy) {
                // Attempt to detect IPv6 connectivity
                const hasIPv6 = await this.checkIPv6Connectivity();
                
                // If we're using a VPN and have IPv6 connectivity,
                // there's a significant chance of IPv6 leakage
                if (hasIPv6) {
                    this.results.ipv6LeakDetected = true;
                    this.results.leakTypes.push('IPv6 (suspected)');
                } else {
                    this.results.ipv6LeakDetected = false;
                }
            } else {
                this.results.ipv6LeakDetected = false;
            }
        } catch (e) {
            console.error('Error checking IPv6 leak:', e);
            this.results.ipv6LeakDetected = false;
        }
    }
    
    /**
     * Check if the user has IPv6 connectivity
     */
    async checkIPv6Connectivity() {
        // We'll use a timing-based approach to detect IPv6 connectivity
        // This is not 100% reliable, but it's a best effort from the client side
        
        try {
            // Try to load a tiny resource from an IPv6-only domain
            const img = new Image();
            let loaded = false;
            
            const promise = new Promise((resolve) => {
                img.onload = () => {
                    loaded = true;
                    resolve(true);
                };
                img.onerror = () => {
                    resolve(false);
                };
                
                // Set a timeout to bail out if the image doesn't load/error quickly
                setTimeout(() => {
                    if (!loaded) {
                        resolve(false);
                    }
                }, 3000);
            });
            
            // Use Google's well-maintained IPv6 test domain
            img.src = `https://ipv6.google.com/favicon.ico?${Date.now()}`;
            
            return await promise;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Assess VPN quality based on detected issues
     */
    assessVPNQuality() {
        // Start with a perfect score
        let score = 100;
        
        // Deduct points for each leak type
        score -= this.results.leakTypes.length * 25;
        
        // Deduct points for using Tor (tends to be slower)
        if (this.results.usingTor) {
            score -= 10;
        }
        
        // Educated guesses about IP reputation
        if (this.results.usingTor) {
            this.results.ipReputation = 'poor'; // Tor exit nodes are often blocklisted
        } else if (this.results.usingVPN) {
            // Attempt to assess reputation based on known VPN provider domains
            const parentScanResults = window.privacyScanResults || {};
            const isp = (parentScanResults.isp || '').toLowerCase();
            
            // Premium VPN providers tend to maintain better IP reputation
            if (isp.includes('nordvpn') || 
                isp.includes('expressvpn') || 
                isp.includes('protonvpn') || 
                isp.includes('mullvad') || 
                isp.includes('privateinternetaccess') || 
                isp.includes('surfshark')) {
                this.results.ipReputation = 'good';
            } else if (isp.includes('vpn') || isp.includes('proxy') || isp.includes('hosting')) {
                this.results.ipReputation = 'medium';
            } else {
                this.results.ipReputation = 'unknown';
            }
        } else if (this.results.usingProxy) {
            this.results.ipReputation = 'medium'; // Free proxies often have poor reputation
        }
        
        // Adjust score based on reputation
        if (this.results.ipReputation === 'poor') {
            score -= 20;
        } else if (this.results.ipReputation === 'medium') {
            score -= 10;
        }
        
        // Ensure score stays in range 0-100
        this.results.vpnQualityScore = Math.max(0, Math.min(100, score));
    }
    
    /**
     * Prepare recommendations based on detected issues
     */
    prepareRecommendations() {
        const recommendations = [];
        
        // If not using a VPN, recommend one
        if (!this.results.usingVPN && !this.results.usingProxy && !this.results.usingTor) {
            recommendations.push({
                title: "Use a VPN for additional privacy",
                description: "A Virtual Private Network (VPN) encrypts your internet traffic and hides your IP address.",
                priority: "medium",
                implementation: "Subscribe to a reputable VPN service like ProtonVPN, Mullvad, or NordVPN. Avoid free VPNs as they often collect and sell your data."
            });
            
            recommendations.push({
                title: "Consider Tor for maximum anonymity",
                description: "The Tor network provides strong anonymity by routing your traffic through multiple encrypted layers.",
                priority: "medium",
                implementation: "Download and install the Tor Browser from torproject.org for the simplest way to access the Tor network."
            });
        }
        
        // If using a VPN but issues detected
        if ((this.results.usingVPN || this.results.usingProxy) && this.results.leakTypes.length > 0) {
            if (this.results.webRTCLeakDetected) {
                recommendations.push({
                    title: "Fix WebRTC leaks in your VPN setup",
                    description: "WebRTC can expose your real IP address even when using a VPN.",
                    priority: "high",
                    implementation: "Install a browser extension like WebRTC Leak Prevent, or disable WebRTC in your browser settings. In Firefox, go to about:config and set media.peerconnection.enabled to false."
                });
            }
            
            if (this.results.dnsLeakDetected) {
                recommendations.push({
                    title: "Fix DNS leaks in your VPN setup",
                    description: "DNS requests might bypass your VPN, revealing your browsing activity to your ISP.",
                    priority: "high",
                    implementation: "Enable DNS leak protection in your VPN app settings. If unavailable, manually set your DNS servers to privacy-focused ones like 1.1.1.1 (Cloudflare) or 9.9.9.9 (Quad9)."
                });
            }
            
            if (this.results.ipv6LeakDetected) {
                recommendations.push({
                    title: "Fix IPv6 leaks in your VPN setup",
                    description: "IPv6 traffic might bypass your VPN tunnel, revealing your real IP address.",
                    priority: "high",
                    implementation: "Disable IPv6 in your network settings, or use a VPN that properly handles IPv6 traffic. Most VPN apps have an option to disable IPv6 or block IPv6 leaks."
                });
            }
        }
        
        // If using a VPN with poor reputation
        if ((this.results.usingVPN || this.results.usingProxy) && this.results.ipReputation === 'poor') {
            recommendations.push({
                title: "Switch to a VPN with better IP reputation",
                description: "Your current VPN's IP addresses may be blocklisted or flagged by websites.",
                priority: "medium",
                implementation: "Consider premium VPN providers like Mullvad, ProtonVPN, or NordVPN which rotate their IP addresses regularly and maintain better reputations."
            });
        }
        
        // General recommendations for VPN users
        if (this.results.usingVPN || this.results.usingProxy || this.results.usingTor) {
            recommendations.push({
                title: "Regularly test your VPN for leaks",
                description: "VPN configurations can change after updates or system changes.",
                priority: "medium",
                implementation: "Use comprehensive leak testing tools like dnsleaktest.com, ipleak.net, or browserleaks.com periodically to ensure your VPN is working correctly."
            });
            
            recommendations.push({
                title: "Enable a kill switch for your VPN",
                description: "A kill switch prevents data leakage if your VPN connection drops.",
                priority: "medium",
                implementation: "Enable the kill switch feature in your VPN application settings. If your VPN doesn't offer one, consider switching to a provider that does."
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
window.vpnAssessor = new VPNAssessor();