using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityServer.Models;

/// <summary>
/// Модель refresh-токена для обновления JWT без повторной аутентификации.
/// </summary>
public class RefreshToken
{
    // Уникальный идентификатор токена
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // Строка токена (хранится в базе, используется клиентом)
    [Required]
    [MaxLength(512)]
    public string Token { get; set; } = string.Empty;

    // Дата и время истечения срока действия токена
    public DateTime ExpiresAt { get; set; }

    // Признак отзыва токена (например, при смене пароля)
    public bool IsRevoked { get; set; }

    // Признак использования токена (токен можно использовать только один раз)
    public bool IsUsed { get; set; }

    // Идентификатор пользователя, которому выдан токен
    [Required]
    public string UserId { get; set; } = string.Empty;

    // Навигационное свойство — ссылка на пользователя
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}
