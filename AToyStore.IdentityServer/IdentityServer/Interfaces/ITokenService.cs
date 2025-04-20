using IdentityServer.Models;

namespace IdentityServer.Interfaces;

public interface ITokenService
{
    Task<string> GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(User user);
}
