namespace Core.Products.Models
{
    public class ProductFilter
    {
        public string? Query { get; set; }
        public string? Category { get; set; }

        public int? MinQuantity { get; set; } 

        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;

        // Пагинация
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
