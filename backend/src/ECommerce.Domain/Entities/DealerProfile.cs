using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class DealerProfile : BaseEntity
{
    [MaxLength(256)]
    public string ShopName { get; set; } = string.Empty;

    public string? ShopDescription { get; set; }

    [MaxLength(128)]
    public string ShopCategory { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public bool IsApproved { get; set; } = false;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
