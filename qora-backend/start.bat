@echo off
echo.
echo  ██████╗  ██████╗ ██████╗  █████╗
echo ██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗
echo ██║   ██║██║   ██║██████╔╝███████║
echo ██║▄▄ ██║██║   ██║██╔══██╗██╔══██║
echo ╚██████╔╝╚██████╔╝██║  ██║██║  ██║
echo  ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo  Vector Database for Indian AI Teams
echo  =====================================
echo.

:: Check if venv exists
if not exist "venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv venv
    echo Done.
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install dependencies
echo [2/3] Installing dependencies...
pip install -r requirements.txt -q
echo Done.

:: Start server
echo [3/3] Starting Qora API server...
echo.
echo  API running at   : http://localhost:8000
echo  API Docs         : http://localhost:8000/docs
echo  API Key          : qr_dev_test123
echo.
echo  Press Ctrl+C to stop
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
