# Product Catalog Platform
A modern full-stack e-commerce catalog platform built with **ASP.NET Core 8**, **React**, and **PostgreSQL**. It includes a public storefront, an admin workspace, JWT authentication, bulk product import, Docker-based local setup, and a project structure designed for long-term maintainability.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Local Development](#local-development)
- [Default Credentials](#default-credentials)
- [API Overview](#api-overview)
- [Bulk Product Upload](#bulk-product-upload)
- [Database Migrations](#database-migrations)
- [Environment Variables](#environment-variables)
- [CI/CD and Quality](#cicd-and-quality)
- [License](#license)

## Overview

This platform provides two main user experiences:

- A **public catalog** where customers can browse active products.
- An **admin panel** where internal users can manage products and categories.

It is designed to be easy to run locally, friendly for contributors, and practical for real-world team workflows.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8, Clean Architecture |
| Frontend | React, Vite, Tailwind CSS |
| Database | PostgreSQL 16 |
| Authentication | ASP.NET Identity, JWT |
| ORM | Entity Framework Core 8 |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions, SonarCloud |

## Core Features

- Public storefront for browsing active products
- Admin dashboard for managing products and categories
- Role-based access with **Administrator** and **Collaborator** permissions
- JWT authentication and protected routes
- Product image support
- CSV bulk upload for products
- Automatic category resolution during import
- Soft delete and reactivate flows
- Docker-first local development experience
- SonarCloud quality analysis in CI

## Architecture

The backend follows a clean separation of concerns between domain, application, infrastructure, and API layers.

```text
backend/src/
|-- Core.Commerce.Domain/          # Entities, interfaces, enums
|-- Core.Commerce.Application/     # Use cases, DTOs, contracts
|-- Core.Commerce.Infrastructure/  # EF Core, repositories, JWT, file storage
|-- Core.Commerce.API/             # Controllers, middleware, Program.cs

frontend/src/
|-- api/                           # Axios client and JWT interceptors
|-- components/                    # Shared UI components
|-- context/                       # Authentication context
|-- pages/
|   |-- admin/                     # Admin workspace views
|   |-- public/                    # Public storefront views
`-- router/                        # Route guards and app router
```

## Project Structure

```text
Product-Catalog-Platform/
|-- .github/
|   |-- workflows/
|       |-- sonar.yml
|-- backend/
|   |-- Dockerfile
|   |-- src/Core.Commerce/
|       |-- Core.Commerce.sln
|       |-- Core.Commerce.API/
|       |-- Core.Commerce.Application/
|       |-- Core.Commerce.Domain/
|       `-- Core.Commerce.Infrastructure/
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- src/
|-- docker-compose.yml
|-- .env.example
|-- README.md
```

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Docker Desktop | 4.x+ |
| Docker Compose | v2.x+ |
| .NET SDK | 8.0.x |
| Node.js | 20.x |

> `.NET SDK` and `Node.js` are only required for local development outside the full Docker workflow.

### Clone the repository

```bash
git clone https://github.com/RedeArmy/Product-Catalog-Platform.git
cd Product-Catalog-Platform
```
## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `POSTGRES_DB` | PostgreSQL database name | `ecommerce_db` |
| `POSTGRES_USER` | PostgreSQL username | `ecommerce_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `SecurePass123!` |
| `JWT_KEY` | JWT signing key, minimum 32 chars | `your_secret_key_here!` |
| `JWT_ISSUER` | JWT issuer | `ecommerce-api` |
| `JWT_AUDIENCE` | JWT audience | `ecommerce-web` |
| `JWT_EXPIRES_MINUTES` | Token expiration time | `60` |
| `UPLOADS_BASE_URL` | Base URL for uploaded files | `http://localhost:5000` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:5000` |

### Create your environment file

```bash
cp .env.example .env
```

Then update `.env` with your local values:

```env
# PostgreSQL
POSTGRES_DB=ecommerce_db
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=your_secure_password

# JWT - minimum 32 characters
JWT_KEY=your_super_secret_key_minimum_32_chars!
JWT_ISSUER=ecommerce-api
JWT_AUDIENCE=ecommerce-web
JWT_EXPIRES_MINUTES=60

# Uploads
UPLOADS_BASE_URL=http://localhost:5000

# Frontend
VITE_API_URL=http://localhost:5000
```

## Running with Docker

### Full stack

```bash
docker compose --profile full up --build
```

### Services

| Service | URL |
|---|---|
| Public catalog | `http://localhost:3000` |
| Admin panel | `http://localhost:3000/admin` |
| Swagger | `http://localhost:5000/swagger` |
| PostgreSQL | `localhost:5432` |

### Database only

```bash
docker compose up db -d
```

### Stop services

```bash
docker compose --profile full down
```

### Stop services and remove volumes

```bash
docker compose --profile full down -v
```

## Local Development

### 1. Start PostgreSQL

```bash
docker compose up db -d
```

### 2. Create `appsettings.Development.json`

Create the file at:

`backend/src/Core.Commerce/Core.Commerce.API/appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=ecommerce_db;Username=ecommerce_user;Password=your_password"
  },
  "Jwt": {
    "SigningKey": "your_super_secret_key_minimum_32_chars!",
    "Issuer": "ecommerce-api",
    "Audience": "ecommerce-web",
    "ExpiresInMinutes": 60
  },
  "Uploads": {
    "Path": "./uploads",
    "BaseUrl": "http://localhost:5000"
  }
}
```

> This file is gitignored and should never be committed.

### 3. Run the backend

Open the solution in Rider or Visual Studio and run the API project.

On startup, the application will:

- apply pending migrations
- seed default users
- expose Swagger

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend development server:

`http://localhost:5173`

## Default Credentials

> Change these credentials before using the project beyond local development.

### Administrator

```text
Email:    admin@ecommerce.com
Password: Admin@123!
```

Permissions:

- Full CRUD on products and categories
- Bulk upload
- Deactivate and reactivate records

### Collaborator

```text
Email:    collaborator@ecommerce.com
Password: Collab@123!
```

Permissions:

- Create and update products
- Create and update categories
- Cannot delete or deactivate records

## API Overview

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate and return JWT |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products/public` | Public | List active products with inventory greater than 5 |
| GET | `/api/products` | JWT | List all products |
| GET | `/api/products/{id}` | JWT | Get a product by ID |
| POST | `/api/products` | Admin + Collaborator | Create a product |
| PUT | `/api/products/{id}` | Admin + Collaborator | Update a product |
| DELETE | `/api/products/{id}` | Admin only | Deactivate a product |
| POST | `/api/products/bulk-upload` | Admin only | Import products from CSV |
| GET | `/api/products/bulk-upload/template` | Public | Download CSV template |

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories/public` | Public | List active categories |
| GET | `/api/categories` | Public | List all categories |
| GET | `/api/categories/{id}` | Public | Get category by ID |
| POST | `/api/categories` | Admin + Collaborator | Create a category |
| PUT | `/api/categories/{id}` | Admin + Collaborator | Update a category |
| DELETE | `/api/categories/{id}` | Admin only | Deactivate a category |

## Bulk Product Upload

Products can be imported in bulk from a CSV file.

### CSV format

```csv
Name,Description,Price,SKU,Inventory,Category,ImageUrl
Nonstick Frying Pan,28cm aluminum frying pan,299.99,SART-001,15,Kitchen,https://example.com/image.jpg
3-Seater Sofa,Gray fabric sofa,2499.99,SOFA-001,5,Furniture,product.jpg
```

### Rules

- `SKU` must be unique
- Duplicate SKUs are skipped and reported
- Category is resolved by name
- If the category does not exist, it is created automatically
- `ImageUrl` supports external image URLs
- Rows with invalid `Price` or `Inventory` values are skipped

You can download the template from the admin panel or directly from:

`GET /api/products/bulk-upload/template`

## Database Migrations

Migrations are applied automatically during application startup.

To create a new migration:

```bash
cd backend/src/Core.Commerce

dotnet ef migrations add MigrationName \
  --project Core.Commerce.Infrastructure \
  --startup-project Core.Commerce.API \
  --output-dir Persistence/Migrations \
  --context AppDbContext
```

## CI/CD and Quality

Every push and pull request triggers the GitHub Actions workflow for build and SonarCloud analysis.

This pipeline helps enforce:

- code quality checks
- maintainability analysis
- reliability and security monitoring
- a quality gate before merging changes

## License

This project is licensed under the MIT License.