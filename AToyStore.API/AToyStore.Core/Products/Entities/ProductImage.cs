namespace Core.Products.Entities;

public class ProductImage
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
}
