using AToyStore.Core.Reviews.Entities;

namespace AToyStore.Core.Reviews.Interfaces;

public interface IProductReviewRepository
{
    Task<List<ProductReview>> GetByProductIdAsync(Guid productId);
    Task<ProductReview?> GetByIdAsync(Guid id);
    Task AddAsync(ProductReview review);
    Task DeleteAsync(ProductReview review);
    Task<List<ProductReview>> GetByUserIdAsync(string userId);
}
