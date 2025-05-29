using AToyStore.Core.Products.Entities;

namespace AToyStore.Core.Favorites.Entities;

public class FavoriteItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = string.Empty; 
    public Guid ProductId { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public Product Product { get; set; } = null!;
}
