using Microsoft.AspNetCore.Identity;

namespace AToyStore.Core.Profile.Entities;

public class User : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}

