import json
import uuid
import requests
from datetime import datetime
from flask import render_template, request, jsonify, session, redirect, url_for, send_from_directory
import os
from app import app, db
from models import ScanResult
from utils import (
    get_ip_info, 
    detect_vpn_proxy, 
    calculate_anonymity_score,
    calculate_legitimacy_score,
    get_risk_level,
    check_webrtc_leak,
    check_dns_leak,
    check_email_leak,
    check_cookie_tracking,
    check_canvas_fingerprinting,
    check_browser_permissions,
    parse_fingerprint_data,
    # New check functions
    check_ssl_security,
    check_password_strength,
    check_extension_detection,
    check_hardware_fingerprinting,
    check_battery_fingerprinting,
    check_audio_fingerprinting,
    check_font_fingerprinting,
    check_security_headers,
    check_user_authenticity,
    analyze_behavioral_patterns,
    analyze_antibot_detection,
    analyze_privacy_extensions,
    # New additional checks
    check_do_not_track,
    check_dns_country,
    check_language_location,
    # New legitimacy score
    calculate_legitimacy_score,
    # New recommendation generator
    generate_privacy_recommendations
)

@app.route('/')
def index():
    """Main page of the privacy detection website"""
    # Create a session ID if one doesn't exist
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    return render_template('index.html')

@app.route('/extensions')
def extensions():
    """Browser extension compatibility checker page"""
    # Create a session ID if one doesn't exist
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    return render_template('extensions.html')

