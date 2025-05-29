namespace AToyStore.Core.Orders.Entities
{
    public class PaymentInfo
    {
        public Guid Id { get; set; }
        public string Method { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
