using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Orders.Models;
using AToyStore.Core.Products.Common.Models;
using AToyStore.Core.Products.Entities;

namespace AToyStore.Core.Orders.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<PagedResult<Order>> GetAllAsync(int pageNumber, int pageSize);
    Task<PagedResult<Order>> GetFilteredAsync(OrderFilter filter);
    Task AddAsync(Order order);
    Task UpdateAsync(Order order);
    Task DeleteAsync(Order order);
    Task UpdateProductQuantityAsync(Product product);
}
