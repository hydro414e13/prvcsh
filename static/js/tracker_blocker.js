/**
 * Third-Party Tracker Blocker
 * Identifies and helps block third-party trackers on websites
 */
class TrackerBlocker {
    constructor() {
        this.initialized = false;
        this.trackerDatabase = null;
        this.results = {
            tested: false,
            trackersDetected: 0,
            trackersByCategory: {},
            trackersList: [],
            blockingActive: false,
            blockedCount: 0,
            blockingEffectiveness: 0, // 0-100 score
            fingerprintersDeclared: 0,
            recommendations: []
        };
    }
    
    /**
     * Initialize the tracker blocker
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Load tracker database (common tracker domains and categories)
        await this.loadTrackerDatabase();
        
        // Scan the current page for trackers
        this.scanForTrackers();
        
        // Check if blocking is already active
        this.checkBlockingActive();
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Load the tracker database
     * This contains known tracking domains and their categories
     */
    async loadTrackerDatabase() {
        // In a real implementation, this would load from a JSON file or API
        // For this example, we'll use a small built-in list of common trackers
        
        this.trackerDatabase = {
            // Advertising networks
            "doubleclick.net": { category: "advertising", company: "Google" },
            "googlesyndication.com": { category: "advertising", company: "Google" },
            "adnxs.com": { category: "advertising", company: "AppNexus" },
            "rubiconproject.com": { category: "advertising", company: "Rubicon" },
            "advertising.com": { category: "advertising", company: "Verizon" },
            "pubmatic.com": { category: "advertising", company: "PubMatic" },
            "adsrvr.org": { category: "advertising", company: "The Trade Desk" },
            "33across.com": { category: "advertising", company: "33Across" },
            "openx.net": { category: "advertising", company: "OpenX" },
            "smartadserver.com": { category: "advertising", company: "Smart" },
            
            // Analytics
            "google-analytics.com": { category: "analytics", company: "Google" },
            "analytics.tiktok.com": { category: "analytics", company: "TikTok" },
            "analytics.twitter.com": { category: "analytics", company: "Twitter" },
            "stats.wp.com": { category: "analytics", company: "WordPress" },
            "analytics.yahoo.com": { category: "analytics", company: "Yahoo" },
            "hotjar.com": { category: "analytics", company: "Hotjar" },
            "mixpanel.com": { category: "analytics", company: "Mixpanel" },
            "segment.io": { category: "analytics", company: "Segment" },
            "amplitude.com": { category: "analytics", company: "Amplitude" },
            "clarity.ms": { category: "analytics", company: "Microsoft" },
            
            // Social media
            "connect.facebook.net": { category: "social", company: "Facebook" },
            "platform.twitter.com": { category: "social", company: "Twitter" },
            "platform.linkedin.com": { category: "social", company: "LinkedIn" },
            "pins.pinterest.com": { category: "social", company: "Pinterest" },
            "static.addtoany.com": { category: "social", company: "AddToAny" },
            "reddit.com/api": { category: "social", company: "Reddit" },
            "disqus.com": { category: "social", company: "Disqus" },
            "sharethis.com": { category: "social", company: "ShareThis" },
            
            // Fingerprinting
            "fingerprintjs.com": { category: "fingerprinting", company: "FingerprintJS" },
            "tractionize.com": { category: "fingerprinting", company: "Tractionize" },
            "securepubads.g.doubleclick.net": { category: "fingerprinting", company: "Google" },
            "analytics-sdk.ably.io": { category: "fingerprinting", company: "Ably" },
            "static.audienceproject.com": { category: "fingerprinting", company: "AudienceProject" },
            
            // Tag managers
            "googletagmanager.com": { category: "tag_manager", company: "Google" },
            "tags.tiqcdn.com": { category: "tag_manager", company: "Tealium" },
            "cdn.dreamdata.cloud": { category: "tag_manager", company: "Dreamdata" },
            "snap.licdn.com": { category: "tag_manager", company: "LinkedIn" },
            
            // Customer data platforms
            "cdn.segment.com": { category: "cdp", company: "Segment" },
            "sgtm.tiktok.com": { category: "cdp", company: "TikTok" },
            "js-agent.newrelic.com": { category: "cdp", company: "New Relic" },
            "static.ads-twitter.com": { category: "cdp", company: "Twitter" },
            "js.hs-analytics.net": { category: "cdp", company: "HubSpot" }
        };
    }
    
