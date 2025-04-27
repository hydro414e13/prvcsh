/**
 * Privacy Risk Visualization Script
 * Creates animated visual representations of privacy risks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the visualization once the page is loaded
    initializeRiskVisualization();
    
    // Initialize tooltips for penalty suggestions and legitimacy factors
    initializeTooltips();
});

/**
 * Initialize the risk visualization components
 */
function initializeRiskVisualization() {
    // Draw the animated score gauge
    drawScoreGauge();
    
    // Draw the legitimacy score gauge
    drawLegitimacyGauge();
    
    // Setup the risk breakdown visualization
    setupRiskBreakdown();
    
    // Setup animated risk map
    setupRiskMap();
}

/**
 * Draw an animated score gauge using Canvas
 */
function drawScoreGauge() {
    const canvas = document.getElementById('scoreGauge');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Get the score value from the DOM
    const scoreElement = document.querySelector('.score-value');
    const score = parseInt(scoreElement.textContent, 10);
    
    // Determine color based on score
    let color;
    if (score >= 80) {
        color = '#28a745'; // green
    } else if (score >= 50) {
        color = '#ffc107'; // yellow
    } else {
        color = '#dc3545'; // red
    }
    
    // Animation variables
    let currentAngle = 0;
    const targetAngle = (score / 100) * Math.PI * 1.5;
    const animationDuration = 1500; // in ms
    const startTime = performance.now();
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#e9ecef';
    ctx.stroke();
    
    // Animation function
    function animate(currentTime) {
        // Calculate progress
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Use easeOutCubic easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        currentAngle = easedProgress * targetAngle;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5, false);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#e9ecef';
        ctx.stroke();
        
        // Draw progress arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + currentAngle, false);
        ctx.lineWidth = 14;
        ctx.strokeStyle = color;
        ctx.stroke();
        
        // Continue animation if not finished
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Add tick marks when animation is complete
            drawTickMarks(ctx, centerX, centerY, radius);
            
            // Add glow effect for final state
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + currentAngle, false);
            ctx.strokeStyle = color;
            ctx.lineWidth = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    // Start animation
    requestAnimationFrame(animate);
}

/**
 * Draw tick marks on the gauge
 */
function drawTickMarks(ctx, centerX, centerY, radius) {
    ctx.fillStyle = '#6c757d';
    
    // Draw 5 tick marks
    for (let i = 0; i <= 5; i++) {
        const angle = Math.PI * 0.75 + (i / 5) * Math.PI * 1.5;
        const innerRadius = radius - 12;
        const outerRadius = radius + 15;
        
        // Calculate tick mark positions
        const innerX = centerX + innerRadius * Math.cos(angle);
        const innerY = centerY + innerRadius * Math.sin(angle);
        const outerX = centerX + outerRadius * Math.cos(angle);
        const outerY = centerY + outerRadius * Math.sin(angle);
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add label for major ticks (0, 25, 50, 75, 100)
        if (i % 1 === 0) {
            const labelRadius = outerRadius + 10;
            const labelX = centerX + labelRadius * Math.cos(angle);
            const labelY = centerY + labelRadius * Math.sin(angle);
            
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((i * 20).toString(), labelX, labelY);
        }
    }
}

/**
 * Draw the legitimacy score gauge
 */
function drawLegitimacyGauge() {
    const canvas = document.getElementById('legitimacyGauge');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Get the legitimacy score value from the DOM
    const scoreElement = document.getElementById('legitimacyValue');
    if (!scoreElement) return;
    
    const score = parseInt(scoreElement.textContent, 10);
    
    // Determine color based on score - for legitimacy, higher is better
    let color;
    if (score >= 80) {
        color = '#28a745'; // green - looks like a real user
    } else if (score >= 50) {
        color = '#ffc107'; // yellow - somewhat suspicious
    } else {
        color = '#dc3545'; // red - very suspicious, likely not a real user
    }
    
    // Animation variables
    let currentAngle = 0;
    const targetAngle = (score / 100) * Math.PI * 1.5;
    const animationDuration = 1500; // in ms
    const startTime = performance.now();
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#e9ecef';
    ctx.stroke();
    
    // Animation function
    function animate(currentTime) {
        // Calculate progress
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Use easeOutCubic easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        currentAngle = easedProgress * targetAngle;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5, false);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#e9ecef';
        ctx.stroke();
        
        // Draw progress arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + currentAngle, false);
        ctx.lineWidth = 14;
        ctx.strokeStyle = color;
        ctx.stroke();
        
        // Continue animation if not finished
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Add tick marks when animation is complete
            drawTickMarks(ctx, centerX, centerY, radius);
            
            // Add glow effect for final state
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + currentAngle, false);
            ctx.strokeStyle = color;
            ctx.lineWidth = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    // Start animation
    requestAnimationFrame(animate);
}

