using IdentityServer.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Serilog;

namespace IdentityServer.Services;

// Сервис отправки email-сообщений через SMTP
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    // Конструктор — инициализирует конфигурацию
    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Асинхронная отправка письма
    public async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        // Получаем настройки SMTP из конфигурации
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        // Формируем письмо
        var email = new MimeMessage
        {
            Subject = subject
        };

        // Устанавливаем отправителя
        email.From.Add(new MailboxAddress("AToyStore", smtpSettings["User"]));

        // Устанавливаем получателя
        email.To.Add(new MailboxAddress(toEmail, toEmail));

        // Формируем HTML-содержимое письма
        email.Body = new BodyBuilder
        {
            HtmlBody = message
        }.ToMessageBody();

        using var smtp = new SmtpClient();

        try
        {
            // Получаем порт и проверяем его наличие
            if (!int.TryParse(smtpSettings["Port"], out var port))
                throw new InvalidOperationException("SMTP-порт не указан или указан некорректно в конфигурации.");

            await smtp.ConnectAsync(
                smtpSettings["Server"],
                port,
                SecureSocketOptions.SslOnConnect
            );

            // Выполняем аутентификацию
            await smtp.AuthenticateAsync(
                smtpSettings["User"],
                smtpSettings["Password"]
            );

            // Отправляем письмо
            await smtp.SendAsync(email);

            // Отключаемся от сервера
            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            // Логируем ошибку
            Log.Error(
                "Ошибка отправки email: {To} | Subject: {Subject} | Ошибка: {Message}",
                toEmail, subject, ex.Message
            );

            // Пробрасываем исключение выше
            throw new Exception($"Ошибка отправки email: {ex.Message}", ex);
        }
    }
}
