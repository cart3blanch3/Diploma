namespace AToyStore.API.DTOs
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public List<string> Images { get; set; } = new();

        public double AverageRating { get; set; }
        public int ReviewsCount { get; set; }
    }
}
