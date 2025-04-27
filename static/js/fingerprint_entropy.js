/**
 * Browser Fingerprinting Entropy Calculator
 * Calculates how unique and identifiable a browser's fingerprint is
 */
class FingerprintEntropyCalculator {
    constructor() {
        this.results = {
            tested: false,
            totalEntropy: 0,
            entropyDetails: {},
            uniquenessScore: 0, // 0-100 scale
            fingerprintComponents: []
        };
        
        // Estimated entropy bits for different browser characteristics
        // These values are approximate and based on research
        this.entropyEstimates = {
            userAgent: 10.0,
            screenResolution: 4.83,
            colorDepth: 2.0,
            timezone: 3.04,
            plugins: 15.4,
            fonts: 13.9,
            canvas: 8.6,
            webGL: 10.0,
            audioContext: 5.4,
            language: 2.3,
            platform: 2.3,
            doNotTrack: 0.94,
            touchSupport: 2.0,
            hardwareConcurrency: 2.1,
            deviceMemory: 1.8,
            adBlocker: 1.0,
            battery: 1.5,
            sessionStorage: 0.6,
            localStorage: 0.6,
            indexedDB: 0.6,
            cpuClass: 0.7,
            pixelRatio: 2.5
        };
    }

    /**
     * Calculate fingerprint entropy to determine browser uniqueness
     * @returns {Object} Results of the entropy calculation
     */
    async calculateFingerprint() {
        try {
            this.results.tested = true;
            
            // Process fingerprint components
            await this.collectAllComponentEntropy();
            
            // Calculate total entropy
            this.results.totalEntropy = Object.values(this.results.entropyDetails).reduce((sum, value) => sum + value, 0);
            
            // Calculate uniqueness score (0-100)
            // This is a simplified calculation - the higher the entropy, the more unique the browser
            this.results.uniquenessScore = Math.min(100, Math.round((this.results.totalEntropy / 80) * 100));
            
            return this.results;
            
        } catch (error) {
            console.error('Fingerprinting entropy calculation error:', error);
            this.results.error = error.message;
            return this.results;
        }
    }

    /**
     * Collect entropy from all available fingerprinting components
     */
    async collectAllComponentEntropy() {
        // Navigator and user agent properties
        this.analyzeUserAgent();
        this.analyzeNavigatorProperties();
        
        // Screen properties
        this.analyzeScreenProperties();
        
        // Hardware information
        this.analyzeHardwareInfo();
        
        // DOM features
        this.analyzeDOMFeatures();
        
        // Browser features
        this.analyzeBrowserFeatures();
        
        // Advanced fingerprinting techniques
        await this.analyzeAdvancedTechniques();
    }

    /**
     * Analyze user agent string for entropy
     */
    analyzeUserAgent() {
        const userAgent = navigator.userAgent;
        this.results.entropyDetails.userAgent = this.entropyEstimates.userAgent;
        this.results.fingerprintComponents.push({
            name: 'User Agent',
            value: userAgent,
            entropyBits: this.entropyEstimates.userAgent
        });
    }

    /**
     * Analyze navigator properties for fingerprinting entropy
     */
    analyzeNavigatorProperties() {
        // Language information
        const language = navigator.language || navigator.userLanguage;
        this.results.entropyDetails.language = this.entropyEstimates.language;
        this.results.fingerprintComponents.push({
            name: 'Language',
            value: language,
            entropyBits: this.entropyEstimates.language
        });
        
        // Platform information
        const platform = navigator.platform;
        this.results.entropyDetails.platform = this.entropyEstimates.platform;
        this.results.fingerprintComponents.push({
            name: 'Platform',
            value: platform,
            entropyBits: this.entropyEstimates.platform
        });
        
        // Do Not Track setting
        const dnt = navigator.doNotTrack || window.doNotTrack;
        this.results.entropyDetails.doNotTrack = this.entropyEstimates.doNotTrack;
        this.results.fingerprintComponents.push({
            name: 'Do Not Track',
            value: dnt,
            entropyBits: this.entropyEstimates.doNotTrack
        });
    }

    /**
     * Analyze screen properties for fingerprinting entropy
     */
    analyzeScreenProperties() {
        // Screen resolution
        const screenResolution = `${screen.width}x${screen.height}`;
        this.results.entropyDetails.screenResolution = this.entropyEstimates.screenResolution;
        this.results.fingerprintComponents.push({
            name: 'Screen Resolution',
            value: screenResolution,
            entropyBits: this.entropyEstimates.screenResolution
        });
        
        // Color depth
        const colorDepth = screen.colorDepth;
        this.results.entropyDetails.colorDepth = this.entropyEstimates.colorDepth;
        this.results.fingerprintComponents.push({
            name: 'Color Depth',
            value: colorDepth,
            entropyBits: this.entropyEstimates.colorDepth
        });
        
        // Pixel ratio
        const pixelRatio = window.devicePixelRatio;
        this.results.entropyDetails.pixelRatio = this.entropyEstimates.pixelRatio;
        this.results.fingerprintComponents.push({
            name: 'Pixel Ratio',
            value: pixelRatio,
            entropyBits: this.entropyEstimates.pixelRatio
        });
    }

