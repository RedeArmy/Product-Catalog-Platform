using Core.Commerce.Domain.Interfaces;
using Core.Commerce.Infrastructure.Persistence.Repositories;

namespace Core.Commerce.Infrastructure.Persistence;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private ProductRepository? _products;
    private CategoryRepository? _categories;

    public IProductRepository Products => _products ??= new ProductRepository(context);
    public ICategoryRepository Categories => _categories ??= new CategoryRepository(context);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await context.SaveChangesAsync(ct);

    public async ValueTask DisposeAsync()
    {
        await context.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}