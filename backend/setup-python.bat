@echo off
REM Setup script for Python YOLO inference dependencies on Windows

echo 🐍 Setting up Python dependencies for YOLO inference...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.7+ first.
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo ✅ Python version: %python_version%

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo ✅ Python setup complete!
echo.
echo 🚀 You can now run YOLO inference with:
echo    python yolo_inference.py ^<image_path^> ^<model_path^> [confidence_threshold]
echo.
echo 📝 To install actual YOLO dependencies, uncomment lines in requirements.txt and run:
echo    pip install -r requirements.txt

pause
