using AToyStore.Core.Orders.Entities;

namespace AToyStore.API.DTOs.Orders
{
    public class UpdateOrderDto
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public OrderStatus Status { get; set; }
        public ShippingInfoDto Shipping { get; set; } = new();
    }

    public class ShippingInfoDto
    {
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }
}
