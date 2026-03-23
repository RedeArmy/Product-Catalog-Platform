namespace Core.Commerce.Application.DTOs;

public abstract record LoginRequestDto(
    string Email,
    string Password
);

public record LoginResponseDto(
    string   AccessToken,
    string   Email,
    string   Role,
    DateTime ExpiresAt
);