using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using AToyStore.Core.Profile.Entities;
using AToyStore.Infrastructure;
using AToyStore.Application.Products.Interfaces;
using AToyStore.Application.Products;
using AToyStore.Infrastructure.Products;
using AToyStore.Application.Orders.Interfaces;
using AToyStore.Application.Orders.Services;
using AToyStore.Core.Orders.Interfaces;
using AToyStore.Infrastructure.Orders;
using AToyStore.Application.Profile.Interfaces;
using AToyStore.Application.Profile;
using AToyStore.Core.Profile.Interfaces;
using AToyStore.Infrastructure.Profile;
using AToyStore.Application.Favorites.Interfaces;
using AToyStore.Application.Favorites.Services;
using AToyStore.Core.Favorites.Interfaces;
using AToyStore.Infrastructure.Favorites;
using AToyStore.Application.Reviews.Interfaces;
using AToyStore.Application.Reviews.Services;
using AToyStore.Core.Reviews.Interfaces;
using AToyStore.Infrastructure.Reviews;
using AToyStore.Application.Payments.Interfaces;
using AToyStore.Application.Payments.Services;
using AToyStore.Core.Payments.Interfaces;
using AToyStore.Infrastructure.Payments;
using AToyStore.Core.Common.Interfaces;
using AToyStore.Infrastructure.Services;
using AToyStore.API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// === Подключение DbContext и PostgreSQL ===
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// === Identity
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// === JWT Authentication with RSA Public Key ===
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var rsa = RSA.Create();
    var publicKeyPath = Path.Combine(builder.Environment.ContentRootPath, "Keys", "public.pem");

    if (!File.Exists(publicKeyPath))
        throw new FileNotFoundException("Public key not found: " + publicKeyPath);

    var publicKeyPem = File.ReadAllText(publicKeyPath)
        .Replace("-----BEGIN PUBLIC KEY-----", "")
        .Replace("-----END PUBLIC KEY-----", "")
        .Replace("\r", "")
        .Replace("\n", "");

    var publicKeyBytes = Convert.FromBase64String(publicKeyPem);
    rsa.ImportSubjectPublicKeyInfo(publicKeyBytes, out _);

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = "http://localhost:5115",

        ValidateAudience = true,
        ValidAudience = "http://localhost:5062",

        ValidateLifetime = true,
        RequireExpirationTime = true,
        ClockSkew = TimeSpan.FromMinutes(1),

        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new RsaSecurityKey(rsa),

        RoleClaimType = "role",
        NameClaimType = "sub"
    };
});

// === DI: Products, Orders, Profile, Favorites, Reviews ===
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();

builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
builder.Services.AddScoped<IFavoriteService, FavoriteService>();

builder.Services.AddScoped<IProductReviewRepository, ProductReviewRepository>();
builder.Services.AddScoped<IProductReviewService, ProductReviewService>();

builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.Configure<YooKassaOptions>(builder.Configuration.GetSection("YooKassa"));
builder.Services.AddScoped<IYooKassaClient, YooKassaClient>(provider =>
{
    var logger = provider.GetRequiredService<ILogger<YooKassaClient>>();
    var config = provider.GetRequiredService<IConfiguration>();
    var options = config.GetSection("YooKassa").Get<YooKassaOptions>();
    return new YooKassaClient(options.ShopId, options.SecretKey, logger);
});

// === Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// === CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://83.222.22.162",
                "http://atoystore.ru",
                "http://www.atoystore.ru",
                "http://atoystore.store",
                "http://www.atoystore.store"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseSecurityHeaders();
app.UseMiddleware<RequestSanitizationMiddleware>();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ошибка при автоматическом применении миграций");
        throw;
    }
}

app.Run();
