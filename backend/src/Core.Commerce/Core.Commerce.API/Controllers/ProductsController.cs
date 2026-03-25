using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.UseCases.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.Commerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(
    GetProducts    getProducts,
    CreateProduct  createProduct,
    UpdateProduct  updateProduct,
    DeleteProduct  deleteProduct,
    BulkUploadProducts bulkUploadProducts) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await getProducts.ExecuteAllAsync(ct);
        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await getProducts.ExecuteByIdAsync(id, ct);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Collaborator")]
    public async Task<IActionResult> Create(
        [FromForm] CreateProductDto dto,
        IFormFile?                  image,
        CancellationToken           ct)
    {
        var result = await createProduct.ExecuteAsync(
            dto,
            image?.OpenReadStream(),
            image?.FileName,
            ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator,Collaborator")]
    public async Task<IActionResult> Update(
        Guid                        id,
        [FromForm] UpdateProductDto dto,
        IFormFile?                  image,
        CancellationToken           ct)
    {
        var result = await updateProduct.ExecuteAsync(
            id,
            dto,
            image?.OpenReadStream(),
            image?.FileName,
            ct);

        if (!result.Success)
            return result.Error == "Product not found."
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await deleteProduct.ExecuteAsync(id, ct);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return NoContent();
    }
    
    [HttpGet("bulk-upload/template")]
    public IActionResult DownloadTemplate()
    {
        const string csv = "Name,Description,Price,SKU,Inventory,Category,ImageUrl\n" +
                           "Sample Product,Product description,99.99,SKU-001,10,Category Name,https://example.com/image.jpg";

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", "products_template.csv");
    }
    
    [HttpPost("bulk-upload")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> BulkUpload(
        IFormFile?         file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "CSV file is required." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only .csv files are accepted." });

        await using var stream = file.OpenReadStream();
        var result = await bulkUploadProducts.ExecuteAsync(stream, ct);

        return Ok(result.Data);
    }
}