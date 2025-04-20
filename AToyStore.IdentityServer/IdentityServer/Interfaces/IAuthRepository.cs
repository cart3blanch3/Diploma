using IdentityServer.Models;
using Microsoft.AspNetCore.Identity;

namespace IdentityServer.Interfaces;

public interface IAuthRepository
{
    Task<User?> GetUserByIdAsync(string userId);
    Task<User?> GetUserByEmailAsync(string email);
    Task<IdentityResult> CreateUserAsync(User user, string password);
    Task<bool> ValidateUserCredentialsAsync(User user, string password);
    Task<bool> IsEmailConfirmedAsync(User user);
    Task<IdentityResult> ConfirmEmailAsync(User user, string token);
    Task<bool> IsUserInRoleAsync(User user, string role);
    Task<IList<string>> GetRolesAsync(User user);
    Task AssignRoleAsync(User user, string role);
    Task<bool> IsTwoFactorEnabledAsync(User user);
    Task SetTwoFactorEnabledAsync(User user, bool isEnabled);
    Task<string> GenerateTwoFactorTokenAsync(User user);
    Task<bool> VerifyTwoFactorTokenAsync(User user, string code);
    Task<string> GenerateEmailConfirmationTokenAsync(User user);
    Task<string> GeneratePasswordResetTokenAsync(User user);
    Task<IdentityResult> ResetPasswordAsync(User user, string token, string newPassword);
    Task<bool> IsUserLockedOutAsync(User user);
    Task LockUserAsync(User user, int lockoutMinutes);
    Task<int> GetFailedLoginAttemptsAsync(User user);
    TimeSpan GetDefaultLockoutTimeSpan();
    Task HandleFailedLoginAsync(User user);
    Task ResetFailedLoginAttemptsAsync(User user);
    Task SaveRefreshTokenAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetRefreshTokenAsync(string token);
    Task InvalidateRefreshTokenAsync(RefreshToken refreshToken);
}
