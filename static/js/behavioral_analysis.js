/**
 * Behavioral Analysis Script
 * Analyzes user interaction patterns for naturalness
 */
class BehavioralAnalyzer {
    constructor() {
        this.suspiciousPatterns = [];
        this.naturalPatterns = [];
        this.interactionMetrics = {
            mouseMoveCount: 0,
            clickCount: 0,
            keyPressCount: 0,
            scrollCount: 0,
            lastActivity: Date.now(),
            averageMouseSpeed: 0,
            totalMouseDistance: 0,
            lastMousePosition: { x: 0, y: 0 },
            mouseSpeeds: []
        };
        this.score = 100;
        this.recommendations = [];
        
        // Set up event listeners
        if (typeof window !== 'undefined') {
            this.setupEventListeners();
        }
    }

    /**
     * Setup event listeners to track user behavior
     * These are passive and don't affect user experience
     */
    setupEventListeners() {
        try {
            // Track mouse movements
            document.addEventListener('mousemove', (e) => {
                this.interactionMetrics.mouseMoveCount++;
                this.interactionMetrics.lastActivity = Date.now();
                
                // Calculate mouse speed and distance
                const currentPosition = { x: e.clientX, y: e.clientY };
                const lastPosition = this.interactionMetrics.lastMousePosition;
                
                if (lastPosition.x !== 0 || lastPosition.y !== 0) {
                    const distance = Math.sqrt(
                        Math.pow(currentPosition.x - lastPosition.x, 2) + 
                        Math.pow(currentPosition.y - lastPosition.y, 2)
                    );
                    
                    this.interactionMetrics.totalMouseDistance += distance;
                    
                    // Only add speed if movement is significant
                    if (distance > 5) {
                        this.interactionMetrics.mouseSpeeds.push(distance);
                        
                        // Keep array at reasonable size
                        if (this.interactionMetrics.mouseSpeeds.length > 50) {
                            this.interactionMetrics.mouseSpeeds.shift();
                        }
                        
                        // Calculate average speed
                        this.interactionMetrics.averageMouseSpeed = 
                            this.interactionMetrics.mouseSpeeds.reduce((a, b) => a + b, 0) / 
                            this.interactionMetrics.mouseSpeeds.length;
                    }
                }
                
                this.interactionMetrics.lastMousePosition = currentPosition;
            }, { passive: true });
            
            // Track clicks
            document.addEventListener('click', () => {
                this.interactionMetrics.clickCount++;
                this.interactionMetrics.lastActivity = Date.now();
            }, { passive: true });
            
            // Track key presses
            document.addEventListener('keydown', () => {
                this.interactionMetrics.keyPressCount++;
                this.interactionMetrics.lastActivity = Date.now();
            }, { passive: true });
            
            // Track scrolling
            document.addEventListener('scroll', () => {
                this.interactionMetrics.scrollCount++;
                this.interactionMetrics.lastActivity = Date.now();
            }, { passive: true });
        } catch (error) {
            console.error("Error setting up behavioral analysis event listeners:", error);
        }
    }

    /**
     * Analyze user behavior patterns
     * @returns {Object} Results of the behavioral analysis
     */
    async analyzeBehavior() {
        try {
            // Check for typical human behavior patterns
            this.checkMouseBehavior();
            this.checkInteractionPatterns();
            this.checkTimingPatterns();
            
            // Calculate a behavior score
            this.calculateScore();
            
            // Generate recommendations
            this.generateRecommendations();
            
            return {
                tested: true,
                natural_behavior: this.suspiciousPatterns.length === 0,
                behavior_score: this.score,
                suspicious_patterns: this.suspiciousPatterns,
                natural_patterns: this.naturalPatterns,
                interaction_metrics: this.interactionMetrics,
                recommendations: this.recommendations
            };
        } catch (error) {
            console.error("Error in behavioral analysis:", error);
            return {
                tested: false,
                error: error.message
            };
        }
    }

    /**
     * Check mouse movement behavior
     */
    checkMouseBehavior() {
        // Check for natural mouse movements (not too linear or precise)
        if (this.interactionMetrics.mouseMoveCount < 5) {
            this.suspiciousPatterns.push("Very little mouse movement detected");
        } else {
            this.naturalPatterns.push("Normal mouse movement patterns");
        }
        
        // Check mouse speed variability
        if (this.interactionMetrics.mouseSpeeds.length > 10) {
            // Calculate standard deviation of mouse speeds
            const avg = this.interactionMetrics.averageMouseSpeed;
            const variance = this.interactionMetrics.mouseSpeeds.reduce(
                (sum, speed) => sum + Math.pow(speed - avg, 2), 0
            ) / this.interactionMetrics.mouseSpeeds.length;
            const stdDev = Math.sqrt(variance);
            
            // Human mouse movements typically have some variability
            if (stdDev < 2 && this.interactionMetrics.mouseMoveCount > 20) {
                this.suspiciousPatterns.push("Unusually consistent mouse movement speed");
            } else if (stdDev > 0) {
                this.naturalPatterns.push("Natural mouse speed variability");
            }
        }
    }

