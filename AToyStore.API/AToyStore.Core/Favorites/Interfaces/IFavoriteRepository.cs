using AToyStore.Core.Favorites.Entities;

namespace AToyStore.Core.Favorites.Interfaces;

public interface IFavoriteRepository
{
    Task<List<FavoriteItem>> GetByUserAsync(string userId);
    Task AddAsync(FavoriteItem item);
    Task RemoveAsync(string userId, Guid productId);
    Task<bool> ExistsAsync(string userId, Guid productId);
}
