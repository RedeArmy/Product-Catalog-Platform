using Core.Commerce.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Core.Commerce.Infrastructure.Services;

public class LocalFileStorageService(IConfiguration config) : IFileStorageService
{
    private readonly string _basePath = config["Uploads:Path"] ?? throw new InvalidOperationException("Uploads:Path is not configured.");
    private readonly string _baseUrl = config["Uploads:BaseUrl"] ?? throw new InvalidOperationException("Uploads:BaseUrl is not configured.");
    
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    public async Task<string> SaveAsync(
        Stream  fileStream,
        string  originalFileName,
        CancellationToken ct = default)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException(
                $"File type '{ext}' is not allowed. Allowed: {string.Join(", ", AllowedExtensions)}");
        
        var relativePath = Path.Combine("products", $"{Guid.NewGuid()}{ext}");
        var fullPath     = Path.Combine(_basePath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var output = File.Create(fullPath);
        await fileStream.CopyToAsync(output, ct);

        return relativePath;
    }

    public async Task DeleteAsync(string relativePath, CancellationToken ct = default)
    {
        var fullPath = Path.Combine(_basePath, relativePath);

        if (File.Exists(fullPath))
            await Task.Run(() => File.Delete(fullPath), ct);
    }

    public string GetPublicUrl(string relativePath)
        => $"{_baseUrl.TrimEnd('/')}/uploads/{relativePath.Replace('\\', '/')}";
}