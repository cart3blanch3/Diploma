namespace AToyStore.Core.Orders.Entities
{
    public class Order
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public decimal TotalPrice { get; set; }

        public List<OrderItem> Items { get; set; } = new();
        public PaymentInfo Payment { get; set; } = new();
        public ShippingInfo Shipping { get; set; } = new();
    }
}
