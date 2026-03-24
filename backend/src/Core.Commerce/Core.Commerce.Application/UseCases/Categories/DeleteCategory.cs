using Core.Commerce.Application.Common;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Categories;

public class DeleteCategory(IUnitOfWork uow)
{
    public async Task<Result<bool>> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var category = await uow.Categories.GetByIdAsync(id, ct);
        if (category is null)
            return Result<bool>.Fail("Category not found.");

        uow.Categories.Delete(category);
        await uow.SaveChangesAsync(ct);

        return Result<bool>.Ok(true);
    }
}