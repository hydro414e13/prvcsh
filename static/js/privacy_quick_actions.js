/**
 * Privacy Quick Actions
 * Provides one-click privacy enhancements for common privacy issues
 */
class PrivacyQuickActions {
    constructor() {
        this.actions = {
            webrtc: {
                title: 'Fix WebRTC Leaks',
                description: 'Prevent WebRTC from leaking your local IP address',
                browserSupport: {
                    'Chrome': true,
                    'Firefox': true,
                    'Safari': false,
                    'Edge': true
                },
                execute: this.fixWebRTCLeak.bind(this)
            },
            cookies: {
                title: 'Clear Tracking Cookies',
                description: 'Remove cookies used for tracking your activity',
                browserSupport: {
                    'Chrome': true,
                    'Firefox': true,
                    'Safari': true,
                    'Edge': true
                },
                execute: this.clearTrackingCookies.bind(this)
            },
            dnt: {
                title: 'Enable Do Not Track',
                description: 'Send Do Not Track signal to websites',
                browserSupport: {
                    'Chrome': true,
                    'Firefox': true,
                    'Safari': true,
                    'Edge': true
                },
                execute: this.enableDoNotTrack.bind(this)
            },
            https: {
                title: 'Force HTTPS',
                description: 'Automatically upgrade to HTTPS connections',
                browserSupport: {
                    'Chrome': true,
                    'Firefox': true,
                    'Safari': true,
                    'Edge': true
                },
                execute: this.forceHTTPS.bind(this)
            },
            fingerprint: {
                title: 'Reduce Fingerprinting',
                description: 'Apply basic protections against browser fingerprinting',
                browserSupport: {
                    'Chrome': true,
                    'Firefox': true,
                    'Safari': true,
                    'Edge': true
                },
                execute: this.reduceFingerprintSurface.bind(this)
            },
            permissions: {
                title: 'Review Permissions',
                description: 'Check and adjust site permissions for privacy',
                browserSupport: {
                    'Chrome': true,
                    'Firefox': true,
                    'Safari': true,
                    'Edge': true
                },
                execute: this.reviewPermissions.bind(this)
            }
        };
        
        // Detect browser
        this.browser = this.detectBrowser();
    }
    
    /**
     * Initialize the quick actions UI
     */
    init() {
        // Create Quick Actions UI
        this.createQuickActionsUI();
        
        // Add event listeners
        this.addEventListeners();
        
        console.log('Privacy Quick Actions initialized');
    }
    
