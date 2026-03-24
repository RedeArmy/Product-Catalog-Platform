using Core.Commerce.Application.UseCases.Products;
using Microsoft.AspNetCore.Mvc;

namespace Core.Commerce.API.Controllers;

[ApiController]
[Route("api/products/public")]
public class PublicProductsController(GetProducts getProducts) : ControllerBase
{
    /// <summary>Public catalog — only products with inventory greater than 5.</summary>
    [HttpGet]
    public async Task<IActionResult> GetPublic(CancellationToken ct)
    {
        var result = await getProducts.ExecutePublicAsync(ct);
        return Ok(result.Data);
    }
}