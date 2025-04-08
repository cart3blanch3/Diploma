@echo off
title AToyStore - Полный запуск

echo --- Сборка и запуск IdentityServer ---
cd AToyStore.IdentityServer\IdentityServer
dotnet build
start dotnet run
cd ..\..

echo --- Сборка и запуск AToyStore.API ---
cd AToyStore.API\AToyStore.API
dotnet build
start dotnet run
cd ..\..

echo --- Запуск клиента (React) ---
cd atoystore-client
start cmd /k "npm install && npm start"
cd ..

echo --- Запуск SIEM (ELK Stack через Docker Compose) ---
cd SIEM
start cmd /k "docker-compose up"
cd ..

echo Все компоненты запущены!
pause
