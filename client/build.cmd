@echo off
set "PATH=C:\Users\Dridi_Nada\Node.js;%PATH%"
set "TEMP=%~dp0tmp"
set "TMP=%~dp0tmp"
if not exist "%~dp0tmp" mkdir "%~dp0tmp"
call npm run build

