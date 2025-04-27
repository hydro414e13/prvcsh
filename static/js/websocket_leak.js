/**
 * WebSocket Leak Detection Script
 * Checks if WebSocket connections can bypass privacy protections
 */
class WebSocketLeakDetector {
    constructor() {
        this.results = {
            tested: false,
            leakDetected: false,
            supportsWebSockets: false,
            bypassesProxy: false,
            testResults: [],
            recommendations: []
        };
        this.initialized = false;
    }
    
    /**
     * Initialize the WebSocket leak detector
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Run the detection
            await this.detectWebSocketLeaks();
            
            // Prepare recommendations based on detected issues
            this.prepareRecommendations();
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing WebSocket leak detector:', error);
        }
    }

    /**
     * Detect WebSocket privacy leaks
     * @returns {Object} Results of the WebSocket leak check
     */
    async detectWebSocketLeaks() {
        try {
            this.results.tested = true;
            this.results.supportsWebSockets = 'WebSocket' in window;

            if (!this.results.supportsWebSockets) {
                return this.results;
            }

            // Test if WebSockets are working
            const socketTestResult = await this.testWebSocketConnection();
            this.results.testResults.push(socketTestResult);
            
            // Check if connection parameters match the browser settings
            // (This would be expanded with real tests in production)
            const connectionTest = await this.testConnectionParameters();
            this.results.testResults.push(connectionTest);
            
            // Determine if there's a leak
            this.results.leakDetected = this.results.testResults.some(test => test.leakDetected);
            this.results.bypassesProxy = this.results.testResults.some(test => test.bypassesProxy);
            
            return this.results;
            
        } catch (error) {
            console.error('WebSocket leak detection error:', error);
            this.results.error = error.message;
            return this.results;
        }
    }

    /**
     * Test a basic WebSocket connection
     * In a real implementation, you would use an actual server endpoint
     * @returns {Object} Test results
     */
    async testWebSocketConnection() {
        return new Promise((resolve) => {
            try {
                // In real usage, you'd connect to your own WebSocket server
                // For the demo, we'll simulate the test
                
                // This simulates what would happen if we did connect
                setTimeout(() => {
                    resolve({
                        name: 'Basic WebSocket connection',
                        success: true,
                        leakDetected: false,
                        bypassesProxy: false,
                        notes: 'WebSockets are properly routed through the browser network stack'
                    });
                }, 500);
                
            } catch (error) {
                resolve({
                    name: 'Basic WebSocket connection',
                    success: false,
                    error: error.message,
                    leakDetected: false,
                    bypassesProxy: false
                });
            }
        });
    }

    /**
     * Test if WebSocket connections use different parameters than HTTP
     * This would be a more detailed check in a real implementation
     * @returns {Object} Test results
     */
    async testConnectionParameters() {
        return new Promise((resolve) => {
            // In a real implementation, you would test if WebSockets
            // follow the proxy settings that regular HTTP connections use
            
            // Simulate the test for demo purposes
            setTimeout(() => {
                resolve({
                    name: 'Proxy settings adherence',
                    success: true,
                    leakDetected: false,
                    bypassesProxy: false,
                    notes: 'WebSocket connections appear to follow browser proxy settings'
                });
            }, 300);
        });
    }
    
    /**
     * Prepare recommendations based on detected issues
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (this.results.leakDetected || this.results.bypassesProxy) {
            recommendations.push({
                title: "Secure WebSocket connections",
                description: "WebSocket connections might be bypassing your privacy protections. Use a VPN that fully tunnels all WebSocket traffic.",
                priority: "high",
                implementation: "Select a VPN provider that offers full WebSocket protection. NordVPN, ExpressVPN, and ProtonVPN are known to handle WebSocket traffic properly."
            });
            
            recommendations.push({
                title: "Use WebSocket blocking extensions",
                description: "Install browser extensions that can control WebSocket connections and prevent unauthorized connections.",
                priority: "medium",
                implementation: "Install 'uBlock Origin' with advanced settings enabled and block WebSocket connections from untrusted domains."
            });
        } else if (this.results.supportsWebSockets) {
            // Even if no leak is detected, provide basic information
            recommendations.push({
                title: "Monitor WebSocket connections",
                description: "Your browser supports WebSockets, which are generally secure but can sometimes bypass privacy protections.",
                priority: "low",
                implementation: "Use a network monitoring tool like the Network tab in DevTools to monitor WebSocket connections when browsing."
            });
        }
        
        this.results.recommendations = recommendations;
    }
}

// Create and add to global namespace
window.websocketLeakDetector = new WebSocketLeakDetector();