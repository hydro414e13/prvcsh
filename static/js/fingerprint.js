/**
 * Browser Fingerprinting Script
 * Collects browser information to detect uniqueness
 */
class FingerprintCollector {
    constructor() {
        this.fingerprint = {};
    }

    /**
     * Collect all fingerprint data
     * @returns {Object} Collected fingerprint data
     */
    async collectAll() {
        this.collectBasicInfo();
        this.collectScreenInfo();
        this.collectLanguageInfo();
        this.collectFontInfo();
        await this.collectCanvasFingerprint();
        await this.collectWebGLInfo();
        
        return this.fingerprint;
    }

    /**
     * Collect basic browser information
     */
    collectBasicInfo() {
        this.fingerprint.userAgent = navigator.userAgent;
        this.fingerprint.appName = navigator.appName;
        this.fingerprint.appVersion = navigator.appVersion;
        this.fingerprint.platform = navigator.platform;
        this.fingerprint.cookieEnabled = navigator.cookieEnabled;
        this.fingerprint.doNotTrack = navigator.doNotTrack;
        this.fingerprint.timezoneOffset = new Date().getTimezoneOffset();
        this.fingerprint.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    /**
     * Collect screen and window information
     */
    collectScreenInfo() {
        this.fingerprint.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        };
        
        this.fingerprint.innerWidth = window.innerWidth;
        this.fingerprint.innerHeight = window.innerHeight;
        this.fingerprint.outerWidth = window.outerWidth;
        this.fingerprint.outerHeight = window.outerHeight;
        this.fingerprint.devicePixelRatio = window.devicePixelRatio;
    }

    /**
     * Collect language preferences
     */
    collectLanguageInfo() {
        this.fingerprint.language = navigator.language;
        this.fingerprint.languages = navigator.languages;
    }

    /**
     * Simple font detection
     */
    collectFontInfo() {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testString = "mmmmmmmmmmlli";
        const testSize = '72px';
        const h = document.getElementsByTagName('body')[0];
        
        // Create a div to test fonts in
        const s = document.createElement('span');
        s.style.fontSize = testSize;
        s.innerHTML = testString;
        const defaultWidth = {};
        const defaultHeight = {};
        
        // Get width of test string in base fonts
        for (const font of baseFonts) {
            s.style.fontFamily = font;
            h.appendChild(s);
            defaultWidth[font] = s.offsetWidth;
            defaultHeight[font] = s.offsetHeight;
            h.removeChild(s);
        }
        
        // List of fonts to detect
        const fontsToDetect = [
            'Arial', 'Verdana', 'Times New Roman', 'Courier New', 
            'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma', 
            'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS'
        ];
        
        const detectedFonts = [];
        
        // Test each font and see if it changes dimensions compared to base fonts
        for (const font of fontsToDetect) {
            let detected = false;
            for (const baseFont of baseFonts) {
                s.style.fontFamily = `${font},${baseFont}`;
                h.appendChild(s);
                const matched = (s.offsetWidth !== defaultWidth[baseFont] || 
                                s.offsetHeight !== defaultHeight[baseFont]);
                h.removeChild(s);
                
                if (matched) {
                    detected = true;
                    break;
                }
            }
            
            if (detected) {
                detectedFonts.push(font);
            }
        }
        
        this.fingerprint.fonts = detectedFonts;
    }

    /**
     * Generate a canvas fingerprint
     */
    async collectCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        
        try {
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Privacy Fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Privacy Fingerprint', 4, 17);
            
            this.fingerprint.canvasFingerprint = canvas.toDataURL().slice(-50);
        } catch (e) {
            this.fingerprint.canvasFingerprint = 'Canvas fingerprinting not supported';
        }
    }

    /**
     * Collect WebGL information
     */
    async collectWebGLInfo() {
        const canvas = document.createElement('canvas');
        let gl;
        let debugInfo;
        let vendor;
        let renderer;
        
        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                this.fingerprint.webglVendor = 'WebGL not supported';
                this.fingerprint.webglRenderer = 'WebGL not supported';
                return;
            }
            
            debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                
                this.fingerprint.webglVendor = vendor;
                this.fingerprint.webglRenderer = renderer;
            } else {
                this.fingerprint.webglVendor = 'WEBGL_debug_renderer_info not accessible';
                this.fingerprint.webglRenderer = 'WEBGL_debug_renderer_info not accessible';
            }
        } catch (e) {
            this.fingerprint.webglVendor = 'Error collecting WebGL info';
            this.fingerprint.webglRenderer = 'Error collecting WebGL info';
        }
    }
}

// Initialize the fingerprint collector
const fingerprintCollector = new FingerprintCollector();
