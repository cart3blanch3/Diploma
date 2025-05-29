using AToyStore.API.DTOs;
using AToyStore.Core.Products.Entities;

namespace AToyStore.API.Mappers;

public static class ProductMapper
{
    public static ProductDto ToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Title = product.Title,
            Description = product.Description,
            Price = product.Price,
            Category = product.Category,
            Quantity = product.Quantity,
            Images = product.Images.Select(i => i.Url).ToList(),
            ReviewsCount = product.Reviews?.Count ?? 0,
            AverageRating = product.Reviews != null && product.Reviews.Count > 0
                ? product.Reviews.Average(r => r.Rating)
                : 0
        };
    }
}
