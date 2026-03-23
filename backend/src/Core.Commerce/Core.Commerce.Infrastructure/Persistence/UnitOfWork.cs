using Core.Commerce.Domain.Interfaces;
using Core.Commerce.Infrastructure.Persistence.Repositories;

namespace Core.Commerce.Infrastructure.Persistence;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private ProductRepository? _products;

    public IProductRepository Products => _products ??= new ProductRepository(context);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await context.SaveChangesAsync(ct);

    public async ValueTask DisposeAsync()
    {
        await context.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}