using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;

namespace ECommerce.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new Repository<User>(_context);
        DealerProfiles = new Repository<DealerProfile>(_context);
        CustomerProfiles = new Repository<CustomerProfile>(_context);
        Categories = new Repository<Category>(_context);
        Products = new Repository<Product>(_context);
        ProductImages = new Repository<ProductImage>(_context);
        Carts = new Repository<Cart>(_context);
        CartItems = new Repository<CartItem>(_context);
        Orders = new Repository<Order>(_context);
        OrderItems = new Repository<OrderItem>(_context);
    }

    public IRepository<User> Users { get; }
    public IRepository<DealerProfile> DealerProfiles { get; }
    public IRepository<CustomerProfile> CustomerProfiles { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<Product> Products { get; }
    public IRepository<ProductImage> ProductImages { get; }
    public IRepository<Cart> Carts { get; }
    public IRepository<CartItem> CartItems { get; }
    public IRepository<Order> Orders { get; }
    public IRepository<OrderItem> OrderItems { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
