/**
 * Browser Fingerprint Randomization
 * Helps detect and potentially randomize browser fingerprinting elements
 */
class FingerprintRandomization {
    constructor() {
        this.initialized = false;
        this.results = {
            tested: false,
            canRandomize: false,
            currentlyRandomized: false,
            techniques: [],
            recommendations: []
        };
    }
    
    /**
     * Initialize the fingerprint randomization checker
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Check for existing randomization extensions or techniques
        await this.detectExistingRandomization();
        
        // Check if the browser has the capability to randomize
        this.checkRandomizationCapability();
        
        // Prepare recommendations based on detected capabilities
        this.prepareRecommendations();
    }
    
    /**
     * Check if randomization capabilities exist in the current browser
     */
    checkRandomizationCapability() {
        const techniques = [];
        
        // Check canvas randomization capability
        if (typeof HTMLCanvasElement !== 'undefined') {
            techniques.push({
                name: 'canvas_randomization',
                available: true,
                enabled: this.detectCanvasRandomization(),
                impact: 'high',
                description: 'Canvas fingerprinting is one of the most common tracking methods'
            });
        }
        
        // Check WebGL randomization
        if (typeof WebGLRenderingContext !== 'undefined') {
            techniques.push({
                name: 'webgl_randomization',
                available: true,
                enabled: this.detectWebGLRandomization(),
                impact: 'high',
                description: 'WebGL can create a highly unique fingerprint'
            });
        }
        
        // Check for User-Agent spoofing capability
        techniques.push({
            name: 'user_agent_spoofing',
            available: true,
            enabled: this.detectUserAgentSpoofing(),
            impact: 'medium',
            description: 'Changing your user-agent can help mask your browser and OS'
        });
        
        // Check audio context fingerprinting protection
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            techniques.push({
                name: 'audio_randomization',
                available: true,
                enabled: this.detectAudioRandomization(),
                impact: 'medium',
                description: 'Audio processing can be used for browser fingerprinting'
            });
        }
        
        // Check font enumeration protection
        techniques.push({
            name: 'font_randomization',
            available: true,
            enabled: this.detectFontRandomization(),
            impact: 'medium',
            description: 'Font lists can be very unique to your device'
        });
        
