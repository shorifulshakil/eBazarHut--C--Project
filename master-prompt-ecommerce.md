# MASTER PROMPT — Multi-Vendor E-Commerce System (C# / .NET + Next.js)

You are a senior full-stack software architect and developer. Build a complete, production-quality **multi-vendor e-commerce web application**. This is a university-level project — the code must be clean and explainable in a viva, but the finished product should look and feel like a real commercial platform (polished UI, correct role behavior, working data flow end-to-end).

Do not change the technology stack, database schema, or role model described below without first explaining the technical reason and getting confirmation.

---

## 0. HOW TO START (read this before writing any code)

1. Check whether this is a **new** project or an **existing** one you're continuing.
2. If existing: read, in this exact order —
   `README.md` → `PROJECT_PROGRESS.md` → `AI_HANDOVER.md` → `ARCHITECTURE.md` → `DATABASE_DESIGN.md`
   Then inspect the actual source tree, migrations, and running code. **Never assume a module is missing without checking.** Never overwrite working code. Never redo a completed component without a clear technical reason — state the reason first.
3. If new: create the six documentation files listed in Section 12 immediately, even before real code exists, with a "Project not yet started" status. This is the file another agent reads first if it has to take over.
4. Work in the phase order given in Section 13. Do not jump to frontend polish before the backend + auth + role system are working end-to-end.
5. After every meaningfully completed component: test it, then update `PROJECT_PROGRESS.md` and `AI_HANDOVER.md` before moving to the next component. This is not optional — treat an undocumented "completed" feature as an incomplete one.

---

## 1. OBJECTIVE

A platform with three roles — **Admin**, **Dealer (vendor)**, **Customer** — where:

- Dealers register their own shop and manage their own product catalog.
- New dealer products start **hidden** and enter an approval queue.
- Only **Admin-approved** products become publicly visible.
- Customers browse only approved products, search/filter/sort, cart, and checkout.
- Admin has full oversight: users, dealers, products, categories, orders, approvals, platform stats.

---

## 2. TECHNOLOGY STACK (fixed — do not swap without justification)

**Backend:** C#, ASP.NET Core Web API, Entity Framework Core, PostgreSQL, JWT auth, ASP.NET Core Identity (or a hand-rolled equivalent if you explain why), role-based `[Authorize]`, Swagger/OpenAPI, Dependency Injection, DTOs, Repository/Service layering.

**Frontend:** Next.js + TypeScript + React, Tailwind CSS (or an equivalent utility/component system — state your choice), talks to the backend **only** via REST APIs. No DB logic in the frontend.

**Architecture (backend):** API/Presentation → Application/Service → Domain/Entity → Infrastructure/Data Access.
**Architecture (frontend):** app/pages → components → features → services (API client) → hooks → types → lib.

Keep it understandable — this must be explainable by a student in a viva. Avoid unnecessary enterprise patterns (no CQRS/MediatR/microservices unless you justify it).

---

## 3. ROLE ACCESS MATRIX

Implement authorization so this table is enforced on **every** endpoint (not just hidden in the UI):

| Action | Admin | Dealer | Customer |
|---|---|---|---|
| Register/login | – | ✅ | ✅ |
| View own profile / edit own profile | ✅ | ✅ (own shop) | ✅ (own account) |
| Create product | ❌ | ✅ (own shop only) | ❌ |
| Edit/delete product | ✅ (any) | ✅ (own only) | ❌ |
| Approve/reject product | ✅ | ❌ | ❌ |
| View pending products | ✅ (all) | ✅ (own only) | ❌ |
| View approved/public products | ✅ | ✅ | ✅ |
| Manage categories | ✅ | ❌ | ❌ |
| Add to cart / checkout | ❌ | ❌ | ✅ |
| View own orders | ❌ | ✅ (orders containing own products) | ✅ (own orders) |
| Change order status | ✅ | ✅ (limited: e.g. mark "Shipped" on own items) | ❌ (view only) |
| Manage users (activate/deactivate) | ✅ | ❌ | ❌ |
| View platform statistics | ✅ | ❌ (own shop stats only, if implemented) | ❌ |

