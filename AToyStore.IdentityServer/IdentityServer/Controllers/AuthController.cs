using IdentityServer.Interfaces;
using IdentityServer.Requests;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IdentityServer.Controllers;

/// Контроллер, отвечающий за регистрацию, вход, 2FA, подтверждение email и работу с токенами.
[Route("auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
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
            return Ok(new { Requires2FA = true });

        // Установка refresh-токена в HttpOnly-куку
        Response.Cookies.Append("refreshToken", refreshToken!, new CookieOptions
        {
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(60) // Можно вынести в конфиг
        });

        return Ok(new { AccessToken = accessToken });
    }

    /// Подтверждение входа по 2FA-коду.
    [HttpPost("verify-2fa")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorRequest request)
    {
        var (accessToken, refreshToken) = await _authService.VerifyTwoFactorAsync(request);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(60)
        });

        return Ok(new { AccessToken = accessToken });
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
        var (accessToken, refreshToken) = await _authService.RefreshTokenAsync(request.Fingerprint);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(60)
        });

        return Ok(new { AccessToken = accessToken });
    }
}