    /**
     * Detect browser type
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        
        if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (userAgent.indexOf('SamsungBrowser') > -1) {
            browser = 'Samsung Internet';
        } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
            browser = 'Opera';
        } else if (userAgent.indexOf('Trident') > -1) {
            browser = 'Internet Explorer';
        } else if (userAgent.indexOf('Edge') > -1) {
            browser = 'Edge';
        } else if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
        }
        
        return browser;
    }
    
    /**
     * Create the quick actions UI
     */
    createQuickActionsUI() {
        const container = document.getElementById('privacy-quick-actions');
        if (!container) return;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'quick-actions-header mb-3';
        header.innerHTML = `
            <h4><i class="fas fa-bolt me-2"></i>One-Click Privacy Actions</h4>
            <p class="text-muted">Detected browser: <strong>${this.browser}</strong></p>
        `;
        container.appendChild(header);
        
        // Create actions grid
        const actionsGrid = document.createElement('div');
        actionsGrid.className = 'row g-3';
        
        // Add each action button
        for (const [actionKey, action] of Object.entries(this.actions)) {
            // Check if browser is supported
            const isSupported = action.browserSupport[this.browser] || false;
            
            const actionCol = document.createElement('div');
            actionCol.className = 'col-md-6 col-lg-4';
            
            const actionCard = document.createElement('div');
            actionCard.className = 'card h-100 action-card';
            actionCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${action.title}</h5>
                    <p class="card-text">${action.description}</p>
                </div>
                <div class="card-footer bg-transparent border-0">
                    <button 
                        class="btn ${isSupported ? 'btn-primary' : 'btn-secondary'} quick-action-btn w-100" 
                        data-action="${actionKey}"
                        ${!isSupported ? 'disabled' : ''}
                    >
                        ${isSupported ? '<i class="fas fa-bolt me-2"></i>Apply Now' : 'Not Available'}
                    </button>
                </div>
                ${!isSupported ? `
                <div class="unsupported-overlay">
                    <div class="unsupported-message">
                        <i class="fas fa-ban me-2"></i>Not supported in ${this.browser}
                    </div>
                </div>` : ''}
            `;
            
            actionCol.appendChild(actionCard);
            actionsGrid.appendChild(actionCol);
        }
        
        container.appendChild(actionsGrid);
        
        // Create results area
        const resultsArea = document.createElement('div');
        resultsArea.className = 'action-results mt-4 d-none';
        resultsArea.id = 'action-results';
        container.appendChild(resultsArea);
    }
    
    /**
     * Add event listeners for action buttons
     */
    addEventListeners() {
        const buttons = document.querySelectorAll('.quick-action-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const actionKey = e.target.getAttribute('data-action');
                if (actionKey && this.actions[actionKey]) {
                    this.executeAction(actionKey);
                }
            });
        });
    }
    
    /**
     * Execute a specific privacy action
     */
    executeAction(actionKey) {
        const action = this.actions[actionKey];
        if (!action) return;
        
        try {
            // Call the action's execute method
            const result = action.execute();
            this.showActionResult(action.title, result);
        } catch (error) {
            console.error(`Error executing privacy action ${actionKey}:`, error);
            this.showActionResult(action.title, {
                success: false,
                message: 'An error occurred while applying this privacy enhancement.',
                details: error.message
            });
        }
    }
    
    /**
     * Show the result of an action in the UI
     */
    showActionResult(actionTitle, result) {
        const resultsArea = document.getElementById('action-results');
        if (!resultsArea) return;
        
        // Make results area visible
        resultsArea.classList.remove('d-none');
        
        // Create result alert
        const resultAlert = document.createElement('div');
        resultAlert.className = `alert ${result.success ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`;
        
        // Create content
        resultAlert.innerHTML = `
            <h5>
                <i class="fas ${result.success ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
                ${actionTitle}
            </h5>
            <p>${result.message}</p>
            ${result.details ? `<p class="small">${result.details}</p>` : ''}
            ${result.steps ? `
                <div class="mt-2">
                    <p class="mb-1"><strong>Next steps:</strong></p>
                    <ol class="ps-3 mb-0">
                        ${result.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            ` : ''}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to results area
        resultsArea.prepend(resultAlert);
        
        // Auto scroll to results
        resultsArea.scrollIntoView({ behavior: 'smooth' });
    }
    
    // ========== PRIVACY ACTIONS IMPLEMENTATIONS ==========
    
    /**
     * Fix WebRTC leak
     */
    fixWebRTCLeak() {
        // Implementation depends on browser
        if (this.browser === 'Chrome') {
            // Chrome/Chromium-based browsers
            return {
                success: true,
                message: 'To fix WebRTC leaks in Chrome, you need to install an extension.',
                steps: [
                    'Install the "WebRTC Leak Prevent" extension from the Chrome Web Store.',
                    'Once installed, click on the extension icon and select "Disable Non-Proxied UDP".',
                    'Refresh this page and run another scan to verify the leak is fixed.'
                ]
            };
        } else if (this.browser === 'Firefox') {
            // Firefox has built-in protection
            return {
                success: true,
                message: 'Firefox allows direct configuration of WebRTC leak protection.',
                steps: [
                    'Type "about:config" in your address bar and press Enter.',
                    'Search for "media.peerconnection.enabled" and set it to "false".',
                    'Also set "media.peerconnection.ice.no_host" to "true".',
                    'Refresh this page and run another scan to verify the leak is fixed.'
                ]
            };
        } else if (this.browser === 'Edge') {
            // Microsoft Edge (Chromium-based)
            return {
                success: true,
                message: 'To fix WebRTC leaks in Edge, you need to install an extension.',
                steps: [
                    'Install the "WebRTC Leak Prevent" extension from the Microsoft Store.',
                    'Once installed, click on the extension icon and select "Disable Non-Proxied UDP".',
                    'Refresh this page and run another scan to verify the leak is fixed.'
                ]
            };
        } else {
            return {
                success: false,
                message: `WebRTC leak prevention is not directly supported for ${this.browser}.`,
                details: 'Consider using Firefox which offers better built-in WebRTC leak protection.'
            };
        }
    }
    
    /**
     * Clear tracking cookies
     */
    clearTrackingCookies() {
        try {
            // Get all cookies
            const cookies = document.cookie.split(';');
            let trackingCookiesCount = 0;
            
            // Identify common tracking cookies
            const trackingPatterns = [
                '_ga', '_gid', '_fbp', '_pin_', 'datr', 'sb', 'fr', 
                'personalization_id', 'guest_id', 'MUID', 'MUIDB',
                'IDE', 'tuuid', 'uid', 'uuid', 'anj', 'uids', 'trkid'
            ];
            
            // Clear matching cookies
            cookies.forEach(cookie => {
                const cookieName = cookie.split('=')[0].trim();
                
                if (trackingPatterns.some(pattern => cookieName.includes(pattern))) {
                    // This is likely a tracking cookie
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    trackingCookiesCount++;
                }
            });
            
            if (trackingCookiesCount > 0) {
                return {
                    success: true,
                    message: `Removed ${trackingCookiesCount} tracking cookies from your browser.`,
                    details: 'Note: This only removes cookies for this site. For complete protection, use browser settings to clear all tracking cookies.',
                    steps: [
                        'To clear all tracking cookies, go to your browser settings.',
                        `In ${this.browser}, look for "Privacy and Security" section.`,
                        'Choose "Clear browsing data" and select "Cookies and site data".',
                        'For ongoing protection, consider using browser extensions like Privacy Badger or Cookie AutoDelete.'
                    ]
                };
            } else {
                return {
                    success: true,
                    message: 'No common tracking cookies were found for this site.',
                    details: 'For complete protection, consider using dedicated privacy extensions.',
                    steps: [
                        'Install a cookie management extension like "Cookie AutoDelete" or "Privacy Badger".',
                        'Configure your browser to block third-party cookies.',
                        `In ${this.browser}, go to Settings > Privacy and Security > Cookies.`
                    ]
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Unable to clear tracking cookies due to browser restrictions.',
                details: error.message
            };
        }
    }
    
    /**
     * Enable Do Not Track setting
     */
    enableDoNotTrack() {
        // Check if DNT is already enabled
        const dntEnabled = navigator.doNotTrack === "1" || 
                         window.doNotTrack === "1" || 
                         navigator.msDoNotTrack === "1";
        
        if (dntEnabled) {
            return {
                success: true,
                message: 'Do Not Track is already enabled in your browser.',
                details: 'Your browser is sending the DNT:1 signal to websites.'
            };
        }
        
        // Create instructions based on browser
        let steps = [];
        
        if (this.browser === 'Chrome') {
            steps = [
                'Open Chrome Settings (click the three dots in the top right).',
                'Scroll down and click on "Advanced".',
                'Under "Privacy and security," select "Site Settings".',
                'Scroll down to "Additional content settings" and click "Send a Do Not Track request".',
                'Toggle the switch to "On".',
                'Restart your browser for the changes to take effect.'
            ];
        } else if (this.browser === 'Firefox') {
            steps = [
                'Open Firefox Settings (click the three bars in the top right).',
                'Select "Privacy & Security" from the left menu.',
                'Scroll down to "Send websites a "Do Not Track" signal".',
                'Select "Always".',
                'Restart your browser for the changes to take effect.'
            ];
        } else if (this.browser === 'Safari') {
            steps = [
                'Open Safari Preferences (from the Safari menu).',
                'Go to the "Privacy" tab.',
                'Check the box that says "Ask websites not to track me".',
                'Restart your browser for the changes to take effect.'
            ];
        } else if (this.browser === 'Edge') {
            steps = [
                'Open Edge Settings (click the three dots in the top right).',
                'Click on "Privacy, search, and services".',
                'Scroll down to "Send "Do Not Track" requests".',
                'Toggle the switch to "On".',
                'Restart your browser for the changes to take effect.'
            ];
        } else {
            steps = [
                'Search for "enable Do Not Track" along with your browser name.',
                'Follow the browser-specific instructions to enable this feature.',
                'Restart your browser for the changes to take effect.'
            ];
        }
        
        return {
            success: true,
            message: 'Follow these steps to enable Do Not Track in your browser.',
            details: 'Note: While enabling DNT sends a request to websites not to track you, not all websites honor this request.',
            steps: steps
        };
    }
    
    /**
     * Force HTTPS connections
     */
    forceHTTPS() {
        // Check if we're already on HTTPS
        const isHttps = window.location.protocol === 'https:';
        
        // Create browser-specific instructions
        let steps = [];
        
        if (this.browser === 'Chrome') {
            steps = [
                'Open Chrome Settings (click the three dots in the top right).',
                'Click on "Privacy and security".',
                'Select "Security".',
                'Toggle "Always use secure connections" to On.',
                'Restart your browser for the changes to take effect.'
            ];
        } else if (this.browser === 'Firefox') {
            steps = [
                'In the address bar, type "about:config" and press Enter.',
                'Click "Accept the Risk and Continue".',
                'Search for "dom.security.https_only_mode".',
                'Set it to "true" by double-clicking it.',
                'Restart your browser for the changes to take effect.'
            ];
        } else if (this.browser === 'Safari') {
            steps = [
                'Safari doesn\'t have a built-in option to force HTTPS.',
                'Consider using a browser extension like "HTTPS Everywhere".',
                'Alternatively, use Firefox or Chrome which have built-in HTTPS-only modes.'
            ];
        } else if (this.browser === 'Edge') {
            steps = [
                'Open Edge Settings (click the three dots in the top right).',
                'Click on "Privacy, search, and services".',
                'Scroll down to "Security".',
                'Toggle "Always use secure connections" to On.',
                'Restart your browser for the changes to take effect.'
            ];
        } else {
            steps = [
                'Search for "force HTTPS" along with your browser name.',
                'Follow the browser-specific instructions to enable this feature.',
                'Consider installing the "HTTPS Everywhere" extension if available for your browser.'
            ];
        }
        
        return {
            success: true,
            message: `Follow these steps to force HTTPS connections in ${this.browser}.`,
            details: isHttps ? 'This site is already using HTTPS, which is good!' : 'This site is not using HTTPS, which is a security risk.',
            steps: steps
        };
    }
    
    /**
     * Reduce fingerprinting surface
     */
    reduceFingerprintSurface() {
        // Create browser-specific instructions
        let steps = [];
        
        if (this.browser === 'Firefox') {
            steps = [
                'In the address bar, type "about:config" and press Enter.',
                'Click "Accept the Risk and Continue".',
                'Search for "privacy.resistFingerprinting" and set it to "true".',
                'Also set "privacy.trackingprotection.fingerprinting.enabled" to "true".',
                'Restart Firefox for the changes to take effect.'
            ];
        } else if (this.browser === 'Chrome' || this.browser === 'Edge') {
            steps = [
                `${this.browser} doesn't have built-in fingerprinting protection as robust as Firefox.`,
                'Install the "Privacy Badger" extension from the Chrome Web Store.',
                'Also consider "Canvas Blocker Fingerprint Protect" or "Fingerprint Defender".',
                'For advanced protection, use the Brave browser which has built-in fingerprinting protection.'
            ];
        } else if (this.browser === 'Safari') {
            steps = [
                'Safari has some built-in fingerprinting protection.',
                'Go to Safari > Preferences > Privacy.',
                'Ensure "Prevent cross-site tracking" is checked.',
                'For additional protection, consider using Firefox with privacy.resistFingerprinting enabled.'
            ];
        } else {
            steps = [
                'Install the "Privacy Badger" browser extension if available for your browser.',
                'Consider switching to Firefox with privacy.resistFingerprinting enabled.',
                'For maximum fingerprinting protection, use the Tor Browser.'
            ];
        }
        
        return {
            success: true,
            message: 'Fingerprinting protection requires browser configuration.',
            details: 'Follow these steps to reduce your browser fingerprint surface:',
            steps: steps
        };
    }
    
    /**
     * Review browser permissions
     */
    reviewPermissions() {
        // Create browser-specific instructions
        let steps = [];
        
        if (this.browser === 'Chrome') {
            steps = [
                'Open Chrome Settings (click the three dots in the top right).',
                'Click on "Privacy and security".',
                'Select "Site Settings".',
                'Review each permission category (Location, Camera, Microphone, etc.).',
                'Remove permissions for sites you don\'t trust or need to access these features.'
            ];
        } else if (this.browser === 'Firefox') {
            steps = [
                'Open Firefox Settings (click the three bars in the top right).',
                'Select "Privacy & Security".',
                'Scroll down to "Permissions" section.',
                'Review each permission type (Location, Camera, Microphone, etc.).',
                'Click "Settings" for each to manage site-specific permissions.'
            ];
        } else if (this.browser === 'Safari') {
            steps = [
                'Open Safari Preferences (from the Safari menu).',
                'Go to the "Websites" tab.',
                'The left sidebar shows different permission categories.',
                'For each category, review the allowed websites on the right.',
                'Change permissions as needed for better privacy.'
            ];
        } else if (this.browser === 'Edge') {
            steps = [
                'Open Edge Settings (click the three dots in the top right).',
                'Click on "Site permissions".',
                'Review each permission category.',
                'Click on a permission to see which sites have access.',
                'Remove permissions for sites you don\'t trust or need to access these features.'
            ];
        } else {
            steps = [
                'Search for "manage site permissions" along with your browser name.',
                'Review each permission type (Location, Camera, Microphone, etc.).',
                'Remove permissions for sites you don\'t trust or need to access these features.'
            ];
        }
        
        // Check for any current permission states
        const permissionTypes = ['geolocation', 'camera', 'microphone', 'notifications'];
        let currentPermissions = [];
        
        permissionTypes.forEach(type => {
            if (navigator.permissions) {
                navigator.permissions.query({ name: type })
                    .then(result => {
                        if (result.state !== 'prompt') {
                            currentPermissions.push(`${type}: ${result.state}`);
                        }
                    })
                    .catch(() => {
                        // Permission type not supported or error occurred
                    });
            }
        });
        
        return {
            success: true,
            message: 'Review your browser permissions to enhance privacy.',
            details: currentPermissions.length > 0 ? 
                    `Current permission states: ${currentPermissions.join(', ')}` : 
                    'Follow these steps to review all site permissions:',
            steps: steps
        };
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    const quickActions = new PrivacyQuickActions();
    quickActions.init();
});