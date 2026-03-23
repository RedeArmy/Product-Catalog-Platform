using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.UseCases.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Core.Commerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(Login loginUseCase) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var result = await loginUseCase.ExecuteAsync(dto);

        if (!result.Success)
            return Unauthorized(new { message = result.Error });

        return Ok(result.Data);
    }
}