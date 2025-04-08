using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AToyStore.API.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        // ✅ Доступен только аутентифицированным пользователям
        [HttpGet]
        [Authorize]
        public IActionResult GetProducts()
        {
            return Ok(new { Message = "Доступ разрешен, токен действителен!" });
        }

        // ✅ Доступ только администраторам
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult CreateProduct()
        {
            return Ok(new { Message = "Продукт создан (только для Admin)" });
        }
    }
}
