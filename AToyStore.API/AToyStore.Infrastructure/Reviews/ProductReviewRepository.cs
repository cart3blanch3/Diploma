using AToyStore.Core.Products.Entities;
using AToyStore.Core.Reviews.Entities;
using AToyStore.Core.Reviews.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AToyStore.Infrastructure.Reviews;

public class ProductReviewRepository : IProductReviewRepository
{
    private readonly AppDbContext _context;

    public ProductReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductReview>> GetByProductIdAsync(Guid productId)
    {
        return await _context.ProductReviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<ProductReview?> GetByIdAsync(Guid id)
    {
        return await _context.ProductReviews.FindAsync(id);
    }

    public async Task AddAsync(ProductReview review)
    {
        _context.ProductReviews.Add(review);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(ProductReview review)
    {
        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ProductReview>> GetByUserIdAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid))
            return new List<ProductReview>();

        return await _context.ProductReviews
            .Where(r => r.UserId == userGuid)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
