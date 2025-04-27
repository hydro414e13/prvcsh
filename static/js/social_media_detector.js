/**
 * Social Media Connection Detector
 * Detects embedded social media buttons and trackers
 */
class SocialMediaDetector {
    constructor() {
        this.initialized = false;
        this.results = {
            tested: false,
            socialPlatformsDetected: [],
            buttonCount: 0,
            trackingEnabled: false,
            connectionsBlocked: false,
            platformDetails: {},
            recommendations: []
        };
    }
    
    /**
     * Initialize the social media detector
     */
    async init() {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Detect social media connections
        this.detectSocialConnections();
        
        // Check if social media connections are blocked
        this.checkBlockingStatus();
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Detect social media connections on the page
     */
    detectSocialConnections() {
        const platformSignatures = {
            facebook: {
                domains: ['facebook.com', 'facebook.net', 'fbcdn.net', 'fb.com', 'fbcdn.com'],
                buttons: ['fb-like', 'fb-share', 'facebook-like', 'facebook-share'],
                classes: ['fb-like', 'fb-share-button', 'facebook-share'],
                tracking: ['pixel', 'trackCustom', 'fbq']
            },
            twitter: {
                domains: ['twitter.com', 'twimg.com', 't.co'],
                buttons: ['twitter-share', 'twitter-follow', 'tweet-button'],
                classes: ['twitter-share-button', 'twitter-follow-button', 'twitter-hashtag-button'],
                tracking: ['twttr.conversion', 'twttr.trackPixel']
            },
            linkedin: {
                domains: ['linkedin.com', 'licdn.com', 'linkedin.net'],
                buttons: ['linkedin-share', 'linkedin-follow'],
                classes: ['linkedin-share-button', 'LI-profile-badge'],
                tracking: ['linkedin_data_partner']
            },
            instagram: {
                domains: ['instagram.com', 'cdninstagram.com'],
                buttons: ['instagram-media', 'insta-button'],
                classes: ['instagram-media', 'instagram-embed'],
                tracking: ['fb_ref=badge']
            },
            pinterest: {
                domains: ['pinterest.com', 'pinimg.com'],
                buttons: ['pinterest-pin', 'pinterest-follow', 'pin-it'],
                classes: ['pinterest-button', 'pin-it-button'],
                tracking: ['pintrk']
            },
            youtube: {
                domains: ['youtube.com', 'ytimg.com', 'youtu.be'],
                buttons: ['youtube-subscribe', 'youtube-embed'],
                classes: ['youtube-player', 'youtube-subscribe'],
                tracking: ['yt-uix-click-track']
            },
            tiktok: {
                domains: ['tiktok.com', 'tiktokcdn.com', 'muscdn.com'],
                buttons: ['tiktok-embed', 'tiktok-follow'],
                classes: ['tiktok-embed'],
                tracking: ['ttq']
            },
            reddit: {
                domains: ['reddit.com', 'redditmedia.com', 'redditstatic.com'],
                buttons: ['reddit-button', 'reddit-embed'],
                classes: ['reddit-card', 'reddit-embed'],
                tracking: ['rdt']
            },
            snapchat: {
                domains: ['snapchat.com', 'snap.com', 'sc-static.net'],
                buttons: ['snapchat-embed', 'snapchat-creative'],
                classes: ['snapchat-creative-kit-share', 'snapchat-embed'],
                tracking: ['snap_pixel']
            }
        };
        
        const detectedPlatforms = {};
        let buttonCount = 0;
        let trackingEnabled = false;
        
        // Function to detect and record findings
        const recordDetection = (platform, type, element, details = {}) => {
            if (!detectedPlatforms[platform]) {
                detectedPlatforms[platform] = {
                    resources: [],
                    buttons: [],
                    tracking: [],
                    embeds: []
                };
            }
            
            detectedPlatforms[platform][type].push({
                element: element,
                details: details
            });
            
            if (type === 'buttons') {
                buttonCount++;
            }
            
            if (type === 'tracking') {
                trackingEnabled = true;
            }
        };
        
        // Check all links for social media domains
        const links = document.querySelectorAll('a[href]');
        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href) continue;
            
            // Check each platform's domains
            for (const [platform, signature] of Object.entries(platformSignatures)) {
                if (signature.domains.some(domain => href.includes(domain))) {
                    // Check if it's a sharing button
                    const isButton = link.innerHTML.toLowerCase().includes('share') || 
                                    link.innerHTML.toLowerCase().includes('follow') ||
                                    link.getAttribute('aria-label')?.toLowerCase().includes('share') ||
                                    link.getAttribute('title')?.toLowerCase().includes('share');
                    
                    if (isButton) {
                        recordDetection(platform, 'buttons', 'a[href]', { href });
                    } else {
                        recordDetection(platform, 'resources', 'a[href]', { href });
                    }
                }
            }
        }
        
        // Check all scripts for social media domains
        const scripts = document.querySelectorAll('script[src]');
        for (const script of scripts) {
            const src = script.getAttribute('src');
            if (!src) continue;
            
            // Check each platform's domains
            for (const [platform, signature] of Object.entries(platformSignatures)) {
                if (signature.domains.some(domain => src.includes(domain))) {
                    recordDetection(platform, 'resources', 'script[src]', { src });
                    
                    // Script tags from social domains often include tracking
                    recordDetection(platform, 'tracking', 'script[src]', { src });
                }
            }
        }
        
