using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Application.Interfaces;
using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Products;

public class GetProducts(IUnitOfWork uow, IFileStorageService storage)
{
    public async Task<Result<IEnumerable<ProductDto>>> ExecuteAllAsync(CancellationToken ct = default)
    {
        var products = await uow.Products.GetAllAsync(ct);
        return Result<IEnumerable<ProductDto>>.Ok(products.Select(Map));
    }

    public async Task<Result<IEnumerable<ProductDto>>> ExecutePublicAsync(CancellationToken ct = default)
    {
        var products = await uow.Products.GetPublicAsync(ct);
        return Result<IEnumerable<ProductDto>>.Ok(products.Select(Map));
    }

    public async Task<Result<ProductDto>> ExecuteByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await uow.Products.GetByIdAsync(id, ct);
        if (product is null)
            return Result<ProductDto>.Fail("Product not found.");

        return Result<ProductDto>.Ok(Map(product));
    }

    private ProductDto Map(Product product) => new()
    {
        Id           = product.Id,
        Name         = product.Name,
        Description  = product.Description,
        Price        = product.Price,
        Sku          = product.Sku,
        Inventory    = product.Inventory,
        CategoryId   = product.CategoryId,
        CategoryName = product.Category?.Name,
        ImageUrl     = product.ImagePath is not null ? storage.GetPublicUrl(product.ImagePath) : null,
        IsActive     = product.IsActive,
        CreatedAt    = product.CreatedAt,
        UpdatedAt    = product.UpdatedAt
    };
}