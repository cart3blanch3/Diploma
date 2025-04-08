using IdentityServer.Data;
using IdentityServer.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace IdentityServer.Repositories;

public class AuthRepository
{
    private readonly UserManager<User> _userManager;
    private readonly AppDbContext _context;

    public AuthRepository(UserManager<User> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    // === Пользователи ===

    // Получить пользователя по Id
    public async Task<User?> GetUserByIdAsync(string userId) =>
        await _userManager.FindByIdAsync(userId);

    // Получить пользователя по Email
    public async Task<User?> GetUserByEmailAsync(string email) =>
        await _userManager.FindByEmailAsync(email);

    // Создать нового пользователя
    public async Task<IdentityResult> CreateUserAsync(User user, string password) =>
        await _userManager.CreateAsync(user, password);

    // Проверить правильность пароля
    public async Task<bool> ValidateUserCredentialsAsync(User user, string password) =>
        await _userManager.CheckPasswordAsync(user, password);

    // Проверить, подтверждён ли Email
    public async Task<bool> IsEmailConfirmedAsync(User user) =>
        await _userManager.IsEmailConfirmedAsync(user);

    // Подтвердить Email с токеном
    public async Task<IdentityResult> ConfirmEmailAsync(User user, string token) =>
        await _userManager.ConfirmEmailAsync(user, token);

    // Проверить, принадлежит ли пользователь роли
    public async Task<bool> IsUserInRoleAsync(User user, string role) =>
        await _userManager.IsInRoleAsync(user, role);


    // === Роли и безопасность ===

    // Получить список ролей пользователя
    public async Task<IList<string>> GetRolesAsync(User user) =>
        await _userManager.GetRolesAsync(user);

    // Назначить роль пользователю
    public async Task AssignRoleAsync(User user, string role) =>
        await _userManager.AddToRoleAsync(user, role);

    // Проверить, включена ли двухфакторная аутентификация
    public async Task<bool> IsTwoFactorEnabledAsync(User user) =>
        await _userManager.GetTwoFactorEnabledAsync(user);

    // Включить или отключить двухфакторную аутентификацию
    public async Task SetTwoFactorEnabledAsync(User user, bool isEnabled) =>
        await _userManager.SetTwoFactorEnabledAsync(user, isEnabled);

    // Сгенерировать 2FA-код
    public async Task<string> GenerateTwoFactorTokenAsync(User user) =>
        await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);

    // Проверить введённый 2FA-код
    public async Task<bool> VerifyTwoFactorTokenAsync(User user, string code) =>
        await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider, code);

    // Сгенерировать токен подтверждения Email
    public async Task<string> GenerateEmailConfirmationTokenAsync(User user) =>
        await _userManager.GenerateEmailConfirmationTokenAsync(user);

    // Сгенерировать токен сброса пароля
    public async Task<string> GeneratePasswordResetTokenAsync(User user) =>
        await _userManager.GeneratePasswordResetTokenAsync(user);

    // Сбросить пароль с токеном
    public async Task<IdentityResult> ResetPasswordAsync(User user, string token, string newPassword) =>
        await _userManager.ResetPasswordAsync(user, token, newPassword);


    // === Блокировка и попытки входа ===

    // Проверить, заблокирован ли пользователь
    public async Task<bool> IsUserLockedOutAsync(User user) =>
        await _userManager.IsLockedOutAsync(user);

    // Установить блокировку пользователю на указанное количество минут
    public async Task LockUserAsync(User user, int lockoutMinutes) =>
        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddMinutes(lockoutMinutes));

    // Получить количество неудачных попыток входа
    public async Task<int> GetFailedLoginAttemptsAsync(User user) =>
        await _userManager.GetAccessFailedCountAsync(user);

    // Увеличить счётчик неудачных попыток входа
    public async Task HandleFailedLoginAsync(User user) =>
        await _userManager.AccessFailedAsync(user);

    // Сбросить счётчик неудачных попыток
    public async Task ResetFailedLoginAttemptsAsync(User user) =>
        await _userManager.ResetAccessFailedCountAsync(user);


    // === Refresh токены ===

    // Сохранить refresh-токен
    public async Task SaveRefreshTokenAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
    }

    // Получить refresh-токен по значению
    public async Task<RefreshToken?> GetRefreshTokenAsync(string token) =>
        await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked);

    // Отметить refresh-токен как использованный
    public async Task InvalidateRefreshTokenAsync(RefreshToken refreshToken)
    {
        refreshToken.IsUsed = true;
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }
}
