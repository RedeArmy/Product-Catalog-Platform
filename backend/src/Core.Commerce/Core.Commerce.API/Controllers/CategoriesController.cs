using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.UseCases.Categories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.Commerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(
    GetCategories    getCategories,
    CreateCategory   createCategory,
    UpdateCategory   updateCategory,
    DeleteCategory   deleteCategory) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await getCategories.ExecuteAllAsync(ct);
        return Ok(result.Data);
    }
    
    [HttpGet("public")]
    public async Task<IActionResult> GetPublic(CancellationToken ct)
    {
        var result = await getCategories.ExecutePublicAsync(ct);
        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await getCategories.ExecuteByIdAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Collaborator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoryDto dto,
        CancellationToken ct)
    {
        var result = await createCategory.ExecuteAsync(dto, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator,Collaborator")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCategoryDto dto,
        CancellationToken ct)
    {
        var result = await updateCategory.ExecuteAsync(id, dto, ct);
        if (!result.Success)
            return result.Error == "Category not found."
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await deleteCategory.ExecuteAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });

        return NoContent();
    }
}