using Microsoft.Extensions.FileProviders;
using System.Text.Json;
using Core.Commerce.Infrastructure.Extensions;
using Core.Commerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy        = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title   = "Product Catalog Platform API",
        Version = "v1"
    });

    // Adds the Authorize button in Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Enter your JWT token. Example: Bearer eyJhbGci..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Infrastructure layers — registered via extension methods
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityServices();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddCorsPolicy(builder.Configuration);

var app = builder.Build();

// Apply pending migrations and seed initial data on every startup
await InitializeDatabaseAsync(app);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");

/* Serve uploaded product images from the configured storage path.
   In local Windows development, Docker-style paths such as "/app/uploads"
   are not valid physical roots, so we normalize them against the app
   content root before registering the static files middleware.*/

var uploadsPath = builder.Configuration["Uploads:Path"];
if (!string.IsNullOrWhiteSpace(uploadsPath))
{
    var isWindows = OperatingSystem.IsWindows();
    var looksLikeLinuxAbsolutePath = uploadsPath.StartsWith('/') || uploadsPath.StartsWith('\\');

    var resolvedUploadsPath = uploadsPath;
    if (!Path.IsPathFullyQualified(uploadsPath) || (isWindows && looksLikeLinuxAbsolutePath))
    {
        resolvedUploadsPath = Path.Combine(
            builder.Environment.ContentRootPath,
            uploadsPath.TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
    }

    resolvedUploadsPath = Path.GetFullPath(resolvedUploadsPath);

    Directory.CreateDirectory(resolvedUploadsPath);
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(resolvedUploadsPath),
        RequestPath = "/uploads"
    });
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
return;

// Database initialization 
static async Task InitializeDatabaseAsync(WebApplication app)
{
    using var scope  = app.Services.CreateScope();
    var services     = scope.ServiceProvider;
    var logger       = services.GetRequiredService<ILogger<Program>>();
    const int maxRetries = 10;
    const int delaySeconds = 3;

    for (var attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            var db      = services.GetRequiredService<AppDbContext>();
            var pending = await db.Database.GetPendingMigrationsAsync();

            var enumerable = pending as string[] ?? pending.ToArray();
            
            if (enumerable.Length != 0)
            {
                logger.LogInformation(
                    "Applying {Count} pending migration(s): {Names}",
                    enumerable.Length,
                    string.Join(", ", enumerable));

                await db.Database.MigrateAsync();
                logger.LogInformation("Migrations applied successfully.");
            }

            await SeedData.SeedAsync(services);
            return;
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            logger.LogWarning(
                ex,
                "Database not ready. Attempt {Attempt}/{Max}. Retrying in {Delay}s...",
                attempt, maxRetries, delaySeconds);

            await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
        }
    }

    // If all attempts failed — throw without logging (caller handles it)
    throw new InvalidOperationException(
        $"Database initialization failed after {maxRetries} attempts.");
}