/**
 * Setup the visualization for the risk breakdown
 */
function setupRiskBreakdown() {
    // Get the penalties list
    const penaltiesContainer = document.getElementById('penaltiesContainer');
    if (penaltiesContainer) {
        const penaltyItems = penaltiesContainer.querySelectorAll('.penalty-item');
        
        // Animate each penalty item
        penaltyItems.forEach((item, index) => {
            // Add a delay based on the index for cascading animation
            const delay = 300 + (index * 100);
            
            // Get the penalty value
            const valueElement = item.querySelector('.penalty-value');
            const value = parseInt(valueElement.getAttribute('data-value'), 10);
            
            // Setup animation for the penalty item
            setTimeout(() => {
                // Add animation class
                item.classList.add('animate-penalty');
                
                // Animate the penalty bar
                const bar = item.querySelector('.penalty-bar-fill');
                if (bar) {
                    // Determine color based on penalty size
                    const percentage = Math.min((value / 30) * 100, 100); // Assuming max penalty is 30
                    bar.style.width = `${percentage}%`;
                }
            }, delay);
        });
    }
    
    // Get the legitimacy factors list
    const legitimacyContainer = document.getElementById('legitimacyFactorsContainer');
    if (legitimacyContainer) {
        const legitimacyItems = legitimacyContainer.querySelectorAll('.legitimacy-factor');
        
        // Animate each legitimacy factor item
        legitimacyItems.forEach((item, index) => {
            // Add a delay based on the index for cascading animation
            const delay = 300 + (index * 100);
            
            // Get the impact value
            const valueElement = item.querySelector('.factor-impact');
            const value = parseInt(valueElement.getAttribute('data-impact'), 10);
            
            // Setup animation for the legitimacy factor item
            setTimeout(() => {
                // Add animation class
                item.classList.add('animate-legitimacy');
                
                // Animate the factor bar
                const bar = item.querySelector('.factor-bar-fill');
                if (bar) {
                    // Determine width based on impact size
                    const percentage = Math.min((value / 20) * 100, 100); // Assuming max factor is 20
                    bar.style.width = `${percentage}%`;
                }
            }, delay);
        });
    }
}

/**
 * Setup the interactive risk map visualization
 */
