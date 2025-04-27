/**
 * Canvas Fingerprinting Detection Script
 * Tests if the browser is vulnerable to canvas fingerprinting
 */
class CanvasFingerprintDetector {
    constructor() {
        this.testSentence = "The quick brown fox jumps over the lazy dog";
        this.testSentence2 = "Pack my box with five dozen liquor jugs";
    }

    /**
     * Test for canvas fingerprinting vulnerability
     * @returns {Object} Results of the canvas fingerprinting test
     */
    async detectCanvasFingerprinting() {
        try {
            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 150;
            
            // Check if canvas is supported
            if (!canvas.getContext) {
                return {
                    tested: true,
                    fingerprintable: false,
                    uniquenessScore: 0,
                    protectionActive: false,
                    canvasFingerprint: '',
                    error: 'Canvas not supported in this browser'
                };
            }
            
            // Get canvas context
            const ctx = canvas.getContext('2d');
            
            // Test consistency to detect anti-fingerprinting measures
            const consistencyTest = this.testConsistency(ctx, canvas);
            
            // Draw a mix of shapes and text that can be fingerprinted
            // Background
            ctx.fillStyle = '#f2f2f2';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw some shapes
            ctx.fillStyle = '#3366CC';
            ctx.beginPath();
            ctx.arc(50, 50, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FF9900';
            ctx.beginPath();
            ctx.moveTo(125, 30);
            ctx.lineTo(150, 70);
            ctx.lineTo(100, 70);
            ctx.fill();
            
            // Draw text with different fonts
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial';
            ctx.fillText(this.testSentence, 10, 100);
            
            ctx.fillStyle = '#666';
            ctx.font = 'italic 12px Times New Roman';
            ctx.fillText('Canvas Fingerprinting Test', 40, 120);
            
            // Add some browser-specific rendering features
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Get the image data
            const dataURL = canvas.toDataURL();
            
            // Calculate a simple hash of the image data
            const fingerprint = this.simpleHash(dataURL);
            
            // Calculate a uniqueness score
            const uniquenessScore = this.calculateUniquenessScore(dataURL);
            
            return {
                tested: true,
                fingerprintable: true,
                uniquenessScore: uniquenessScore,
                protectionActive: consistencyTest.protectionDetected,
                canvasFingerprint: fingerprint
            };
        } catch (error) {
            console.error('Canvas fingerprinting detection error:', error);
            return {
                tested: true,
                fingerprintable: false,
                uniquenessScore: 0,
                protectionActive: false,
                canvasFingerprint: '',
                error: error.message
            };
        }
    }

    /**
     * Calculate a uniqueness score for the canvas output
     * @param {string} dataURL - Canvas data URL
     * @returns {number} Uniqueness score from 1-10
     */
    calculateUniquenessScore(dataURL) {
        // In a real implementation, this would compare against a database
        // of known canvas outputs and measure entropy.
        // For simplicity, we'll do a basic calculation based on the length and variation
        
        // A longer data URL generally indicates more pixel variations
        const length = dataURL.length;
        
        // Count unique characters as a proxy for entropy
        const uniqueChars = new Set(dataURL).size;
        
        // Check for specific pattern differences that might indicate OS/browser specifics
        const containsSpecificPatterns = (
            dataURL.includes('AAAA') || 
            dataURL.includes('////') ||
            dataURL.includes('0000')
        );
        
        // Calculate a score from 1-10
        let score = 0;
        
        // Length factor (longer = more unique)
        if (length > 5000) score += 2;
        else if (length > 3000) score += 1;
        
        // Unique characters factor
        if (uniqueChars > 80) score += 3;
        else if (uniqueChars > 60) score += 2;
        else if (uniqueChars > 40) score += 1;
        
        // Specific patterns that indicate browser fingerprinting
        if (containsSpecificPatterns) score += 2;
        
        // Basic features
        score += 3; // Base score because canvas is generally fingerprintable
        
        // Ensure the score is between 1 and 10
        return Math.max(1, Math.min(10, score));
    }

    /**
     * Generate a simple hash of the data URL
     * @param {string} str - String to hash
     * @returns {string} Simple hash
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Convert to a hex string
        return (hash >>> 0).toString(16);
    }

    /**
     * Test if canvas output is consistent (indication of anti-fingerprinting)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Object} Consistency test results
     */
    testConsistency(ctx, canvas) {
        // Run the same drawing operation multiple times and check for differences
        // Some privacy browsers (like Tor) add noise to canvas rendering to prevent fingerprinting
        
        // First drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '18px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(this.testSentence2, 10, 50);
        const firstRender = canvas.toDataURL();
        
        // Second drawing (identical parameters)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '18px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(this.testSentence2, 10, 50);
        const secondRender = canvas.toDataURL();
        
        // Check for differences
        const difference = this.calculateDifference(firstRender, secondRender);
        
        return {
            protectionDetected: difference > 0,
            differenceScore: difference
        };
    }

    /**
     * Calculate a simple difference score between two strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Difference score
     */
    calculateDifference(str1, str2) {
        // In a real implementation, this would be more sophisticated
        // For simplicity, we'll just check if they're identical
        if (str1 === str2) return 0;
        
        // Check the length difference
        const lengthDiff = Math.abs(str1.length - str2.length);
        if (lengthDiff > 0) return 1;
        
        // Count character differences (simplified)
        let diffCount = 0;
        const minLength = Math.min(str1.length, str2.length);
        const checkLength = Math.min(minLength, 1000); // Limit to 1000 chars for efficiency
        
        for (let i = 0; i < checkLength; i++) {
            if (str1[i] !== str2[i]) {
                diffCount++;
            }
        }
        
        return diffCount > 0 ? 1 : 0;
    }
}