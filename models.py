from datetime import datetime, timedelta
from app import db
from sqlalchemy import func

class ScanResult(db.Model):
    """Model to store privacy scan results"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False, index=True)
    
    # IP and location info
    ip_address = db.Column(db.String(45), nullable=False)  # IPv6 support
    ip_version = db.Column(db.String(10))  # IPv4 or IPv6
    country = db.Column(db.String(64))
    region = db.Column(db.String(64))
    city = db.Column(db.String(64))
    timezone = db.Column(db.String(64))
    isp = db.Column(db.String(128))
    asn = db.Column(db.String(64))
    
    # VPN/Proxy detection
    is_vpn = db.Column(db.Boolean, default=False)
    is_proxy = db.Column(db.Boolean, default=False)
    is_tor = db.Column(db.Boolean, default=False)
    proxy_type = db.Column(db.String(64))
    
    # WebRTC leak results
    webrtc_local_ip = db.Column(db.String(45))
    has_webrtc_leak = db.Column(db.Boolean, default=False)
    
    # DNS leak results
    has_dns_leak = db.Column(db.Boolean, default=False)
    dns_servers = db.Column(db.Text)  # Stored as JSON
    
    # Fingerprint data (stored as JSON strings)
    user_agent = db.Column(db.String(512))
    browser_info = db.Column(db.String(128))
    os_info = db.Column(db.String(128))
    screen_resolution = db.Column(db.String(32))
    timezone_offset = db.Column(db.String(32))
    language = db.Column(db.String(16))
    
    # Headers
    headers_json = db.Column(db.Text)  # Stored as JSON
    
    # Email leak check
    email_check_performed = db.Column(db.Boolean, default=False)
    email_leaked = db.Column(db.Boolean, default=False)
    email_leak_sources = db.Column(db.Text)  # Stored as JSON list of sites
    
    # Cookie tracking
    cookie_tracking_tested = db.Column(db.Boolean, default=False)
    tracking_cookies_found = db.Column(db.Boolean, default=False)
    cookie_count = db.Column(db.Integer, default=0)
    tracking_cookies = db.Column(db.Text)  # Stored as JSON
    third_party_cookies_enabled = db.Column(db.Boolean, default=False)
    
    # Canvas fingerprinting
    canvas_tested = db.Column(db.Boolean, default=False)
    canvas_fingerprintable = db.Column(db.Boolean, default=False)
    canvas_uniqueness_score = db.Column(db.Integer, default=0)
    canvas_protection_active = db.Column(db.Boolean, default=False)
    canvas_fingerprint = db.Column(db.String(64))
    
    # Browser permissions
    permissions_tested = db.Column(db.Boolean, default=False)
    permissions_supported = db.Column(db.Boolean, default=False)
    permission_data = db.Column(db.Text)  # Stored as JSON
    sensitive_features_enabled = db.Column(db.Boolean, default=False)
    
    # NEW: SSL/TLS security check
    ssl_security_tested = db.Column(db.Boolean, default=False)
    ssl_version = db.Column(db.String(16))
    ssl_cipher = db.Column(db.String(64))
    ssl_secure = db.Column(db.Boolean, default=False)
    
    # NEW: Password check
    password_check_performed = db.Column(db.Boolean, default=False)
    password_strength_score = db.Column(db.Integer, default=0)  # 0-100
    password_feedback = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Browser extension detection
    extension_detection_tested = db.Column(db.Boolean, default=False)
    privacy_extensions_detected = db.Column(db.Boolean, default=False)
    detected_extensions = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Advanced fingerprinting detection
    hardware_fingerprinting_tested = db.Column(db.Boolean, default=False)
    cpu_cores = db.Column(db.Integer)
    gpu_info = db.Column(db.String(256))
    hardware_concurrency = db.Column(db.Integer)
    device_memory = db.Column(db.Float)
    
    # NEW: Battery API fingerprinting
    battery_api_tested = db.Column(db.Boolean, default=False)
    battery_api_available = db.Column(db.Boolean, default=False)
    battery_level = db.Column(db.Float)
    battery_charging = db.Column(db.Boolean, default=False)
    
    # NEW: Audio fingerprinting
    audio_fingerprinting_tested = db.Column(db.Boolean, default=False)
    audio_fingerprintable = db.Column(db.Boolean, default=False)
    audio_fingerprint = db.Column(db.String(64))
    
    # NEW: Font fingerprinting
    font_fingerprinting_tested = db.Column(db.Boolean, default=False)
    unique_fonts_detected = db.Column(db.Integer, default=0)
    font_fingerprint = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Security headers check
    security_headers_tested = db.Column(db.Boolean, default=False)
    security_headers_score = db.Column(db.Integer, default=0)  # 0-100
    security_headers = db.Column(db.Text)  # Stored as JSON
    missing_security_headers = db.Column(db.Text)  # Stored as JSON
    
    # NEW: WebSocket leak detection
    websocket_leak_tested = db.Column(db.Boolean, default=False)
    websocket_leak_detected = db.Column(db.Boolean, default=False)
    websocket_supported = db.Column(db.Boolean, default=False)
    websocket_bypasses_proxy = db.Column(db.Boolean, default=False)
    
    # NEW: CNAME cloaking detection
    cname_cloaking_tested = db.Column(db.Boolean, default=False)
    cname_cloaking_detected = db.Column(db.Boolean, default=False)
    suspicious_subdomains = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Fingerprint entropy calculation
    fingerprint_entropy_tested = db.Column(db.Boolean, default=False)
    fingerprint_entropy_score = db.Column(db.Float)  # Total entropy bits
    fingerprint_uniqueness_score = db.Column(db.Integer)  # 0-100
    fingerprint_components = db.Column(db.Text)  # Stored as JSON
    
    # NEW: XSS vulnerability check
    xss_vulnerability_tested = db.Column(db.Boolean, default=False)
    xss_vulnerability_detected = db.Column(db.Boolean, default=False)
    xss_vulnerabilities = db.Column(db.Text)  # Stored as JSON
    xss_risk_level = db.Column(db.String(16))  # Low, Medium, High
    
    # NEW: HTTP/3 and QUIC support check
    http3_support_tested = db.Column(db.Boolean, default=False)
    http3_supported = db.Column(db.Boolean, default=False)
    quic_supported = db.Column(db.Boolean, default=False)
    http2_supported = db.Column(db.Boolean, default=False)
    connection_protocol = db.Column(db.String(16))  # HTTP/1.1, HTTP/2, HTTP/3
    transport_security = db.Column(db.String(16))  # TLS version
    protocol_performance_score = db.Column(db.Integer)  # 0-100
    
    # NEW: Timezone consistency check
    timezone_consistency_tested = db.Column(db.Boolean, default=False)
    timezone_consistent = db.Column(db.Boolean, default=True)
    reported_timezone = db.Column(db.String(64))
    detected_timezone = db.Column(db.String(64))
    timezone_offset_consistent = db.Column(db.Boolean, default=True)
    reported_offset = db.Column(db.Integer)
    calculated_offset = db.Column(db.Integer)
    dst_status = db.Column(db.String(16))  # "active", "inactive", "not-used"
    timezone_confidence = db.Column(db.Integer)  # 0-100
    timezone_discrepancies = db.Column(db.Text)  # Stored as JSON
    
    # NEW: User Authenticity check
    authenticity_tested = db.Column(db.Boolean, default=False)
    authentic_appearance = db.Column(db.Boolean, default=True)
    authenticity_score = db.Column(db.Integer)  # 0-100
    bot_detection_risk = db.Column(db.String(16))  # "Low", "Medium", "High"
    suspicious_factors = db.Column(db.Text)  # Stored as JSON
    authenticity_factors = db.Column(db.Text)  # Stored as JSON
    authenticity_recommendations = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Behavioral Analysis
    behavioral_analysis_tested = db.Column(db.Boolean, default=False)
    natural_behavior = db.Column(db.Boolean, default=True)
    behavior_score = db.Column(db.Integer)  # 0-100
    suspicious_patterns = db.Column(db.Text)  # Stored as JSON
    natural_patterns = db.Column(db.Text)  # Stored as JSON
    interaction_metrics = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Anti-Bot Detection Analysis
    antibot_detection_tested = db.Column(db.Boolean, default=False)
    passes_basic_bot_checks = db.Column(db.Boolean, default=True)
    passes_advanced_bot_checks = db.Column(db.Boolean, default=True)
    detection_risk_score = db.Column(db.Integer)  # 0-100
    triggered_detections = db.Column(db.Text)  # Stored as JSON
    passed_detections = db.Column(db.Text)  # Stored as JSON
    vulnerable_services = db.Column(db.Text)  # Stored as JSON
    detection_evasion_advice = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Privacy Extensions Analysis
    extensions_analysis_tested = db.Column(db.Boolean, default=False)
    extensions_detected = db.Column(db.Text)  # Stored as JSON
    possible_extensions = db.Column(db.Text)  # Stored as JSON
    extension_privacy_impact = db.Column(db.Integer)  # 0-100
    extension_authenticity_impact = db.Column(db.Integer)  # 0-100
    extension_compatibility_impact = db.Column(db.Integer)  # 0-100
    extension_recommendations = db.Column(db.Text)  # Stored as JSON
    
    # NEW: Do Not Track Check
    do_not_track_tested = db.Column(db.Boolean, default=False)
    do_not_track_enabled = db.Column(db.Boolean, default=False)
    
    # NEW: DNS Server Location
    dns_country_tested = db.Column(db.Boolean, default=False)
    dns_country_different = db.Column(db.Boolean, default=False) 
    dns_country = db.Column(db.String(64))
    
    # NEW: Language vs Location
    language_location_tested = db.Column(db.Boolean, default=False)
    language_location_different = db.Column(db.Boolean, default=False)
    system_language = db.Column(db.String(16))
    browser_language = db.Column(db.String(16))
    
    # Risk assessment
    anonymity_score = db.Column(db.Integer)  # 0-100
    risk_level = db.Column(db.String(16))  # Low, Medium, High
    score_factors = db.Column(db.Text)  # Stored as JSON with penalties and bonuses
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ScanResult {self.id} - IP: {self.ip_address} - Score: {self.anonymity_score}>'

    @classmethod
    def cleanup_old_results(cls, days=30, max_results_per_session=10):
        """
        Clean up old scan results to prevent database from growing too large
        
        Args:
            days: Number of days to keep results (older results will be deleted)
            max_results_per_session: Maximum number of results to keep per session
            
        Returns:
            tuple: (old_deleted_count, excess_deleted_count)
        """
        from app import db, app
        
        # Calculate cutoff date
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        try:
            # Delete results older than the cutoff date
            old_deleted = cls.query.filter(cls.created_at < cutoff_date).delete()
            db.session.commit()
            
            # For each session, keep only the most recent max_results_per_session results
            sessions = db.session.query(cls.session_id.distinct()).all()
            excess_deleted = 0
            
            for session in sessions:
                session_id = session[0]
                # Get IDs of all but the most recent max_results_per_session results
                subquery = db.session.query(cls.id).filter(
                    cls.session_id == session_id
                ).order_by(
                    cls.created_at.desc()
                ).offset(max_results_per_session).all()
                
                if subquery:
                    # Extract IDs to delete
                    ids_to_delete = [record[0] for record in subquery]
                    # Delete excess results
                    deleted = cls.query.filter(cls.id.in_(ids_to_delete)).delete(synchronize_session='fetch')
                    excess_deleted += deleted
            
            db.session.commit()
            app.logger.info(f"Cleaned up database: {old_deleted} old results and {excess_deleted} excess results deleted")
            return (old_deleted, excess_deleted)
            
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error cleaning up database: {str(e)}")
            return (0, 0)
    
    @classmethod
    def get_database_stats(cls):
        """
        Get database statistics
        
        Returns:
            dict: Database statistics
        """
        from app import db, app
        
        try:
            # Total number of results
            total_count = db.session.query(func.count(cls.id)).scalar()
            
            # Number of results per session
            session_counts = db.session.query(
                cls.session_id, 
                func.count(cls.id).label('count')
            ).group_by(cls.session_id).all()
            
            # Total database size (approximate)
            total_size = db.session.query(func.count(cls.id) * 50).scalar()  # ~50KB per record
            
            # Oldest and newest result
            oldest = db.session.query(func.min(cls.created_at)).scalar()
            newest = db.session.query(func.max(cls.created_at)).scalar()
            
            return {
                'total_count': total_count,
                'session_count': len(session_counts),
                'avg_results_per_session': total_count / len(session_counts) if session_counts else 0,
                'max_results_per_session': max([c[1] for c in session_counts]) if session_counts else 0,
                'total_size_kb': total_size,
                'oldest_result': oldest,
                'newest_result': newest,
            }
            
        except Exception as e:
            app.logger.error(f"Error getting database stats: {str(e)}")
            return {
                'error': str(e)
            }
