using AToyStore.Core.Reviews.Entities;
using Core.Products.Entities;

namespace AToyStore.Core.Products.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; } 

    public List<ProductImage> Images { get; set; } = new();
    public List<ProductReview> Reviews { get; set; } = new();
}
