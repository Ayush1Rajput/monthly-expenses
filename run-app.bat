@echo off
title PennyWise - Expense Tracker
color 0A
echo ========================================================
echo       Starting PennyWise Mobile Expense Tracker
echo ========================================================
echo.
echo  [1/2] Starting Backend Server (Port 5000)...
start "PennyWise-Backend" cmd /k "cd /d \"%~dp0backend\" && npm start"

echo.
echo  [2/2] Starting Frontend Mobile PWA (Port 5173)...
start "PennyWise-Frontend" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo  APP IS READY!
echo.
echo  * On this Computer:  http://localhost:5173
echo  * On Android Mobile:  http://192.168.1.65:5173
echo ========================================================
echo.
echo Opening app in your browser...
start http://localhost:5173
echo.
echo Keep this window open or minimize it while using the app.
pause