function setupRiskMap() {
    const riskMapElement = document.getElementById('riskMap');
    if (!riskMapElement) return;
    
    // Get risk areas from data attributes
    const riskAreas = JSON.parse(riskMapElement.getAttribute('data-risk-areas') || '[]');
    
    // Create SVG for the risk map
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "300");
    svg.setAttribute("viewBox", "0 0 600 300");
    riskMapElement.appendChild(svg);
    
    // Create background
    const background = document.createElementNS(svgNS, "rect");
    background.setAttribute("width", "600");
    background.setAttribute("height", "300");
    background.setAttribute("fill", "#f8f9fa");
    background.setAttribute("rx", "10");
    svg.appendChild(background);
    
    // Define risk categories and positions
    const categories = [
        { name: "Browser", x: 150, y: 80, radius: 70 },
        { name: "Network", x: 300, y: 80, radius: 70 },
        { name: "VPN", x: 450, y: 80, radius: 70 },
        { name: "Cookies", x: 150, y: 220, radius: 70 },
        { name: "IP", x: 300, y: 220, radius: 70 },
        { name: "Data", x: 450, y: 220, radius: 70 }
    ];
    
    // Draw connecting lines first (behind the circles)
    for (let i = 0; i < categories.length; i++) {
        for (let j = i + 1; j < categories.length; j++) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", categories[i].x);
            line.setAttribute("y1", categories[i].y);
            line.setAttribute("x2", categories[j].x);
            line.setAttribute("y2", categories[j].y);
            line.setAttribute("stroke", "#dee2e6");
            line.setAttribute("stroke-width", "1");
            svg.appendChild(line);
        }
    }
    
    // Draw circles for each category
    categories.forEach((category, index) => {
        // Find if this category has risk data
        const riskData = riskAreas.find(area => area.category.toLowerCase() === category.name.toLowerCase());
        let riskLevel = 0;
        
        if (riskData) {
            riskLevel = riskData.riskLevel; // 0-100
        }
        
        // Create circle with animation delay based on index
        setTimeout(() => {
            // Create and append the circle
            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", category.x);
            circle.setAttribute("cy", category.y);
            circle.setAttribute("r", 0); // Start at 0 for animation
            
            // Determine fill color based on risk level
            let fillColor;
            if (riskLevel >= 70) {
                fillColor = 'rgba(220, 53, 69, 0.7)'; // High risk - red
            } else if (riskLevel >= 30) {
                fillColor = 'rgba(255, 193, 7, 0.7)'; // Medium risk - yellow
            } else {
                fillColor = 'rgba(40, 167, 69, 0.7)'; // Low risk - green
            }
            
            circle.setAttribute("fill", fillColor);
            circle.setAttribute("stroke", "#fff");
            circle.setAttribute("stroke-width", "2");
            svg.appendChild(circle);
            
            // Add animation to expand the circle
            let currentRadius = 0;
            const targetRadius = category.radius * (0.3 + (riskLevel / 100) * 0.7); // Scale based on risk level
            const animationDuration = 1000;
            const startTime = performance.now();
            
            function animateCircle(timestamp) {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Use easeOutElastic easing function for bouncy effect
                const easedProgress = elasticOut(progress);
                currentRadius = Math.max(0, easedProgress * targetRadius); // Ensure radius is never negative
                
                // SVG circles cannot have negative radius values
                circle.setAttribute("r", currentRadius);
                
                if (progress < 1) {
                    requestAnimationFrame(animateCircle);
                }
            }
            
            requestAnimationFrame(animateCircle);
            
            // Add text label
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", category.x);
            text.setAttribute("y", category.y);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "#fff");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("pointer-events", "none");
            text.textContent = category.name;
            svg.appendChild(text);
            
            // Add risk level label
            const riskText = document.createElementNS(svgNS, "text");
            riskText.setAttribute("x", category.x);
            riskText.setAttribute("y", category.y + 20);
            riskText.setAttribute("text-anchor", "middle");
            riskText.setAttribute("dominant-baseline", "middle");
            riskText.setAttribute("fill", "#fff");
            riskText.setAttribute("font-size", "12");
            riskText.setAttribute("pointer-events", "none");
            riskText.textContent = `${riskLevel}%`;
            svg.appendChild(riskText);
            
            // Make circle interactive
            circle.addEventListener('mouseover', () => {
                circle.setAttribute("stroke-width", "3");
                circle.setAttribute("filter", "url(#glow)");
            });
            
            circle.addEventListener('mouseout', () => {
                circle.setAttribute("stroke-width", "2");
                circle.setAttribute("filter", "");
            });
            
            // Add tooltip with more details
            circle.addEventListener('click', () => {
                // Show more detailed information in a tooltip or modal
                showCategoryDetails(category.name, riskLevel);
            });
            
        }, index * 200); // Stagger animation starts
    });
    
    // Add SVG filters for glow effects
    const defs = document.createElementNS(svgNS, "defs");
    svg.appendChild(defs);
    
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "glow");
    filter.setAttribute("width", "300%");
    filter.setAttribute("height", "300%");
    filter.setAttribute("x", "-100%");
    filter.setAttribute("y", "-100%");
    defs.appendChild(filter);
    
    const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feGaussianBlur.setAttribute("stdDeviation", "5");
    feGaussianBlur.setAttribute("result", "blur");
    filter.appendChild(feGaussianBlur);
    
    const feColorMatrix = document.createElementNS(svgNS, "feColorMatrix");
    feColorMatrix.setAttribute("in", "blur");
    feColorMatrix.setAttribute("type", "matrix");
    feColorMatrix.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 15 -5");
    feColorMatrix.setAttribute("result", "glow");
    filter.appendChild(feColorMatrix);
    
    const feMerge = document.createElementNS(svgNS, "feMerge");
    filter.appendChild(feMerge);
    
    const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
    feMergeNode1.setAttribute("in", "glow");
    feMerge.appendChild(feMergeNode1);
    
    const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
    feMergeNode2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMergeNode2);
}

/**
 * Show detailed information about a risk category
 */
