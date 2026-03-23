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

    private ProductDto Map(Product p) => new()
    {
        Id          = p.Id,
        Name        = p.Name,
        Description = p.Description,
        Price       = p.Price,
        Sku         = p.Sku,
        Inventory   = p.Inventory,
        ImageUrl    = p.ImagePath is not null ? storage.GetPublicUrl(p.ImagePath) : null,
        IsActive    = p.IsActive,
        CreatedAt   = p.CreatedAt,
        UpdatedAt   = p.UpdatedAt
    };
}