# Architecture

## Overview

This is a **layered monolith** ASP.NET Core Web API with a separate Next.js frontend. The architecture follows clean architecture principles while keeping it simple enough for a university project.

## Backend Architecture

### Solution Structure

```
ECommerce.sln
├── src/
│   ├── ECommerce.API/              # Presentation Layer
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Controllers/
│   │
│   ├── ECommerce.Application/      # Application Layer
│   │   ├── Services/
│   │   ├── DTOs/
│   │   ├── Interfaces/
│   │   └── Mappings/
│   │
│   ├── ECommerce.Domain/           # Domain Layer
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── Interfaces/
│   │
│   └── ECommerce.Infrastructure/   # Infrastructure Layer
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   └── Configurations/
│       ├── Repositories/
│       ├── Migrations/
│       └── Services/
│
└── tests/
    ├── ECommerce.UnitTests/
    └── ECommerce.IntegrationTests/
```

### Layer Responsibilities

| Layer | Responsibility | Depends On |
|-------|---------------|------------|
| **API** | HTTP routing, controllers, middleware, Swagger, DI registration | Application |
| **Application** | Business logic, services, DTOs, validation, orchestration | Domain |
| **Domain** | Entities, enums, domain interfaces, business rules | None (pure) |
| **Infrastructure** | EF Core, database access, repositories, migrations | Domain |

### Dependency Flow

```
API → Application → Domain
       ↓
  Infrastructure → Domain
```

Infrastructure references Domain but not vice versa. Application references Domain. API references Application.

### Key Design Decisions

1. **No CQRS/MediatR:** Overkill for this project size. Simple service layer is sufficient.
2. **No microservices:** Single deployable unit. Easier to develop, test, and deploy.
3. **Repository Pattern:** Abstracts EF Core details from services. Makes testing easier.
4. **DTOs:** Separate request/response models from domain entities. Prevents over-posting and serialization issues.
5. **FluentValidation:** Used alongside Data Annotations for complex validation rules.
6. **Global Exception Handling:** Custom middleware catches all exceptions and returns consistent error responses.

## Frontend Architecture

### Directory Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (customer)/
│   │   ├── products/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   └── account/page.tsx
│   ├── (dealer)/
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/edit/page.tsx
│   │   └── orders/page.tsx
│   ├── (admin)/
│   │   ├── dashboard/page.tsx
│   │   ├── products/pending/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── users/page.tsx
│   │   └── stats/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/           # Shared UI kit: Button, Input, Card, Badge, Modal, Table, Toast
│   ├── layout/       # Navbar, Footer, Sidebar
│   └── forms/        # Reusable form components
├── features/
│   ├── auth/         # Auth feature module
│   ├── products/     # Products feature module
│   ├── cart/         # Cart feature module
│   ├── orders/       # Orders feature module
│   └── admin/        # Admin feature modules
├── services/
│   └── api.ts        # API client (fetch wrappers)
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
├── types/
│   └── index.ts      # TypeScript interfaces
├── lib/
│   └── utils.ts      # Helper functions
└── public/
```

### Key Design Decisions

1. **App Router:** Next.js 14+ App Router for better performance and React Server Components support.
2. **Route Groups:** `(auth)`, `(customer)`, `(dealer)`, `(admin)` for layout grouping without affecting URLs.
3. **Feature-based organization:** `features/` groups related components, hooks, and services.
4. **Shared UI Kit:** Consistent design system built once in `components/ui/`.
5. **API Client:** Centralized in `services/api.ts` with typed methods for each endpoint.
6. **No state management library:** React Context + hooks sufficient for this project size.

## Security Architecture

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT Bearer tokens (15-min access, 7-day refresh) |
| Authorization | `[Authorize(Roles = "...")]` + ownership checks from JWT claims |
| Password Storage | ASP.NET Core Identity with BCrypt hashing |
| Input Validation | Data Annotations + FluentValidation |
| CORS | Locked to frontend origin only |
| Secrets | Environment variables, `appsettings.Development.json` gitignored |
| Error Handling | Global middleware — no stack traces in responses |
| SQL Injection | Prevented by EF Core parameterized queries |

## Database Architecture

- **PostgreSQL** via EF Core 8
- **Code-first migrations** for schema evolution
- **Foreign keys** with proper cascade rules
- **Indexes** on frequently queried columns (ApprovalStatus, CategoryId, DealerId)
- **Transactions** for order creation + stock decrement

See `DATABASE_DESIGN.md` for the full schema.

## Deviations from Master Prompt

None at this stage. Any future deviations will be documented here with reasoning.
