using AToyStore.Application.Products.Interfaces;
using AToyStore.Core.Products.Entities;
using AToyStore.Core.Products.Common.Models;
using Core.Products.Models;
using Core.Products;

namespace AToyStore.Application.Products;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<PagedResult<Product>> GetAllAsync(int pageNumber, int pageSize)
    {
        var filter = new ProductFilter
        {
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return await _productRepository.GetFilteredAsync(filter);
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        return await _productRepository.GetByIdAsync(id);
    }

    public async Task<PagedResult<Product>> SearchAsync(string keyword, int pageNumber, int pageSize)
    {
        var filter = new ProductFilter
        {
            Query = keyword,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return await _productRepository.GetFilteredAsync(filter);
    }

    public async Task<PagedResult<Product>> FilterAsync(ProductFilter filter)
    {
        return await _productRepository.GetFilteredAsync(filter);
    }

    public async Task<Product> CreateAsync(Product product)
    {
        await _productRepository.AddAsync(product);
        return product;
    }

    public async Task<bool> UpdateAsync(Product product)
    {
        var existing = await _productRepository.GetByIdAsync(product.Id);
        if (existing == null)
            return false;

        await _productRepository.UpdateAsync(product);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _productRepository.GetByIdAsync(id);
        if (existing == null)
            return false;

        await _productRepository.DeleteAsync(existing);
        return true;
    }
}
