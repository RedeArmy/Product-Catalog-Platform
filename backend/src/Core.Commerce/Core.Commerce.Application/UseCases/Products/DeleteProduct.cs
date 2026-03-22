using Core.Commerce.Application.Common;
using Core.Commerce.Application.Interfaces;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Products;

public class DeleteProduct(IUnitOfWork uow, IFileStorageService storage)
{
    public async Task<Result<bool>> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var product = await uow.Products.GetByIdAsync(id, ct);
        if (product is null)
            return Result<bool>.Fail("Product not found.");

        if (product.ImagePath is not null)
            await storage.DeleteAsync(product.ImagePath, ct);

        uow.Products.Delete(product);
        await uow.SaveChangesAsync(ct);

        return Result<bool>.Ok(true);
    }
}