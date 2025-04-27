import os
import logging
from pathlib import Path

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix


# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)

# Set a secret key
app.secret_key = "privacy_shield_2024_secure_key_123!"
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# Add CSP headers
@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://cdn.replit.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
        "img-src 'self' data:; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "media-src 'self' data:; "
        "connect-src 'self' https://api.ipify.org https://ipapi.co;"
    )
    return response

# configure the database
instance_path = Path(app.instance_path)
instance_path.mkdir(exist_ok=True)
database_path = instance_path / "privacy_detector.db"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{database_path}"
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# initialize the app with the extension
db.init_app(app)

# Custom Jinja2 filters
@app.template_filter('number_format')
def number_format_filter(value):
    """Format a number with commas as thousands separator"""
    try:
        return "{:,}".format(int(value))
    except (ValueError, TypeError):
        return value

@app.template_filter('fromjson')
def fromjson_filter(value):
    """Convert a JSON string to Python object"""
    import json
    try:
        if not value:
            return []
        return json.loads(value)
    except (ValueError, TypeError):
        app.logger.warning(f"Invalid JSON: {value}")
        return []

@app.template_filter('tojson')
def tojson_filter(value):
    """Convert Python object to JSON string with error handling"""
    import json
    try:
        if value is None:
            return "[]"
        return json.dumps(value)
    except (TypeError, OverflowError, ValueError) as e:
        app.logger.warning(f"Error converting to JSON: {str(e)}")
        return "[]"

# Import routes after app is created
from routes import *

with app.app_context():
    # Make sure to import the models here or their tables won't be created
    import models  # noqa: F401

    db.create_all()
    
    # Set up scheduled database cleanup
    @app.before_request
    def cleanup_database():
        """Periodically clean up old scan results to prevent database growth"""
        import time
        import threading
        from datetime import datetime
        
        # Store the last cleanup time in app.config
        last_cleanup = app.config.get('LAST_DB_CLEANUP')
        current_time = time.time()
        
        # Run cleanup once per day (86400 seconds)
        if not last_cleanup or (current_time - last_cleanup > 86400):
            app.config['LAST_DB_CLEANUP'] = current_time
            
            def cleanup_task():
                # Create a new app context for the background thread
                with app.app_context():
                    try:
                        app.logger.info("Starting scheduled database cleanup")
                        # Keep results from last 30 days, max 10 results per session
                        deleted = models.ScanResult.cleanup_old_results(days=30, max_results_per_session=10)
                        app.logger.info(f"Database cleanup complete. Deleted: {deleted}")
                    except Exception as e:
                        app.logger.error(f"Error cleaning up database: {str(e)}")
            
            # Run the cleanup in a background thread to avoid blocking requests
            cleanup_thread = threading.Thread(target=cleanup_task)
            cleanup_thread.daemon = True
            cleanup_thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
