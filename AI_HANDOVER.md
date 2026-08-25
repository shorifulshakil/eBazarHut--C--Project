# AI Handover Document

This document is written so a *different* AI agent with zero chat history can pick up this project immediately.

## Objective

Build a complete, production-quality **multi-vendor e-commerce web application** for a university project. Three roles: Admin, Dealer, Customer. Core feature: Dealer products require Admin approval before public visibility.

## Current Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# / ASP.NET Core Web API (.NET 8) |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL 14+ |
| Auth | JWT Bearer + ASP.NET Core Identity |
| Frontend | Next.js 14+ (App Router) + TypeScript + React |
| Styling | Tailwind CSS |
| API Docs | Swagger / OpenAPI |

## Architecture

### Backend (Layered)
```
ECommerce.API/           # Presentation layer — Controllers, Program.cs, Middleware
├── ECommerce.Application/  # Application layer — Services, DTOs, Interfaces
├── ECommerce.Domain/       # Domain layer — Entities, Enums, Interfaces
└── ECommerce.Infrastructure/ # Infrastructure — DbContext, Repositories, Migrations
```

### Frontend
```
app/           # Next.js App Router pages
components/    # Shared UI components (Button, Input, Card, Badge, Modal, Table, Toast)
features/      # Feature modules (auth, products, cart, orders, admin)
services/      # API client wrappers
hooks/         # Custom React hooks
types/         # TypeScript type definitions
lib/           # Utilities and helpers
```

## Completed Modules

| Module | Status | Notes |
|--------|--------|-------|
| Documentation (6 files) | ✅ Complete | README, PROJECT_PROGRESS, AI_HANDOVER, ARCHITECTURE, API_DOCUMENTATION, DATABASE_DESIGN |
| Database Schema | ✅ Designed | See DATABASE_DESIGN.md |
| Database SQL Scripts | ✅ Complete | `database/schema.sql`, `database/seed.sql` |
| Backend Project Structure | ⏳ Pending | .NET solution and projects not yet created |
| EF Core Models | ⏳ Pending | |
| EF Core Migrations | ⏳ Pending | |
| Authentication | ⏳ Pending | |
| Authorization | ⏳ Pending | |
| API Controllers | ⏳ Pending | |
| Frontend Project | ⏳ Pending | Next.js not yet scaffolded |
| Frontend Pages | ⏳ Pending | |
| Testing | ⏳ Pending | |

## Database Schema Status

Finalized per master prompt Section 4. Entities:
- User (with Role enum: Admin/Dealer/Customer)
- DealerProfile (1:1 with User)
- CustomerProfile (1:1 with User)
- Category (self-referencing for subcategories)
- Product (with ApprovalStatus enum)
- ProductImage
- Cart (1:1 with CustomerProfile)
- CartItem
- Order
- OrderItem

See `DATABASE_DESIGN.md` for full ER diagram and table descriptions.

## Live API Endpoints

Not yet implemented. Planned endpoints per master prompt Section 6:

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Dealer:** `GET/PUT /api/dealers/profile`, `GET /api/dealers/products`, `POST /api/dealers/products`, `PUT/DELETE /api/dealers/products/{id}`, `GET /api/dealers/orders`

**Customer/Public:** `GET /api/products`, `GET /api/products/{id}`, `GET /api/categories`, `GET /api/dealers/{id}/public-profile`, `POST/GET /api/cart`, `PUT/DELETE /api/cart/items/{id}`, `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}`

**Admin:** `GET /api/admin/users`, `PUT /api/admin/users/{id}/status`, `GET /api/admin/dealers`, `GET /api/admin/products/pending`, `PUT /api/admin/products/{id}/approve`, `PUT /api/admin/products/{id}/reject`, `DELETE /api/admin/products/{id}`, `GET/POST/PUT/DELETE /api/admin/categories`, `GET /api/admin/stats`

## Live Frontend Routes

Not yet implemented. Planned routes:
- `/` — Home page with hero and featured products
- `/products` — Product listing with search/filter/sort
- `/products/[id]` — Product detail
- `/cart` — Shopping cart
- `/checkout` — Checkout flow
- `/auth/login` — Login
- `/auth/register` — Register (role selection)
- `/dealer/dashboard` — Dealer dashboard
- `/dealer/products` — Dealer product management
- `/dealer/orders` — Dealer orders
- `/admin/dashboard` — Admin dashboard
- `/admin/products/pending` — Admin approval queue
- `/admin/categories` — Category management
- `/admin/users` — User management
- `/admin/stats` — Platform statistics
- `/account` — User profile (shared)

## Auth Implementation Notes

- JWT Bearer authentication with ASP.NET Core Identity
- Passwords hashed with BCrypt (via Identity)
- Tokens include role claim for authorization
- All protected endpoints validate token and extract user ID from claims
- Never trust client-supplied IDs for ownership checks — derive from JWT

## Known Bugs/Limitations

- No code implemented yet — pure scaffolding phase
- File upload for product images not yet designed
- Payment integration not part of scope (checkout is order creation only)
- Email notifications not part of scope

## What Must NOT Be Changed Without Explicit Reason

- Technology stack: C# backend, Next.js frontend, PostgreSQL database
- Three roles: Admin, Dealer, Customer
- Dealer product approval workflow (core feature)
- Ownership checks derived from JWT, never client-supplied IDs
- Server-side calculation of order totals and stock validation
- The six documentation files are mandatory and must stay current

```
CURRENT STATUS:
Project initialized. Documentation complete. Database schema and SQL scripts ready. Backend and frontend implementation pending.

LAST COMPLETED TASK:
Created project documentation and database scripts.

CURRENT TASK:
Create backend .NET project structure and EF Core models/migrations.

NEXT TASK:
Implement authentication, authorization, and API controllers.

KNOWN ISSUES:
No code implemented yet. EF Core migrations not generated. Frontend not scaffolded.

IMPORTANT DECISIONS:
Technology stack locked per master prompt. Three roles fixed. Approval workflow is core feature. Ownership checks must be server-side from JWT claims.
```
