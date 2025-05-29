using AToyStore.Core.Orders.Entities;
using AToyStore.Core.Profile.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AToyStore.Application.Profile.Interfaces
{
    public interface IUserProfileService
    {
        Task<User?> GetByIdAsync(string userId);
        Task<bool> UpdateAsync(User profile);
        Task<bool> SetTwoFactorEnabledAsync(string userId, bool enabled);

        Task<List<Order>> GetOrderHistoryAsync(string userId); 
    }
}
