@echo off
echo ========================================
echo Installing Node.js Dependencies
echo ========================================
echo.

npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Make sure Node.js and npm are installed
    echo Check: node --version and npm --version
    pause
    exit /b 1
)

echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
echo.
echo Next step: Run start.bat to start the development server
echo.
pause