function showCategoryDetails(category, riskLevel) {
    // Find or create modal element
    let modal = document.getElementById('riskDetailModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'riskDetailModal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="risk-detail-content"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Set modal content
    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = `${category} Risk Details`;
    
    const modalContent = modal.querySelector('.risk-detail-content');
    
    // Determine risk level category
    let riskCategory;
    if (riskLevel >= 70) {
        riskCategory = 'High';
    } else if (riskLevel >= 30) {
        riskCategory = 'Medium';
    } else {
        riskCategory = 'Low';
    }
    
    // Generate content based on category
    let details = '';
    switch(category.toLowerCase()) {
        case 'browser':
            details = getBrowserRiskDetails(riskCategory);
            break;
        case 'network':
            details = getNetworkRiskDetails(riskCategory);
            break;
        case 'vpn':
            details = getVpnRiskDetails(riskCategory);
            break;
        case 'cookies':
            details = getCookiesRiskDetails(riskCategory);
            break;
        case 'ip':
            details = getIpRiskDetails(riskCategory);
            break;
        case 'data':
            details = getDataRiskDetails(riskCategory);
            break;
        default:
            details = `<p>No detailed information available for ${category}.</p>`;
    }
    
    modalContent.innerHTML = `
        <div class="text-center mb-4">
            <div class="display-4 ${riskCategory === 'High' ? 'text-danger' : riskCategory === 'Medium' ? 'text-warning' : 'text-success'}">
                ${riskLevel}%
            </div>
            <div class="h5 ${riskCategory === 'High' ? 'text-danger' : riskCategory === 'Medium' ? 'text-warning' : 'text-success'}">
                ${riskCategory} Risk
            </div>
        </div>
        ${details}
    `;
    
    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Get detailed content for browser risk
 */
function getBrowserRiskDetails(riskCategory) {
    if (riskCategory === 'High') {
        return `
            <p>Your browser configuration has major privacy issues:</p>
            <ul>
                <li>You're using a browser with weak privacy protections</li>
                <li>Privacy extensions are missing or insufficient</li>
                <li>Your browser is vulnerable to fingerprinting</li>
                <li>WebRTC might be leaking your local IP address</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Consider switching to Firefox or Tor Browser with privacy extensions installed.</p>
        `;
    } else if (riskCategory === 'Medium') {
        return `
            <p>Your browser has some privacy vulnerabilities:</p>
            <ul>
                <li>Some fingerprinting protections are missing</li>
                <li>Additional privacy extensions might be needed</li>
                <li>Browser settings could be optimized for better privacy</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Enable Enhanced Tracking Protection in your browser settings and install privacy extensions.</p>
        `;
    } else {
        return `
            <p>Your browser configuration has good privacy protection:</p>
            <ul>
                <li>You're using a privacy-focused browser</li>
                <li>Fingerprinting protection is active</li>
                <li>Privacy extensions are detected</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Keep your browser and extensions updated regularly for continued protection.</p>
        `;
    }
}

/**
 * Get detailed content for network risk
 */
function getNetworkRiskDetails(riskCategory) {
    if (riskCategory === 'High') {
        return `
            <p>Your network connection has significant privacy risks:</p>
            <ul>
                <li>DNS leaks detected which can expose your browsing activity</li>
                <li>Insecure or unencrypted connections possible</li>
                <li>Network traffic may be monitored by your ISP</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Use encrypted DNS (DNS-over-HTTPS) and a VPN service.</p>
        `;
    } else if (riskCategory === 'Medium') {
        return `
            <p>Your network has some privacy concerns:</p>
            <ul>
                <li>Some traffic might not be fully protected</li>
                <li>Network configuration could be improved</li>
                <li>DNS settings may need updating</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Configure your device to use secure DNS servers and ensure network encryption.</p>
        `;
    } else {
        return `
            <p>Your network connection appears to be secure:</p>
            <ul>
                <li>No DNS leaks detected</li>
                <li>Network traffic is likely encrypted</li>
                <li>Connection security is good</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Continue using secure network practices and consider a VPN for additional protection.</p>
        `;
    }
}

/**
 * Get detailed content for VPN risk
 */
function getVpnRiskDetails(riskCategory) {
    if (riskCategory === 'High') {
        return `
            <p>Your VPN protection has critical weaknesses:</p>
            <ul>
                <li>No VPN detected - your real IP address is exposed</li>
                <li>Your Internet Service Provider can see all your activity</li>
                <li>Websites can easily track your location and identity</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Use a reputable VPN service to mask your IP address and encrypt your traffic.</p>
        `;
    } else if (riskCategory === 'Medium') {
        return `
            <p>Your VPN protection could be improved:</p>
            <ul>
                <li>VPN may be active but has configuration issues</li>
                <li>Potential leaks in your VPN connection</li>
                <li>VPN might not be protecting all traffic</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Check your VPN settings and enable kill switch features.</p>
        `;
    } else {
        return `
            <p>Your VPN protection looks good:</p>
            <ul>
                <li>VPN service detected and working properly</li>
                <li>Your real IP address is masked</li>
                <li>Traffic appears to be encrypted</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Continue using your VPN service for online activities.</p>
        `;
    }
}

/**
 * Get detailed content for cookies risk
 */
function getCookiesRiskDetails(riskCategory) {
    if (riskCategory === 'High') {
        return `
            <p>Your cookie settings have major privacy issues:</p>
            <ul>
                <li>Many tracking cookies detected (advertising/analytics)</li>
                <li>Third-party cookies are enabled</li>
                <li>Cookie-based tracking is active</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Clear cookies regularly, disable third-party cookies, and use cookie-blocking extensions.</p>
        `;
    } else if (riskCategory === 'Medium') {
        return `
            <p>Your cookie settings need some improvement:</p>
            <ul>
                <li>Some tracking cookies detected</li>
                <li>Cookie settings could be more restrictive</li>
                <li>Some tracking may be occurring</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Review browser cookie settings and consider using a cookie management extension.</p>
        `;
    } else {
        return `
            <p>Your cookie settings provide good privacy:</p>
            <ul>
                <li>Few or no tracking cookies detected</li>
                <li>Third-party cookies appear to be blocked</li>
                <li>Cookie-based tracking is limited</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Continue monitoring and clearing cookies periodically.</p>
        `;
    }
}

/**
 * Get detailed content for IP risk
 */
function getIpRiskDetails(riskCategory) {
    if (riskCategory === 'High') {
        return `
            <p>Your IP address has high exposure risk:</p>
            <ul>
                <li>Your real IP address is visible to websites</li>
                <li>WebRTC leaks may be exposing your local IP</li>
                <li>Your location can be accurately determined</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Use a VPN and disable WebRTC in your browser or use a WebRTC-blocking extension.</p>
        `;
    } else if (riskCategory === 'Medium') {
        return `
            <p>Your IP protection has some weaknesses:</p>
            <ul>
                <li>Some IP information may be leaking</li>
                <li>Partial geographic location exposure</li>
                <li>Potential for tracking through IP</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Check for WebRTC leaks and consider a VPN service.</p>
        `;
    } else {
        return `
            <p>Your IP address appears to be well-protected:</p>
            <ul>
                <li>Real IP address is likely masked</li>
                <li>No obvious WebRTC leaks</li>
                <li>Location data is obscured</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Continue using IP masking tools and services.</p>
        `;
    }
}

/**
 * Get detailed content for data risk
 */
function getDataRiskDetails(riskCategory) {
    if (riskCategory === 'High') {
        return `
            <p>Your data protection has serious vulnerabilities:</p>
            <ul>
                <li>Email or personal data found in breaches</li>
                <li>Weak password detection</li>
                <li>Data may be exposed in multiple ways</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Change passwords, use a password manager, and check for data breaches regularly.</p>
        `;
    } else if (riskCategory === 'Medium') {
        return `
            <p>Your data protection needs improvement:</p>
            <ul>
                <li>Some personal data may be at risk</li>
                <li>Password strength could be improved</li>
                <li>Limited data exposure detected</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Strengthen passwords and review accounts for potential data breaches.</p>
        `;
    } else {
        return `
            <p>Your data appears to be well-protected:</p>
            <ul>
                <li>No obvious data breaches detected</li>
                <li>Good password practices observed</li>
                <li>Personal data exposure is minimal</li>
            </ul>
            <p class="mt-3"><strong>Recommendation:</strong> Continue using strong passwords and monitor for data breaches.</p>
        `;
    }
}

/**
 * Elastic out easing function for animations
 * @param {number} x - The progress value (0-1)
 * @returns {number} The eased progress value
 */
function elasticOut(x) {
    const c4 = (2 * Math.PI) / 3;
    
    if (x === 0 || x === 1) {
        return x;
    }
    
    // Original elastic effect: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
    // Make sure the result is never negative by using Math.max(0, ...)
    return Math.max(0, Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1);
}

/**
 * Initialize Bootstrap tooltips for the penalty items
 */
function initializeTooltips() {
    // Initialize all elements with data-bs-toggle="tooltip" attribute
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0) {
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
            html: true,
            // Add a custom class for styling if needed
            customClass: 'privacy-tooltip',
            // Make tooltips a bit wider to accommodate more text
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="max-width: 250px;"></div></div>'
        }));
    }
}