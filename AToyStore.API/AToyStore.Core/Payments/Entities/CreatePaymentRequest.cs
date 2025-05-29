namespace AToyStore.Core.Payments.Entities
{
    public class CreatePaymentRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty; 
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
    }
}
