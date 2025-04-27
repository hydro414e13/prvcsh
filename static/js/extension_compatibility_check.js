/**
 * Browser Extension Compatibility Check
 * Analyzes the user's browser and recommends compatible privacy extensions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize extension compatibility check when the page loads
    initializeExtensionCheck();
    
    // Add event listener for the check button if present
    const checkExtensionsBtn = document.getElementById('checkExtensionsBtn');
    if (checkExtensionsBtn) {
        checkExtensionsBtn.addEventListener('click', function() {
            runExtensionCompatibilityCheck();
        });
    }
});

/**
 * Initialize extension compatibility checking components
 */
function initializeExtensionCheck() {
    // Add extension check section to the page if not already present
    if (document.getElementById('extension-check-section')) {
        setupExtensionResults();
    }
}

/**
 * Run the extension compatibility check
 */
function runExtensionCompatibilityCheck() {
    // Show loading indicator
    const resultContainer = document.getElementById('extension-compatibility-results');
    if (resultContainer) {
        resultContainer.innerHTML = '<div class="text-center my-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Analyzing browser and extensions...</p></div>';
    }
    
    // Detect browser type and version
    const browserInfo = detectBrowser();
    
    // Detect installed extensions (as much as possible via feature detection)
    detectExtensions()
        .then(function(detectedExtensions) {
            // Get recommendations based on browser and detected extensions
            const recommendations = getExtensionRecommendations(browserInfo, detectedExtensions);
            
            // Display the results
            displayExtensionResults(browserInfo, detectedExtensions, recommendations);
        })
        .catch(function(error) {
            console.error('Error in extension detection:', error);
            if (resultContainer) {
                resultContainer.innerHTML = '<div class="alert alert-danger">Error analyzing extensions. Please try again.</div>';
            }
        });
}

/**
 * Setup the extension results section
 */
function setupExtensionResults() {
    const resultsContainer = document.getElementById('extension-compatibility-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '<p class="text-center text-muted">Click "Check Extensions" to analyze your browser and get recommendations.</p>';
}

/**
 * Detect browser type and version
 * @returns {Object} Browser information
 */
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = {
        name: 'Unknown',
        version: 'Unknown',
        supportsWebExtensions: false,
        supportsChromiumExtensions: false,
        privacyFeatures: []
    };
    
    // Detect Firefox
    if (userAgent.indexOf('Firefox') !== -1) {
        browser.name = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (match) browser.version = match[1];
        browser.supportsWebExtensions = true;
        browser.privacyFeatures = [
            'Enhanced Tracking Protection',
            'Content Blocking',
            'DNS over HTTPS',
            'Fingerprinting Protection'
        ];
    } 
    // Detect Chrome
    else if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1 && userAgent.indexOf('OPR') === -1) {
        browser.name = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
        if (match) browser.version = match[1];
        browser.supportsChromiumExtensions = true;
        browser.privacyFeatures = [
            'Safe Browsing',
            'Site Isolation',
            'SameSite Cookies'
        ];
    } 
    // Detect Edge
    else if (userAgent.indexOf('Edg') !== -1) {
        browser.name = 'Edge';
        const match = userAgent.match(/Edg\/(\d+\.\d+)/);
        if (match) browser.version = match[1];
        browser.supportsChromiumExtensions = true;
        browser.privacyFeatures = [
            'Tracking Prevention',
            'SmartScreen Filter',
            'InPrivate Browsing'
        ];
    } 
    // Detect Opera
    else if (userAgent.indexOf('OPR') !== -1 || userAgent.indexOf('Opera') !== -1) {
        browser.name = 'Opera';
        const match = userAgent.match(/OPR\/(\d+\.\d+)/);
        if (match) browser.version = match[1];
        browser.supportsChromiumExtensions = true;
        browser.privacyFeatures = [
            'Built-in Ad Blocker',
            'Built-in VPN',
            'Tracking Protection'
        ];
    } 
    // Detect Safari
    else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
        browser.name = 'Safari';
        const match = userAgent.match(/Version\/(\d+\.\d+)/);
        if (match) browser.version = match[1];
        browser.supportsWebExtensions = false;
        browser.privacyFeatures = [
            'Intelligent Tracking Prevention',
            'Privacy Report',
            'Cross-site Tracking Prevention'
        ];
    } 
    // Detect Brave (Chromium-based)
    else if (navigator.brave && navigator.brave.isBrave) {
        browser.name = 'Brave';
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
        if (match) browser.version = match[1];
        browser.supportsChromiumExtensions = true;
        browser.privacyFeatures = [
            'Shields (Built-in Ad Blocker)',
            'HTTPS Everywhere',
            'Script Blocking',
            'Fingerprinting Protection'
        ];
    }
    
    // Additional feature detection for browsers
    browser.hasLocalStorage = typeof localStorage !== 'undefined';
    browser.hasSessionStorage = typeof sessionStorage !== 'undefined';
    browser.hasIndexedDB = typeof indexedDB !== 'undefined';
    browser.hasServiceWorker = 'serviceWorker' in navigator;
    
    return browser;
}

