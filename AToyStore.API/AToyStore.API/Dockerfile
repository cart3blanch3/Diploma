# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файлы решения и проекты (только те, что нужны для сборки API)
COPY ["AToyStore.API/AToyStore.API.csproj", "AToyStore.API/"]
COPY ["AToyStore.Application/AToyStore.Application.csproj", "AToyStore.Application/"]
COPY ["AToyStore.Infrastructure/AToyStore.Infrastructure.csproj", "AToyStore.Infrastructure/"]
COPY ["AToyStore.Core/AToyStore.Core.csproj", "AToyStore.Core/"]

# Восстанавливаем зависимости для API (с учетом ProjectReference)
RUN dotnet restore "AToyStore.API/AToyStore.API.csproj"

# Копируем весь код API и зависимых проектов
COPY AToyStore.API/. AToyStore.API/
COPY AToyStore.Application/. AToyStore.Application/
COPY AToyStore.Infrastructure/. AToyStore.Infrastructure/
COPY AToyStore.Core/. AToyStore.Core/

# Собираем проект в релизной конфигурации
RUN dotnet publish "AToyStore.API/AToyStore.API.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Копируем опубликованные файлы из стадии сборки
COPY --from=build /app/publish .

# Открываем порт 8001 (как ты просил)
EXPOSE 8001

# Запускаем приложение
ENTRYPOINT ["dotnet", "AToyStore.API.dll"]
