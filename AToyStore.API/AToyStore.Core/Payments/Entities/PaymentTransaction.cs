public class PaymentTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "RUB";
    public string Status { get; set; } = "pending";
    public bool Paid { get; set; }
    public Guid OrderId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ConfirmationUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; } // ← ДОБАВИТЬ
}
