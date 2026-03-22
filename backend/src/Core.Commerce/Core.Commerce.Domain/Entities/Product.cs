namespace Core.Commerce.Domain.Entities;

public class Product : BaseEntity
{
    public string  Name        { get; set; } = string.Empty;
    public string  Description { get; set; } = string.Empty;
    public decimal Price       { get; set; }
    public string  Sku         { get; set; } = string.Empty;
    public int     Inventory   { get; set; }
    public string? ImagePath   { get; set; }
    public bool    IsActive    { get; set; } = true;
}