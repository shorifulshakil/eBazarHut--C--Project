using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;

namespace ECommerce.Application.Interfaces;

public interface IAdminService
{
    Task<List<UserDto>> GetAllUsersAsync(string? role, bool? isActive, string? search, int page, int pageSize);
    Task<UserDto> UpdateUserStatusAsync(Guid userId, UserStatusUpdate request);
    Task<List<DealerProfileResponse>> GetAllDealersAsync();
    Task<StatsResponse> GetStatsAsync();
}
