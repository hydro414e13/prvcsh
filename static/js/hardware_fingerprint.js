/**
 * Hardware Fingerprinting Detection Script
 * Checks for CPU, GPU, and other hardware-related fingerprinting vectors
 */
class HardwareFingerprintDetector {
    constructor() {
        this.results = {
            tested: false,
            hardwareConcurrency: null,
            deviceMemory: null,
            cpuCores: null,
            gpuInfo: null,
            audioFeatures: {},
            errorMessage: null
        };
    }

    /**
     * Detect hardware fingerprinting vectors
     * @returns {Object} Results of the hardware fingerprinting detection
     */
    async detectHardwareFingerprinting() {
        try {
            this.results.tested = true;
            
            // CPU cores detection
            if ('hardwareConcurrency' in navigator) {
                this.results.hardwareConcurrency = navigator.hardwareConcurrency;
                this.results.cpuCores = navigator.hardwareConcurrency;
            }
            
            // Device memory detection
            if ('deviceMemory' in navigator) {
                this.results.deviceMemory = navigator.deviceMemory;
            }
            
            // GPU detection via WebGL
            this.results.gpuInfo = await this.getGPUInfo();
            
            return this.results;
            
        } catch (error) {
            console.error('Hardware fingerprinting detection error:', error);
            this.results.errorMessage = error.message;
            return this.results;
        }
    }
    
    /**
     * Get GPU information using WebGL
     * @returns {Object} GPU details
     */
    async getGPUInfo() {
        let gpu = {
            vendor: 'Not available',
            renderer: 'Not available',
            webglVersion: 'Not available'
        };
        
        try {
            // Try WebGL1
            const canvas = document.createElement('canvas');
            let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                // Try WebGL2
                gl = canvas.getContext('webgl2');
            }
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                
                if (debugInfo) {
                    gpu.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Not available';
                    gpu.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Not available';
                }
                
                // Detect WebGL version
                if (gl instanceof WebGLRenderingContext) {
                    gpu.webglVersion = '1.0';
                } else if (gl instanceof WebGL2RenderingContext) {
                    gpu.webglVersion = '2.0';
                }
                
                // Check for WebGL extensions as fingerprinting vector
                gpu.extensions = Array.from(gl.getSupportedExtensions() || []);
                
                // Get some general WebGL capabilities as fingerprinting vectors
                gpu.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                gpu.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
                gpu.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
                gpu.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
                gpu.aliasedLineWidthRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
                gpu.aliasedPointSizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
                gpu.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
                
                // Generate a fingerprint hash from GPU characteristics
                const gpuString = JSON.stringify({
                    vendor: gpu.vendor,
                    renderer: gpu.renderer,
                    maxTexSize: gpu.maxTextureSize,
                    extensions: gpu.extensions.slice(0, 10).join(',')
                });
                
                gpu.fingerprint = this.simpleHash(gpuString);
            }
        } catch (error) {
            console.warn('Error getting GPU info:', error);
        }
        
        return gpu;
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