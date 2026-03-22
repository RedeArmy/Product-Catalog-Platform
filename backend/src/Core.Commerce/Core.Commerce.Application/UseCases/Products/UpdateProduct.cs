using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.Interfaces;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Products;

public class UpdateProduct(IUnitOfWork uow, IFileStorageService storage)
{
    public async Task<Result<ProductDto>> ExecuteAsync(
        Guid              id,
        UpdateProductDto  dto,
        Stream?           imageStream,
        string?           imageFileName,
        CancellationToken ct = default)
    {
        var product = await uow.Products.GetByIdAsync(id, ct);
        if (product is null)
            return Result<ProductDto>.Fail("Product not found.");

        if (await uow.Products.SkuExistsAsync(dto.Sku, excludeId: id, ct: ct))
            return Result<ProductDto>.Fail($"SKU '{dto.Sku}' is already in use.");

        if (imageStream is not null && imageFileName is not null)
        {
            if (product.ImagePath is not null)
                await storage.DeleteAsync(product.ImagePath, ct);

            product.ImagePath = await storage.SaveAsync(imageStream, imageFileName, ct);
        }

        product.Name        = dto.Name.Trim();
        product.Description = dto.Description.Trim();
        product.Price       = dto.Price;
        product.Sku         = dto.Sku.Trim().ToUpperInvariant();
        product.Inventory   = dto.Inventory;

        uow.Products.Update(product);
        await uow.SaveChangesAsync(ct);

        return Result<ProductDto>.Ok(new ProductDto(
            product.Id, product.Name, product.Description, product.Price,
            product.Sku, product.Inventory,
            product.ImagePath is not null ? storage.GetPublicUrl(product.ImagePath) : null,
            product.IsActive, product.CreatedAt, product.UpdatedAt
        ));
    }
}