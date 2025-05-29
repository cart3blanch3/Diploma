using AToyStore.Core.Products.Common.Models;
using AToyStore.Core.Products.Entities;
using Core.Products.Models;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<PagedResult<Product>> GetFilteredAsync(ProductFilter filter);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(Product product);
}
