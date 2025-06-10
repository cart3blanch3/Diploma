using AToyStore.Core.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Serilog;


namespace AToyStore.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");

        var email = new MimeMessage
        {
            Subject = subject
        };

        email.From.Add(new MailboxAddress("AToyStore", smtpSettings["User"]));
        email.To.Add(new MailboxAddress(toEmail, toEmail));

        email.Body = new BodyBuilder
        {
            HtmlBody = message
        }.ToMessageBody();

        using var smtp = new SmtpClient();

        try
        {
            if (!int.TryParse(smtpSettings["Port"], out var port))
                throw new InvalidOperationException("SMTP-порт не указан или указан некорректно в конфигурации.");

            await smtp.ConnectAsync(
                smtpSettings["Server"],
                port,
                SecureSocketOptions.SslOnConnect
            );

            await smtp.AuthenticateAsync(
                smtpSettings["User"],
                smtpSettings["Password"]
            );

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            Log.Error(
                "Ошибка отправки email: {To} | Subject: {Subject} | Ошибка: {Message}",
                toEmail, subject, ex.Message
            );
            throw new Exception($"Ошибка отправки email: {ex.Message}", ex);
        }
    }
}