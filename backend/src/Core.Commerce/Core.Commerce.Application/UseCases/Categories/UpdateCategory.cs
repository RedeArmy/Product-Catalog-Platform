using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Categories;

public class UpdateCategory(IUnitOfWork uow)
{
    public async Task<Result<CategoryDto>> ExecuteAsync(
        Guid              id,
        UpdateCategoryDto dto,
        CancellationToken ct = default)
    {
        var category = await uow.Categories.GetByIdAsync(id, ct);
        if (category is null)
            return Result<CategoryDto>.Fail("Category not found.");

        if (await uow.Categories.NameExistsAsync(dto.Name, excludeId: id, ct: ct))
            return Result<CategoryDto>.Fail($"Category '{dto.Name}' already exists.");

        category.Name        = dto.Name.Trim();
        category.Description = dto.Description.Trim();
        category.IsActive    = dto.IsActive;

        uow.Categories.Update(category);
        await uow.SaveChangesAsync(ct);

        return Result<CategoryDto>.Ok(new CategoryDto
        {
            Id          = category.Id,
            Name        = category.Name,
            Description = category.Description,
            IsActive    = category.IsActive,
            CreatedAt   = category.CreatedAt,
            UpdatedAt   = category.UpdatedAt
        });
    }
}