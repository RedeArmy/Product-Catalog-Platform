using Core.Commerce.Application.Common;
using Core.Commerce.Application.DTOs;
using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Interfaces;

namespace Core.Commerce.Application.UseCases.Products;

public class BulkUploadProducts(IUnitOfWork uow)
{
    public async Task<Result<BulkUploadResultDto>> ExecuteAsync(
        Stream            csvStream,
        CancellationToken ct = default)
    {
    var result = new BulkUploadResultDto();
    var rows   = await ParseCsvAsync(csvStream, ct);
    result.TotalRows = rows.Count;
    
    var categoryCache = (await uow.Categories.GetAllAsync(ct))
        .ToDictionary(c => c.Name.ToLowerInvariant(), c => c.Id);

    foreach (var (dto, rowIndex) in rows.Select((r, i) => (r, i + 2)))
    {
        try
        {
            if (await uow.Products.SkuExistsAsync(dto.Sku, ct: ct))
            {
                result.Skipped++;
                result.Errors.Add(new BulkUploadErrorDto
                {
                    Row     = rowIndex,
                    Sku     = dto.Sku,
                    Message = $"SKU '{dto.Sku}' already exists — skipped."
                });
                continue;
            }

            Guid? categoryId = null;
            if (!string.IsNullOrWhiteSpace(dto.Category))
                categoryId = await ResolveOrCreateCategoryAsync(
                    dto.Category.Trim(), categoryCache, ct);

            string? imagePath = null;
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                var imageRef = dto.ImageUrl.Trim();
                if (imageRef.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                    imageRef.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                    imagePath = imageRef;
            }

            var product = new Product
            {
                Name        = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                Price       = dto.Price,
                Sku         = dto.Sku.Trim().ToUpperInvariant(),
                Inventory   = dto.Inventory,
                CategoryId  = categoryId,
                ImagePath   = imagePath
            };

            await uow.Products.AddAsync(product, ct);
            await uow.SaveChangesAsync(ct);
            result.Created++;
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            result.Errors.Add(new BulkUploadErrorDto
            {
                Row     = rowIndex,
                Sku     = dto.Sku,
                Message = message
            });
        }
    }

    return Result<BulkUploadResultDto>.Ok(result);
}

    private async Task<Guid> ResolveOrCreateCategoryAsync(
        string                      name,
        Dictionary<string, Guid>    cache,
        CancellationToken           ct)
    {
        var key = name.ToLowerInvariant();

        // Already in cache (from BD or created earlier in this batch)
        if (cache.TryGetValue(key, out var existingId))
            return existingId;

        // Not found — create and add to cache immediately
        var category = new Category
        {
            Name        = name,
            Description = string.Empty
        };

        await uow.Categories.AddAsync(category, ct);
        await uow.SaveChangesAsync(ct);  // Save immediately to avoid UK conflict

        cache[key] = category.Id;
        return category.Id;
    }

    private static async Task<List<BulkUploadProductDto>> ParseCsvAsync(
        Stream            stream,
        CancellationToken ct)
    {
        var results = new List<BulkUploadProductDto>();
        using var reader = new StreamReader(stream);
        
        var header = await reader.ReadLineAsync(ct);
        if (header is null) return results;

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line)) continue;

            var columns = SplitCsvLine(line);
            if (columns.Length < 6) continue;

            if (!decimal.TryParse(columns[2], System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var price))
                continue;

            if (!int.TryParse(columns[4], out var inventory))
                continue;

            results.Add(new BulkUploadProductDto
            {
                Name        = columns[0].Trim(),
                Description = columns[1].Trim(),
                Price       = price,
                Sku         = columns[3].Trim(),
                Inventory   = inventory,
                Category    = columns.Length > 5 ? columns[5].Trim() : string.Empty,
                ImageUrl    = columns.Length > 6 ? columns[6].Trim() : null
            });
        }

        return results;
    }

    private static string[] SplitCsvLine(string line)
    {
        // Handles quoted fields with commas inside
        var result  = new List<string>();
        var current = new System.Text.StringBuilder();
        var inQuotes = false;

        foreach (var ch in line)
        {
            if (ch == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (ch == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(ch);
            }
        }

        result.Add(current.ToString());
        return [.. result];
    }
}