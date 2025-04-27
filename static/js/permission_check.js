/**
 * Browser Permission Check Script
 * Analyzes browser permissions that could impact privacy
 */
class PermissionChecker {
    constructor() {
        // List of permissions to check
        this.permissionsToCheck = [
            'geolocation',
            'notifications',
            'microphone',
            'camera',
            'persistent-storage',
            'midi',
            'clipboard-read',
            'clipboard-write',
            'background-sync',
            'screen-wake-lock',
            'accelerometer',
            'gyroscope',
            'magnetometer'
        ];
        
        // List of sensitive features
        this.featuresSupported = {
            bluetooth: 'bluetooth' in navigator,
            usb: 'usb' in navigator,
            serial: 'serial' in navigator,
            nfc: 'nfc' in navigator,
            sensors: 'Sensor' in window,
            payment: 'PaymentRequest' in window,
            vr: 'xr' in navigator,
            gamepad: 'getGamepads' in navigator,
            mediaDevices: 'mediaDevices' in navigator,
            serviceWorker: 'serviceWorker' in navigator
        };
    }

    /**
     * Check browser permissions status
     * @returns {Object} Results of the permissions check
     */
    async checkPermissions() {
        // Check if Permissions API is supported
        if (!('permissions' in navigator)) {
            return {
                tested: true,
                permissionsSupported: false,
                permissions: {},
                features: this.featuresSupported,
                autoplay: await this.checkAutoplayStatus()
            };
        }

        try {
            // Check each permission
            const permissionStatuses = {};
            for (const permission of this.permissionsToCheck) {
                try {
                    // Some permissions have different syntax or special cases
                    if (permission === 'microphone') {
                        permissionStatuses['microphone'] = await this.getMediaPermissionStatus({ audio: true });
                    } else if (permission === 'camera') {
                        permissionStatuses['camera'] = await this.getMediaPermissionStatus({ video: true });
                    } else {
                        permissionStatuses[permission] = await this.getPermissionStatus(permission);
                    }
                } catch (error) {
                    console.warn(`Error checking permission ${permission}:`, error);
                    permissionStatuses[permission] = 'error';
                }
            }
            
            // Check autoplay status
            const autoplayEnabled = await this.checkAutoplayStatus();
            
            // Check if any sensitive features are enabled
            const sensitiveEnabled = Object.values(this.featuresSupported).some(v => v === true);

            return {
                tested: true,
                permissionsSupported: true,
                permissions: permissionStatuses,
                features: this.featuresSupported,
                autoplay: autoplayEnabled,
                sensitiveEnabled: sensitiveEnabled
            };
        } catch (error) {
            console.error('Permission check error:', error);
            return {
                tested: true,
                permissionsSupported: false,
                error: error.message,
                features: this.featuresSupported,
                autoplay: await this.checkAutoplayStatus()
            };
        }
    }

    /**
     * Get the status of a specific permission
     * @param {string} permissionName - Name of the permission to check
     * @returns {Promise<string>} Permission status
     */
    async getPermissionStatus(permissionName) {
        try {
            // Some permissions need a special descriptor object
            let descriptor;
            
            switch (permissionName) {
                case 'midi':
                    descriptor = { name: permissionName, sysex: true };
                    break;
                case 'accelerometer':
                case 'gyroscope':
                case 'magnetometer':
                    descriptor = { name: permissionName };
                    break;
                default:
                    descriptor = { name: permissionName };
            }
            
            const status = await navigator.permissions.query(descriptor);
            return status.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.warn(`Permission ${permissionName} check failed:`, error);
            return 'unsupported';
        }
    }

    /**
     * Check media permissions (camera/microphone)
     * @param {Object} constraints - Media constraints to check
     * @returns {Promise<string>} Permission status
     */
    async getMediaPermissionStatus(constraints) {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return 'unsupported';
            }
            
            // We try to get the media and see if it succeeds
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Clean up: stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            return 'granted';
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                return 'denied';
            } else if (error.name === 'NotFoundError') {
                return 'unavailable'; // Hardware not available
            } else {
                return 'prompt'; // If we're not sure, assume prompt
            }
        }
    }

    /**
     * Check if autoplay is allowed for video
     * @returns {Promise<boolean>} Whether autoplay is allowed
     */
    async checkAutoplayStatus() {
        try {
            // Create a video element
            const video = document.createElement('video');
            video.style.width = '0';
            video.style.height = '0';
            video.style.position = 'absolute';
            video.style.opacity = '0';
            
            // Set up silent content
            video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc28yAAAAAG1wNDFhdmMxAAAIA21vb3YAAABsbXZoZAAAAADHOZ6jxzmeo'; // Tiny silent mp4
            
            // Append to document temporarily
            document.body.appendChild(video);
            
            // Try to play
            let autoplayAllowed = false;
            try {
                await video.play();
                autoplayAllowed = true;
            } catch (error) {
                autoplayAllowed = false;
            }
            
            // Clean up
            document.body.removeChild(video);
            
            return autoplayAllowed;
        } catch (error) {
            console.warn('Autoplay check error:', error);
            return false;
        }
    }
}