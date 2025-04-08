using Microsoft.AspNetCore.Identity;

namespace IdentityServer.Models;

/// Пользователь системы, расширяющий стандартную модель IdentityUser
public class User : IdentityUser
{
    // Полное имя пользователя
    public string FullName { get; set; } = string.Empty;

    // Коллекция refresh-токенов, выданных пользователю
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