    /**
     * Scan the page for trackers by analyzing network requests and third-party resources
     */
    scanForTrackers() {
        if (!this.trackerDatabase) return;
        
        const trackers = {};
        const trackersByCategory = {
            advertising: [],
            analytics: [],
            social: [],
            fingerprinting: [],
            tag_manager: [],
            cdp: [],
            other: []
        };
        
        // Get all scripts on the page
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src) {
                this.checkResourceForTrackers(script.src, trackers, trackersByCategory);
            }
        });
        
        // Get all iframes
        const iframes = document.querySelectorAll('iframe[src]');
        iframes.forEach(iframe => {
            if (iframe.src) {
                this.checkResourceForTrackers(iframe.src, trackers, trackersByCategory);
            }
        });
        
        // Get all images that might be tracking pixels
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            if (img.src && (img.width <= 1 || img.height <= 1)) {
                this.checkResourceForTrackers(img.src, trackers, trackersByCategory);
            }
        });
        
        // Also check link tags (especially for social media)
        const links = document.querySelectorAll('link[href]');
        links.forEach(link => {
            if (link.href) {
                this.checkResourceForTrackers(link.href, trackers, trackersByCategory);
            }
        });
        
        // Convert trackers object to array for easier manipulation
        const trackersList = Object.keys(trackers).map(domain => ({
            domain,
            category: trackers[domain].category,
            company: trackers[domain].company,
            count: trackers[domain].count
        }));
        
        // Sort by count (most frequent first)
        trackersList.sort((a, b) => b.count - a.count);
        
        // Update results
        this.results.trackersDetected = trackersList.length;
        this.results.trackersList = trackersList;
        this.results.trackersByCategory = trackersByCategory;
        this.results.fingerprintersDeclared = trackersByCategory.fingerprinting.length;
    }
    
    /**
     * Check if a URL contains known trackers
     */
    checkResourceForTrackers(url, trackers, trackersByCategory) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // Check against each tracker domain
            for (const trackerDomain in this.trackerDatabase) {
                if (domain.includes(trackerDomain) || domain.endsWith('.' + trackerDomain)) {
                    const tracker = this.trackerDatabase[trackerDomain];
                    
                    // Add to trackers if not already there
                    if (!trackers[trackerDomain]) {
                        trackers[trackerDomain] = {
                            category: tracker.category,
                            company: tracker.company,
                            count: 1
                        };
                    } else {
                        trackers[trackerDomain].count++;
                    }
                    
                    // Add to category list if not already there
                    const category = tracker.category || 'other';
                    if (!trackersByCategory[category].some(t => t.domain === trackerDomain)) {
                        trackersByCategory[category].push({
                            domain: trackerDomain,
                            company: tracker.company
                        });
                    }
                    
                    break; // Found a match, no need to check other trackers
                }
            }
        } catch (e) {
            console.error('Error checking resource for trackers:', e);
        }
    }
    
    /**
     * Check if blocking is already active by looking for known blocker extensions
     */
    checkBlockingActive() {
        // Try to detect common blocker extensions
        let blockingDetected = false;
        let blockedCount = 0;
        
        // Method 1: Check for common ad blocker elements
        const adBlockDetectionElements = [
            'AdblockDetector',
            'AdblockDetectionDiv',
            'ad-blocker-message',
            'adblock-detection',
            'adblock-notice'
        ];
        
        for (const id of adBlockDetectionElements) {
            if (document.getElementById(id)) {
                blockingDetected = true;
                break;
            }
        }
        
        // Method 2: Check for uBlock Origin specific element
        if (document.querySelector('html.ubo-ready, html.ubo-processed')) {
            blockingDetected = true;
        }
        
        // Method 3: Check if common bait ads are blocked
        const baitAd = document.createElement('div');
        baitAd.className = 'ads ad adsbox doubleclick ad-placement carbon-ads';
        baitAd.style.position = 'absolute';
        baitAd.style.opacity = '0';
        baitAd.style.height = '1px';
        baitAd.style.width = '1px';
        baitAd.style.pointerEvents = 'none';
        document.body.appendChild(baitAd);
        
        // Check if the bait ad is hidden by an ad blocker
        const baitAdBlocked = window.getComputedStyle(baitAd).display === 'none' || 
                            baitAd.offsetHeight === 0 || 
                            baitAd.offsetWidth === 0;
        
        if (baitAdBlocked) {
            blockingDetected = true;
        }
        
        // Clean up
        document.body.removeChild(baitAd);
        
        // Estimate blocked count and effectiveness
        if (blockingDetected) {
            // Rough estimate of blocking effectiveness based on detected trackers vs typical website
            const expectedTrackers = 15; // Average number of trackers on websites
            const detectedTrackers = this.results.trackersDetected;
            
            // If we found fewer trackers than expected, some might be blocked
            if (detectedTrackers < expectedTrackers) {
                blockedCount = expectedTrackers - detectedTrackers;
                this.results.blockingEffectiveness = Math.min(100, Math.round((blockedCount / expectedTrackers) * 100));
            } else {
                // Either not effective or the site has many trackers despite blocking
                this.results.blockingEffectiveness = 20; // Low effectiveness
            }
        } else {
            this.results.blockingEffectiveness = 0;
        }
        
        this.results.blockingActive = blockingDetected;
        this.results.blockedCount = blockedCount;
    }
    
    /**
     * Prepare recommendations based on detected trackers
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (!this.results.blockingActive) {
            recommendations.push({
                title: "Install a content blocker",
                description: "Content blockers prevent trackers from loading and collecting data about you.",
                priority: "high",
                implementation: "Install uBlock Origin (recommended), Privacy Badger, or AdGuard from your browser's extension store."
            });
        } else if (this.results.blockingEffectiveness < 50) {
            recommendations.push({
                title: "Upgrade your content blocker",
                description: "Your current blocker is missing some trackers. Consider using a more comprehensive solution.",
                priority: "medium",
                implementation: "Replace or supplement your current blocker with uBlock Origin using medium or high filtering settings."
            });
        }
        
        if (this.results.trackersByCategory.fingerprinting.length > 0) {
            recommendations.push({
                title: "Block fingerprinting scripts",
                description: "Fingerprinting scripts are particularly invasive for privacy, creating a unique identifier for your browser.",
                priority: "high",
                implementation: "Enable 'fingerprinting protection' in your browser settings (Firefox) or use an extension specifically designed to block fingerprinting like Privacy Badger or Canvas Blocker."
            });
        }
        
        if (this.results.trackersByCategory.social.length > 0) {
            recommendations.push({
                title: "Disable social media trackers",
                description: "Social media buttons and embeds track you across websites, even if you don't use them.",
                priority: "medium",
                implementation: "Use the 'Privacy Possum' or 'Facebook Container' extensions to isolate social media tracking, or disable JavaScript for social media domains."
            });
        }
        
        // General recommendations
        recommendations.push({
            title: "Consider a privacy-focused browser",
            description: "Some browsers have built-in tracker blocking and privacy features.",
            priority: "medium",
            implementation: "Firefox with privacy settings enhanced, Brave Browser, or Tor Browser all offer improved privacy protections by default."
        });
        
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
window.trackerBlocker = new TrackerBlocker();