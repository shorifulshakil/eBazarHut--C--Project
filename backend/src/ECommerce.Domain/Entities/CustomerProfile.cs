namespace ECommerce.Domain.Entities;

public class CustomerProfile : BaseEntity
{
    public string? ShippingAddress { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Cart? Cart { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
