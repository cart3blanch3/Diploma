using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using IdentityServer.Models;
using IdentityServer.Repositories;
using IdentityServer.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Serilog;

namespace IdentityServer.Services;

/// Сервис для генерации JWT access и refresh токенов.
public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IAuthRepository _authRepository;
    private readonly RSA _rsa;
    private readonly RsaSecurityKey _rsaKey;

    // Конструктор - загружает RSA-ключ и подготавливает криптографическую подпись
    public TokenService(IConfiguration configuration, IAuthRepository authRepository)
    {
        _configuration = configuration;
        _authRepository = authRepository;

        // Создание RSA-объекта
        _rsa = RSA.Create();

        // Путь к приватному ключу берётся из конфигурации
        var privateKeyPath = _configuration["JwtSettings:PrivateKeyPath"];

        // Проверка существования файла приватного ключа
        if (!File.Exists(privateKeyPath))
        {
            Log.Fatal("Ошибка: RSA-ключ не найден по пути {Path}", privateKeyPath);
            throw new Exception("RSA-ключ не найден, проверь путь в конфигурации.");
        }

        // Импорт PEM-ключа из файла
        _rsa.ImportFromPem(File.ReadAllText(privateKeyPath));

        // Создаём ключ для подписи JWT
        _rsaKey = new RsaSecurityKey(_rsa)
        {
            KeyId = "MyRSAKey"
        };
    }

    // Генерация AccessToken на основе данных пользователя
    public async Task<string> GenerateAccessToken(User user)
    {
        try
        {
            // Подпись токена
            var credentials = new SigningCredentials(_rsaKey, SecurityAlgorithms.RsaSha256);

            // Получаем роли пользователя
            var userRoles = await _authRepository.GetRolesAsync(user);

            // Преобразуем роли в claims
            var roleClaims = userRoles
                .Select(role => new Claim(ClaimTypes.Role, role))
                .ToList();

            // Основные claims токена
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id), // ID пользователя
                new(JwtRegisteredClaimNames.Email, user.Email!), // Email
                new("fullName", user.FullName), // Полное имя
                new("role", userRoles.FirstOrDefault() ?? "Client") // Роль (Клиент / Администратор)
            };

            // Время жизни токена (в минутах)
            if (!int.TryParse(_configuration["JwtSettings:AccessTokenLifetime"], out var tokenLifetime))
                throw new Exception("AccessTokenLifetime не задан или указан некорректно");

            // Формируем JWT
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"], // издатель токена
                audience: _configuration["JwtSettings:Audience"], // потребитель токена
                claims: claims, // список claims
                expires: DateTime.UtcNow.AddMinutes(tokenLifetime), // срок действия
                signingCredentials: credentials // криптографическая подпись
            );

            // Сериализуем JWT в строку
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        catch (Exception ex)
        {
            Log.Error("Ошибка генерации AccessToken для пользователя {Email}: {Message}", user.Email, ex.Message);
            throw new Exception("Ошибка генерации AccessToken", ex);
        }
    }

    // Генерация RefreshToken — используется для обновления AccessToken без повторного входа
    public RefreshToken GenerateRefreshToken(User user)
    {
        try
        {
            // Создаём 32 случайных байта
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            // Время жизни refresh-токена (в минутах)
            if (!int.TryParse(_configuration["JwtSettings:RefreshTokenLifetime"], out var lifetime))
                throw new Exception("RefreshTokenLifetime не задан или указан некорректно");

            // Формируем refresh-токен
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber), // кодируем случайные байты в строку
                ExpiresAt = DateTime.UtcNow.AddMinutes(lifetime), // срок действия
                UserId = user.Id // привязка к пользователю
            };
        }
        catch (Exception ex)
        {
            Log.Error("Ошибка генерации RefreshToken для пользователя {Email}: {Message}", user.Email, ex.Message);
            throw new Exception("Ошибка генерации RefreshToken", ex);
        }
    }
}
