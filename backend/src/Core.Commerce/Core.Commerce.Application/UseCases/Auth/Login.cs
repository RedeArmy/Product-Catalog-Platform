using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.Interfaces;
using Core.Commerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Core.Commerce.Application.UseCases.Auth;

public class Login(UserManager<AppUser> userManager, IJwtService jwt)
{
    public async Task<Result<LoginResponseDto>> ExecuteAsync(LoginRequestDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);

        if (user is null || !await userManager.CheckPasswordAsync(user, dto.Password))
            return Result<LoginResponseDto>.Fail("Invalid credentials.");

        var token = jwt.GenerateToken(user);

        return Result<LoginResponseDto>.Ok(new LoginResponseDto(
            AccessToken: token,
            Email:       user.Email!,
            Role:        user.Role.ToString(),
            ExpiresAt:   jwt.GetExpiration()
        ));
    }
}