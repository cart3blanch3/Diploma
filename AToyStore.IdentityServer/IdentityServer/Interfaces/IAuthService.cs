using IdentityServer.Requests;

namespace IdentityServer.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequest request);
    Task<(string? AccessToken, string? RefreshToken, bool Requires2FA)> LoginAsync(LoginRequest request);
    Task<(string AccessToken, string RefreshToken)> VerifyTwoFactorAsync(VerifyTwoFactorRequest request);
    Task ConfirmEmailAsync(ConfirmEmailRequest request);
    Task ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
    Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(string fingerprint);
}