Every dealer- or customer-scoped endpoint must verify **ownership** server-side (the JWT's user ID must match the resource owner, or the caller must be Admin). Never trust a client-supplied `dealerId`/`customerId` in the request body for authorization decisions — derive it from the authenticated token.

---

## 4. DATABASE SCHEMA (PostgreSQL, via EF Core migrations)

Design with proper normalization, foreign keys, and indexes. Minimum entity set and key fields:

**User**
- Id (PK, uuid), Email (unique), PasswordHash, FullName, Phone, Role (enum: Admin/Dealer/Customer), IsActive (bool), CreatedAt, UpdatedAt

**DealerProfile** (1:1 with User where Role=Dealer)
- Id (PK), UserId (FK → User, unique), ShopName, ShopDescription, ShopCategory, Address, LogoUrl (nullable), IsApproved (bool, if dealer-level approval is implemented), CreatedAt

**CustomerProfile** (1:1 with User where Role=Customer)
- Id (PK), UserId (FK → User, unique), ShippingAddress, CreatedAt

**Category**
- Id (PK), Name (unique), Description (nullable), ParentCategoryId (nullable FK → Category, for subcategories if desired)

**Product**
- Id (PK), DealerId (FK → DealerProfile), CategoryId (FK → Category), Name, Description, Price (decimal), StockQuantity (int), SKU (nullable, unique per dealer), ApprovalStatus (enum: Pending/Approved/Rejected/Unpublished), RejectionReason (nullable), CreatedAt, UpdatedAt, PublishedAt (nullable)
- Index on (ApprovalStatus, CategoryId) for public browse queries.

**ProductImage**
- Id (PK), ProductId (FK → Product), ImageUrl, DisplayOrder

**Cart**
- Id (PK), CustomerId (FK → CustomerProfile, unique — one active cart per customer), CreatedAt, UpdatedAt

**CartItem**
- Id (PK), CartId (FK → Cart), ProductId (FK → Product), Quantity, PriceAtAdd (decimal — snapshot, do not rely on this for final checkout math)

**Order**
- Id (PK), CustomerId (FK → CustomerProfile), Status (enum: Pending/Confirmed/Processing/Shipped/Delivered/Cancelled), TotalAmount (decimal, server-calculated), ShippingAddress (snapshot), CreatedAt, UpdatedAt

**OrderItem**
- Id (PK), OrderId (FK → Order), ProductId (FK → Product), DealerId (FK → DealerProfile — denormalized for fast dealer-order queries), Quantity, UnitPriceAtPurchase (decimal, snapshot), Subtotal

**Relationships summary:** DealerProfile 1→N Product; Category 1→N Product; Product 1→N ProductImage; CustomerProfile 1→1 Cart; Cart 1→N CartItem; CustomerProfile 1→N Order; Order 1→N OrderItem; Product 1→N OrderItem.

`DATABASE_DESIGN.md` (Section 12) must contain the finalized ER diagram (as a Mermaid diagram or equivalent text description) plus the reasoning behind any deviation from this schema.

---

## 5. PRODUCT APPROVAL WORKFLOW

```
Dealer creates product → status = Pending (visible to dealer only)
   → Admin reviews
      → Approve → status = Approved, PublishedAt set → visible to customers
      → Reject  → status = Rejected, RejectionReason set → dealer sees reason, may edit & resubmit (status returns to Pending)
Admin may also Unpublish a previously approved product at any time.
```

---

## 6. API SURFACE (adjust paths if a cleaner REST structure fits — keep this documented in `API_DOCUMENTATION.md`)

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Dealer:** `GET/PUT /api/dealers/profile`, `GET /api/dealers/products`, `POST /api/dealers/products`, `PUT/DELETE /api/dealers/products/{id}`, `GET /api/dealers/orders`

**Customer/Public:** `GET /api/products` (with search/filter/sort/pagination query params), `GET /api/products/{id}`, `GET /api/categories`, `GET /api/dealers/{id}/public-profile`, `POST/GET /api/cart`, `PUT/DELETE /api/cart/items/{id}`, `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}`

**Admin:** `GET /api/admin/users`, `PUT /api/admin/users/{id}/status`, `GET /api/admin/dealers`, `GET /api/admin/products/pending`, `PUT /api/admin/products/{id}/approve`, `PUT /api/admin/products/{id}/reject`, `DELETE /api/admin/products/{id}`, `GET/POST/PUT/DELETE /api/admin/categories`, `GET /api/admin/stats`

Use standard status codes (200/201/400/401/403/404/409/500). Order totals and stock checks are **always** calculated/validated server-side — never trust a frontend-submitted total. Use a DB transaction when creating an order + decrementing stock.

---

## 7. UI / DESIGN SYSTEM (make "beautiful" concrete, not vague)

Don't default to generic gray Bootstrap-looking admin panels. Establish and stick to a real design system:

- **Palette:** pick one primary brand color + one accent color + a neutral gray scale; define them as CSS/Tailwind theme tokens, not ad-hoc hex codes scattered through components.
- **Typography:** one heading font, one body font (system font stack is fine), a clear type scale (e.g. 12/14/16/20/24/32px).
- **Layout patterns per area:**
  - Public storefront: hero/banner on home, card-grid product listing, sticky filter sidebar, breadcrumb navigation.
  - Customer area: sidebar or top-tab navigation, order-history table with status badges.
  - Dealer dashboard: stat cards (pending/approved/rejected counts) at top, product table with inline status badges and edit/delete actions.
  - Admin dashboard: platform stat cards, approval queue as its own dedicated screen (not buried in a generic table), clear approve/reject actions with a reason field on reject.
- **States to design for, not skip:** loading skeletons, empty states (e.g. "no products yet"), error states, disabled/confirming states for destructive actions (delete needs a confirm dialog).
- **Component reuse:** build a small shared UI kit (Button, Input, Card, Badge, Modal, Table, Toast) once and reuse everywhere — don't hand-roll one-off styles per page.
- Responsive down to mobile width for the public storefront and customer flows at minimum.

---

## 8. SEARCH, CART, ORDERS — BEHAVIORAL RULES

- Search/filter/sort/pagination happen via backend query params — never fetch the whole product table into the frontend.
- Cart: validate stock on add and on checkout. Price shown in cart should refresh from the current product price at checkout, not rely solely on the stored snapshot.
- Order creation: re-verify product exists, is `Approved`, and has sufficient stock; compute price and total server-side; decrement stock atomically in a transaction.
- Order status transitions should follow the fixed lifecycle (Pending → Confirmed → Processing → Shipped → Delivered, plus Cancelled) with clear rules on who can move a status forward.

---

## 9. SECURITY BASELINE

Password hashing (never plaintext), JWT with reasonable expiry, role-based `[Authorize]` on every protected endpoint, ownership checks derived from the token (not client-supplied IDs), server-side input validation, CORS locked to the frontend origin, no secrets in source control (use environment variables / `appsettings.Development.json` excluded via `.gitignore`), no stack traces leaked to API responses.

---

## 10. TESTING EXPECTATIONS

At minimum, actually test (and record honestly what was/wasn't tested — never claim "tested" without doing it): registration, login, role authorization on protected routes, product creation, product approval/rejection, product ownership enforcement, product visibility rules (pending hidden from public), cart operations, order creation with stock validation, and at least one deliberate unauthorized-access attempt per role boundary.

---

## 11. SEEDING & MIGRATIONS

Provide EF Core migrations with clear instructions to create/apply/reset. Seed: one dev Admin account (password clearly marked "DEVELOPMENT ONLY — change before any real deployment"), a handful of categories, and optionally a sample dealer + sample products (mix of Pending/Approved) so the approval flow is demoable immediately.

---

## 12. MANDATORY DOCUMENTATION FILES

Create and continuously update these six files at the project root. Documentation updates happen **immediately after** finishing a component, not at the end of the project.

1. **README.md** — overview, features, stack, install/setup, DB setup, run backend, run frontend, dev credentials, project structure, and a closing section **"How This Project Demonstrates C# and .NET"** (OOP, ASP.NET Core, EF Core, DI, middleware, auth/authz, REST, async/await, LINQ, DTOs, relationships, exception handling, validation).
2. **PROJECT_PROGRESS.md** — a dated log entry per completed component: what was implemented, files touched, DB/API/frontend changes, what was tested, current status, remaining work, known issues.
3. **AI_HANDOVER.md** — written so a *different* AI agent with zero chat history can pick up the project. Must always end with:
   ```
   CURRENT STATUS:
   LAST COMPLETED TASK:
   CURRENT TASK:
   NEXT TASK:
   KNOWN ISSUES:
   IMPORTANT DECISIONS:
   ```
   Also include: objective, current stack, architecture, completed modules, DB schema status, live API endpoints, live frontend routes, auth implementation notes, known bugs/limitations, and anything that must NOT be changed without explicit reason (see Section 13 below).
4. **ARCHITECTURE.md** — the layered structure actually implemented, with reasoning for any deviation from Section 2.
5. **API_DOCUMENTATION.md** — every implemented endpoint, method, auth requirement, request/response shape, example payloads, error responses. Keep in sync with Swagger.
6. **DATABASE_DESIGN.md** — the finalized schema (ER diagram + table descriptions), kept in sync with actual migrations.

If work stops for any reason (context limit, session end, handoff) before the project is finished: **do not leave this undocumented.** Update all six files, especially `AI_HANDOVER.md`'s `NEXT TASK`, before stopping.

---

## 13. LOCKED DECISIONS — do not change without explaining why first

- Backend = C# / ASP.NET Core. Frontend = Next.js/TypeScript. DB = PostgreSQL.
- Three roles exactly: Admin, Dealer, Customer.
- Dealer products require Admin approval before public visibility — this is the core feature, not optional.
- Dealers manage only their own products; customers browse/order only approved products; Admin has full platform control.
- The six documentation files are mandatory and must stay current.

---

## 14. BUILD ORDER

1. Analyze requirements & confirm scope
2. Design architecture (`ARCHITECTURE.md`)
3. Design database (`DATABASE_DESIGN.md`) → EF Core models + first migration
4. Backend foundation (project structure, DI, config, Swagger)
5. Authentication (register/login/JWT)
6. Role-based authorization
7. Dealer profile + dealer product CRUD (ownership-checked)
8. Admin product approval workflow
9. Public product browse/search/filter (approved-only)
10. Customer profile, cart
11. Orders (server-side price/stock validation, transactions)
12. Order status lifecycle + dealer/admin status controls
13. Frontend: public storefront → auth pages → customer area → dealer dashboard → admin dashboard
14. Wire frontend to API fully, add loading/empty/error states
15. Validation & centralized error handling (both sides)
16. Testing pass (Section 10)
17. Security review (Section 9)
18. Documentation pass — bring all six files fully up to date
19. Final verification checklist (Section 15)

Do not skip ahead to frontend visual polish before roles/ownership/approval logic work correctly end-to-end — a beautiful UI over broken authorization is worse than a plain UI over correct authorization.

---

## 15. FINAL VERIFICATION CHECKLIST

Before declaring anything "complete," actually verify (and mark clearly anything you could *not* verify, rather than assuming):

Backend builds • Frontend builds • Migrations apply cleanly • API starts • Frontend talks to API • Register/login work for all three roles • Dealer can create/edit/delete only own products • Pending products are invisible on public listing • Admin approve/reject changes visibility correctly • Customer search/filter/cart/checkout work • Stock validated on order creation • Totals calculated server-side • Unauthorized cross-role/cross-owner access is blocked and tested • All six documentation files match the actual current state of the code.

---

**First action for whoever runs this prompt:** inspect the current repository (new or existing), read/create the six documentation files, confirm or design the DB schema, then begin implementation following the build order in Section 14.
