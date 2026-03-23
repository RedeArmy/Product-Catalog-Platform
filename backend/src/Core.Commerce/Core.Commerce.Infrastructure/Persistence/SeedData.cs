using Core.Commerce.Domain.Entities;
using Core.Commerce.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Core.Commerce.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var logger      = services.GetRequiredService<ILogger<AppDbContext>>();

        await SeedUserAsync(
            userManager, logger,
            email:    "admin@ecommerce.com",
            password: "Admin@123!",
            role:     UserRole.Administrator);

        await SeedUserAsync(
            userManager, logger,
            email:    "collaborator@ecommerce.com",
            password: "Collab@123!",
            role:     UserRole.Collaborator);
    }

    private static async Task SeedUserAsync(
        UserManager<AppUser> userManager,
        ILogger              logger,
        string               email,
        string               password,
        UserRole             role)
    {
        // Skip if user already exists — safe to run on every startup
        if (await userManager.FindByEmailAsync(email) is not null)
            return;

        var user = new AppUser
        {
            UserName = email,
            Email    = email,
            Role     = role,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, password);

        if (result.Succeeded)
            logger.LogInformation("Seed user created: {Email} ({Role})", email, role);
        else
            logger.LogError(
                "Failed to create seed user {Email}: {Errors}",
                email,
                string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}