namespace Core.Commerce.Application.DTOs;

public class LoginRequestDto
{
    public string Email    { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string   AccessToken { get; set; } = string.Empty;
    public string   Role        { get; set; } = string.Empty;
    public DateTime ExpiresAt   { get; set; }
}