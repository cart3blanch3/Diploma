namespace AToyStore.Core.Orders.Entities
{
    public class ShippingInfo
    {
        public Guid Id { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public DateTime? ShippedAt { get; set; }
    }
}
