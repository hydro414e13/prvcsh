/**
 * Font Fingerprinting Detection Script
 * Checks which fonts are available on the system, which can be used for fingerprinting
 */
class FontFingerprintDetector {
    constructor() {
        this.results = {
            tested: false,
            uniqueFontsDetected: 0,
            fontFingerprint: {},
            errorMessage: null
        };
        
        // Common fonts to test for
        this.fontsToTest = [
            // Windows fonts
            'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria', 'Cambria Math', 
            'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 
            'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 
            'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
            // macOS fonts
            'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Apple Color Emoji', 'AppleGothic', 
            'AppleMyungjo', 'Arial Hebrew', 'Avenir', 'Baskerville', 'Big Caslon', 'Brush Script MT', 
            'Chalkboard', 'Cochin', 'Copperplate', 'Didot', 'Futura', 'Geneva', 'Gill Sans', 
            'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Marker Felt', 'Menlo', 
            'Monaco', 'Optima', 'Papyrus', 'Skia', 'Snell Roundhand',
            // Linux fonts
            'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'FreeMono', 'FreeSans', 'FreeSerif', 
            'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Nimbus Mono L', 'Nimbus Sans L', 
            'Nimbus Roman No9 L', 'URW Bookman L', 'URW Chancery L',
            // Common web fonts
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Raleway', 'Oxygen', 
            'Ubuntu', 'Nunito', 'Merriweather', 'Playfair Display'
        ];
    }

    /**
     * Detect font availability for fingerprinting
     * @returns {Object} Results of the font fingerprinting check
     */
    async detectFontFingerprinting() {
        try {
            this.results.tested = true;
            
            // Create a test bed for font detection
            const testBed = document.createElement('div');
            testBed.style.position = 'absolute';
            testBed.style.left = '-9999px';
            testBed.style.visibility = 'hidden';
            document.body.appendChild(testBed);
            
            // Reference fonts for width comparison
            const referenceFont = 'monospace';
            const fallbackFont = 'sans-serif';
            
            // Object to store available fonts
            const availableFonts = {};
            
            // Test each font
            for (const font of this.fontsToTest) {
                // Create spans with different fonts
                const referenceSpan = document.createElement('span');
                referenceSpan.style.fontFamily = referenceFont;
                referenceSpan.innerText = 'mmmmmmmmmmlllllllllliiiiiiiiiiWWWWWWWWWW';
                testBed.appendChild(referenceSpan);
                
                const fallbackSpan = document.createElement('span');
                fallbackSpan.style.fontFamily = fallbackFont;
                fallbackSpan.innerText = 'mmmmmmmmmmlllllllllliiiiiiiiiiWWWWWWWWWW';
                testBed.appendChild(fallbackSpan);
                
                const testSpan = document.createElement('span');
                testSpan.style.fontFamily = `'${font}', ${fallbackFont}`;
                testSpan.innerText = 'mmmmmmmmmmlllllllllliiiiiiiiiiWWWWWWWWWW';
                testBed.appendChild(testSpan);
                
                // Get metrics
                const referenceWidth = referenceSpan.offsetWidth;
                const fallbackWidth = fallbackSpan.offsetWidth;
                const testWidth = testSpan.offsetWidth;
                
                // Determine if font is available
                // If the test width is different from both reference and fallback, it's likely available
                const fontAvailable = testWidth !== referenceWidth && 
                                     (testWidth !== fallbackWidth || 
                                     Math.abs(testWidth - fallbackWidth) > 2);
                
                // Store result
                availableFonts[font] = fontAvailable;
                
                // Clean up spans
                testBed.removeChild(referenceSpan);
                testBed.removeChild(fallbackSpan);
                testBed.removeChild(testSpan);
            }
            
            // Clean up test bed
            document.body.removeChild(testBed);
            
            // Count unique fonts detected
            const detectedFonts = Object.keys(availableFonts).filter(font => availableFonts[font]);
            this.results.uniqueFontsDetected = detectedFonts.length;
            
            // Create a fingerprint from the fonts
            this.results.fontFingerprint = {
                availableFonts: availableFonts,
                // Create a simple hash of the available fonts for comparison
                fingerprint: this.simpleHash(detectedFonts.join(','))
            };
            
            return this.results;
            
        } catch (error) {
            console.error('Font fingerprinting detection error:', error);
            this.results.errorMessage = error.message;
            return this.results;
        }
    }
    
    /**
     * Generate a simple hash for the data
     * @param {string} str - String to hash
     * @returns {string} Simple hash
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
}