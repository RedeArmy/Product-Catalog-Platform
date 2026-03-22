namespace Core.Commerce.Application.DTOs;

public record ProductDto(
    Guid     Id,
    string   Name,
    string   Description,
    decimal  Price,
    string   Sku,
    int      Inventory,
    string?  ImageUrl,
    bool     IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public abstract record CreateProductDto(
    string  Name,
    string  Description,
    decimal Price,
    string  Sku,
    int     Inventory
);

public abstract record UpdateProductDto(
    string  Name,
    string  Description,
    decimal Price,
    string  Sku,
    int     Inventory
);