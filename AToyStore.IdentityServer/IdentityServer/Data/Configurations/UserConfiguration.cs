using IdentityServer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdentityServer.Data.Configurations;

/// Конфигурация сущности User 
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Индекс на поле Email (уникальный)
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        // Полное имя пользователя — обязательно и не более 100 символов
        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(100);

        // Email — обязательно, ограничение длины
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        // UserName — обязательно, ограничение длины
        builder.Property(u => u.UserName)
            .IsRequired()
            .HasMaxLength(100);

        // NormalizedUserName — ограничение длины
        builder.Property(u => u.NormalizedUserName)
            .HasMaxLength(100);

        // NormalizedEmail — ограничение длины
        builder.Property(u => u.NormalizedEmail)
            .HasMaxLength(255);

        // Отметка для отслеживания параллельных изменений
        builder.Property(u => u.ConcurrencyStamp)
            .IsConcurrencyToken();
    }
}
