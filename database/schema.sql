-- ============================================
-- Multi-Vendor E-Commerce Platform
-- Database Schema (PostgreSQL)
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
    CREATE TYPE UserRole AS ENUM ('Admin', 'Dealer', 'Customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ApprovalStatus AS ENUM ('Pending', 'Approved', 'Rejected', 'Unpublished');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE OrderStatus AS ENUM ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Email" VARCHAR(256) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "FullName" VARCHAR(256) NOT NULL,
    "Phone" VARCHAR(32) NULL,
    "Role" UserRole NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users"("Email");
CREATE INDEX IF NOT EXISTS "IX_Users_Role" ON "Users"("Role");

-- ============================================
-- DEALER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS "DealerProfiles" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" UUID NOT NULL UNIQUE REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ShopName" VARCHAR(256) NOT NULL,
    "ShopDescription" TEXT NULL,
    "ShopCategory" VARCHAR(128) NOT NULL,
    "Address" TEXT NOT NULL,
    "LogoUrl" TEXT NULL,
    "IsApproved" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_DealerProfiles_UserId" ON "DealerProfiles"("UserId");

-- ============================================
-- CUSTOMER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS "CustomerProfiles" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" UUID NOT NULL UNIQUE REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ShippingAddress" TEXT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_CustomerProfiles_UserId" ON "CustomerProfiles"("UserId");

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS "Categories" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Name" VARCHAR(128) NOT NULL UNIQUE,
    "Description" TEXT NULL,
    "ParentCategoryId" UUID NULL REFERENCES "Categories"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Categories_Name" ON "Categories"("Name");

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS "Products" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "DealerId" UUID NOT NULL REFERENCES "DealerProfiles"("Id") ON DELETE CASCADE,
    "CategoryId" UUID NOT NULL REFERENCES "Categories"("Id") ON DELETE RESTRICT,
    "Name" VARCHAR(256) NOT NULL,
    "Description" TEXT NULL,
    "Price" DECIMAL(10,2) NOT NULL CHECK ("Price" >= 0),
    "StockQuantity" INTEGER NOT NULL DEFAULT 0 CHECK ("StockQuantity" >= 0),
    "SKU" VARCHAR(128) NULL,
    "ApprovalStatus" ApprovalStatus NOT NULL DEFAULT 'Pending',
    "RejectionReason" TEXT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "PublishedAt" TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS "IX_Products_ApprovalStatus_CategoryId" ON "Products"("ApprovalStatus", "CategoryId");
CREATE INDEX IF NOT EXISTS "IX_Products_DealerId" ON "Products"("DealerId");
CREATE INDEX IF NOT EXISTS "IX_Products_SKU" ON "Products"("SKU");
CREATE INDEX IF NOT EXISTS "IX_Products_Name" ON "Products" USING GIN ("Name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "IX_Products_Description" ON "Products" USING GIN ("Description" gin_trgm_ops);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS "ProductImages" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductId" UUID NOT NULL REFERENCES "Products"("Id") ON DELETE CASCADE,
    "ImageUrl" TEXT NOT NULL,
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "IX_ProductImages_ProductId" ON "ProductImages"("ProductId");

-- ============================================
-- CARTS
-- ============================================
CREATE TABLE IF NOT EXISTS "Carts" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "CustomerId" UUID NOT NULL UNIQUE REFERENCES "CustomerProfiles"("Id") ON DELETE CASCADE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Carts_CustomerId" ON "Carts"("CustomerId");

-- ============================================
-- CART ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS "CartItems" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "CartId" UUID NOT NULL REFERENCES "Carts"("Id") ON DELETE CASCADE,
    "ProductId" UUID NOT NULL REFERENCES "Products"("Id") ON DELETE CASCADE,
    "Quantity" INTEGER NOT NULL DEFAULT 1 CHECK ("Quantity" > 0),
    "PriceAtAdd" DECIMAL(10,2) NOT NULL CHECK ("PriceAtAdd" >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_CartItems_CartId_ProductId" ON "CartItems"("CartId", "ProductId");

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS "Orders" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "CustomerId" UUID NOT NULL REFERENCES "CustomerProfiles"("Id") ON DELETE RESTRICT,
    "Status" OrderStatus NOT NULL DEFAULT 'Pending',
    "TotalAmount" DECIMAL(12,2) NOT NULL CHECK ("TotalAmount" >= 0),
    "ShippingAddress" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Orders_CustomerId" ON "Orders"("CustomerId");
CREATE INDEX IF NOT EXISTS "IX_Orders_Status" ON "Orders"("Status");
CREATE INDEX IF NOT EXISTS "IX_Orders_CreatedAt" ON "Orders"("CreatedAt");

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS "OrderItems" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "OrderId" UUID NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "ProductId" UUID NOT NULL REFERENCES "Products"("Id") ON DELETE RESTRICT,
    "DealerId" UUID NOT NULL REFERENCES "DealerProfiles"("Id") ON DELETE RESTRICT,
    "Quantity" INTEGER NOT NULL CHECK ("Quantity" > 0),
    "UnitPriceAtPurchase" DECIMAL(10,2) NOT NULL CHECK ("UnitPriceAtPurchase" >= 0),
    "Subtotal" DECIMAL(12,2) NOT NULL CHECK ("Subtotal" >= 0)
);

CREATE INDEX IF NOT EXISTS "IX_OrderItems_OrderId" ON "OrderItems"("OrderId");
CREATE INDEX IF NOT EXISTS "IX_OrderItems_DealerId" ON "OrderItems"("DealerId");

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON "Users";
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON "Products";
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "Products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON "Carts";
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON "Carts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON "Orders";
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "Orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
