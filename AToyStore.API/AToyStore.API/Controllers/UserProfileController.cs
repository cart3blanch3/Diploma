using AToyStore.Application.Profile.Interfaces;
using AToyStore.Core.Profile.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AToyStore.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly IUserProfileService _userProfileService;

    public UserProfileController(IUserProfileService userProfileService)
    {
        _userProfileService = userProfileService;
    }

    // Получение профиля текущего пользователя
    [HttpGet]
    public async Task<ActionResult<User>> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _userProfileService.GetByIdAsync(userId);
        return user == null ? NotFound() : Ok(user);
    }

    // Обновление профиля (имя, email)
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] User updatedProfile)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null || userId != updatedProfile.Id)
            return Forbid();

        var success = await _userProfileService.UpdateAsync(updatedProfile);
        return success ? Ok("Профиль обновлён") : BadRequest("Не удалось обновить профиль");
    }

    // Включение / отключение 2FA
    [HttpPost("2fa")]
    public async Task<IActionResult> SetTwoFactor([FromQuery] bool enabled)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var success = await _userProfileService.SetTwoFactorEnabledAsync(userId, enabled);
        return success ? Ok($"2FA {(enabled ? "включена" : "отключена")}") : BadRequest("Ошибка изменения статуса 2FA");
    }

    // История заказов
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrderHistory()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var orders = await _userProfileService.GetOrderHistoryAsync(userId);
        return Ok(orders);
    }
}
