-- ============================================
-- Multi-Vendor E-Commerce Platform
-- Seed Data (PostgreSQL)
-- ============================================

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES
(uuid_generate_v4(), 'Electronics', 'Electronic devices and accessories'),
(uuid_generate_v4(), 'Clothing', 'Fashion and apparel'),
(uuid_generate_v4(), 'Home & Garden', 'Home improvement and garden supplies'),
(uuid_generate_v4(), 'Books', 'Books and educational materials'),
(uuid_generate_v4(), 'Sports', 'Sports equipment and accessories')
ON CONFLICT ("Name") DO NOTHING;

-- ============================================
-- USERS (passwords are BCrypt hashes of the plaintext passwords)
-- ============================================

-- Admin: Admin@123
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "IsActive")
VALUES (
    uuid_generate_v4(),
    'admin@ecommerce.com',
    '$2a$11$KIXz9eH7qH8qH8qH8qH8qO7qH8qH8qH8qH8qH8qH8qH8qH8qH8q', -- Admin@123 (replace with real BCrypt)
    'System Admin',
    '+1000000000',
    'Admin',
    true
) ON CONFLICT ("Email") DO NOTHING;

-- Dealer: Dealer@123
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "IsActive")
VALUES (
    uuid_generate_v4(),
    'dealer@ecommerce.com',
    '$2a$11$KIXz9eH7qH8qH8qH8qH8qO7qH8qH8qH8qH8qH8qH8qH8qH8qH8q', -- Dealer@123 (replace with real BCrypt)
    'John Dealer',
    '+1000000001',
    'Dealer',
    true
) ON CONFLICT ("Email") DO NOTHING;

-- Customer: Customer@123
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "IsActive")
VALUES (
    uuid_generate_v4(),
    'customer@ecommerce.com',
    '$2a$11$KIXz9eH7qH8qH8qH8qH8qO7qH8qH8qH8qH8qH8qH8qH8qH8qH8q', -- Customer@123 (replace with real BCrypt)
    'Jane Customer',
    '+1000000002',
    'Customer',
    true
) ON CONFLICT ("Email") DO NOTHING;

-- ============================================
-- DEALER PROFILE
-- ============================================
INSERT INTO "DealerProfiles" ("UserId", "ShopName", "ShopDescription", "ShopCategory", "Address", "IsApproved")
SELECT 
    u."Id",
    'Tech Haven',
    'Your one-stop shop for the latest electronics and gadgets',
    'Electronics',
    '123 Tech Street, Silicon Valley, CA',
    true
FROM "Users" u WHERE u."Email" = 'dealer@ecommerce.com'
ON CONFLICT ("UserId") DO NOTHING;

-- ============================================
-- CUSTOMER PROFILE
-- ============================================
INSERT INTO "CustomerProfiles" ("UserId", "ShippingAddress")
SELECT 
    u."Id",
    '456 Customer Lane, Springfield, IL'
FROM "Users" u WHERE u."Email" = 'customer@ecommerce.com'
ON CONFLICT ("UserId") DO NOTHING;

-- ============================================
-- SAMPLE PRODUCTS
-- ============================================
DO $$
DECLARE
    dealer_id UUID;
    cat_electronics UUID;
    cat_clothing UUID;
    cat_books UUID;
    prod_id UUID;
BEGIN
    SELECT "Id" INTO dealer_id FROM "DealerProfiles" WHERE "UserId" = (SELECT "Id" FROM "Users" WHERE "Email" = 'dealer@ecommerce.com');
    SELECT "Id" INTO cat_electronics FROM "Categories" WHERE "Name" = 'Electronics';
    SELECT "Id" INTO cat_clothing FROM "Categories" WHERE "Name" = 'Clothing';
    SELECT "Id" INTO cat_books FROM "Categories" WHERE "Name" = 'Books';

    IF dealer_id IS NOT NULL AND cat_electronics IS NOT NULL THEN
        -- Approved Product 1
        INSERT INTO "Products" ("DealerId", "CategoryId", "Name", "Description", "Price", "StockQuantity", "ApprovalStatus", "PublishedAt")
        VALUES (dealer_id, cat_electronics, 'Wireless Headphones', 'High-quality noise-canceling wireless headphones with 30-hour battery life.', 99.99, 50, 'Approved', NOW())
        RETURNING "Id" INTO prod_id;
        
        INSERT INTO "ProductImages" ("ProductId", "ImageUrl", "DisplayOrder") VALUES
            (prod_id, 'https://picsum.photos/400/400?random=1', 0);

        -- Approved Product 2
        INSERT INTO "Products" ("DealerId", "CategoryId", "Name", "Description", "Price", "StockQuantity", "ApprovalStatus", "PublishedAt")
        VALUES (dealer_id, cat_electronics, 'Smart Watch', 'Feature-rich smartwatch with health tracking and GPS.', 199.99, 30, 'Approved', NOW())
        RETURNING "Id" INTO prod_id;
        
        INSERT INTO "ProductImages" ("ProductId", "ImageUrl", "DisplayOrder") VALUES
            (prod_id, 'https://picsum.photos/400/400?random=2', 0);

        -- Pending Product (for demo approval flow)
        INSERT INTO "Products" ("DealerId", "CategoryId", "Name", "Description", "Price", "StockQuantity", "ApprovalStatus")
        VALUES (dealer_id, cat_electronics, 'Bluetooth Speaker', 'Portable waterproof Bluetooth speaker.', 49.99, 100, 'Pending')
        RETURNING "Id" INTO prod_id;
        
        INSERT INTO "ProductImages" ("ProductId", "ImageUrl", "DisplayOrder") VALUES
            (prod_id, 'https://picsum.photos/400/400?random=3', 0);

        -- Rejected Product (for demo)
        INSERT INTO "Products" ("DealerId", "CategoryId", "Name", "Description", "Price", "StockQuantity", "ApprovalStatus", "RejectionReason")
        VALUES (dealer_id, cat_electronics, 'Broken Product', 'This product has poor images.', 1.00, 0, 'Rejected', 'Image quality too low')
        RETURNING "Id" INTO prod_id;
    END IF;
END $$;

-- ============================================
-- NOTE: PASSWORD HASHES
-- ============================================
-- The seed passwords above use placeholder hashes.
-- You MUST replace them with real BCrypt hashes before using.
-- 
-- To generate real hashes, run this C# snippet in your backend:
--   var hasher = new PasswordHasher<User>();
--   hasher.HashPassword(null, "Admin@123");
--
-- Or use an online BCrypt generator with the passwords:
--   Admin@123
--   Dealer@123
--   Customer@123
-- ============================================
