namespace ECommerce.Domain.Interfaces;
using ECommerce.Domain.Entities;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Entities.DealerProfile> DealerProfiles { get; }
    IRepository<Entities.CustomerProfile> CustomerProfiles { get; }
    IRepository<Entities.Category> Categories { get; }
    IRepository<Entities.Product> Products { get; }
    IRepository<Entities.ProductImage> ProductImages { get; }
    IRepository<Entities.Cart> Carts { get; }
    IRepository<Entities.CartItem> CartItems { get; }
    IRepository<Entities.Order> Orders { get; }
    IRepository<Entities.OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
