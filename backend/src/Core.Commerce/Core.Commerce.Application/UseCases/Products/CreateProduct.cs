using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.Interfaces;
using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Products;

public class CreateProduct(IUnitOfWork uow, IFileStorageService storage)
{
    public async Task<Result<ProductDto>> ExecuteAsync(
        CreateProductDto  dto,
        Stream?           imageStream,
        string?           imageFileName,
        CancellationToken ct = default)
    {
        if (await uow.Products.SkuExistsAsync(dto.Sku, ct: ct))
            return Result<ProductDto>.Fail($"SKU '{dto.Sku}' is already in use.");

        string? imagePath = null;
        if (imageStream is not null && imageFileName is not null)
            imagePath = await storage.SaveAsync(imageStream, imageFileName, ct);

        var product = new Product
        {
            Name        = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Price       = dto.Price,
            Sku         = dto.Sku.Trim().ToUpperInvariant(),
            Inventory   = dto.Inventory,
            ImagePath   = imagePath
        };

        await uow.Products.AddAsync(product, ct);
        await uow.SaveChangesAsync(ct);

        return Result<ProductDto>.Ok(new ProductDto(
            product.Id, product.Name, product.Description, product.Price,
            product.Sku, product.Inventory,
            imagePath is not null ? storage.GetPublicUrl(imagePath) : null,
            product.IsActive, product.CreatedAt, product.UpdatedAt
        ));
    }
}