using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Serilog;

public class RequestSanitizationMiddleware
{
    private readonly RequestDelegate _next;

    public RequestSanitizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.ContentType != null && context.Request.ContentType.Contains("application/json"))
        {
            context.Request.EnableBuffering();

            using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
            var rawBody = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;

            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(rawBody, options);

                if (dict != null)
                {
                    foreach (var (key, value) in dict)
                    {
                        if (value is JsonElement element && element.ValueKind == JsonValueKind.String)
                        {
                            var str = element.GetString() ?? "";
                            if (ContainsMaliciousInput(str))
                            {
                                var statusCode = StatusCodes.Status400BadRequest;

                                var problemDetails = new ProblemDetails
                                {
                                    Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                                    Title = "One or more validation errors occurred.",
                                    Status = statusCode,
                                    Detail = $"Потенциально вредоносный ввод обнаружен в поле '{key}'",
                                    Instance = context.Request.Path
                                };

                                problemDetails.Extensions["errors"] = new Dictionary<string, string[]>
                                {
                                    { key, new[] { "Обнаружена потенциальная XSS/SQL-инъекция или недопустимый ввод." } }
                                };

                                Log.Fatal("Обнаружена потенциальная атака в поле '{Field}': {Value}", key, str);

                                context.Response.StatusCode = statusCode;
                                context.Response.ContentType = "application/problem+json";
                                await context.Response.WriteAsJsonAsync(problemDetails);
                                return;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Warning("Не удалось распарсить JSON для анализа: {Message}", ex.Message);
            }
        }

        await _next(context);
    }

    private bool ContainsMaliciousInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return false;

        var patterns = new[]
        {
            "<script", "</script", "onerror=", "onload=", "alert(", "DROP TABLE", "SELECT ", "INSERT ",
            "DELETE ", "UNION ", "--", "' OR '1'='1", "xp_cmdshell"
        };

        return patterns.Any(p => input.IndexOf(p, StringComparison.OrdinalIgnoreCase) >= 0);
    }
}
