namespace AToyStore.Core.Reviews.Entities;

public class ProductReview
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int Rating { get; set; } // 1-5
    public DateTime CreatedAt { get; set; }
}
