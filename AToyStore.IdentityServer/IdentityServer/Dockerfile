# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файлы решения и проекта
COPY ["AToyStore.IdentityServer.sln", "."]
COPY ["IdentityServer/IdentityServer.csproj", "IdentityServer/"]

# Восстанавливаем зависимости
RUN dotnet restore "IdentityServer/IdentityServer.csproj"

# Копируем весь код проекта
COPY IdentityServer/. IdentityServer/

# Собираем проект в релизной конфигурации
RUN dotnet publish "IdentityServer/IdentityServer.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Копируем скомпилированные файлы из стадии сборки
COPY --from=build /app/publish .

# Копируем ключи для JWT (предполагается, что папка Keys находится в IdentityServer)
COPY IdentityServer/Keys ./Keys

# Открываем порт 8000
EXPOSE 8000

# Запускаем приложение
ENTRYPOINT ["dotnet", "IdentityServer.dll"]
