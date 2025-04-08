using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace IdentityServer.Middlewares;

// Middleware, добавляющий заголовки безопасности ко всем HTTP-ответам
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Защита от XSS (не даёт браузеру выполнять вредоносные скрипты)
        headers["X-XSS-Protection"] = "1; mode=block";

        // Запрещает браузеру угадывать тип содержимого (MIME-sniffing)
        headers["X-Content-Type-Options"] = "nosniff";

        // Блокирует возможность встраивания сайта через <iframe> (Clickjacking)
        headers["X-Frame-Options"] = "DENY";

        // CSP: запрещает загрузку ресурсов с других источников
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self'; " +
            "object-src 'none'; " +
            "frame-ancestors 'none'; " +
            "base-uri 'self';";

        // Отключает передачу Referer-заголовка для защиты от утечек
        headers["Referrer-Policy"] = "no-referrer";

        // HSTS — сообщает браузеру всегда использовать HTTPS (включить для HTTPS)
        //headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";

        // Запрещает доступ к API браузера (геолокация, камера, микрофон и т.д.)
        headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), fullscreen=(self)";

        // Изоляция текущего окна от других вкладок (защита от атак типа Spectre)
        headers["Cross-Origin-Opener-Policy"] = "same-origin";
        headers["Cross-Origin-Embedder-Policy"] = "require-corp";

        await _next(context);
    }
}

// Расширение для подключения middleware в конвейер
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
