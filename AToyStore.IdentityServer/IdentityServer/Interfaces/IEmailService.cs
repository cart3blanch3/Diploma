namespace IdentityServer.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string message);
}
