/**
 * Anonymity Score Timeline
 * Tracks anonymity scores over time and shows progress
 */
class AnonymityTimeline {
    constructor() {
        this.initialized = false;
        this.localStorageKey = 'anonymity_timeline_data';
        this.results = {
            tested: false,
            currentScore: 0,
            previousScores: [],
            trend: 'stable', // 'improving', 'declining', 'stable'
            changePercent: 0,
            recommendations: []
        };
    }
    
    /**
     * Initialize the anonymity timeline
     */
    async init(currentAnonymityScore) {
        if (this.initialized) return;
        
        this.initialized = true;
        this.results.tested = true;
        
        // Store the current anonymity score
        this.results.currentScore = currentAnonymityScore || 0;
        
        // Load previous scores from local storage
        this.loadPreviousScores();
        
        // Add current score to timeline
        this.addCurrentScoreToTimeline();
        
        // Calculate trend
        this.calculateTrend();
        
        // Prepare recommendations
        this.prepareRecommendations();
    }
    
    /**
     * Load previous scores from local storage
     */
    loadPreviousScores() {
        try {
            // Get saved data from local storage
            const savedData = localStorage.getItem(this.localStorageKey);
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Validate the data
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    // Limit to the most recent 10 entries
                    this.results.previousScores = parsedData.slice(-10);
                }
            }
        } catch (e) {
            console.error('Error loading anonymity timeline data:', e);
            // Start with empty array if there's an error
            this.results.previousScores = [];
        }
    }
    
    /**
     * Add current score to timeline
     */
    addCurrentScoreToTimeline() {
        // Create a new entry with current timestamp and score
        const newEntry = {
            timestamp: Date.now(),
            date: new Date().toISOString(),
            score: this.results.currentScore
        };
        
        // Add to previous scores
        this.results.previousScores.push(newEntry);
        
        // Limit to the most recent 10 entries
        if (this.results.previousScores.length > 10) {
            this.results.previousScores = this.results.previousScores.slice(-10);
        }
        
        // Save to local storage
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.results.previousScores));
        } catch (e) {
            console.error('Error saving anonymity timeline data:', e);
        }
    }
    
    /**
     * Calculate trend in anonymity scores
     */
    calculateTrend() {
        const scores = this.results.previousScores;
        
        // Need at least two scores to calculate a trend
        if (scores.length < 2) {
            this.results.trend = 'stable';
            this.results.changePercent = 0;
            return;
        }
        
        // Get the most recent score before the current one
        const previousScore = scores[scores.length - 2].score;
        const currentScore = this.results.currentScore;
        
        // Calculate percent change
        if (previousScore > 0) {
            this.results.changePercent = ((currentScore - previousScore) / previousScore) * 100;
        } else {
            this.results.changePercent = currentScore > 0 ? 100 : 0;
        }
        
        // Round to one decimal place
        this.results.changePercent = Math.round(this.results.changePercent * 10) / 10;
        
        // Determine trend
        if (this.results.changePercent > 5) {
            this.results.trend = 'improving';
        } else if (this.results.changePercent < -5) {
            this.results.trend = 'declining';
        } else {
            this.results.trend = 'stable';
        }
        
        // Calculate long-term trend if we have enough data
        if (scores.length >= 3) {
            const firstScore = scores[0].score;
            const longTermChange = ((currentScore - firstScore) / firstScore) * 100;
            this.results.longTermTrend = longTermChange > 5 ? 'improving' :
                                       longTermChange < -5 ? 'declining' : 'stable';
            this.results.longTermChangePercent = Math.round(longTermChange * 10) / 10;
        }
    }
    
    /**
     * Prepare recommendations based on trends
     */
    prepareRecommendations() {
        const recommendations = [];
        
        // If declining trend, recommend taking action
        if (this.results.trend === 'declining') {
            recommendations.push({
                title: "Address recent privacy decline",
                description: `Your anonymity score has decreased by ${Math.abs(this.results.changePercent)}% recently.`,
                priority: "high",
                implementation: "Review recent changes to your browser, extensions, or VPN settings. Check if you've disabled any privacy features or allowed additional permissions to websites."
            });
        }
        
        // If very low score, recommend privacy reset
        if (this.results.currentScore < 30) {
            recommendations.push({
                title: "Privacy reset recommended",
                description: "Your current anonymity score is very low, indicating significant privacy risks.",
                priority: "high",
                implementation: "Consider a privacy reset: clear browser data, review installed extensions, check for malware, update your browser, and reconfigure privacy settings to their strictest levels."
            });
        }
        
        // If stable but low score, recommend gradual improvements
        if (this.results.trend === 'stable' && this.results.currentScore < 60) {
            recommendations.push({
                title: "Gradually improve your privacy setup",
                description: "Your privacy score has been consistently mediocre.",
                priority: "medium",
                implementation: "Set a goal to improve your score by 10 points each month. Start with implementing one new privacy recommendation from this report each week."
            });
        }
        
        // If improving, provide positive reinforcement
        if (this.results.trend === 'improving' && this.results.currentScore > 60) {
            recommendations.push({
                title: "Maintain your privacy improvements",
                description: `Your privacy score has improved by ${this.results.changePercent}% recently.`,
                priority: "low",
                implementation: "Continue your current privacy practices and consider setting up a regular privacy audit schedule to maintain these improvements."
            });
        }
        
        // General recommendation for all users
        recommendations.push({
            title: "Schedule regular privacy check-ups",
            description: "Regular privacy assessments help maintain and improve your anonymity over time.",
            priority: "medium",
            implementation: "Set a calendar reminder to run a full privacy check monthly, and check this timeline to track your progress. Consider using Privacy Badger's automated learning to continuously improve protection."
        });
        
        this.results.recommendations = recommendations;
    }
    
    /**
     * Get the test results
     */
    getResults() {
        return this.results;
    }
    
    /**
     * Clear timeline data (useful for privacy or testing)
     */
    clearTimelineData() {
        try {
            localStorage.removeItem(this.localStorageKey);
            this.results.previousScores = [];
            this.results.trend = 'stable';
            this.results.changePercent = 0;
            return true;
        } catch (e) {
            console.error('Error clearing anonymity timeline data:', e);
            return false;
        }
    }
}

// Create and add to global namespace
window.anonymityTimeline = new AnonymityTimeline();