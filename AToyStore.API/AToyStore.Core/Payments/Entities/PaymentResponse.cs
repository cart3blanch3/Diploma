namespace AToyStore.Core.Payments.Entities;

public class PaymentResponse
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ConfirmationUrl { get; set; } = string.Empty;
}
