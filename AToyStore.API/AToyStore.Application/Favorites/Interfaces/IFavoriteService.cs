using AToyStore.Core.Favorites.Entities;

namespace AToyStore.Application.Favorites.Interfaces;

public interface IFavoriteService
{
    Task<List<FavoriteItem>> GetFavoritesAsync(string userId);
    Task AddToFavoritesAsync(string userId, Guid productId);
    Task RemoveFromFavoritesAsync(string userId, Guid productId);
}
