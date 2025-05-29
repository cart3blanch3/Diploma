using AToyStore.Application.Favorites.Interfaces;
using AToyStore.Core.Favorites.Entities;
using AToyStore.Core.Favorites.Interfaces;
using System;

namespace AToyStore.Application.Favorites.Services;

public class FavoriteService : IFavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;

    public FavoriteService(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task<List<FavoriteItem>> GetFavoritesAsync(string userId)
    {
        return await _favoriteRepository.GetByUserAsync(userId);
    }

    public async Task AddToFavoritesAsync(string userId, Guid productId)
    {
        var exists = await _favoriteRepository.ExistsAsync(userId, productId);
        if (exists)
            return;

        var favorite = new FavoriteItem
        {
            UserId = userId,
            ProductId = productId
        };

        await _favoriteRepository.AddAsync(favorite);
    }

    public async Task RemoveFromFavoritesAsync(string userId, Guid productId)
    {
        await _favoriteRepository.RemoveAsync(userId, productId);
    }

}