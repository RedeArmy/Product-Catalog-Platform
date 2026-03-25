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

        foreach (var (dto, rowIndex) in rows.Select((r, i) => (r, i + 2)))
        {
            try
            {
                // Resolve or create a category
                Guid? categoryId = null;
                if (!string.IsNullOrWhiteSpace(dto.Category))
                    categoryId = await ResolveOrCreateCategoryAsync(dto.Category.Trim(), ct);

                var product = new Product
                {
                    Name        = dto.Name.Trim(),
                    Description = dto.Description.Trim(),
                    Price       = dto.Price,
                    Sku         = dto.Sku.Trim().ToUpperInvariant(),
                    Inventory   = dto.Inventory,
                    CategoryId  = categoryId,
                    ImagePath   = string.IsNullOrWhiteSpace(dto.ImageUrl)
                                    ? null
                                    : dto.ImageUrl.Trim()
                };

                await uow.Products.AddAsync(product, ct);
                result.Created++;
            }
            catch (Exception ex)
            {
                result.Errors.Add(new BulkUploadErrorDto
                {
                    Row     = rowIndex,
                    Sku     = dto.Sku,
                    Message = ex.Message
                });
            }
        }

        await uow.SaveChangesAsync(ct);
        return Result<BulkUploadResultDto>.Ok(result);
    }

    private async Task<Guid> ResolveOrCreateCategoryAsync(
        string            name,
        CancellationToken ct)
    {
        // Check if a category already exists
        var all      = await uow.Categories.GetAllAsync(ct);
        var existing = all.FirstOrDefault(c =>
            string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase));

        if (existing is not null)
            return existing.Id;

        // Create a new category automatically
        var category = new Category
        {
            Name        = name,
            Description = string.Empty
        };

        await uow.Categories.AddAsync(category, ct);
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