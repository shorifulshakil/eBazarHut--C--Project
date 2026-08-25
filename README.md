# Multi-Vendor E-Commerce Platform

A production-quality multi-vendor e-commerce web application built with **C# / ASP.NET Core** (backend) and **Next.js + TypeScript** (frontend), using **PostgreSQL** as the database.

## Features

- **Three Roles:** Admin, Dealer (vendor), Customer
- **Dealer Shops:** Dealers register their own shop and manage product catalogs
- **Product Approval Workflow:** New dealer products start hidden and require Admin approval before public visibility
- **Customer Storefront:** Browse, search, filter, sort approved products; cart and checkout
- **Admin Oversight:** Full platform management — users, dealers, products, categories, orders, approvals, statistics
- **Role-Based Authorization:** Every endpoint enforces ownership and role checks server-side

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# / ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Database | PostgreSQL |
| Auth | JWT + ASP.NET Core Identity |
| Frontend | Next.js 14+ (App Router) + TypeScript + React |
| Styling | Tailwind CSS |
| API Docs | Swagger / OpenAPI |

## Project Structure

```
C-Project/
├── backend/             # ASP.NET Core Web API
│   ├── src/
│   │   └── ECommerce.API/
│   └── docs/
├── frontend/            # Next.js application
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── lib/
└── database/            # SQL scripts and migrations
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [pgAdmin 4](https://www.pgadmin.org/) (optional, for DB management)

## Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE ecommerce_db;"

# Run schema and seed scripts
psql -U postgres -d ecommerce_db -f database/schema.sql
psql -U postgres -d ecommerce_db -f database/seed.sql
```

Or apply EF Core migrations (see backend README).

### 2. Backend Setup

```bash
cd backend
dotnet restore
dotnet run --project src/ECommerce.API
```

API will be available at `https://localhost:7001` with Swagger at `/swagger`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`.

### 4. Environment Configuration

Copy the example env files and update with your credentials:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

### Development Credentials (seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer@ecommerce.com | Dealer@123 |
| Customer | customer@ecommerce.com | Customer@123 |

> **WARNING:** These are DEVELOPMENT ONLY credentials. Change before any real deployment.

## How This Project Demonstrates C# and .NET

- **OOP:** Entity classes with relationships, inheritance (role-based user hierarchy), encapsulation in services
- **ASP.NET Core:** Web API with routing, middleware pipeline, dependency injection
- **Entity Framework Core:** Code-first migrations, LINQ queries, relationship mapping, transactions
- **Dependency Injection:** Service registration, repository pattern, scoped lifetimes
- **Middleware:** Authentication middleware, exception handling middleware, CORS
- **Auth/Authz:** JWT bearer authentication, role-based `[Authorize]` policies, ownership validation
- **REST:** Clean API design with proper HTTP verbs and status codes
- **Async/Await:** Non-blocking database operations with `async/await` throughout
- **LINQ:** Complex queries for filtering, searching, pagination, aggregations
- **DTOs:** Data transfer objects for request/response separation from entities
- **Relationships:** One-to-one, one-to-many, many-to-many with proper foreign keys
- **Exception Handling:** Global exception handling middleware with consistent error responses
- **Validation:** Data annotations and FluentValidation for input validation

## Documentation

- [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) — Component completion log
- [AI_HANDOVER.md](./AI_HANDOVER.md) — Handoff guide for AI agents
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture and design decisions
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — Complete API reference
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — Database schema and ER diagram
# C-Project
