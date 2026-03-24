namespace Core.Commerce.Domain.Interfaces;

public interface IUnitOfWork : IAsyncDisposable
{
    IProductRepository Products { get; }
    ICategoryRepository Categories { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}