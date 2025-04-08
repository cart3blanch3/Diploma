@echo off
setlocal
cd /d "%~dp0"

echo [1/4] Восстановление NuGet-пакетов для IdentityServer...
cd "AToyStore.IdentityServer\IdentityServer"
dotnet restore
if %errorlevel% neq 0 (
    echo Ошибка восстановления NuGet-пакетов в IdentityServer
    exit /b 1
)

echo [2/4] Восстановление NuGet-пакетов для AToyStore.API...
cd "..\..\AToyStore.API"
dotnet restore
if %errorlevel% neq 0 (
    echo Ошибка восстановления NuGet-пакетов в AToyStore.API
    exit /b 1
)

echo [3/4] Установка npm-зависимостей для клиента...
cd "..\atoystore-client"
call npm install
if %errorlevel% neq 0 (
    echo Ошибка установки npm-зависимостей
    exit /b 1
)

REM echo [4/4] Запуск docker-compose...
REM cd "..\SIEM"
REM docker-compose up -d

echo Установка зависимостей завершена успешно.
pause
