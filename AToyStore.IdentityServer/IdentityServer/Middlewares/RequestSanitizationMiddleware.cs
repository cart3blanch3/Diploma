using System.Text;
using System.Text.Json;
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
                                Log.Fatal("🚨 Обнаружена потенциальная атака в поле '{Field}': {Value}", key, str);
                                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                                await context.Response.WriteAsync("Неверный или вредоносный ввод обнаружен.");
                                return;
                            }
                        }
                    }
                }
            }
            catch
            {
                Log.Warning("⚠️ Не удалось распарсить JSON для анализа.");
            }
        }

        await _next(context);
    }

    private bool ContainsMaliciousInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return false;

        var patterns = new[]
        {
            "<script", "</script", "onerror=", "onload=", "alert(", "DROP TABLE", "SELECT ", "INSERT ", "DELETE ", "UNION ", "--", "' OR '1'='1", "xp_cmdshell"
        };

        return patterns.Any(p => input.IndexOf(p, StringComparison.OrdinalIgnoreCase) >= 0);
    }
}
