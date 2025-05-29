using AToyStore.Core.Profile.Entities;

namespace AToyStore.Core.Profile.Interfaces;

public interface IUserProfileRepository
{
    Task<User?> GetByIdAsync(string userId);
    Task<bool> UpdateAsync(User user);
    Task<bool> SetTwoFactorEnabledAsync(string userId, bool enabled);
}

