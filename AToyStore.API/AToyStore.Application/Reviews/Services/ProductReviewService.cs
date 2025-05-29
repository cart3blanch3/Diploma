using AToyStore.Application.Reviews.Interfaces;
using AToyStore.Core.Reviews.Entities;
using AToyStore.Core.Reviews.Interfaces;

namespace AToyStore.Application.Reviews.Services
{
    public class ProductReviewService : IProductReviewService
    {
        private readonly IProductReviewRepository _reviewRepository;

        public ProductReviewService(IProductReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        public async Task<List<ProductReview>> GetByProductIdAsync(Guid productId)
        {
            return await _reviewRepository.GetByProductIdAsync(productId);
        }

        public async Task<ProductReview?> GetByIdAsync(Guid id)
        {
            return await _reviewRepository.GetByIdAsync(id);
        }

        public async Task<ProductReview> AddAsync(ProductReview review)
        {
            review.CreatedAt = DateTime.UtcNow;
            await _reviewRepository.AddAsync(review);
            return review;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
                return false;

            await _reviewRepository.DeleteAsync(review);
            return true;
        }

        public async Task<List<ProductReview>> GetByUserIdAsync(string userId)
        {
            return await _reviewRepository.GetByUserIdAsync(userId);
        }
    }
}
