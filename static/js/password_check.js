/**
 * Password Strength Checker
 * Tests the strength of a password and provides feedback
 */
class PasswordStrengthChecker {
    constructor() {
        this.results = {
            tested: false,
            password: '',
            score: 0, // 0-100
            feedback: {
                warning: null,
                suggestions: []
            }
        };
        
        // Common password patterns to check against
        this.commonPatterns = [
            /^123456/, /^password/, /^qwerty/, /^admin/,
            /^welcome/, /^letmein/, /^monkey/, /^login/,
            /^abc123/, /^111111/, /^dragon/, /^baseball/,
            /^football/, /^696969/, /^master/, /^shadow/,
            /^666666/, /^qwertyuiop/, /^123123/, /^654321/
        ];
        
        // Common character sequences
        this.sequences = [
            'abcdefghijklmnopqrstuvwxyz',
            '01234567890',
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm'
        ];
    }

    /**
     * Check password strength
     * @param {string} password - The password to check
     * @returns {Object} Results of the password check
     */
    checkPassword(password) {
        if (!password) {
            this.results.tested = true;
            this.results.feedback.warning = "No password provided";
            this.results.score = 0;
            return this.results;
        }
        
        this.results.tested = true;
        this.results.password = password;
        
        // Reset suggestions
        this.results.feedback.suggestions = [];
        this.results.feedback.warning = null;

        // Start with base score of 50
        let score = 50;
        
        // Length check (8+ chars recommended)
        if (password.length < 8) {
            score -= 10 * (8 - password.length);
            this.results.feedback.suggestions.push("Use a longer password (at least 8 characters)");
        } else {
            score += 5 * Math.min(password.length - 8, 12); // Cap bonus at 12 extra chars
        }
        
        // Check for character diversity
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        // Diversity bonuses
        if (hasLower) score += 10;
        if (hasUpper) score += 10;
        if (hasDigit) score += 10;
        if (hasSpecial) score += 15;
        
        // Diversity checks
        if (!hasLower) this.results.feedback.suggestions.push("Include lowercase letters");
        if (!hasUpper) this.results.feedback.suggestions.push("Include uppercase letters");
        if (!hasDigit) this.results.feedback.suggestions.push("Include numbers");
        if (!hasSpecial) this.results.feedback.suggestions.push("Include special characters");
        
        // Check for common password patterns
        for (const pattern of this.commonPatterns) {
            if (pattern.test(password.toLowerCase())) {
                score -= 30;
                this.results.feedback.warning = "This is similar to a commonly used password";
                break;
            }
        }
        
        // Check for keyboard sequences
        for (const seq of this.sequences) {
            for (let i = 0; i < seq.length - 3; i++) {
                const forward = seq.substring(i, i + 4);
                const reverse = forward.split('').reverse().join('');
                
                if (password.toLowerCase().includes(forward) || 
                    password.toLowerCase().includes(reverse)) {
                    score -= 20;
                    this.results.feedback.suggestions.push("Avoid keyboard patterns like 'qwerty' or '12345'");
                    break;
                }
            }
        }
        
        // Check for character repetition
        const repetitionRegex = /(.)\1{2,}/;  // Same character 3+ times in a row
        if (repetitionRegex.test(password)) {
            score -= 15;
            this.results.feedback.suggestions.push("Avoid repeating characters");
        }
        
        // Calculate final score (clamped to 0-100)
        this.results.score = Math.max(0, Math.min(100, score));
        
        // Set general warning based on score
        if (!this.results.feedback.warning) {
            if (this.results.score < 20) {
                this.results.feedback.warning = "This password is very weak";
            } else if (this.results.score < 40) {
                this.results.feedback.warning = "This password is weak";
            } else if (this.results.score < 60) {
                this.results.feedback.warning = "This password is moderate";
            } else if (this.results.score < 80) {
                this.results.feedback.warning = "This is a good password";
            } else {
                this.results.feedback.warning = "This is a strong password";
            }
        }
        
        return this.results;
    }
}