/**
 * Detect installed extensions via feature detection
 * @returns {Promise<Array>} Detected extensions information
 */
async function detectExtensions() {
    let detectedExtensions = [];
    
    // Check if uBlock Origin is likely installed by looking for its element hiding styles
    if (document.querySelectorAll('style[id^="ublock"]').length > 0) {
        detectedExtensions.push({
            name: 'uBlock Origin',
            type: 'Ad Blocker',
            detected: true,
            confidence: 'high'
        });
    }
    
    // Check for AdBlock or Adblock Plus by looking for their element hiding
    if (document.querySelectorAll('.adsbygoogle').length === 0 || 
        document.getElementById('ad-container') === null) {
        detectedExtensions.push({
            name: 'AdBlock or Adblock Plus',
            type: 'Ad Blocker',
            detected: true,
            confidence: 'medium'
        });
    }
    
    // Check for Privacy Badger elements
    if (document.querySelectorAll('script[data-privacy-badger="true"]').length > 0) {
        detectedExtensions.push({
            name: 'Privacy Badger',
            type: 'Tracker Blocker',
            detected: true,
            confidence: 'high'
        });
    }

    // Check for HTTPS Everywhere by trying to detect its redirection behavior
    if (document.querySelector('meta[http-equiv="Content-Security-Policy"][content*="upgrade-insecure-requests"]')) {
        detectedExtensions.push({
            name: 'HTTPS Everywhere or similar',
            type: 'HTTPS Enforcer',
            detected: true,
            confidence: 'medium'
        });
    }
    
    // Check for Dark Reader extension
    if (document.documentElement.classList.contains('darkreader') || 
        document.querySelector('meta[name="darkreader"]')) {
        detectedExtensions.push({
            name: 'Dark Reader',
            type: 'Appearance',
            detected: true,
            confidence: 'high'
        });
    }
    
    // Check for NoScript/ScriptSafe behavior
    const scriptBlocked = await testScriptExecution();
    if (scriptBlocked) {
        detectedExtensions.push({
            name: 'NoScript or ScriptSafe',
            type: 'Script Blocker',
            detected: true,
            confidence: 'medium'
        });
    }
    
    // Check for fingerprinting protection
    const fingerprintingProtected = await testFingerprintingProtection();
    if (fingerprintingProtected) {
        detectedExtensions.push({
            name: 'Canvas Blocker or Fingerprinting Protection',
            type: 'Anti-Fingerprinting',
            detected: true,
            confidence: 'medium'
        });
    }
    
    return detectedExtensions;
}

/**
 * Test if script execution might be blocked
 * @returns {Promise<boolean>} Whether script blocking is detected
 */
async function testScriptExecution() {
    try {
        // Create a test script element
        const script = document.createElement('script');
        script.id = 'script-execution-test';
        script.textContent = 'window.scriptExecutionTestResult = true;';
        document.head.appendChild(script);
        
        // Wait a short time and check if the script executed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Clean up
        if (document.getElementById('script-execution-test')) {
            document.head.removeChild(script);
        }
        
        // Return true if script execution seems to be blocked
        return window.scriptExecutionTestResult !== true;
    } catch (e) {
        // If there was an error, script execution might be blocked
        return true;
    }
}

/**
 * Test if fingerprinting protection is active
 * @returns {Promise<boolean>} Whether fingerprinting protection is detected
 */
async function testFingerprintingProtection() {
    try {
        // Try to create a canvas and draw to it
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return true; // Canvas blocked entirely
        
        // Draw some text
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.fillText('Fingerprint test', 0, 0);
        
        // Get the pixel data
        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            // If we can't get image data, fingerprinting protection is active
            return true;
        }
        
        // Try a second time and see if the result is different (randomization)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText('Fingerprint test', 0, 0);
        let imageData2;
        try {
            imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            return true;
        }
        
        // Compare the two images (simplified)
        const data1 = imageData.data;
        const data2 = imageData2.data;
        let differences = 0;
        
        // Just check a sample of pixels for differences
        for (let i = 0; i < data1.length; i += 100) {
            if (data1[i] !== data2[i]) {
                differences++;
            }
        }
        
        // If there are differences, canvas randomization is active
        return differences > 3;
    } catch (e) {
        // If there was an error, assume fingerprinting protection
        return true;
    }
}

/**
 * Get recommended extensions based on browser and detected extensions
 * @param {Object} browser - Browser information
 * @param {Array} detectedExtensions - Detected extensions
 * @returns {Object} Extension recommendations
 */
