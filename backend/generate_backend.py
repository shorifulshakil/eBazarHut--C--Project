import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip())
        
base_dir = "/Users/md.prantoislam/Desktop/C-Project/backend/src"

# ================= Domain =================
domain_enums = """
namespace ECommerce.Domain.Enums;

public enum Role { Admin, Dealer, Customer }
public enum ApprovalStatus { Pending, Approved, Rejected, Unpublished }
public enum OrderStatus { Pending, Confirmed, Processing, Shipped, Delivered, Cancelled }
"""
write_file(f"{base_dir}/ECommerce.Domain/Enums.cs", domain_enums)

domain_entities = """
using System;
using System.Collections.Generic;

namespace ECommerce.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DealerProfile? DealerProfile { get; set; }
    public CustomerProfile? CustomerProfile { get; set; }
}

public class DealerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string ShopDescription { get; set; } = string.Empty;
    public string ShopCategory { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class CustomerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Cart? Cart { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentCategoryId { get; set; }
    
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DealerId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? SKU { get; set; }
    public string ApprovalStatus { get; set; } = "Pending";
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }

    public DealerProfile? Dealer { get; set; }
    public Category? Category { get; set; }
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}

public class ProductImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    public Product? Product { get; set; }
}

public class Cart
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public CustomerProfile? Customer { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtAdd { get; set; }

    public Cart? Cart { get; set; }
    public Product? Product { get; set; }
}

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public CustomerProfile? Customer { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid DealerId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceAtPurchase { get; set; }
    public decimal Subtotal { get; set; }

    public Order? Order { get; set; }
    public Product? Product { get; set; }
    public DealerProfile? Dealer { get; set; }
}
"""
write_file(f"{base_dir}/ECommerce.Domain/Entities.cs", domain_entities)

# ================= Infrastructure =================
infra_context = """
using Microsoft.EntityFrameworkCore;
using ECommerce.Domain.Entities;

namespace ECommerce.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<DealerProfile> DealerProfiles { get; set; }
    public DbSet<CustomerProfile> CustomerProfiles { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<DealerProfile>().HasOne(d => d.User).WithOne(u => u.DealerProfile).HasForeignKey<DealerProfile>(d => d.UserId);
        modelBuilder.Entity<CustomerProfile>().HasOne(c => c.User).WithOne(u => u.CustomerProfile).HasForeignKey<CustomerProfile>(c => c.UserId);
        
        modelBuilder.Entity<Cart>().HasOne(c => c.Customer).WithOne(cp => cp.Cart).HasForeignKey<Cart>(c => c.CustomerId);
        
        modelBuilder.Entity<Category>().HasOne(c => c.ParentCategory).WithMany(c => c.SubCategories).HasForeignKey(c => c.ParentCategoryId);
    }
}
"""
write_file(f"{base_dir}/ECommerce.Infrastructure/ApplicationDbContext.cs", infra_context)

print("Backend scaffold script generated!")
