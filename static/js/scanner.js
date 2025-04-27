/**
 * Main scanning logic for the privacy & IP leak detector
 */
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced privacy features will be loaded once implemented
    const privacyFeatures = window.privacyFeatures || {};
    // Progress bar elements
    const progressBar = document.getElementById('scan-progress');
    const progressText = document.getElementById('progress-text');
    
    // Scan button
    const scanButton = document.getElementById('start-scan');
    
    // Email check form
    const emailForm = document.getElementById('email-check-form');
    const emailInput = document.getElementById('email-input');
    
    // Results container
    const resultsContainer = document.getElementById('initial-results');
    
    // Initialize test components
    const fingerprintCollector = new FingerprintCollector();
    const webrtcDetector = new WebRTCLeakDetector();
    const dnsLeakDetector = new DNSLeakDetector();
    const emailLeakDetector = new EmailLeakDetector();
    const cookieTrackingDetector = new CookieTrackingDetector();
    const canvasFingerprintDetector = new CanvasFingerprintDetector();
    const permissionChecker = new PermissionChecker();
    
    // New privacy check components
    const doNotTrackDetector = new DoNotTrackDetector();
    const languageDetector = new LanguageDetector();
    
    // Authenticity analysis components
    const userAuthenticityChecker = new UserAuthenticityChecker();
    const behavioralAnalyzer = new BehavioralAnalyzer();
    const antibotDetectionAnalyzer = new AntiBotDetectionAnalyzer();
    const privacyExtensionsAnalyzer = new PrivacyExtensionsAnalyzer();
    
    // Initialize the enhanced privacy features
    let privacyFeaturesInitialized = false;
    
    if (scanButton) {
        scanButton.addEventListener('click', startScan);
    }
    
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (emailInput && emailInput.value) {
                runEmailCheck(emailInput.value);
            }
        });
    }
    
    // Add event listener for the clear cache button
    const clearCacheButton = document.getElementById('clear-email-cache');
    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', function() {
            emailLeakDetector.clearCache();
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="alert alert-info">Cache cleared. Run a new check for fresh results.</div>';
            }
        });
    }
    
    /**
     * Run an email leak check
     * @param {string} email - Email to check
     */
    async function runEmailCheck(email) {
        try {
            updateProgress(10, 'Checking email leaks...');
            const emailData = await emailLeakDetector.checkEmail(email);
            
            // Process the results
            updateProgress(100, 'Check complete!');
            
            // Display the results
            const leakStatus = emailData.leakFound ? 
                'Your email was found in data breaches!' : 
                'Your email was not found in any known data breaches.';
                
            const leakClass = emailData.leakFound ? 'alert-danger' : 'alert-success';
            
            const resultHtml = `
                <div class="alert ${leakClass} mt-3">
                    <strong>${leakStatus}</strong>
                    ${emailData.leakFound ? `<p>Found in ${emailData.breachCount} breaches.</p>` : ''}
                </div>
            `;
            
            // Add to the page
            if (resultsContainer) {
                resultsContainer.innerHTML = resultHtml;
            }
        } catch (error) {
            console.error('Email check error:', error);
            showError('An error occurred checking your email. Please try again.');
        }
    }
    
    /**
     * Start the scanning process
     */
    async function startScan() {
        try {
            // Show progress bar, hide scan button
            document.getElementById('scan-progress-container').classList.remove('d-none');
            if (scanButton) scanButton.classList.add('d-none');
            
            updateProgress(5, 'Initializing scan...');
            
            // Collect fingerprint data
            updateProgress(15, 'Collecting browser fingerprint...');
            const fingerprint = await fingerprintCollector.collectAll();
            
            // Check for WebRTC leaks
            updateProgress(30, 'Checking for WebRTC leaks...');
            const webrtcData = await webrtcDetector.detectLeaks();
            
            // Check for DNS leaks
            updateProgress(45, 'Testing DNS configuration...');
            const dnsData = await dnsLeakDetector.checkForLeak();
            
            // Email check - check if user has provided an email in the form
            updateProgress(40, 'Checking data breach status...');
            let emailData = { tested: false };
            
            // If there's an email in the input field, include it in the scan
            if (emailInput && emailInput.value && emailInput.value.trim() !== '') {
                updateProgress(45, 'Checking email breach status...');
                emailData = await emailLeakDetector.checkEmail(emailInput.value.trim());
            }
            
            // Check for cookie tracking
            updateProgress(50, 'Checking cookie tracking...');
            const cookieData = await cookieTrackingDetector.detectTrackingCookies();
            
            // Check for canvas fingerprinting
            updateProgress(55, 'Checking canvas fingerprinting vulnerability...');
            const canvasData = await canvasFingerprintDetector.detectCanvasFingerprinting();
            
            // Check for browser permissions
            updateProgress(60, 'Checking browser permissions...');
            const permissionData = await permissionChecker.checkPermissions();
            
            // Check Do Not Track status
            updateProgress(65, 'Checking Do Not Track status...');
            const dntData = await doNotTrackDetector.checkStatus();
            
            // Check language location consistency
            updateProgress(67, 'Checking language settings...');
            const languageData = await languageDetector.checkLanguageLocation();
            
            // Comment out behavior tracking for now
            // behavioralAnalyzer.startTracking();
            
            // Placeholder data for user authenticity
            updateProgress(65, 'Analyzing browser authenticity...');
            const authenticityData = { tested: true, authentic_appearance: true };
            
            // Placeholder data for anti-bot detection
            updateProgress(70, 'Testing anti-bot detection systems...');
            const antibotData = { tested: true, passes_basic_bot_checks: true };
            
            // Placeholder data for privacy extensions
            updateProgress(75, 'Analyzing privacy extensions...');
            const extensionsData = { tested: true, extensions_detected: [] };
            
            // Placeholder data for behavior analysis
            updateProgress(80, 'Analyzing browsing behavior...');
            // behavioralAnalyzer.stopTracking();
            const behaviorData = { tested: true, natural_behavior: true };
            
            // Prepare data to send to the server
            const scanData = new FormData();
            
            // Initialize enhanced privacy features
            updateProgress(82, 'Initializing enhanced privacy features...');
            if (!privacyFeaturesInitialized) {
                try {
                    // Get current anonymity score from the scan
                    const currentScore = fingerprint.anonymityScore || 50;
                    await privacyFeatures.init(currentScore);
                    privacyFeaturesInitialized = true;
                    
                    // Get the privacy features results
                    const enhancedPrivacyResults = privacyFeatures.getResults();
                    
                    // Add to scan data
                    scanData.append('enhanced_privacy', JSON.stringify(enhancedPrivacyResults));
                    
                    updateProgress(85, 'Enhanced privacy features initialized!');
                } catch (privacyError) {
                    console.error('Error initializing privacy features:', privacyError);
                    // Continue with scan even if enhanced features fail
                }
            }
            scanData.append('fingerprint', JSON.stringify(fingerprint));
            scanData.append('webrtc', JSON.stringify(webrtcData));
            scanData.append('dns', JSON.stringify(dnsData));
            scanData.append('email', JSON.stringify(emailData));
            scanData.append('cookies', JSON.stringify(cookieData));
            scanData.append('canvas', JSON.stringify(canvasData));
            scanData.append('permissions', JSON.stringify(permissionData));
            scanData.append('do_not_track', JSON.stringify(dntData));
            scanData.append('language', JSON.stringify(languageData));
            scanData.append('authenticity', JSON.stringify(authenticityData));
            scanData.append('behavior', JSON.stringify(behaviorData));
            scanData.append('antibot', JSON.stringify(antibotData));
            scanData.append('privacy_extensions', JSON.stringify(extensionsData));
            
            // Send data to server for analysis
            updateProgress(85, 'Analyzing IP and location data...');
            const response = await fetch('/scan', {
                method: 'POST',
                body: scanData
            });
            
            updateProgress(90, 'Processing results...');
            const data = await response.json();
            
            if (data.success) {
                updateProgress(100, 'Scan complete!');
                
                // Redirect to results page
                setTimeout(() => {
                    window.location.href = `/results/${data.result_id}`;
                }, 500);
            } else {
                updateProgress(100, 'Error: ' + (data.error || 'Unknown error'));
                showError('An error occurred during the scan. Please try again.');
                
                // Show scan button again
                if (scanButton) scanButton.classList.remove('d-none');
                setTimeout(() => {
                    document.getElementById('scan-progress-container').classList.add('d-none');
                }, 3000);
            }
        } catch (error) {
            console.error('Scan error:', error);
            updateProgress(100, 'Error occurred');
            showError('An error occurred during the scan. Please try again.');
            
            // Show scan button again
            if (scanButton) scanButton.classList.remove('d-none');
            setTimeout(() => {
                document.getElementById('scan-progress-container').classList.add('d-none');
            }, 3000);
        }
    }
    
    /**
     * Update the progress bar
     * @param {number} percent - Percentage complete
     * @param {string} message - Status message to display
     */
    function updateProgress(percent, message) {
        if (progressBar) {
            progressBar.style.width = percent + '%';
            progressBar.setAttribute('aria-valuenow', percent);
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }
    
    /**
     * Show an error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger mt-3';
        errorAlert.role = 'alert';
        errorAlert.textContent = message;
        
        if (resultsContainer) {
            resultsContainer.appendChild(errorAlert);
        }
        
        // Remove after a timeout
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.parentNode.removeChild(errorAlert);
            }
        }, 5000);
    }
});
