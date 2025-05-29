using AToyStore.Core.Products.Entities;
using AToyStore.Core.Reviews.Entities;

namespace AToyStore.Application.Reviews.Interfaces
{
    public interface IProductReviewService
    {
        Task<List<ProductReview>> GetByProductIdAsync(Guid productId);
        Task<ProductReview?> GetByIdAsync(Guid id);
        Task<ProductReview> AddAsync(ProductReview review);
        Task<bool> DeleteAsync(Guid id);
        Task<List<ProductReview>> GetByUserIdAsync(string userId);
    }
}
