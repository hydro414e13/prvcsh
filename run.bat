@echo off
echo Starting Privacy Shield...

:: Set environment variables
set SESSION_SECRET=privacy_shield_2024_secure_key_123!
set DATABASE_URL=sqlite:///D:\Adi\Private\Documents\Projects\PrivacyShield - Done\PrivacyShield\PrivacyShield\instance\privacy_detector.db

:: Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing requirements...
    pip install -r requirements.txt
)

:: Run the application
python app.py

:: Keep the window open if there's an error
if errorlevel 1 (
    echo.
    echo Application failed to start. Press any key to exit...
    pause >nul
) 