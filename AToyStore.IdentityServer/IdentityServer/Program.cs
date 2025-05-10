using IdentityServer.Data;
using IdentityServer.Filters;
using IdentityServer.Middlewares;
using IdentityServer.Models;
using IdentityServer.Repositories;
using IdentityServer.Interfaces;
using IdentityServer.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.Http.BatchFormatters;
using System.Security;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Antiforgery;

var builder = WebApplication.CreateBuilder(args);

// Настройка Serilog для логгирования
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console()
    .WriteTo.File("logs/identityserver.txt", rollingInterval: RollingInterval.Day)
    .WriteTo.Http(
        requestUri: "http://localhost:5044",
        batchFormatter: new ArrayBatchFormatter(),
        textFormatter: new Serilog.Formatting.Json.JsonFormatter(renderMessage: true),
        queueLimitBytes: null
    )
    .CreateLogger();

builder.Host.UseSerilog();

// Настройка CORS для клиента React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Подключение базы данных и миграций
var migrationsAssembly = typeof(Program).Assembly.GetName().Name;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL"),
        npgsql => npgsql.MigrationsAssembly(migrationsAssembly)));

//builder.Services.AddDbContext<PersistedGrantDbContext>(options =>
//    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL"),
//        npgsql => npgsql.MigrationsAssembly(migrationsAssembly)));

// Использование кастомного хэшера паролей на основе BCrypt
builder.Services.AddScoped<IPasswordHasher<User>, BcryptPasswordHasher<User>>();

// Настройка Identity
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "AToyStore.Auth";
    options.Cookie.HttpOnly = true;
    /*options.Cookie.SecurePolicy = CookieSecurePolicy.Always;*/ // Только по HTTPS
    options.Cookie.SameSite = SameSiteMode.Strict; // Или Lax, если взаимодействие с внешними ресурсами
    options.LoginPath = "/auth/login";
    options.AccessDeniedPath = "/auth/access-denied";
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
});

// Настройка параметров пароля
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 12;
    options.Password.RequireUppercase = true;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;

    // Максимальное количество неудачных попыток входа — 10
    options.Lockout.MaxFailedAccessAttempts = 10;

    // Время блокировки — 10 минут
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);

    // Включить блокировку для новых пользователей
    options.Lockout.AllowedForNewUsers = true;
});

builder.Services.AddAntiforgery(options =>
{
    options.Cookie.Name = "X-CSRF-TOKEN";
    options.HeaderName = "X-CSRF-TOKEN";
});

// Регистрация зависимостей
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Документация Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "IdentityServer API",
        Version = "v1",
        Description = "API для аутентификации, авторизации, JWT, 2FA и refresh-токенов"
    });
});

// Загрузка RSA-ключа для подписи токенов
var rsa = RSA.Create();
var privateKeyPath = builder.Configuration["JwtSettings:PrivateKeyPath"];
if (!File.Exists(privateKeyPath))
    throw new FileNotFoundException($"Не найден приватный ключ по пути {privateKeyPath}");

rsa.ImportFromPem(File.ReadAllText(privateKeyPath));
var key = new RsaSecurityKey(rsa)
{
    KeyId = builder.Configuration["JwtSettings:KeyId"]
};
var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateModelAttribute>();
});

var app = builder.Build();

// Middleware: заголовки безопасности
app.UseSecurityHeaders();

// Middleware: логгирование запросов
app.UseSerilogRequestLogging();

// Middleware: глобальная обработка исключений
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (exceptionFeature == null) return;

        var exception = exceptionFeature.Error;

        var statusCode = exception switch
        {
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            SecurityException => StatusCodes.Status403Forbidden,
            InvalidOperationException => StatusCodes.Status422UnprocessableEntity,
            _ => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{statusCode}",
            Title = statusCode switch
            {
                400 => "Некорректный запрос",
                401 => "Ошибка авторизации",
                403 => "Доступ запрещён",
                404 => "Ресурс не найден",
                422 => "Ошибка бизнес-логики",
                _ => "Внутренняя ошибка сервера"
            },
            Status = statusCode,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        if (statusCode == 500)
        {
            Log.Fatal("Критическая ошибка: {Message} | Path: {Path} | Exception: {Exception}",
                exception.Message, context.Request.Path, exception);
        }
        else
        {
            Log.Warning("Ошибка {StatusCode}: {Message} | Path: {Path}",
                statusCode, exception.Message, context.Request.Path);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});

app.Use(async (context, next) =>
{
    var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
    var tokens = antiforgery.GetAndStoreTokens(context);

    context.Response.Cookies.Append("X-CSRF-TOKEN", tokens.RequestToken!, new CookieOptions
    {
        HttpOnly = false,
        Secure = true,
        SameSite = SameSiteMode.Strict
    });

    await next();
});

// Использование CORS, IdentityServer и контроллеров
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Инициализация ролей и администратора при запуске приложения
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<User>>();

        string[] roleNames = { "Admin", "Client" };

        foreach (var role in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var adminEmail = "admin@atoystore.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var newAdmin = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Admin User"
            };

            var adminResult = await userManager.CreateAsync(newAdmin, "Admin123456!");
            if (adminResult.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, "Admin");
                Console.WriteLine("Администратор создан: " + adminEmail);
            }
        }
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Ошибка применения миграций или создания администратора");
        throw;
    }
}

// Запуск приложения
app.Run();
