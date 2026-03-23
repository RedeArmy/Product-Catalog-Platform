using Core.Commerce.Domain.Entities;

namespace Core.Commerce.Application.Interfaces;

public interface IJwtService
{
    string   GenerateToken(AppUser user);
    DateTime GetExpiration();
}