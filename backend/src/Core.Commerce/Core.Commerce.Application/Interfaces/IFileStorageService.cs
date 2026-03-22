namespace Core.Commerce.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveAsync(Stream fileStream, string originalFileName, CancellationToken ct = default);
    Task DeleteAsync(string relativePath, CancellationToken ct = default);
    string GetPublicUrl(string relativePath);
}