        // Check all iframes for social media domains
        const iframes = document.querySelectorAll('iframe[src]');
        for (const iframe of iframes) {
            const src = iframe.getAttribute('src');
            if (!src) continue;
            
            // Check each platform's domains
            for (const [platform, signature] of Object.entries(platformSignatures)) {
                if (signature.domains.some(domain => src.includes(domain))) {
                    recordDetection(platform, 'embeds', 'iframe[src]', { src });
                }
            }
        }
        
        // Check for social media buttons by classes and IDs
        for (const [platform, signature] of Object.entries(platformSignatures)) {
            // Check by button IDs
            for (const buttonId of signature.buttons) {
                const elements = document.querySelectorAll(`#${buttonId}, [id*="${buttonId}"]`);
                for (const element of elements) {
                    recordDetection(platform, 'buttons', `#${buttonId}`, { element: element.outerHTML.slice(0, 100) });
                }
            }
            
            // Check by CSS classes
            for (const className of signature.classes) {
                const elements = document.querySelectorAll(`.${className}, [class*="${className}"]`);
                for (const element of elements) {
                    recordDetection(platform, 'buttons', `.${className}`, { element: element.outerHTML.slice(0, 100) });
                }
            }
        }
        
        // Check for tracking scripts in page source
        const pageSource = document.documentElement.outerHTML;
        for (const [platform, signature] of Object.entries(platformSignatures)) {
            for (const trackingCode of signature.tracking) {
                if (pageSource.includes(trackingCode)) {
                    recordDetection(platform, 'tracking', 'inline script', { code: trackingCode });
                }
            }
        }
        
        // Update results
        this.results.socialPlatformsDetected = Object.keys(detectedPlatforms);
        this.results.buttonCount = buttonCount;
        this.results.trackingEnabled = trackingEnabled;
        this.results.platformDetails = detectedPlatforms;
    }
    
    /**
     * Check if social media connections are being blocked
     */
    checkBlockingStatus() {
        // Check for common ad/social blockers
        const commonBlockers = [
            'ublock',
            'adblock',
            'privacy-badger',
            'disconnect',
            'ghostery',
            'facebook-container'
        ];
        
        let blockerDetected = false;
        
        // Check DOM for evidence of blockers
        for (const blocker of commonBlockers) {
            if (document.getElementById(blocker) || 
                document.getElementsByClassName(blocker).length > 0 ||
                document.querySelector(`[id*="${blocker}"], [class*="${blocker}"]`)) {
                blockerDetected = true;
                break;
            }
        }
        
        // Check if FacebookSDK is blocked
        if (this.results.socialPlatformsDetected.includes('facebook') &&
            !window.FB && !window.fbq && document.querySelectorAll('[class*="fb-"]').length > 0) {
            blockerDetected = true;
        }
        
        // Check if Twitter widgets are blocked
        if (this.results.socialPlatformsDetected.includes('twitter') &&
            !window.twttr && document.querySelectorAll('[class*="twitter-"]').length > 0) {
            blockerDetected = true;
        }
        
        this.results.connectionsBlocked = blockerDetected;
    }
    
    /**
     * Prepare recommendations based on detected social media connections
     */
    prepareRecommendations() {
        const recommendations = [];
        
        if (this.results.socialPlatformsDetected.length > 0 && !this.results.connectionsBlocked) {
            recommendations.push({
                title: "Block social media trackers",
                description: "Social media buttons and embeds track your browsing even if you don't click them.",
                priority: "high",
                implementation: "Install a privacy extension like Privacy Badger, uBlock Origin, or Disconnect to block social media trackers. For Firefox users, the Facebook Container extension isolates Facebook tracking."
            });
        }
        
        if (this.results.socialPlatformsDetected.includes('facebook')) {
            recommendations.push({
                title: "Contain Facebook tracking",
                description: "Facebook tracks your activity across websites with embedded like buttons, share buttons, and pixels.",
                priority: "high",
                implementation: "Firefox users can install 'Facebook Container' to isolate Facebook from other browsing. Other browser users should try 'Privacy Badger' which learns to block Facebook trackers as you browse."
            });
        }
        
        if (this.results.trackingEnabled) {
            recommendations.push({
                title: "Use a separate browser for social media",
                description: "Isolate your social media activity from your regular browsing to prevent cross-site tracking.",
                priority: "medium",
                implementation: "Use one browser exclusively for social media sites (e.g., Firefox), and a different browser (e.g., Chrome) for all other browsing activity. Never log into social accounts on your primary browser."
            });
        }
        
        // General recommendations
        if (this.results.socialPlatformsDetected.length > 0) {
            recommendations.push({
                title: "Install a social media blocking extension",
                description: "Dedicated extensions can block social widgets and prevent tracking.",
                priority: "medium",
                implementation: "Extensions like 'Social Disconnect', 'Social Media Privacy', or 'Social Fixer' can block trackers and add privacy controls to social media sites."
            });
            
            recommendations.push({
                title: "Use alternative sharing methods",
                description: "Share content without using embedded social media buttons.",
                priority: "low",
                implementation: "Instead of clicking share buttons, copy the URL and paste it directly into your social media platform of choice. This prevents the originating website from tracking your social sharing."
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
window.socialMediaDetector = new SocialMediaDetector();