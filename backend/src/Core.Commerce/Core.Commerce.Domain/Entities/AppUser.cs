using Core.Commerce.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Core.Commerce.Domain.Entities;

public class AppUser : IdentityUser
{
    public UserRole Role { get; init; }
}