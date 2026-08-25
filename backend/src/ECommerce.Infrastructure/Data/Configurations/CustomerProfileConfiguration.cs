using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class CustomerProfileConfiguration : IEntityTypeConfiguration<CustomerProfile>
{
    public void Configure(EntityTypeBuilder<CustomerProfile> builder)
    {
        builder.ToTable("customer_profiles");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnType("uuid");
        builder.Property(c => c.ShippingAddress);
        builder.Property(c => c.UserId).HasColumnType("uuid").IsRequired();
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(c => c.UserId).IsUnique();
        builder.HasOne(c => c.User).WithOne(u => u.CustomerProfile).HasForeignKey<CustomerProfile>(c => c.UserId);
    }
}
