using AToyStore.Core.Products.Common.Models;
using AToyStore.Core.Products.Entities;
using Core.Products.Models;

namespace AToyStore.Application.Products.Interfaces;

public interface IProductService
{
    Task<PagedResult<Product>> GetAllAsync(int pageNumber, int pageSize);
    Task<Product?> GetByIdAsync(Guid id);
    Task<PagedResult<Product>> SearchAsync(string keyword, int pageNumber, int pageSize);
    Task<PagedResult<Product>> FilterAsync(ProductFilter filter);
    Task<Product> CreateAsync(Product product);
    Task<bool> UpdateAsync(Product product);
    Task<bool> DeleteAsync(Guid id);
}
