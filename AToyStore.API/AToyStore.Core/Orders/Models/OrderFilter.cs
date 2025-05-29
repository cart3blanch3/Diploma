using AToyStore.Core.Orders.Entities;

namespace AToyStore.Core.Orders.Models
{
    public class OrderFilter
    {
        public OrderStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? UserId { get; set; }
        public string? SearchQuery { get; set; }
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
