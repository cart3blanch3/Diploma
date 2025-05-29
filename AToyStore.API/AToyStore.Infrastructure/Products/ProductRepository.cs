using AToyStore.Core.Products.Common.Models;
using AToyStore.Core.Products.Entities;
using AToyStore.Infrastructure;
using Core.Products;
using Core.Products.Models;
using Microsoft.EntityFrameworkCore;

namespace AToyStore.Infrastructure.Products;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .ToListAsync();
    }

    public async Task<PagedResult<Product>> GetFilteredAsync(ProductFilter filter)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            query = query.Where(p =>
                EF.Functions.ILike(p.Title, $"%{filter.Query}%") ||
                EF.Functions.ILike(p.Description, $"%{filter.Query}%"));
        }

        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(p => p.Category == filter.Category);

        if (filter.MinQuantity.HasValue)
            query = query.Where(p => p.Quantity >= filter.MinQuantity.Value);

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);

        query = filter.SortBy?.ToLower() switch
        {
            "price" => filter.SortDescending
                ? query.OrderByDescending(p => p.Price)
                : query.OrderBy(p => p.Price),

            "title" => filter.SortDescending
                ? query.OrderByDescending(p => p.Title)
                : query.OrderBy(p => p.Title),

            _ => query.OrderByDescending(p => p.Id)
        };

        var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
        var pageSize = filter.PageSize < 1 ? 20 : filter.PageSize;
        var skip = (pageNumber - 1) * pageSize;

        var totalCount = await query.CountAsync();
        var items = await query.Skip(skip).Take(pageSize).ToListAsync();

        return new PagedResult<Product>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task AddAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Product product)
    {
        var existing = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == product.Id);

        if (existing != null)
        {
            // Обновление основных полей
            _context.Entry(existing).CurrentValues.SetValues(product);

            // Только добавление новых изображений, если они есть
            if (product.Images != null && product.Images.Any())
            {
                foreach (var newImage in product.Images)
                {
                    // Убедимся, что URL уникален, чтобы не дублировать
                    if (!existing.Images.Any(img => img.Url == newImage.Url))
                    {
                        existing.Images.Add(newImage);
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteAsync(Product product)
    {
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }
}
