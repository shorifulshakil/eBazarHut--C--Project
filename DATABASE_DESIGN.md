# Database Design

## ER Diagram

```mermaid
erDiagram
    User ||--o| DealerProfile : "has"
    User ||--o| CustomerProfile : "has"
    User ||--o| Order : "places"
    
    DealerProfile ||--o{ Product : "sells"
    Category ||--o{ Product : "contains"
    Product ||--o{ ProductImage : "has"
    
    CustomerProfile ||--|| Cart : "has"
    Cart ||--o{ CartItem : "contains"
    CartItem }o--|| Product : "references"
    
    Order ||--o{ OrderItem : "contains"
    OrderItem }o--|| Product : "references"
    OrderItem }o--|| DealerProfile : "sold_by"
    
    Product ||--o{ OrderItem : "appears_in"
```

## Table Specifications

### User
Stores authentication and role information for all platform users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| Email | VARCHAR(256) | UNIQUE, NOT NULL | Login identifier |
| PasswordHash | TEXT | NOT NULL | BCrypt hashed password |
| FullName | VARCHAR(256) | NOT NULL | Display name |
| Phone | VARCHAR(32) | NULLABLE | Contact phone |
| Role | VARCHAR(32) | NOT NULL | Admin / Dealer / Customer |
| IsActive | BOOLEAN | NOT NULL, DEFAULT true | Account status |
| CreatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Account creation |
| UpdatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Last update |

**Indexes:** Email (unique)

### DealerProfile
Extended profile for users with Dealer role. 1:1 with User.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| UserId | UUID | FK → User(Id), UNIQUE, NOT NULL | Owner user |
| ShopName | VARCHAR(256) | NOT NULL | Shop display name |
| ShopDescription | TEXT | NULLABLE | Shop bio |
| ShopCategory | VARCHAR(128) | NOT NULL | Primary category |
| Address | TEXT | NOT NULL | Shop address |
| LogoUrl | TEXT | NULLABLE | Logo image URL |
| IsApproved | BOOLEAN | NOT NULL, DEFAULT false | Dealer approval status |
| CreatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Registration date |

### CustomerProfile
Extended profile for users with Customer role. 1:1 with User.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| UserId | UUID | FK → User(Id), UNIQUE, NOT NULL | Owner user |
| ShippingAddress | TEXT | NULLABLE | Default shipping address |
| CreatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Registration date |

### Category
Product categories with optional parent for subcategories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| Name | VARCHAR(128) | UNIQUE, NOT NULL | Category name |
| Description | TEXT | NULLABLE | Category description |
| ParentCategoryId | UUID | FK → Category(Id), NULLABLE | Parent category |

**Indexes:** Name (unique)

### Product
Products listed by dealers. Starts Pending until Admin approves.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| DealerId | UUID | FK → DealerProfile(Id), NOT NULL | Seller |
| CategoryId | UUID | FK → Category(Id), NOT NULL | Category |
| Name | VARCHAR(256) | NOT NULL | Product name |
| Description | TEXT | NULLABLE | Product description |
| Price | DECIMAL(10,2) | NOT NULL | Unit price |
| StockQuantity | INTEGER | NOT NULL, DEFAULT 0 | Available stock |
| SKU | VARCHAR(128) | NULLABLE, UNIQUE per dealer | Stock keeping unit |
| ApprovalStatus | VARCHAR(32) | NOT NULL, DEFAULT 'Pending' | Pending/Approved/Rejected/Unpublished |
| RejectionReason | TEXT | NULLABLE | Reason if rejected |
| CreatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Creation date |
| UpdatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Last update |
| PublishedAt | TIMESTAMP | NULLABLE | When approved |

**Indexes:** (ApprovalStatus, CategoryId), DealerId, SKU

### ProductImage
Multiple images per product with display order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| ProductId | UUID | FK → Product(Id), NOT NULL | Parent product |
| ImageUrl | TEXT | NOT NULL | Image URL |
| DisplayOrder | INTEGER | NOT NULL, DEFAULT 0 | Sort order |

### Cart
One active cart per customer. 1:1 with CustomerProfile.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| CustomerId | UUID | FK → CustomerProfile(Id), UNIQUE, NOT NULL | Owner |
| CreatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Creation date |
| UpdatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Last modification |

### CartItem
Items in a cart.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| CartId | UUID | FK → Cart(Id), NOT NULL | Parent cart |
| ProductId | UUID | FK → Product(Id), NOT NULL | Product reference |
| Quantity | INTEGER | NOT NULL, DEFAULT 1 | Item quantity |
| PriceAtAdd | DECIMAL(10,2) | NOT NULL | Price snapshot at add time |

**Unique constraint:** (CartId, ProductId)

### Order
Customer orders with server-calculated totals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| CustomerId | UUID | FK → CustomerProfile(Id), NOT NULL | Buyer |
| Status | VARCHAR(32) | NOT NULL, DEFAULT 'Pending' | Order status |
| TotalAmount | DECIMAL(12,2) | NOT NULL | Server-calculated total |
| ShippingAddress | TEXT | NOT NULL | Delivery address snapshot |
| CreatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Order date |
| UpdatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Last status change |

### OrderItem
Line items in an order. DealerId denormalized for fast queries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| Id | UUID | PK | Primary key |
| OrderId | UUID | FK → Order(Id), NOT NULL | Parent order |
| ProductId | UUID | FK → Product(Id), NOT NULL | Product reference |
| DealerId | UUID | FK → DealerProfile(Id), NOT NULL | Seller (denormalized) |
| Quantity | INTEGER | NOT NULL | Units ordered |
| UnitPriceAtPurchase | DECIMAL(10,2) | NOT NULL | Price at time of order |
| Subtotal | DECIMAL(12,2) | NOT NULL | Quantity × UnitPrice |

## Relationship Rules

| Relationship | Type | Notes |
|--------------|------|-------|
| User → DealerProfile | 1:1 | Only when Role = Dealer |
| User → CustomerProfile | 1:1 | Only when Role = Customer |
| DealerProfile → Product | 1:N | Dealer owns products |
| Category → Product | 1:N | Product belongs to one category |
| Product → ProductImage | 1:N | Product has images |
| CustomerProfile → Cart | 1:1 | One active cart per customer |
| Cart → CartItem | 1:N | Cart contains items |
| CustomerProfile → Order | 1:N | Customer places orders |
| Order → OrderItem | 1:N | Order has line items |
| Product → OrderItem | 1:N | Product appears in orders |
| DealerProfile → OrderItem | 1:N | Dealer sells items (via OrderItem.DealerId) |

## Deviations from Master Prompt

None at this stage. This schema matches Section 4 of the master prompt exactly.
