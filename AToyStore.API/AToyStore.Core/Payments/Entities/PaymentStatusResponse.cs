namespace AToyStore.Core.Payments.Entities;

public class PaymentStatusResponse
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool Paid { get; set; }
    public string OrderId { get; set; } = string.Empty; 

}