    /**
     * Check interaction patterns between mouse, keyboard, and scrolling
     */
    checkInteractionPatterns() {
        // Check for a natural mix of interactions
        const totalInteractions = 
            this.interactionMetrics.clickCount + 
            this.interactionMetrics.keyPressCount + 
            this.interactionMetrics.scrollCount;
            
        if (totalInteractions > 5) {
            // Check if there's some mix of different interaction types
            const hasMultipleInteractionTypes = 
                (this.interactionMetrics.clickCount > 0 ? 1 : 0) +
                (this.interactionMetrics.keyPressCount > 0 ? 1 : 0) +
                (this.interactionMetrics.scrollCount > 0 ? 1 : 0) >= 2;
                
            if (hasMultipleInteractionTypes) {
                this.naturalPatterns.push("Natural mix of interaction types");
            } else {
                this.suspiciousPatterns.push("Limited to only one type of interaction");
            }
        }
        
        // Check mouse to click ratio (humans don't click on every mouse move)
        if (this.interactionMetrics.mouseMoveCount > 10 && this.interactionMetrics.clickCount > 0) {
            const moveToClickRatio = this.interactionMetrics.mouseMoveCount / this.interactionMetrics.clickCount;
            
            // Most humans have many mouse movements per click
            if (moveToClickRatio < 5) {
                this.suspiciousPatterns.push("Unusually high click frequency compared to mouse movement");
            } else if (moveToClickRatio > 100) {
                this.suspiciousPatterns.push("Very few clicks compared to mouse movement");
            } else {
                this.naturalPatterns.push("Natural mouse-to-click ratio");
            }
        }
    }

    /**
     * Check timing patterns between interactions
     */
    checkTimingPatterns() {
        // For now, this is a placeholder - in a real implementation, 
        // we'd track timestamps between events to detect patterns
        // such as perfectly regular intervals between actions
        
        // Current time
        const now = Date.now();
        
        // Check time since last activity
        const timeSinceActivity = now - this.interactionMetrics.lastActivity;
        
        // If there's been activity and it wasn't too long ago
        if (this.interactionMetrics.lastActivity > 0 && timeSinceActivity < 60000) {
            this.naturalPatterns.push("Recent user activity detected");
        }
    }

    /**
     * Calculate a behavior score based on patterns
     */
    calculateScore() {
        // Start with a perfect score
        let score = 100;
        
        // Each suspicious pattern reduces the score
        score -= (this.suspiciousPatterns.length * 15);
        
        // Each natural pattern adds a small bonus (capped at original 100)
        score += (this.naturalPatterns.length * 3);
        score = Math.min(score, 100);
        
        // Ensure score doesn't go below 0
        this.score = Math.max(score, 0);
    }

    /**
     * Generate recommendations based on suspicious patterns
     */
    generateRecommendations() {
        if (this.suspiciousPatterns.includes("Very little mouse movement detected")) {
            this.recommendations.push({
                category: "behavior",
                title: "Use Natural Mouse Movements",
                description: "Your browsing appears to have minimal mouse movement, which can appear suspicious. Try to move your cursor naturally when browsing websites.",
                priority: "medium"
            });
        }
        
        if (this.suspiciousPatterns.includes("Unusually consistent mouse movement speed")) {
            this.recommendations.push({
                category: "behavior",
                title: "Vary Your Mouse Movement Patterns",
                description: "Your mouse movements have an unusually consistent speed, which can trigger bot detection. Try varying your mouse movement speed and patterns.",
                priority: "medium"
            });
        }
        
        if (this.suspiciousPatterns.includes("Limited to only one type of interaction")) {
            this.recommendations.push({
                category: "behavior",
                title: "Use Various Interaction Methods",
                description: "Your browsing uses limited interaction types. Try using a mix of clicking, scrolling, and keyboard actions for more natural browsing patterns.",
                priority: "low"
            });
        }
        
        if (this.suspiciousPatterns.includes("Unusually high click frequency compared to mouse movement")) {
            this.recommendations.push({
                category: "behavior",
                title: "Reduce Click Frequency",
                description: "You're clicking much more frequently than typical users in relation to mouse movement, which can appear automated. Try moving your mouse more between clicks.",
                priority: "medium"
            });
        }
        
        if (this.suspiciousPatterns.includes("Very few clicks compared to mouse movement")) {
            this.recommendations.push({
                category: "behavior",
                title: "Increase Interaction",
                description: "Your browsing shows extensive mouse movement with very little clicking, which is unusual. Try interacting more with page elements for more natural behavior.",
                priority: "low"
            });
        }
    }
}