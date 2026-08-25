using System.ComponentModel.DataAnnotations;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class User : BaseEntity
{
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(256)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? Phone { get; set; }

    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DealerProfile? DealerProfile { get; set; }
    public CustomerProfile? CustomerProfile { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
