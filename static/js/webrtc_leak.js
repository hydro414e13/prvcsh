/**
 * WebRTC IP Leak Detection Script
 * Checks if WebRTC is leaking local IP addresses
 */
class WebRTCLeakDetector {
    constructor() {
        this.data = {
            public_ip: null,
            local_ip: null,
            local_ips: []
        };
    }

    /**
     * Check for WebRTC leaks
     * @returns {Promise} Resolves with leak data
     */
    async detectLeaks() {
        return new Promise((resolve) => {
            if (!this.isWebRTCSupported()) {
                this.data.supported = false;
                resolve(this.data);
                return;
            }

            this.data.supported = true;
            
            // Set a timeout to ensure we don't wait forever
            const timeout = setTimeout(() => {
                resolve(this.data);
            }, 5000);
            
            try {
                // Create peer connection
                const pc = new RTCPeerConnection({
                    iceServers: [{urls: "stun:stun.services.mozilla.com"}]
                });
                
                // Add dummy data channel (required for STUN request)
                pc.createDataChannel("");
                
                // Event handler for ICE candidates
                pc.onicecandidate = (event) => {
                    if (!event || !event.candidate) return;
                    
                    const candidate = event.candidate.candidate;
                    console.log("WebRTC candidate:", candidate);
                    
                    // Parse candidate string for IP addresses
                    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/g;
                    const matches = [...candidate.matchAll(ipRegex)];
                    
                    if (matches && matches.length > 0) {
                        for (const match of matches) {
                            const ip = match[0];
                            
                            // Skip localhost and duplicates
                            if (ip === '127.0.0.1' || this.data.local_ips.includes(ip)) {
                                continue;
                            }
                            
                            // Track every IP found
                            this.data.local_ips.push(ip);
                            
                            // The first local IP found
                            if (!this.data.local_ip) {
                                this.data.local_ip = ip;
                            }
                        }
                    }
                };
                
                // Create offer and set local description
                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .catch(err => console.error("Error creating WebRTC offer:", err));
                
                // Resolve after a short delay to allow gathering candidates
                setTimeout(() => {
                    clearTimeout(timeout);
                    pc.close();
                    resolve(this.data);
                }, 1000);
                
            } catch (error) {
                console.error("Error in WebRTC leak detection:", error);
                clearTimeout(timeout);
                resolve(this.data);
            }
        });
    }

    /**
     * Check if WebRTC is supported in this browser
     * @returns {boolean} True if WebRTC is supported
     */
    isWebRTCSupported() {
        return !!(window.RTCPeerConnection || 
                window.webkitRTCPeerConnection || 
                window.mozRTCPeerConnection);
    }
}

// Initialize WebRTC detector
const webrtcDetector = new WebRTCLeakDetector();
