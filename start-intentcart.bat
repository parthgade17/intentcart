@echo off
title IntentCart Launcher

start "IntentCart Backend" cmd /k "cd /d C:\Users\parth\IntentCart\backend && npm start"

start "IntentCart Frontend" cmd /k "cd /d C:\Users\parth\IntentCart\frontend && npm run dev"

timeout /t 5 /nobreak >nul

start "" http://localhost:3000