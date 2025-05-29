using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Orders.Models;
using AToyStore.Core.Products.Common.Models;

namespace AToyStore.Application.Orders.Interfaces;

public interface IOrderService
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<PagedResult<Order>> GetAllAsync(int pageNumber, int pageSize);
    Task<PagedResult<Order>> GetFilteredAsync(OrderFilter filter);
    Task<Order> CreateAsync(Order order);
    Task<bool> UpdateAsync(Order order); 
    Task<bool> DeleteAsync(Guid id);
    Task<bool> MarkAsPaidAsync(Guid orderId);
}
