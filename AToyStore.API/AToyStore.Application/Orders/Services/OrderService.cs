using AToyStore.Application.Orders.Interfaces;
using AToyStore.Core.Common.Interfaces;
using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Orders.Interfaces;
using AToyStore.Core.Orders.Models;
using AToyStore.Core.Products.Common.Models;
using AToyStore.Application.Profile.Interfaces; // Добавлено для IUserProfileService

namespace AToyStore.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IEmailService _emailService;
    private readonly IUserProfileService _userProfileService; // Добавлено

    public OrderService(
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IEmailService emailService,
        IUserProfileService userProfileService)  // Добавлено
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _emailService = emailService;
        _userProfileService = userProfileService; // Добавлено
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
                product.Quantity -= item.Quantity;
            }
            else
            {
                product.Quantity = 0;
            }

            await _productRepository.UpdateAsync(product);
        }

        await _orderRepository.AddAsync(order);

        // Получаем email пользователя по userId
        var user = await _userProfileService.GetByIdAsync(order.UserId);
        var email = user?.Email;

        if (!string.IsNullOrEmpty(email))
        {
            var shortOrderId = order.Id.ToString().Substring(0, 8);
            var subject = $"Ваш заказ #{shortOrderId} успешно создан";
            var message = $"Здравствуйте, <b>{order.CustomerName}</b>!<br/>" +
                          $"Ваш заказ был успешно создан и сейчас обрабатывается.<br/>" +
                          $"Статус заказа: {order.Status}.<br/>" +
                          $"Спасибо за покупку в AToyStore!";

            try
            {
                await _emailService.SendEmailAsync(email, subject, message);
            }
            catch (Exception ex)
            {
                // Логирование ошибки отправки письма, например: Log.Warn(...)
            }
        }

        return order;
    }

    public async Task<bool> UpdateAsync(Order order)
    {
        var existing = await _orderRepository.GetByIdAsync(order.Id);
        if (existing == null)
            return false;

        var oldStatus = existing.Status;
        existing.Status = order.Status;
        existing.Shipping = order.Shipping;
        existing.Payment = order.Payment;

        await _orderRepository.UpdateAsync(existing);

        // Если статус изменился — отправляем письмо
        if (oldStatus != order.Status)
        {
            var user = await _userProfileService.GetByIdAsync(order.UserId);
            var email = user?.Email;

            if (!string.IsNullOrEmpty(email))
            {
                var shortOrderId = order.Id.ToString().Substring(0, 8);
                var subject = $"Статус вашего заказа #{shortOrderId} изменён";
                var message = $"Здравствуйте, <b>{order.CustomerName}</b>!<br/>" +
                              $"Статус вашего заказа #{order.Id} был изменён на «{order.Status}».<br/>" +
                              $"Спасибо, что выбираете AToyStore!";

                try
                {
                    await _emailService.SendEmailAsync(email, subject, message);
                }
                catch (Exception ex)
                {
                    // Логирование ошибки, например: Log.Warn(...)
                }
            }
        }

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

        var user = await _userProfileService.GetByIdAsync(order.UserId);
        var email = user?.Email;

        if (!string.IsNullOrEmpty(email))
        {
            var shortOrderId = order.Id.ToString().Substring(0, 8);
            var subject = $"Оплата заказа #{shortOrderId} подтверждена";
            var message = $"Здравствуйте, <b>{order.CustomerName}</b>!<br/>" +
                          $"Спасибо за оплату заказа #{order.Id}.<br/>" +
                          $"Статус вашего заказа обновлен на «Оплачен».<br/>" +
                          $"Мы скоро отправим ваш заказ.";

            try
            {
                await _emailService.SendEmailAsync(email, subject, message);
            }
            catch (Exception ex)
            {
                // Логирование ошибки отправки письма
            }
        }

        return true;
    }
}