function getExtensionRecommendations(browser, detectedExtensions) {
    const recommendations = {
        essential: [],
        recommended: [],
        optional: [],
        conflicting: [],
        compatibility: {}
    };
    
    // Check for detected extension types
    const hasAdBlocker = detectedExtensions.some(ext => ext.type === 'Ad Blocker');
    const hasTrackerBlocker = detectedExtensions.some(ext => ext.type === 'Tracker Blocker');
    const hasScriptBlocker = detectedExtensions.some(ext => ext.type === 'Script Blocker');
    const hasHttpsEnforcer = detectedExtensions.some(ext => ext.type === 'HTTPS Enforcer');
    const hasAntiFingerprinting = detectedExtensions.some(ext => ext.type === 'Anti-Fingerprinting');
    
    // Define extension sets based on browser
    if (browser.name === 'Firefox') {
        if (!hasAdBlocker) {
            recommendations.essential.push({
                name: 'uBlock Origin',
                url: 'https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/',
                description: 'Efficient content blocker with minimal resource usage',
                icon: 'shield-alt'
            });
        }
        
        if (!hasTrackerBlocker) {
            recommendations.recommended.push({
                name: 'Privacy Badger',
                url: 'https://addons.mozilla.org/en-US/firefox/addon/privacy-badger17/',
                description: 'Automatically learns to block invisible trackers',
                icon: 'user-secret'
            });
        }
        
        if (!hasAntiFingerprinting) {
            recommendations.recommended.push({
                name: 'Canvas Blocker',
                url: 'https://addons.mozilla.org/en-US/firefox/addon/canvasblocker/',
                description: 'Prevents fingerprinting via canvas and other APIs',
                icon: 'fingerprint'
            });
        }
        
        recommendations.optional.push({
            name: 'Decentraleyes',
            url: 'https://addons.mozilla.org/en-US/firefox/addon/decentraleyes/',
            description: 'Protects against tracking through CDNs',
            icon: 'globe'
        });
        
        if (hasScriptBlocker) {
            recommendations.conflicting.push({
                name: 'NoScript with uBlock Origin',
                description: 'These extensions may have overlapping functionality. For better performance, consider using uBlock Origin in advanced mode instead of both.'
            });
        }
        
        // Compatibility notes for Firefox
        recommendations.compatibility = {
            note: 'Firefox provides strong built-in tracking protection. For optimal privacy with minimal performance impact, we recommend using uBlock Origin and Privacy Badger along with Firefox\'s Enhanced Tracking Protection set to "Strict".',
            browserFeatures: browser.privacyFeatures
        };
    } 
    else if (browser.name === 'Chrome' || browser.name === 'Edge' || browser.name === 'Opera') {
        // Recommendations for Chromium-based browsers
        if (!hasAdBlocker) {
            recommendations.essential.push({
                name: 'uBlock Origin',
                url: 'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
                description: 'Efficient content blocker with minimal resource usage',
                icon: 'shield-alt'
            });
        }
        
        if (!hasTrackerBlocker) {
            recommendations.recommended.push({
                name: 'Privacy Badger',
                url: 'https://chrome.google.com/webstore/detail/privacy-badger/pkehgijcmpdhfbdbbnkijodmdjhbjlgp',
                description: 'Automatically learns to block invisible trackers',
                icon: 'user-secret'
            });
        }
        
        if (!hasHttpsEnforcer) {
            recommendations.recommended.push({
                name: 'HTTPS Everywhere',
                url: 'https://chrome.google.com/webstore/detail/https-everywhere/gcbommkclmclpchllfjekcdonpmejbdp',
                description: 'Encrypts your communications with many websites',
                icon: 'lock'
            });
        }
        
        recommendations.optional.push({
            name: 'ClearURLs',
            url: 'https://chrome.google.com/webstore/detail/clearurls/lckanjgmijmafbedllaakclkaicjfmnk',
            description: 'Removes tracking elements from URLs',
            icon: 'link'
        });
        
        // Compatibility notes for Chromium-based browsers
        recommendations.compatibility = {
            note: `${browser.name} doesn't provide the same level of privacy features as Firefox or Brave. For better privacy, you should install more extensions or consider switching browsers.`,
            browserFeatures: browser.privacyFeatures
        };
    } 
    else if (browser.name === 'Safari') {
        // Safari has limited extension support
        recommendations.essential.push({
            name: 'AdGuard for Safari',
            url: 'https://apps.apple.com/app/apple-store/id1440147259',
            description: 'Ad blocker for Safari',
            icon: 'shield-alt'
        });
        
        // Compatibility notes for Safari
        recommendations.compatibility = {
            note: 'Safari has limited extension support but includes Intelligent Tracking Prevention. Consider Firefox or Brave for better privacy extension support.',
            browserFeatures: browser.privacyFeatures
        };
    } 
    else if (browser.name === 'Brave') {
        // Brave has built-in blocking
        recommendations.optional.push({
            name: 'Privacy Badger',
            url: 'https://chrome.google.com/webstore/detail/privacy-badger/pkehgijcmpdhfbdbbnkijodmdjhbjlgp',
            description: 'Can complement Brave\'s built-in protections',
            icon: 'user-secret'
        });
        
        // Compatibility notes for Brave
        recommendations.compatibility = {
            note: 'Brave already includes built-in ad and tracker blocking. You need fewer extensions compared to other browsers.',
            browserFeatures: browser.privacyFeatures
        };
    }
    
    return recommendations;
}

