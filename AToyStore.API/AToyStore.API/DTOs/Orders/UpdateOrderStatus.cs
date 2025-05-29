using AToyStore.Core.Orders.Entities;

namespace AToyStore.API.DTOs.Orders
{
    public class UpdateOrderStatusDto
    {
        public Guid Id { get; set; }
        public OrderStatus Status { get; set; }
    }
}
