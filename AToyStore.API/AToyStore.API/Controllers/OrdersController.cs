using AToyStore.API.DTOs.Orders;
using AToyStore.Application.Orders.Interfaces;
using AToyStore.Application.Payments.Interfaces;
using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Payments.Entities;
using Microsoft.AspNetCore.Mvc;
using OrderPaymentInfo = AToyStore.Core.Orders.Entities.PaymentInfo;

namespace AToyStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IPaymentService _paymentService;

    public OrdersController(IOrderService orderService, IPaymentService paymentService)
    {
        _orderService = orderService;
        _paymentService = paymentService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            Note = dto.Note ?? string.Empty,
            TotalPrice = dto.TotalPrice,
            CreatedAt = DateTime.UtcNow,
            Payment = new OrderPaymentInfo
            {
                Id = Guid.NewGuid(),
                Method = dto.Payment.Method,
                IsPaid = dto.Payment.IsPaid,
                PaidAt = dto.Payment.IsPaid ? DateTime.UtcNow : null
            },
            Shipping = new ShippingInfo
            {
                Id = Guid.NewGuid(),
                Address = dto.Shipping.Address,
                City = dto.Shipping.City,
                Country = dto.Shipping.Country
            },
            Items = dto.Items.Select(item => new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList()
        };

        // Сохраняем заказ в БД
        await _orderService.CreateAsync(order);

        // Если выбрана онлайн-оплата, создаём платёж в YooKassa
        if (dto.Payment.Method == "YooKassa")
        {
            var payment = await _paymentService.CreatePaymentAsync(new CreatePaymentRequest
            {
                UserId = dto.UserId,
                OrderId = order.Id.ToString(),
                Amount = dto.TotalPrice,
                Description = $"Оплата заказа {order.Id}",
                ReturnUrl = $"http://localhost:3000/payment-success?orderId={order.Id}"
            });

            return Ok(new
            {
                orderId = order.Id,
                paymentUrl = payment.ConfirmationUrl 
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        return Ok(order);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _orderService.GetAllAsync(pageNumber, pageSize);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID в URL и теле запроса не совпадают.");

        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        order.Status = dto.Status;
        var success = await _orderService.UpdateAsync(order);

        return success ? NoContent() : StatusCode(500, "Не удалось обновить заказ");
    }

    [HttpPut("edit/{id}")]
    public async Task<IActionResult> Edit(Guid id, [FromBody] UpdateOrderDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID в URL и теле запроса не совпадают.");

        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        order.CustomerName = dto.CustomerName;
        order.CustomerPhone = dto.CustomerPhone;
        order.Note = dto.Note;
        order.Status = dto.Status;
        order.Shipping.Address = dto.Shipping.Address;
        order.Shipping.City = dto.Shipping.City;
        order.Shipping.Country = dto.Shipping.Country;

        var success = await _orderService.UpdateAsync(order);
        return success ? NoContent() : StatusCode(500, "Не удалось обновить заказ");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        var success = await _orderService.DeleteAsync(id);
        return success ? NoContent() : StatusCode(500, "Не удалось удалить заказ");
    }
}