    /**
     * Analyze hardware information for fingerprinting entropy
     */
    analyzeHardwareInfo() {
        // Hardware concurrency (CPU cores)
        if (navigator.hardwareConcurrency) {
            const hardwareConcurrency = navigator.hardwareConcurrency;
            this.results.entropyDetails.hardwareConcurrency = this.entropyEstimates.hardwareConcurrency;
            this.results.fingerprintComponents.push({
                name: 'CPU Cores',
                value: hardwareConcurrency,
                entropyBits: this.entropyEstimates.hardwareConcurrency
            });
        }
        
        // Device memory
        if (navigator.deviceMemory) {
            const deviceMemory = navigator.deviceMemory;
            this.results.entropyDetails.deviceMemory = this.entropyEstimates.deviceMemory;
            this.results.fingerprintComponents.push({
                name: 'Device Memory',
                value: deviceMemory + 'GB',
                entropyBits: this.entropyEstimates.deviceMemory
            });
        }
    }

    /**
     * Analyze DOM features for fingerprinting entropy
     */
    analyzeDOMFeatures() {
        // Touch support
        const touchPoints = navigator.maxTouchPoints || 0;
        const touchSupport = touchPoints > 0 ? `Yes (${touchPoints} points)` : 'No';
        this.results.entropyDetails.touchSupport = this.entropyEstimates.touchSupport;
        this.results.fingerprintComponents.push({
            name: 'Touch Support',
            value: touchSupport,
            entropyBits: this.entropyEstimates.touchSupport
        });
        
        // Check for storage mechanisms
        this.results.entropyDetails.localStorage = this.entropyEstimates.localStorage;
        this.results.fingerprintComponents.push({
            name: 'Local Storage',
            value: typeof localStorage !== 'undefined' ? 'Available' : 'Unavailable',
            entropyBits: this.entropyEstimates.localStorage
        });
        
        this.results.entropyDetails.sessionStorage = this.entropyEstimates.sessionStorage;
        this.results.fingerprintComponents.push({
            name: 'Session Storage',
            value: typeof sessionStorage !== 'undefined' ? 'Available' : 'Unavailable',
            entropyBits: this.entropyEstimates.sessionStorage
        });
        
        this.results.entropyDetails.indexedDB = this.entropyEstimates.indexedDB;
        this.results.fingerprintComponents.push({
            name: 'IndexedDB',
            value: typeof indexedDB !== 'undefined' ? 'Available' : 'Unavailable',
            entropyBits: this.entropyEstimates.indexedDB
        });
    }

    /**
     * Analyze browser features for fingerprinting entropy
     */
    analyzeBrowserFeatures() {
        // Timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.results.entropyDetails.timezone = this.entropyEstimates.timezone;
        this.results.fingerprintComponents.push({
            name: 'Timezone',
            value: timezone,
            entropyBits: this.entropyEstimates.timezone
        });
        
        // AdBlock detection (simplified)
        const adBlockDetection = this.detectAdBlocker();
        this.results.entropyDetails.adBlocker = this.entropyEstimates.adBlocker;
        this.results.fingerprintComponents.push({
            name: 'Ad Blocker',
            value: adBlockDetection ? 'Detected' : 'Not detected',
            entropyBits: this.entropyEstimates.adBlocker
        });
    }

    /**
     * Simple AdBlock detection
     * @returns {boolean} Whether an ad blocker appears to be present
     */
    detectAdBlocker() {
        // Very simplified - in reality, many ad blockers now avoid detection
        // This would need a more sophisticated approach in production
        return false;
    }

    /**
     * Analyze advanced fingerprinting techniques
     */
    async analyzeAdvancedTechniques() {
        // Canvas fingerprinting
        this.results.entropyDetails.canvas = this.entropyEstimates.canvas;
        this.results.fingerprintComponents.push({
            name: 'Canvas Fingerprint',
            value: 'Analyzed',
            entropyBits: this.entropyEstimates.canvas
        });
        
        // WebGL fingerprinting
        if (typeof WebGLRenderingContext !== 'undefined') {
            this.results.entropyDetails.webGL = this.entropyEstimates.webGL;
            this.results.fingerprintComponents.push({
                name: 'WebGL',
                value: 'Available',
                entropyBits: this.entropyEstimates.webGL
            });
        }
        
        // Audio fingerprinting
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            this.results.entropyDetails.audioContext = this.entropyEstimates.audioContext;
            this.results.fingerprintComponents.push({
                name: 'Audio Context',
                value: 'Available',
                entropyBits: this.entropyEstimates.audioContext
            });
        }
        
        // Battery status
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                this.results.entropyDetails.battery = this.entropyEstimates.battery;
                this.results.fingerprintComponents.push({
                    name: 'Battery API',
                    value: 'Available',
                    entropyBits: this.entropyEstimates.battery
                });
            } catch (e) {
                // Battery API not accessible
            }
        }
    }
}