using AToyStore.Core.Profile.Entities;
using AToyStore.Core.Profile.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AToyStore.Infrastructure.Profile;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly UserManager<User> _userManager;

    public UserProfileRepository(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<User?> GetByIdAsync(string userId)
    {
        return await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> UpdateAsync(User profile)
    {
        var existingUser = await _userManager.FindByIdAsync(profile.Id);
        if (existingUser == null)
            return false;

        existingUser.FullName = profile.FullName;
        existingUser.Email = profile.Email;
        existingUser.UserName = profile.Email;

        var result = await _userManager.UpdateAsync(existingUser);
        return result.Succeeded;
    }

    public async Task<bool> SetTwoFactorEnabledAsync(string userId, bool enabled)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return false;

        var result = await _userManager.SetTwoFactorEnabledAsync(user, enabled);
        return result.Succeeded;
    }
}
