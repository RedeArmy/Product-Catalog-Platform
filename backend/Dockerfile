# --------------------Stage 1: build--------------------------------
# Use the full SDK image to compile the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy solution and project files first — Docker caches this layer.
COPY src/Core.Commerce/Core.Commerce.sln ./
COPY src/Core.Commerce/Core.Commerce.API/Core.Commerce.API.csproj                         ./Core.Commerce.API/
COPY src/Core.Commerce/Core.Commerce.Application/Core.Commerce.Application.csproj         ./Core.Commerce.Application/
COPY src/Core.Commerce/Core.Commerce.Domain/Core.Commerce.Domain.csproj                   ./Core.Commerce.Domain/
COPY src/Core.Commerce/Core.Commerce.Infrastructure/Core.Commerce.Infrastructure.csproj   ./Core.Commerce.Infrastructure/

# Restore dependencies
RUN dotnet restore Core.Commerce.sln

# Copy the rest of the source code
COPY src/Core.Commerce/ ./

# Build and publish in Release mode
RUN dotnet publish Core.Commerce.API/Core.Commerce.API.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# -----------------------Stage 2: runtime---------------------------------
# Use the smaller runtime image — no SDK, no source code
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Create uploads directory for product images
RUN mkdir -p /app/uploads

# Copy only the published output from the build stage
COPY --from=build /app/publish .

# Non-root user for security — never run as root in production
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

ENTRYPOINT ["dotnet", "Core.Commerce.API.dll"]