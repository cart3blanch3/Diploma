using IdentityServer.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using IdentityServer.Data.Configurations;

namespace IdentityServer.Data;

/// Контекст базы данных, расширяющий IdentityDbContext
public class AppDbContext : IdentityDbContext<User, IdentityRole, string>
{
    /// Таблица refresh-токенов.
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// Конфигурация моделей
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Применяем кастомные конфигурации для сущностей
        builder.ApplyConfiguration(new UserConfiguration());           // Конфигурация пользователя
        builder.ApplyConfiguration(new RefreshTokenConfiguration());   // Конфигурация refresh-токена
    }
}
