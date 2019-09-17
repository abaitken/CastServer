@echo off

cd /d "%~dp0"
call build.cmd
call npm run server

::TODO : introduce key press exit for server if additional commands are required