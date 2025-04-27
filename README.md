# Privacy & IP Leak Detector

A Flask-based privacy and IP leak detection platform that provides comprehensive anonymity testing and advanced privacy protection technologies.

## Features

- Detailed IP and anonymity scanning
- WebRTC leak detection
- Browser extension compatibility checker
- Enhanced privacy feature tooltips
- Real-time anonymity scoring system

## Tech Stack

- Flask web framework
- PostgreSQL database (SQLite for development)
- HTML/CSS/JavaScript frontend
- Bootstrap for responsive design
- Font Awesome icons

## Deployment on Render

This application is configured for easy deployment on Render.com.

### Prerequisites

1. A Render.com account
2. Git repository with this codebase

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. In Render Dashboard, select "New Web Service"
3. Connect your Git repository
4. Render will automatically detect the configuration from `render.yaml`
5. Click "Create Web Service"

Render will automatically:
- Provision a PostgreSQL database
- Set up the required environment variables
- Build and deploy your application

### Manual Configuration (if needed)

If you prefer to set up the service manually instead of using the `render.yaml`:

1. **Web Service Settings:**
   - Environment: Python
   - Build Command: `pip install poetry && poetry install --no-interaction --no-ansi`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT --workers 4 main:app`

2. **Environment Variables:**
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Random secure string for session encryption
   
3. **Database:**
   - Create a PostgreSQL database from Render Dashboard
   - Connect it to your web service

## Local Development

1. Clone this repository
2. Install dependencies: `pip install poetry && poetry install`
3. Set up environment variables (see `.env.example`)
4. Run the application: `gunicorn --bind 0.0.0.0:5000 main:app`