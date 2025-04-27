/**
 * Browser Extension Detection Script
 * Attempts to detect privacy and security extensions installed in the browser
 */
class ExtensionDetector {
    constructor() {
        this.results = {
            tested: false,
            privacyExtensionsDetected: false,
            detectedExtensions: [],
            errorMessage: null
        };
        
        // Known extension signatures to look for
        this.extensionSignatures = [
            {
                name: "uBlock Origin",
                test: () => {
                    return typeof window.uBlock0 !== 'undefined' || 
                           document.querySelector('html').classList.contains('ua-ublock-origin');
                }
            },
            {
                name: "Adblock Plus",
                test: () => {
                    return typeof window.AdblockPlus !== 'undefined' || 
                           document.getElementById('abp-anchor') !== null;
                }
            },
            {
                name: "Privacy Badger",
                test: () => {
                    // Look for Privacy Badger specific DOM modifications
                    return document.querySelector('[data-pb-state]') !== null;
                }
            },
            {
                name: "HTTPS Everywhere",
                test: () => {
                    return typeof window.httpsEverywhereEnabled !== 'undefined';
                }
            },
            {
                name: "NoScript",
                test: () => {
                    // NoScript usually modifies the browser's security policies
                    return typeof window.__NoScript !== 'undefined' ||
                           document.documentElement.getAttribute('data-noscript') !== null;
                }
            },
            {
                name: "Ghostery",
                test: () => {
                    return typeof window.Ghostery !== 'undefined' ||
                           document.querySelector('.ghostery-blocked') !== null;
                }
            },
            {
                name: "DuckDuckGo Privacy Essentials",
                test: () => {
                    return document.documentElement.classList.contains('ddg-extension');
                }
            },
            {
                name: "Decentraleyes",
                test: () => {
                    return typeof window.decentraleyes !== 'undefined';
                }
            }
        ];
    }

    /**
     * Attempt to detect browser extensions
     * @returns {Object} Results of extension detection
     */
    async detectExtensions() {
        try {
            this.results.tested = true;
            
            // Check for CSS side-effects
            // Create a test element
            const testDiv = document.createElement('div');
            testDiv.id = 'extension-detection-test';
            testDiv.className = 'ads ad adsbox doubleclick ad-placement carbon-ads';
            testDiv.style.height = '1px';
            testDiv.style.width = '1px';
            testDiv.style.position = 'absolute';
            testDiv.style.bottom = '-1px';
            testDiv.style.left = '-1px';
            
            document.body.appendChild(testDiv);
            
            // Give it a moment to be affected by extensions
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if ad blockers are active (would hide our test div)
            const adBlockerDetected = window.getComputedStyle(testDiv).display === 'none' || 
                                     !testDiv.offsetParent;
                                     
            if (adBlockerDetected) {
                this.results.detectedExtensions.push({
                    name: "Generic Ad Blocker",
                    confidence: "High"
                });
            }
            
            // Clean up test div
            document.body.removeChild(testDiv);
            
            // Check for specific extension signatures
            for (const extension of this.extensionSignatures) {
                try {
                    if (extension.test()) {
                        this.results.detectedExtensions.push({
                            name: extension.name,
                            confidence: "Medium" // Hard to be 100% certain with client-side detection
                        });
                    }
                } catch (err) {
                    console.warn(`Error testing for ${extension.name}:`, err);
                }
            }
            
            // Check for global variables from extensions
            // Note: Modern extensions use isolated worlds via content scripts, making this less reliable
            const knownExtensionVars = [
                { name: '_gaq', extension: 'Google Analytics Opt-out' },
                { name: 'gaGlobal', extension: 'Google Analytics' }
            ];
            
            for (const v of knownExtensionVars) {
                if (v.name in window) {
                    this.results.detectedExtensions.push({
                        name: v.extension,
                        confidence: "Low"
                    });
                }
            }
            
            // Set privacy extensions detected flag
            this.results.privacyExtensionsDetected = this.results.detectedExtensions.length > 0;
            
            // Check for feature blocking using feature detection
            const featureTests = [
                {
                    name: "WebRTC Blocking Extension",
                    test: async () => {
                        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                            return true; // Possibly blocked
                        }
                        
                        try {
                            // This will get blocked by some privacy extensions
                            const devices = await navigator.mediaDevices.enumerateDevices();
                            return devices.length === 0; // Suspicious if no devices at all
                        } catch(e) {
                            return true; // Accessing was prevented
                        }
                    }
                },
                {
                    name: "Canvas Blocking Extension",
                    test: async () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Draw something unique
                        ctx.textBaseline = "top";
                        ctx.font = "14px 'Arial'";
                        ctx.fillStyle = "#f60";
                        ctx.fillRect(125, 1, 62, 20);
                        ctx.fillStyle = "#069";
                        ctx.fillText("Privacy Test", 2, 15);
                        
                        const dataURL = canvas.toDataURL();
                        // If canvas blocking is active, this might return a blank image
                        // or a consistent fingerprint regardless of input
                        return dataURL === "data:," || 
                              dataURL === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAT0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICXAc+tAAFdcBmtAAAAAElFTkSuQmCC";
                    }
                }
            ];
            
            // Run feature tests
            for (const test of featureTests) {
                if (await test.test()) {
                    this.results.detectedExtensions.push({
                        name: test.name,
                        confidence: "Medium"
                    });
                }
            }
            
            return this.results;
            
        } catch (error) {
            console.error('Extension detection error:', error);
            this.results.errorMessage = error.message;
            return this.results;
        }
    }
}