using AToyStore.Application.Orders.Interfaces;
using AToyStore.Application.Payments.Interfaces;
using AToyStore.Core.Payments.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AToyStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IOrderService _orderService;

    public PaymentsController(IPaymentService paymentService, IOrderService orderService)
    {
        _paymentService = paymentService;
        _orderService = orderService;
    }

    /// <summary>
    /// Создание нового платежа
    /// </summary>
    [HttpPost("create")]
    [Authorize] // Убери, если не используешь авторизацию
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            // Если авторизация используется, можно брать ID из токена:
            // request.UserId = User.FindFirst("sub")?.Value ?? string.Empty;
            return BadRequest("UserId обязателен.");
        }

        var result = await _paymentService.CreatePaymentAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Получение статуса платежа
    /// </summary>
    [HttpGet("status/{paymentId}")]
    public async Task<IActionResult> GetPaymentStatus(string paymentId)
    {
        var result = await _paymentService.CheckPaymentStatusAsync(paymentId);

        if (result.Paid && !string.IsNullOrWhiteSpace(result.OrderId))
        {
            await _orderService.MarkAsPaidAsync(Guid.Parse(result.OrderId));
        }

        return Ok(result);
    }

    [HttpGet("by-order/{orderId}")]
    public async Task<IActionResult> GetPaymentByOrder(Guid orderId)
    {
        var transaction = await _paymentService.GetPaymentByOrderIdAsync(orderId);
        if (transaction == null)
            return NotFound();

        return Ok(new { paymentId = transaction.PaymentId });
    }
}
