using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Commerce.Infrastructure.Persistence.Repositories;

public class CategoryRepository(AppDbContext context) : ICategoryRepository
{
    public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct = default)
        => await context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync(ct);
    
    public async Task<IEnumerable<Category>> GetPublicAsync(CancellationToken ct = default)
        => await context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<bool> NameExistsAsync(
        string name,
        Guid? excludeId = null,
        CancellationToken ct = default)
    {
        var normalizedName = name.Trim().ToLowerInvariant();
        return await context.Categories
            .AnyAsync(c => c.Name.ToLower() == normalizedName
                           && (excludeId == null || c.Id != excludeId), ct);
    }

    public async Task AddAsync(Category category, CancellationToken ct = default)
        => await context.Categories.AddAsync(category, ct);

    public void Update(Category category)
        => context.Categories.Update(category);

    public void Delete(Category category)
    {
        category.IsActive = false;
        context.Categories.Update(category);
    }
}