        // Update results
        this.results.techniques = techniques;
        this.results.canRandomize = techniques.some(t => t.available);
        this.results.currentlyRandomized = techniques.some(t => t.enabled);
    }
    
    /**
     * Detect if canvas fingerprinting protection is active
     */
    detectCanvasRandomization() {
        try {
            // Create a canvas and draw something specific
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            
            // Draw specific text
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#FF0000';
            ctx.fillText('FingerprintTest', 10, 10);
            ctx.fillStyle = '#00FF00';
            ctx.fillText('SampleTest', 10, 30);
            
            // Get the data URL
            const dataURL1 = canvas.toDataURL();
            
            // Draw exactly the same thing again
            const canvas2 = document.createElement('canvas');
            canvas2.width = 200;
            canvas2.height = 50;
            const ctx2 = canvas2.getContext('2d');
            
            ctx2.textBaseline = 'top';
            ctx2.font = '14px Arial';
            ctx2.fillStyle = '#FF0000';
            ctx2.fillText('FingerprintTest', 10, 10);
            ctx2.fillStyle = '#00FF00';
            ctx2.fillText('SampleTest', 10, 30);
            
            // Get the second data URL
            const dataURL2 = canvas2.toDataURL();
            
            // If they're different, some randomization is happening
            return dataURL1 !== dataURL2;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Detect if WebGL fingerprinting protection is active
     */
    detectWebGLRandomization() {
        try {
            // Create a WebGL context
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return false;
            
            // Get WebGL vendor and renderer info
            const debugInfo1 = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo1) return false;
            
            const vendor1 = gl.getParameter(debugInfo1.UNMASKED_VENDOR_WEBGL);
            const renderer1 = gl.getParameter(debugInfo1.UNMASKED_RENDERER_WEBGL);
            
            // Create a second WebGL context
            const canvas2 = document.createElement('canvas');
            const gl2 = canvas2.getContext('webgl') || canvas2.getContext('experimental-webgl');
            if (!gl2) return false;
            
            // Get second WebGL info
            const debugInfo2 = gl2.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo2) return false;
            
            const vendor2 = gl2.getParameter(debugInfo2.UNMASKED_VENDOR_WEBGL);
            const renderer2 = gl2.getParameter(debugInfo2.UNMASKED_RENDERER_WEBGL);
            
            // If they're different, randomization is happening
            return vendor1 !== vendor2 || renderer1 !== renderer2;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Detect if User-Agent spoofing is active
     */
    detectUserAgentSpoofing() {
        // This is difficult to detect directly
        // We can look for inconsistencies between reported user agent and observed behavior
        
        // Check if navigator.userAgent seems suspicious or modified
        const ua = navigator.userAgent;
        
        // Check for common privacy extensions that might modify user agent
        return ua.includes("Firefox") && navigator.productSub !== "20100101" ||
               ua.includes("Chrome") && /Firefox|Safari/.test(ua);
    }
    
    /**
     * Detect if audio fingerprinting protection is active
     */
    detectAudioRandomization() {
        try {
            // Create an AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return false;
            
            // Create two audio contexts and compare their behaviors
            const audioCtx1 = new AudioContext();
            const audioCtx2 = new AudioContext();
            
            // Create oscillators
            const oscillator1 = audioCtx1.createOscillator();
            const oscillator2 = audioCtx2.createOscillator();
            
            // Create analyzers
            const analyzer1 = audioCtx1.createAnalyser();
            const analyzer2 = audioCtx2.createAnalyser();
            
            // Connect oscillators to analyzers
            oscillator1.connect(analyzer1);
            oscillator2.connect(analyzer2);
            
            // Start oscillators
            oscillator1.start();
            oscillator2.start();
            
            // Get frequency data
            const data1 = new Uint8Array(analyzer1.frequencyBinCount);
            const data2 = new Uint8Array(analyzer2.frequencyBinCount);
            
            analyzer1.getByteFrequencyData(data1);
            analyzer2.getByteFrequencyData(data2);
            
            // Stop oscillators
            oscillator1.stop();
            oscillator2.stop();
            
            // Close audio contexts
            audioCtx1.close();
            audioCtx2.close();
            
            // Compare frequency data
            let different = false;
            for (let i = 0; i < Math.min(data1.length, data2.length); i++) {
                if (data1[i] !== data2[i]) {
                    different = true;
                    break;
                }
            }
            
            return different;
        } catch (e) {
            // If we can't test this, assume no randomization
            return false;
        }
    }
    
    /**
     * Detect if font enumeration protection is active
     */
    detectFontRandomization() {
        // This is challenging to detect directly
        // We can check some commonly modified CSS properties
        
        // Create a test element
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'Arial, sans-serif';
        testElement.style.fontSize = '16px';
        testElement.textContent = 'Font Test';
        
        // Add to body temporarily (hidden)
        testElement.style.position = 'absolute';
        testElement.style.opacity = '0';
        document.body.appendChild(testElement);
        
        // Get computed width
        const width1 = testElement.getBoundingClientRect().width;
        
        // Create a second test with same parameters
        const testElement2 = document.createElement('div');
        testElement2.style.fontFamily = 'Arial, sans-serif';
        testElement2.style.fontSize = '16px';
        testElement2.textContent = 'Font Test';
        testElement2.style.position = 'absolute';
        testElement2.style.opacity = '0';
        document.body.appendChild(testElement2);
        
        // Get second width
        const width2 = testElement2.getBoundingClientRect().width;
        
        // Clean up
        document.body.removeChild(testElement);
        document.body.removeChild(testElement2);
        
        // If widths differ, randomization might be happening
        return width1 !== width2;
    }
    
    /**
     * Detect existing randomization extensions or techniques
     */
    async detectExistingRandomization() {
        // Check for common privacy extensions that provide fingerprint randomization
        const commonExtensionPatterns = [
            // Privacy Badger may modify canvas fingerprinting
            { type: 'div', id: 'privacyBadgerIcon' },
            // Canvas Blocker extension
            { type: 'div', id: 'CanvasBlocker' },
            // Trace presence of Brave browser's fingerprinting protection
            { property: 'navigator.brave' }
        ];
        
        for (const pattern of commonExtensionPatterns) {
            if (pattern.type && pattern.id) {
                const element = document.getElementById(pattern.id);
                if (element && element.tagName.toLowerCase() === pattern.type) {
                    this.results.currentlyRandomized = true;
                    break;
                }
            } else if (pattern.property) {
                // Check for property
                const parts = pattern.property.split('.');
                let obj = window;
                let propertyExists = true;
                
                for (const part of parts) {
                    if (obj && obj.hasOwnProperty(part)) {
                        obj = obj[part];
                    } else {
                        propertyExists = false;
                        break;
                    }
                }
                
                if (propertyExists) {
                    this.results.currentlyRandomized = true;
                    break;
                }
            }
        }
    }
    
    /**
     * Prepare recommendations based on detected capabilities
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (!this.results.currentlyRandomized) {
            recommendations.push({
                title: "Install a fingerprinting protection extension",
                description: "Extensions like Privacy Badger or Canvas Blocker can help randomize your browser fingerprint.",
                priority: "high",
                implementation: "Install 'Privacy Badger' by the Electronic Frontier Foundation or 'Canvas Blocker' from your browser's extension store."
            });
            
            if (navigator.userAgent.toLowerCase().includes("firefox")) {
                recommendations.push({
                    title: "Enable Firefox's built-in fingerprinting protection",
                    description: "Firefox has built-in fingerprinting protection that can be enabled in privacy settings.",
                    priority: "high",
                    implementation: "Go to Firefox Menu > Settings > Privacy & Security > Custom > check 'Fingerprinters'."
                });
            } else if (navigator.userAgent.toLowerCase().includes("chrome")) {
                recommendations.push({
                    title: "Consider using a privacy-focused browser",
                    description: "Browsers like Firefox or Brave have better built-in fingerprinting protection than Chrome.",
                    priority: "medium",
                    implementation: "Install Firefox or Brave browser as an alternative to Chrome for privacy-sensitive browsing."
                });
            }
            
            recommendations.push({
                title: "Use a browser compartmentalization strategy",
                description: "Use different browsers for different activities to prevent cross-site tracking.",
                priority: "medium",
                implementation: "Use one browser for social media, another for banking, and a third for general browsing."
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
window.fingerprintRandomization = new FingerprintRandomization();