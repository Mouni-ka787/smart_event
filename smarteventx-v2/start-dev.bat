@echo off
echo Starting SmartEventX Development Environment...
echo.

echo Starting Backend Server...
cd ..\smarteventx-backend
start cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
cd ..\smarteventx-v2
npm run dev

echo.
echo Development environment started successfully!
pause