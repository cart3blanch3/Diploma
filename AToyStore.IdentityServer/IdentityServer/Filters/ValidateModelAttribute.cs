using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace IdentityServer.Filters;

/// <summary>
/// Фильтр, автоматически проверяющий валидность модели и возвращающий 400 Bad Request при ошибках валидации.
/// </summary>
public class ValidateModelAttribute : ActionFilterAttribute
{
    // Метод вызывается перед выполнением действия контроллера
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        // Если модель невалидна (не прошла валидацию аннотаций)
        if (!context.ModelState.IsValid)
        {
            // Собираем ошибки валидации: ключ — имя свойства, значение — массив сообщений
            var errors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            // Возвращаем клиенту подробный ответ с ошибками (400 Bad Request)
            context.Result = new BadRequestObjectResult(new ValidationProblemDetails(errors)
            {
                Title = "Ошибка валидации",
                Status = StatusCodes.Status400BadRequest,
                Detail = "Один или несколько параметров не прошли проверку."
            });
        }
    }
}