@app.route('/api/check-email', methods=['POST'])
def check_email_breach():
    """API endpoint to check if an email has been in data breaches"""
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Email is required'
            }), 400
            
        email = data['email']
        
        # Create email data structure with the email included
        email_data = {
            'tested': True,
            'email': email
        }
        
        # Perform the server-side check
        from utils import check_email_against_breach_db
        leaked, breach_sites = check_email_against_breach_db(email)
        
        # Return the results
        return jsonify({
            'status': 'success',
            'result': {
                'leaked': leaked,
                'breach_sites': breach_sites
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/scan', methods=['POST'])
def scan():
    """Process the scan request and collect initial data"""
    # Get IP data from request
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if ',' in client_ip:  # Handle multiple proxies
        client_ip = client_ip.split(',')[0].strip()
    
    # Get client headers
    headers = {k: v for k, v in request.headers.items()}
    headers_json = json.dumps(headers)
    
    # Get the session ID or create one
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    # Create scan session and store basic info
    try:
        # Get IP information
        ip_info = get_ip_info(client_ip)
        
        # Check if using VPN/proxy
        vpn_proxy_info = detect_vpn_proxy(client_ip, headers)
        
        # Process and save fingerprint data from the request
        fingerprint_data = json.loads(request.form.get('fingerprint', '{}'))
        processed_fingerprint = parse_fingerprint_data(fingerprint_data)
        
        # WebRTC leak information
        webrtc_data = json.loads(request.form.get('webrtc', '{}'))
        webrtc_leak = check_webrtc_leak(webrtc_data, client_ip)
        
        # DNS leak information
        dns_data = json.loads(request.form.get('dns', '{}'))
        dns_leak = check_dns_leak(dns_data)
        
        # Email leak information
        email_data = json.loads(request.form.get('email', '{}'))
        email_leak = check_email_leak(email_data)
        
        # Cookie tracking information
        cookie_data = json.loads(request.form.get('cookies', '{}'))
        cookie_tracking = check_cookie_tracking(cookie_data)
        
        # Canvas fingerprinting information
        canvas_data = json.loads(request.form.get('canvas', '{}'))
        canvas_fingerprinting = check_canvas_fingerprinting(canvas_data)
        
        # Browser permissions information
        permission_data = json.loads(request.form.get('permissions', '{}'))
        permissions = check_browser_permissions(permission_data)
        
        # Process new checks data
        ssl_data = json.loads(request.form.get('ssl', '{}'))
        ssl_security = check_ssl_security(ssl_data)
        
        password_data = json.loads(request.form.get('password', '{}'))
        password_strength = check_password_strength(password_data)
        
        # Process user authenticity data
        authenticity_data = json.loads(request.form.get('authenticity', '{}'))
        user_authenticity = check_user_authenticity(authenticity_data)
        
        # Process behavioral analysis data
        behavior_data = json.loads(request.form.get('behavior', '{}'))
        behavior_analysis = analyze_behavioral_patterns(behavior_data)
        
        # Process anti-bot detection data
        antibot_data = json.loads(request.form.get('antibot', '{}'))
        antibot_detection = analyze_antibot_detection(antibot_data)
        
        # Process privacy extensions data
        extensions_data = json.loads(request.form.get('privacy_extensions', '{}'))
        privacy_extensions = analyze_privacy_extensions(extensions_data)
        
        extension_data = json.loads(request.form.get('extensions', '{}'))
        extension_detection = check_extension_detection(extension_data)
        
        hardware_data = json.loads(request.form.get('hardware', '{}'))
        hardware_fingerprinting = check_hardware_fingerprinting(hardware_data)
        
        battery_data = json.loads(request.form.get('battery', '{}'))
        battery_fingerprinting = check_battery_fingerprinting(battery_data)
        
        audio_data = json.loads(request.form.get('audio', '{}'))
        audio_fingerprinting = check_audio_fingerprinting(audio_data)
        
        font_data = json.loads(request.form.get('fonts', '{}'))
        font_fingerprinting = check_font_fingerprinting(font_data)
        
        headers_data = json.loads(request.form.get('securityHeaders', '{}'))
        security_headers = check_security_headers(headers_data)
        
        # Process new additional checks
        dnt_data = json.loads(request.form.get('do_not_track', '{}'))
        do_not_track = check_do_not_track(dnt_data)
        
        dns_country_data = json.loads(request.form.get('dns', '{}'))
        dns_country_check = check_dns_country(dns_country_data, ip_info.get('country_code', 'Unknown'))
        
        language_data = json.loads(request.form.get('language', '{}'))
        language_location_check = check_language_location(language_data, ip_info.get('country_code', 'Unknown'))
        
        # Process enhanced privacy features data
        enhanced_privacy_data = json.loads(request.form.get('enhanced_privacy', '{}'))
        app.logger.debug(f"Enhanced Privacy Data: {enhanced_privacy_data}")
        
        # Calculate anonymity score and risk level with all checks
        score_result = calculate_anonymity_score(
            ip_info, 
            vpn_proxy_info,
            webrtc_leak,
            dns_leak,
            email_leak,
            processed_fingerprint,
            headers,
            cookie_tracking,
            canvas_fingerprinting,
            permissions,
            ssl_security,
            password_strength,
            extension_detection,
            hardware_fingerprinting,
            battery_fingerprinting,
            audio_fingerprinting,
            font_fingerprinting,
            security_headers,
            user_authenticity,
            behavior_analysis,
            antibot_detection,
            privacy_extensions,
            do_not_track,
            dns_country_check,
            language_location_check
        )
        
        # Extract the actual score and factors that affected it
        anonymity_score = score_result['score']
        score_factors = {
            'penalties': score_result['penalties'],
            'bonuses': score_result['bonuses']
        }
        
        # Store score factors as JSON for display in results
        score_factors_json = json.dumps(score_factors)
        
        # Get risk level based on score
        risk_level = get_risk_level(anonymity_score)
        
        # Create and save the scan result
        scan_result = ScanResult(
            session_id=session['session_id'],
            ip_address=client_ip,
            ip_version=ip_info.get('version', 'Unknown'),
            country=ip_info.get('country', 'Unknown'),
            region=ip_info.get('region', 'Unknown'),
            city=ip_info.get('city', 'Unknown'),
            timezone=ip_info.get('timezone', 'Unknown'),
            isp=ip_info.get('isp', 'Unknown'),
            asn=ip_info.get('asn', 'Unknown'),
            is_vpn=vpn_proxy_info.get('is_vpn', False),
            is_proxy=vpn_proxy_info.get('is_proxy', False),
            is_tor=vpn_proxy_info.get('is_tor', False),
            proxy_type=vpn_proxy_info.get('proxy_type', 'None'),
            webrtc_local_ip=webrtc_data.get('local_ip', 'Not detected'),
            has_webrtc_leak=webrtc_leak.get('has_leak', False),
            has_dns_leak=dns_leak.get('has_leak', False),
            dns_servers=json.dumps(dns_leak.get('dns_servers', [])),
            email_check_performed=email_leak.get('performed', False),
            email_leaked=email_leak.get('leaked', False),
            email_leak_sources=json.dumps(email_leak.get('breach_sites', [])),
            
            # Cookie tracking data
            cookie_tracking_tested=cookie_tracking.get('tested', False),
            tracking_cookies_found=cookie_tracking.get('tracking_cookies_found', False),
            cookie_count=cookie_tracking.get('cookie_count', 0),
            tracking_cookies=json.dumps(cookie_tracking.get('tracking_cookies', [])),
            third_party_cookies_enabled=cookie_tracking.get('third_party_enabled', False),
            
            # Canvas fingerprinting data
            canvas_tested=canvas_fingerprinting.get('tested', False),
            canvas_fingerprintable=canvas_fingerprinting.get('fingerprintable', False),
            canvas_uniqueness_score=canvas_fingerprinting.get('uniqueness_score', 0),
            canvas_protection_active=canvas_fingerprinting.get('protection_active', False),
            canvas_fingerprint=canvas_fingerprinting.get('canvas_fingerprint', ''),
            
            # Browser permissions data
            permissions_tested=permissions.get('tested', False),
            permissions_supported=permissions.get('permissions_supported', False),
            permission_data=json.dumps(permissions.get('permissions', {})),
            sensitive_features_enabled=any(permissions.get('features', {}).values()),
            
            # SSL/TLS security data
            ssl_security_tested=ssl_security.get('tested', False),
            ssl_version=ssl_security.get('version', 'Unknown'),
            ssl_cipher=ssl_security.get('cipher', 'Unknown'),
            ssl_secure=ssl_security.get('secure', False),
            
            # Password strength data
            password_check_performed=password_strength.get('performed', False),
            password_strength_score=password_strength.get('score', 0),
            password_feedback=json.dumps(password_strength.get('feedback', {})),
            
            # Browser extension data
            extension_detection_tested=extension_detection.get('tested', False),
            privacy_extensions_detected=extension_detection.get('privacy_extensions_detected', False),
            detected_extensions=json.dumps(extension_detection.get('detected_extensions', [])),
            
            # Hardware fingerprinting data
            hardware_fingerprinting_tested=hardware_fingerprinting.get('tested', False),
            cpu_cores=hardware_fingerprinting.get('cpu_cores'),
            gpu_info=str(hardware_fingerprinting.get('gpu_info', {}))[:255],  # Truncate if needed
            hardware_concurrency=hardware_fingerprinting.get('hardware_concurrency'),
            device_memory=hardware_fingerprinting.get('device_memory'),
            
            # Battery API fingerprinting
            battery_api_tested=battery_fingerprinting.get('tested', False),
            battery_api_available=battery_fingerprinting.get('api_available', False),
            battery_level=battery_fingerprinting.get('battery_level'),
            battery_charging=battery_fingerprinting.get('battery_charging', False),
            
            # Audio fingerprinting
            audio_fingerprinting_tested=audio_fingerprinting.get('tested', False),
            audio_fingerprintable=audio_fingerprinting.get('fingerprintable', False),
            audio_fingerprint=audio_fingerprinting.get('audio_fingerprint', ''),
            
            # Font fingerprinting
            font_fingerprinting_tested=font_fingerprinting.get('tested', False),
            unique_fonts_detected=font_fingerprinting.get('unique_fonts_detected', 0),
            font_fingerprint=json.dumps(font_fingerprinting.get('font_fingerprint', {})),
            
            # Security headers
            security_headers_tested=security_headers.get('tested', False),
            security_headers_score=security_headers.get('score', 0),
            security_headers=json.dumps(security_headers.get('headers', {})),
            missing_security_headers=json.dumps(security_headers.get('missing_headers', [])),
            
            # User authenticity data
            authenticity_tested=user_authenticity.get('tested', False),
            authentic_appearance=user_authenticity.get('authentic_appearance', True),
            authenticity_score=user_authenticity.get('authenticity_score', 100),
            bot_detection_risk=user_authenticity.get('bot_detection_risk', 'Low'),
            suspicious_factors=json.dumps(user_authenticity.get('suspicious_factors', [])),
            authenticity_factors=json.dumps(user_authenticity.get('authenticity_factors', [])),
            authenticity_recommendations=json.dumps(user_authenticity.get('recommendations', [])),
            
            # Behavioral analysis data
            behavioral_analysis_tested=behavior_analysis.get('tested', False),
            natural_behavior=behavior_analysis.get('natural_behavior', True),
            behavior_score=behavior_analysis.get('behavior_score', 100),
            suspicious_patterns=json.dumps(behavior_analysis.get('suspicious_patterns', [])),
            natural_patterns=json.dumps(behavior_analysis.get('natural_patterns', [])),
            interaction_metrics=json.dumps(behavior_analysis.get('interaction_metrics', {})),
            
            # Anti-bot detection data
            antibot_detection_tested=antibot_detection.get('tested', False),
            passes_basic_bot_checks=antibot_detection.get('passes_basic_bot_checks', True),
            passes_advanced_bot_checks=antibot_detection.get('passes_advanced_bot_checks', True),
            detection_risk_score=antibot_detection.get('detection_risk_score', 0),
            triggered_detections=json.dumps(antibot_detection.get('triggered_detections', [])),
            passed_detections=json.dumps(antibot_detection.get('passed_detections', [])),
            vulnerable_services=json.dumps(antibot_detection.get('vulnerable_services', [])),
            detection_evasion_advice=json.dumps(antibot_detection.get('detection_evasion_advice', [])),
            
            # Privacy extensions analysis data
            extensions_analysis_tested=privacy_extensions.get('tested', False),
            extensions_detected=json.dumps(privacy_extensions.get('extensions_detected', [])),
            possible_extensions=json.dumps(privacy_extensions.get('possible_extensions', [])),
            extension_privacy_impact=privacy_extensions.get('extension_privacy_impact', 0),
            extension_authenticity_impact=privacy_extensions.get('extension_authenticity_impact', 0),
            extension_compatibility_impact=privacy_extensions.get('extension_compatibility_impact', 0),
            extension_recommendations=json.dumps(privacy_extensions.get('extension_recommendations', [])),
            
            # New additional checks data
            do_not_track_tested=do_not_track.get('tested', False),
            do_not_track_enabled=do_not_track.get('enabled', False),
            
            dns_country_tested=dns_country_check.get('tested', False),
            dns_country_different=dns_country_check.get('country_different', False),
            dns_country=dns_country_check.get('dns_country', 'Unknown'),
            
            language_location_tested=language_location_check.get('tested', False),
            language_location_different=language_location_check.get('location_different', False),
            system_language=language_location_check.get('system_language', 'Unknown'),
            browser_language=language_location_check.get('browser_language', 'Unknown'),
            
            # Standard data
            user_agent=processed_fingerprint.get('user_agent', 'Unknown'),
            browser_info=processed_fingerprint.get('browser_info', 'Unknown'),
            os_info=processed_fingerprint.get('os_info', 'Unknown'),
            screen_resolution=processed_fingerprint.get('screen_resolution', 'Unknown'),
            timezone_offset=processed_fingerprint.get('timezone_offset', 'Unknown'),
            language=processed_fingerprint.get('language', 'Unknown'),
            headers_json=headers_json,
            anonymity_score=anonymity_score,
            risk_level=risk_level,
            score_factors=score_factors_json
        )
        
        db.session.add(scan_result)
        db.session.commit()
        
        # Return the result ID to be redirected to the results page
        return jsonify({
            'success': True,
            'result_id': scan_result.id
        })
    
    except Exception as e:
        app.logger.error(f"Error during scan: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/results/<int:result_id>')
def results(result_id):
    """Display the scan results"""
    try:
        scan_result = ScanResult.query.get_or_404(result_id)
        
        # Parse headers from JSON string
        headers = json.loads(scan_result.headers_json) if scan_result.headers_json else {}
        
        # Parse score factors from JSON string
        score_factors = json.loads(scan_result.score_factors) if scan_result.score_factors else {'penalties': [], 'bonuses': []}
        
        # Calculate legitimacy score (how much user appears to be a real, innocent user)
        legitimacy_data = calculate_legitimacy_score(scan_result)
        
        # Generate personalized recommendations based on detected issues
        recommendations = generate_privacy_recommendations(scan_result, score_factors['penalties'])
        
        # Group recommendations by category for display
        category_names = {
            'connection': 'Connection Security',
            'browser': 'Browser Settings',
            'fingerprinting': 'Fingerprinting Protection',
            'data': 'Data Security',
            'web': 'Web Security',
            'permissions': 'Browser Permissions',
            'authenticity': 'User Authenticity',
            'behavior': 'Behavioral Patterns'
        }
        
        # Organize recommendations by category
        grouped_recommendations = {}
        for rec in recommendations:
            category = rec['category']
            if category not in grouped_recommendations:
                grouped_recommendations[category] = {
                    'name': category_names.get(category, category.capitalize()),
                    'items': []
                }
            grouped_recommendations[category]['items'].append(rec)
        
        # Make sure items is always a list
        for category, details in grouped_recommendations.items():
            if not isinstance(details['items'], list):
                app.logger.error(f"Items for category {category} is not a list: {type(details['items'])}")
                details['items'] = []
        
        app.logger.debug(f"Rendering results with grouped_recommendations: {grouped_recommendations}")
        
        # Prepare enhanced privacy data for the template
        enhanced_features = {
            'fingerprint_randomization': 'Fingerprint Randomization',
            'https_upgrade': 'HTTPS Upgrade',
            'dns_privacy': 'DNS Privacy',
            'tracker_blocker': 'Tracker Blocker',
            'cookie_manager': 'Cookie Manager',
            'social_media_detector': 'Social Media Detector',
            'vpn_assessor': 'VPN Assessment',
            'websocket_leak': 'WebSocket Leak Protection',
            'anonymity_timeline': 'Anonymity Timeline'
        }
        
        # Get the results of tests that have been performed
        enhanced_results = {}
        
        return render_template('results.html', 
                              result=scan_result, 
                              headers=headers,
                              score_factors=score_factors,
                              legitimacy_data=legitimacy_data,
                              recommendations=recommendations,
                              grouped_recommendations=grouped_recommendations,
                              enhanced_features=enhanced_features,
                              enhanced_results=enhanced_results)
    except Exception as e:
        app.logger.error(f"Error displaying results: {str(e)}")
        import traceback
        app.logger.error(traceback.format_exc())
        # Show a simplified error page instead of crashing
        return render_template('index.html', error=f"An error occurred while displaying the results: {str(e)}")

@app.route('/history')
def history():
    """Show history of scan results for current session"""
    # Get the session ID
    session_id = session.get('session_id')
    
    if not session_id:
        # Redirect to index if no session exists
        return redirect(url_for('index'))
    
    # Get scan results for this session, ordered by most recent first
    scan_results = ScanResult.query.filter_by(session_id=session_id)\
                                  .order_by(ScanResult.created_at.desc())\
                                  .limit(10)\
                                  .all()
    
    return render_template('history.html', scan_results=scan_results)

@app.route('/favicon.ico')
def favicon():
    """Serve the favicon.ico from the root URL"""
    return send_from_directory(os.path.join(app.root_path), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/admin/database-stats')
def database_stats():
    """Admin route to view database statistics and trigger cleanup"""
    # Basic authentication through query parameter for simplicity
    # In a production app, use proper authentication
    token = request.args.get('token')
    if not token or token != 'privacy_admin_2025':
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized access'
        }), 403
    
    # Get database statistics
    stats = ScanResult.get_database_stats()
    
    # Check if cleanup was requested
    if request.args.get('cleanup') == 'true':
        days = int(request.args.get('days', 30))
        max_per_session = int(request.args.get('max_per_session', 10))
        
        # Run cleanup
        deleted = ScanResult.cleanup_old_results(days=days, max_results_per_session=max_per_session)
        
        # Get updated stats after cleanup
        updated_stats = ScanResult.get_database_stats()
        
        return jsonify({
            'status': 'success',
            'message': f'Cleanup completed. Deleted {deleted[0]} old records and {deleted[1]} excess records.',
            'original_stats': stats,
            'updated_stats': updated_stats
        })
    
    return jsonify({
        'status': 'success',
        'stats': stats,
        'cleanup_info': {
            'instructions': 'Add ?cleanup=true to trigger database cleanup',
            'options': {
                'days': 'Number of days to keep records (default: 30)',
                'max_per_session': 'Maximum number of records per session (default: 10)'
            }
        }
    })

# Add test route
@app.route('/test-static')
def test_static():
    return render_template('test_static.html')
