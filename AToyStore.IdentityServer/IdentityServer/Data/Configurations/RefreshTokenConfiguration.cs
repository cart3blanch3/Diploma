using IdentityServer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdentityServer.Data.Configurations;

/// Конфигурация сущности RefreshToken 
public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        // Уникальный индекс по полю Token
        builder.HasIndex(rt => rt.Token).IsUnique();

        // Ограничение длины и обязательность поля Token
        builder.Property(rt => rt.Token)
            .IsRequired()
            .HasMaxLength(512);

        // Связь: один пользователь — много refresh-токенов
        builder.HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade); // Удаление токенов при удалении пользователя
    }
}
