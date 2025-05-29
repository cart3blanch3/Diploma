namespace AToyStore.API.DTOs.Orders
{
    public class CreateOrderDto
    {
        public string UserId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public List<CreateOrderItemDto> Items { get; set; } = new();
        public CreatePaymentInfoDto Payment { get; set; } = new();
        public CreateShippingInfoDto Shipping { get; set; } = new();
        public string Note { get; set; } = string.Empty;
    }
}