/**
 * Display extension detection and recommendation results
 * @param {Object} browser - Browser information
 * @param {Array} detectedExtensions - Detected extensions
 * @param {Object} recommendations - Extension recommendations
 */
function displayExtensionResults(browser, detectedExtensions, recommendations) {
    const resultContainer = document.getElementById('extension-compatibility-results');
    if (!resultContainer) return;
    
    // Create HTML for results
    let html = `
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0"><i class="fas fa-puzzle-piece me-2"></i>Browser Extension Compatibility</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-globe me-2"></i>Browser Information</h5>
                        <table class="table table-sm">
                            <tr>
                                <th>Browser</th>
                                <td>${browser.name}</td>
                            </tr>
                            <tr>
                                <th>Version</th>
                                <td>${browser.version}</td>
                            </tr>
                            <tr>
                                <th>Privacy Features</th>
                                <td>
                                    <ul class="mb-0 ps-3">
                                        ${browser.privacyFeatures.map(feature => `<li>${feature}</li>`).join('')}
                                    </ul>
                                </td>
                            </tr>
                        </table>
                        
                        <h5 class="mt-4"><i class="fas fa-eye me-2"></i>Detected Extensions</h5>
                        ${detectedExtensions.length > 0 ? `
                            <ul class="list-group">
                                ${detectedExtensions.map(ext => `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${ext.name}</strong>
                                            <span class="ms-2 badge bg-secondary">${ext.type}</span>
                                        </div>
                                        <span class="badge ${ext.confidence === 'high' ? 'bg-success' : 'bg-warning text-dark'}">
                                            ${ext.confidence} confidence
                                        </span>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : `<p class="text-muted">No extensions were detected automatically. You may still have privacy extensions installed that couldn't be detected.</p>`}
                    </div>
                    
                    <div class="col-md-6">
                        <h5><i class="fas fa-star me-2"></i>Recommended Extensions</h5>
                        
                        <div class="compatibility-note alert alert-info mb-3">
                            <i class="fas fa-info-circle me-2"></i>
                            ${recommendations.compatibility.note}
                        </div>
                        
                        ${recommendations.essential.length > 0 ? `
                            <h6 class="mt-3">Essential</h6>
                            <div class="list-group mb-3">
                                ${recommendations.essential.map(ext => `
                                    <a href="${ext.url}" target="_blank" rel="noopener" class="list-group-item list-group-item-action d-flex align-items-center">
                                        <i class="fas fa-${ext.icon} me-3 text-primary"></i>
                                        <div>
                                            <strong>${ext.name}</strong>
                                            <p class="mb-0 small text-muted">${ext.description}</p>
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${recommendations.recommended.length > 0 ? `
                            <h6 class="mt-3">Recommended</h6>
                            <div class="list-group mb-3">
                                ${recommendations.recommended.map(ext => `
                                    <a href="${ext.url}" target="_blank" rel="noopener" class="list-group-item list-group-item-action d-flex align-items-center">
                                        <i class="fas fa-${ext.icon} me-3 text-success"></i>
                                        <div>
                                            <strong>${ext.name}</strong>
                                            <p class="mb-0 small text-muted">${ext.description}</p>
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${recommendations.optional.length > 0 ? `
                            <h6 class="mt-3">Optional</h6>
                            <div class="list-group mb-3">
                                ${recommendations.optional.map(ext => `
                                    <a href="${ext.url}" target="_blank" rel="noopener" class="list-group-item list-group-item-action d-flex align-items-center">
                                        <i class="fas fa-${ext.icon} me-3 text-secondary"></i>
                                        <div>
                                            <strong>${ext.name}</strong>
                                            <p class="mb-0 small text-muted">${ext.description}</p>
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${recommendations.conflicting.length > 0 ? `
                            <h6 class="mt-3">Potential Conflicts</h6>
                            <div class="alert alert-warning">
                                ${recommendations.conflicting.map(conflict => `
                                    <p><strong>${conflict.name}</strong>: ${conflict.description}</p>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert the HTML into the container
    resultContainer.innerHTML = html;
}