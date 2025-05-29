namespace AToyStore.Core.Payments.Entities;

public class PaymentInfo
{
    public string Id { get; set; } = string.Empty; // ID платежа в YooMoney
    public string OrderId { get; set; } = string.Empty; // Локальный ID заказа
    public string Status { get; set; } = string.Empty; // Статус платежа
    public decimal Amount { get; set; } // Сумма
    public string Currency { get; set; } = "RUB"; // Валюта
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Дата создания
    public string? PaymentUrl { get; set; } // URL для перехода пользователя на оплату
}
