using AToyStore.Core.Favorites.Entities;
using AToyStore.Core.Favorites.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AToyStore.Infrastructure.Favorites;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly AppDbContext _context;

    public FavoriteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FavoriteItem>> GetByUserAsync(string userId)
    {
        return await _context.Favorites
            .Include(f => f.Product)
                .ThenInclude(p => p.Images) 
            .Where(f => f.UserId == userId)
            .ToListAsync();
    }

    public async Task AddAsync(FavoriteItem item)
    {
        _context.Favorites.Add(item);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(string userId, Guid productId)
    {
        var item = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

        if (item != null)
        {
            _context.Favorites.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string userId, Guid productId)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.ProductId == productId);
    }
}
