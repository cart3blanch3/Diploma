using Microsoft.AspNetCore.Identity;

namespace IdentityServer.Services;

// Кастомная реализация хэширования паролей с использованием алгоритма BCrypt
public class BcryptPasswordHasher<TUser> : IPasswordHasher<TUser> where TUser : class
{
    // WorkFactor определяет сложность хэша (2^12 итераций)
    private const int WorkFactor = 12;

    // Хэширование пароля пользователя
    public string HashPassword(TUser user, string password)
    {
        // Проверка, что пароль задан
        if (password == null)
            throw new ArgumentNullException(nameof(password));

        // Возврат хэшированного пароля (с вшитой солью)
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: WorkFactor);
    }

    // Проверка соответствия введённого пароля сохранённому хэшу
    public PasswordVerificationResult VerifyHashedPassword(TUser user, string hashedPassword, string providedPassword)
    {
        // Проверка, что значения не null
        if (hashedPassword == null || providedPassword == null)
            return PasswordVerificationResult.Failed;

        // Сравнение введённого пароля с хэшем
        return BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword)
            ? PasswordVerificationResult.Success
            : PasswordVerificationResult.Failed;
    }
}
