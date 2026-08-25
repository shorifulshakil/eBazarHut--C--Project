using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class DealerProfileConfiguration : IEntityTypeConfiguration<DealerProfile>
{
    public void Configure(EntityTypeBuilder<DealerProfile> builder)
    {
        builder.ToTable("dealer_profiles");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnType("uuid");
        builder.Property(d => d.ShopName).HasMaxLength(256).IsRequired();
        builder.Property(d => d.ShopDescription);
        builder.Property(d => d.ShopCategory).HasMaxLength(128).IsRequired();
        builder.Property(d => d.Address).IsRequired();
        builder.Property(d => d.LogoUrl);
        builder.Property(d => d.IsApproved).HasDefaultValue(false);
        builder.Property(d => d.UserId).HasColumnType("uuid").IsRequired();
        builder.Property(d => d.CreatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(d => d.UserId).IsUnique();
        builder.HasOne(d => d.User).WithOne(u => u.DealerProfile).HasForeignKey<DealerProfile>(d => d.UserId);
    }
}
