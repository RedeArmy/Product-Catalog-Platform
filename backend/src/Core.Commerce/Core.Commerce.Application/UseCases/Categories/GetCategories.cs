using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Categories;

public class GetCategories(IUnitOfWork uow)
{
    public async Task<Result<IEnumerable<CategoryDto>>> ExecuteAllAsync(CancellationToken ct = default)
    {
        var categories = await uow.Categories.GetAllAsync(ct);
        return Result<IEnumerable<CategoryDto>>.Ok(categories.Select(Map));
    }
    
    public async Task<Result<IEnumerable<CategoryDto>>> ExecutePublicAsync(CancellationToken ct = default)
    {
        var categories = await uow.Categories.GetPublicAsync(ct);
        return Result<IEnumerable<CategoryDto>>.Ok(categories.Select(Map));
    }

    public async Task<Result<CategoryDto>> ExecuteByIdAsync(Guid id, CancellationToken ct = default)
    {
        var category = await uow.Categories.GetByIdAsync(id, ct);
        if (category is null)
            return Result<CategoryDto>.Fail("Category not found.");

        return Result<CategoryDto>.Ok(Map(category));
    }

    private static CategoryDto Map(Domain.Entities.Category c) => new()
    {
        Id          = c.Id,
        Name        = c.Name,
        Description = c.Description,
        IsActive    = c.IsActive,
        CreatedAt   = c.CreatedAt,
        UpdatedAt   = c.UpdatedAt
    };
}