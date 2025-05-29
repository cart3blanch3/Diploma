using AToyStore.Application.Orders.Interfaces;
using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Orders.Interfaces;
using AToyStore.Core.Orders.Models;
using AToyStore.Core.Products.Common.Models;

namespace AToyStore.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;

    public OrderService(IOrderRepository orderRepository, IProductRepository productRepository)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        return await _orderRepository.GetByIdAsync(id);
    }

    public async Task<PagedResult<Order>> GetAllAsync(int pageNumber, int pageSize)
    {
        return await _orderRepository.GetAllAsync(pageNumber, pageSize);
    }

    public async Task<PagedResult<Order>> GetFilteredAsync(OrderFilter filter)
    {
        return await _orderRepository.GetFilteredAsync(filter);
    }

    public async Task<Order> CreateAsync(Order order)
    {
        foreach (var item in order.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);

            if (product == null)
                throw new Exception($"Product with ID {item.ProductId} not found");

            if (product.Quantity >= item.Quantity)
            {
                // Хватает в наличии — вычитаем
                product.Quantity -= item.Quantity;
            }
            else
            {
                // Не хватает — всё, что есть, вычитаем, остальное будет сделано на заказ
                product.Quantity = 0;
            }

            await _productRepository.UpdateAsync(product);
        }

        await _orderRepository.AddAsync(order);
        return order;
    }

    public async Task<bool> UpdateAsync(Order order)
    {
        var existing = await _orderRepository.GetByIdAsync(order.Id);
        if (existing == null)
            return false;

        existing.Status = order.Status;
        existing.Shipping = order.Shipping;
        existing.Payment = order.Payment;

        await _orderRepository.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _orderRepository.GetByIdAsync(id);
        if (existing == null)
            return false;

        await _orderRepository.DeleteAsync(existing);
        return true;
    }

    public async Task<bool> MarkAsPaidAsync(Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
            return false;

        order.Status = OrderStatus.Paid;
        order.Payment.IsPaid = true;
        order.Payment.PaidAt = DateTime.UtcNow;

        await _orderRepository.UpdateAsync(order);
        return true;
    }
}
