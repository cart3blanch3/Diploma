using IdentityServer.Models;
using IdentityServer.Interfaces;
using IdentityServer.Requests;
using Microsoft.AspNetCore.Identity;
using Serilog;
using System.Net;
using System.Security;

namespace IdentityServer.Services;

/// Сервис для управления аутентификацией и безопасностью пользователей.
public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        IAuthRepository authRepository,
        ITokenService tokenService,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor
        )
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
        _emailService = emailService;
        _httpContextAccessor = httpContextAccessor;
    }

    // Регистрация нового пользователя
    public async Task RegisterAsync(RegisterRequest request)
    {
        // Проверяем, существует ли уже пользователь с таким email
        var existingUser = await _authRepository.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Пользователь с таким email уже зарегистрирован.");

        // Создаём нового пользователя
        var user = new User
        {
            UserName = request.Email,       // логин совпадает с email
            Email = request.Email,          // email пользователя
            FullName = request.FullName     // имя пользователя
        };

        // Пытаемся создать пользователя
        var result = await _authRepository.CreateUserAsync(user, request.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Ошибка регистрации: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        // Назначаем пользователю роль "Client"
        await _authRepository.AssignRoleAsync(user, "Client");

        // Включаем/отключаем двухфакторную аутентификацию в зависимости от запроса
        await _authRepository.SetTwoFactorEnabledAsync(user, request.EnableTwoFactor);

        // Генерируем токен подтверждения email
        var emailToken = await _authRepository.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(emailToken);

        // Формируем ссылку подтверждения email
        var confirmationLink = $"http://localhost:3000/confirm-email?email={user.Email}&token={encodedToken}";

        // Отправляем письмо с ссылкой подтверждения на email
        await _emailService.SendEmailAsync(
            user.Email!,
            "Подтверждение регистрации",
            $"Для подтверждения email перейди по ссылке: <a href='{confirmationLink}'>Подтвердить email</a>");
    }

    // Вход пользователя в систему
    public async Task<(string? AccessToken, string? RefreshToken, bool Requires2FA)> LoginAsync(LoginRequest request)
    {
        // Поиск пользователя по email
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Пользователь не найден.");

        // Проверка, заблокирован ли пользователь
        if (await _authRepository.IsUserLockedOutAsync(user))
        {
            Log.Warning("Попытка входа в заблокированный аккаунт {Email}", user.Email);
            throw new SecurityException("Ваш аккаунт временно заблокирован. Попробуйте позже.");
        }

        // Проверка корректности пароля
        var isPasswordValid = await _authRepository.ValidateUserCredentialsAsync(user, request.Password);
        if (!isPasswordValid)
        {
            // Получаем количество неудачных попыток перед текущей
            var attemptsBeforeLock = await _authRepository.GetFailedLoginAttemptsAsync(user);

            // Увеличиваем счётчик неудачных попыток
            await _authRepository.HandleFailedLoginAsync(user);

            // Проверка: заблокирован ли пользователь после этой попытки
            if (await _authRepository.IsUserLockedOutAsync(user))
            {
                // Логируем блокировку
                if (await _authRepository.IsUserInRoleAsync(user, "Admin"))
                {
                    Log.Fatal("Администратор {Email} заблокирован после {FailedAttempts} неудачных попыток входа", user.Email, attemptsBeforeLock + 1);
                }
                else
                {
                    Log.Warning("Пользователь {Email} заблокирован после {Attempts} неудачных попыток входа", user.Email, attemptsBeforeLock + 1);
                }

                var lockoutTime = _authRepository.GetDefaultLockoutTimeSpan().TotalMinutes;
                throw new SecurityException($"Аккаунт заблокирован на {lockoutTime} минут.");
            }

            // Логируем неудачную попытку входа
            Log.Warning("Неверный пароль у пользователя {Email}", user.Email);
            throw new SecurityException("Неверный пароль.");
        }

        // Сбрасываем счётчик неудачных входов после успешной авторизации
        await _authRepository.ResetFailedLoginAttemptsAsync(user);
        Log.Information("Пользователь {Email} успешно вошёл в систему.", user.Email);

        // Проверка включена ли двухфакторная аутентификация
        if (await _authRepository.IsTwoFactorEnabledAsync(user))
        {
            // Генерация одноразового кода 2FA
            var code = await _authRepository.GenerateTwoFactorTokenAsync(user);
            Log.Information("Отправка 2FA кода на email для пользователя {Email}", user.Email);

            // Отправка кода на почту
            await _emailService.SendEmailAsync(user.Email!, "Код подтверждения 2FA",
                $"Ваш код подтверждения входа: <strong>{code}</strong>");

            // Уведомляем клиент, что требуется 2FA
            return (null, null, true);
        }

        // Генерация токенов при успешной аутентификации
        var accessToken = await _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user);
        await _authRepository.SaveRefreshTokenAsync(refreshToken);

        // Возвращаем токены
        return (accessToken, refreshToken.Token, false);
    }

    // Проверка 2FA-кода
    public async Task<(string AccessToken, string RefreshToken)> VerifyTwoFactorAsync(VerifyTwoFactorRequest request)
    {
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Неверные данные.");

        var isValid = await _authRepository.VerifyTwoFactorTokenAsync(user, request.Code);
        if (!isValid)
            throw new SecurityException("Неверный 2FA код.");

        var accessToken = await _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user);
        await _authRepository.SaveRefreshTokenAsync(refreshToken);

        return (accessToken, refreshToken.Token);
    }

    // Подтверждение email
    public async Task ConfirmEmailAsync(ConfirmEmailRequest request)
    {
        // Поиск пользователя по email
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
            throw new InvalidOperationException("Пользователь не найден.");

        // Подтверждение email по токену
        var result = await _authRepository.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
            throw new InvalidOperationException("Ошибка подтверждения email.");
    }

    // Запрос на сброс пароля
    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        // Поиск пользователя по email
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
            throw new InvalidOperationException("Пользователь не найден.");

        // Генерация токена сброса пароля
        var resetToken = await _authRepository.GeneratePasswordResetTokenAsync(user);

        // Кодируем токен для безопасной передачи в ссылке
        var encodedToken = WebUtility.UrlEncode(resetToken);

        // Формируем ссылку для сброса пароля (переход на клиентское приложение)
        var resetLink = $"http://localhost:3000/reset-password?email={user.Email}&token={encodedToken}";

        // Отправка письма со ссылкой пользователю
        await _emailService.SendEmailAsync(user.Email!, "Сброс пароля",
            $"Для сброса пароля перейди по ссылке: <a href='{resetLink}'>Сбросить пароль</a>");
    }

    // Сброс пароля по токену
    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        // Поиск пользователя по email
        var user = await _authRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
            throw new InvalidOperationException("Пользователь не найден.");

        // Сброс пароля с использованием токена и нового пароля
        var result = await _authRepository.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException("Ошибка сброса пароля.");
    }

    // Обновление access и refresh токенов по refresh-токену
    public async Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(string refreshToken)
    {
        // Поиск refresh-токена
        var storedToken = await _authRepository.GetRefreshTokenAsync(refreshToken);

        // Проверка существования токена и срока его действия
        if (storedToken == null || storedToken.ExpiresAt <= DateTime.UtcNow)
            throw new SecurityException("Refresh-токен недействителен или истёк.");

        // Получаем пользователя, которому принадлежит токен
        var user = await _authRepository.GetUserByIdAsync(storedToken.UserId);
        if (user == null)
            throw new UnauthorizedAccessException("Пользователь не найден.");

        // Генерация новых токенов
        var newAccessToken = await _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken(user);

        // Обновляем refresh-токен: помечаем старый как использованный и сохраняем новый
        await _authRepository.InvalidateRefreshTokenAsync(storedToken);
        await _authRepository.SaveRefreshTokenAsync(newRefreshToken);

        // Возвращаем новые токены клиенту
        return (newAccessToken, newRefreshToken.Token);
    }
}
