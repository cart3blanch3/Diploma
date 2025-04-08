using IdentityServer.Requests;
using IdentityServer.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IdentityServer.Controllers;

/// Контроллер, отвечающий за регистрацию, вход, 2FA, подтверждение email и работу с токенами.
[Route("auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// Регистрация нового пользователя.
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        await _authService.RegisterAsync(request);
        return Ok("Письмо с подтверждением отправлено.");
    }

    /// Подтверждение email пользователя.
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
    {
        await _authService.ConfirmEmailAsync(request);
        return Ok("Email успешно подтверждён.");
    }

    /// Вход пользователя (если включена 2FA — возвращается Requires2FA).
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (accessToken, refreshToken, requires2FA) = await _authService.LoginAsync(request);

        if (requires2FA)
        {
            return Ok(new { Requires2FA = true });
        }

        return Ok(new { AccessToken = accessToken, RefreshToken = refreshToken });
    }

    /// Подтверждение входа по 2FA-коду.
    [HttpPost("verify-2fa")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorRequest request)
    {
        var (accessToken, refreshToken) = await _authService.VerifyTwoFactorAsync(request);
        return Ok(new { AccessToken = accessToken, RefreshToken = refreshToken });
    }

    /// Отправка письма для сброса пароля.
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.ForgotPasswordAsync(request);
        return Ok("Ссылка для сброса пароля отправлена на email.");
    }

    /// Сброс пароля по ссылке и токену.
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok("Пароль успешно сброшен.");
    }

    /// Обновление access/refresh токенов по refresh-токену.
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var (accessToken, refreshToken) = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(new { AccessToken = accessToken, RefreshToken = refreshToken });
    }
}
