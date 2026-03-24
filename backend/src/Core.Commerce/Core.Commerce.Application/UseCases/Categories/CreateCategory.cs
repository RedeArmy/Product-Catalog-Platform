using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Categories;

public class CreateCategory(IUnitOfWork uow)
{
    public async Task<Result<CategoryDto>> ExecuteAsync(
        CreateCategoryDto dto,
        CancellationToken ct = default)
    {
        if (await uow.Categories.NameExistsAsync(dto.Name, ct: ct))
            return Result<CategoryDto>.Fail($"Category '{dto.Name}' already exists.");

        var category = new Category
        {
            Name        = dto.Name.Trim(),
            Description = dto.Description.Trim()
        };

        await uow.Categories.AddAsync(category, ct);
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