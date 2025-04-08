@echo off
setlocal

:: Проверка наличия winget
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo Winget не найден. Устанавливаю...
    powershell -Command "Start-Process 'https://aka.ms/getwingetpreview' -Wait"
    echo После установки winget перезапусти этот файл.
    pause
    exit /b
)

:: Установка .NET SDK 8.0.400
echo Установка .NET SDK 8.0.400...
winget install --id Microsoft.DotNet.SDK.8 --version 8.0.400 -e --accept-package-agreements --accept-source-agreements

:: Установка Node.js 22.11.0 (в комплекте идёт npm 10.9.0)
echo Установка Node.js 22.11.0...
winget install OpenJS.NodeJS.LTS --version 22.11.0 -e --accept-package-agreements --accept-source-agreements

:: Установка PostgreSQL (если .exe рядом)
if exist "postgresql-17.2-windows-x64.exe" (
    echo Установка PostgreSQL 17.2...
    start /wait postgresql-17.2-windows-x64.exe
) else (
    echo Файл установки PostgreSQL 17.2 не найден. Скачай его вручную или помести в папку со скриптом.
)

:: Установка pgAdmin 4
echo Установка pgAdmin 4...
winget install pgAdmin.pgAdmin4 -e --accept-package-agreements --accept-source-agreements

:: Установка Visual Studio Code
echo Установка Visual Studio Code...
winget install Microsoft.VisualStudioCode -e --accept-package-agreements --accept-source-agreements

:: Установка Docker Desktop
echo Установка Docker Desktop...
winget install Docker.DockerDesktop -e --accept-package-agreements --accept-source-agreements

:: Установка Postman
echo Установка Postman...
winget install Postman.Postman -e --accept-package-agreements --accept-source-agreements

echo Все установки завершены. 
pause
