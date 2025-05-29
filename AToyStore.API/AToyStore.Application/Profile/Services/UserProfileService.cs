using AToyStore.Core.Profile.Entities;
using AToyStore.Core.Profile.Interfaces;
using AToyStore.Core.Orders.Interfaces;
using AToyStore.Application.Profile.Interfaces;
using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Orders.Models;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IOrderRepository _orderRepository;

    public UserProfileService(IUserProfileRepository userProfileRepository, IOrderRepository orderRepository)
    {
        _userProfileRepository = userProfileRepository;
        _orderRepository = orderRepository;
    }

    public Task<User?> GetByIdAsync(string userId) =>
        _userProfileRepository.GetByIdAsync(userId);

    public Task<bool> UpdateAsync(User profile) =>
        _userProfileRepository.UpdateAsync(profile);

    public Task<bool> SetTwoFactorEnabledAsync(string userId, bool enabled) =>
        _userProfileRepository.SetTwoFactorEnabledAsync(userId, enabled);

    public async Task<List<Order>> GetOrderHistoryAsync(string userId)
    {
        var filter = new OrderFilter
        {
            UserId = userId,
            PageSize = 100, // по умолчанию получим до 100 последних заказов
            PageNumber = 1
        };

        var result = await _orderRepository.GetFilteredAsync(filter);
        return result.Items.ToList();
    }
}
