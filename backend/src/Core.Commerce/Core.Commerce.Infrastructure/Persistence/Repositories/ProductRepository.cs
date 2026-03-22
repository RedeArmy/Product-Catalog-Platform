using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Commerce.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppDbContext context) : IProductRepository
{
    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct = default)
        => await context.Products
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetPublicAsync(CancellationToken ct = default)
        => await context.Products
            .Where(p => p.IsActive && p.Inventory > 5)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await context.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive, ct);

    public async Task<bool> SkuExistsAsync(
        string sku,
        Guid? excludeId = null,
        CancellationToken ct = default)
        => await context.Products
            .AnyAsync(p => p.Sku == sku.ToUpperInvariant()
                           && (excludeId == null || p.Id != excludeId), ct);

    public async Task AddAsync(Product product, CancellationToken ct = default)
        => await context.Products.AddAsync(product, ct);

    public void Update(Product product)
        => context.Products.Update(product);

    public void Delete(Product product)
    {
        product.IsActive = false;
        context.Products.Update(product);
    }
}