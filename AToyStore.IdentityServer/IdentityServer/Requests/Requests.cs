using System.ComponentModel.DataAnnotations;

namespace IdentityServer.Requests
{
    public record RegisterRequest(
        [Required(ErrorMessage = "Введите имя")]
        [StringLength(100, ErrorMessage = "Имя должно содержать до 100 символов")]
        string FullName,

        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        string Email,

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(12, ErrorMessage = "Пароль должен содержать минимум 12 символов")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).+$",
            ErrorMessage = "Пароль должен содержать заглавную, строчную буквы, цифру и спецсимвол")]
        string Password,

        bool EnableTwoFactor
    );

    public record LoginRequest(
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        string Email,

        [Required(ErrorMessage = "Пароль обязателен")]
        string Password,

        [Required(ErrorMessage = "Отпечаток устройства обязателен")]
        string Fingerprint
    );


    public record VerifyTwoFactorRequest(
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        string Email,

        [Required(ErrorMessage = "Код обязателен")]
        string Code,

        [Required(ErrorMessage = "Отпечаток устройства обязателен")]
        string Fingerprint
    );


    public record ForgotPasswordRequest(
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        string Email
    );

    public record ResetPasswordRequest(
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        string Email,

        [Required(ErrorMessage = "Токен обязателен")]
        string Token,

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(12, ErrorMessage = "Пароль должен содержать минимум 12 символов")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).+$",
            ErrorMessage = "Пароль должен содержать заглавную, строчную буквы, цифру и спецсимвол")]
        string NewPassword
    );

    public record ConfirmEmailRequest(
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        string Email = "",

        [Required(ErrorMessage = "Токен обязателен")]
        string Token = ""
    );

    public record RefreshTokenRequest(
        [Required(ErrorMessage = "Отпечаток устройства обязателен")]
        string Fingerprint
    );
}
