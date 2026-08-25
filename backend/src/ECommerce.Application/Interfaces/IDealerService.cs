using ECommerce.Application.DTOs.Dealer;

namespace ECommerce.Application.Interfaces;

public interface IDealerService
{
    Task<DealerProfileResponse> GetProfileAsync(Guid userId);
    Task<DealerProfileResponse> CreateProfileAsync(Guid userId, DealerProfileRequest request);
    Task<DealerProfileResponse> UpdateProfileAsync(Guid userId, DealerProfileRequest request);
}
