namespace AToyStore.API.DTOs
{
    public class ProductReviewDto
    {
        public Guid Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UserId { get; set; }
        public string? FullName { get; set; }
    }
}
