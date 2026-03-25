namespace Core.Commerce.Application.DTOs;

public class BulkUploadProductDto
{
    public string  Name        { get; set; } = string.Empty;
    public string  Description { get; set; } = string.Empty;
    public decimal Price       { get; set; }
    public string  Sku         { get; set; } = string.Empty;
    public int     Inventory   { get; set; }
    public string  Category    { get; set; } = string.Empty;
    public string? ImageUrl    { get; set; }
}

public class BulkUploadResultDto
{
    public int                        TotalRows    { get; set; }
    public int                        Created      { get; set; }
    public int                        Skipped      { get; set; }
    public List<BulkUploadErrorDto>   Errors       { get; set; } = [];
}

public class BulkUploadErrorDto
{
    public int    Row     { get; set; }
    public string Sku     { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}