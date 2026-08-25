using AutoMapper;
using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;

namespace ECommerce.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AdminService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<UserDto>> GetAllUsersAsync(string? role, bool? isActive, string? search, int page, int pageSize)
    {
        var query = _unitOfWork.Users.GetQueryable();

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var userRole))
            query = query.Where(u => u.Role == userRole);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Email.Contains(search!) || u.FullName.Contains(search!));

        query = query.OrderBy(u => u.FullName);

        var users = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return users.Select(_mapper.Map<UserDto>).ToList();
    }

    public async Task<UserDto> UpdateUserStatusAsync(Guid userId, UserStatusUpdate request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<List<DealerProfileResponse>> GetAllDealersAsync()
    {
        var dealers = _unitOfWork.DealerProfiles.GetQueryable().OrderBy(d => d.ShopName).ToList();
        return dealers.Select(_mapper.Map<DealerProfileResponse>).ToList();
    }

    public async Task<StatsResponse> GetStatsAsync()
    {
        var users = _unitOfWork.Users.GetQueryable().ToList();
        var products = _unitOfWork.Products.GetQueryable().ToList();
        var orders = _unitOfWork.Orders.GetQueryable().ToList();

        var totalRevenue = orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount);

        return new StatsResponse
        {
            TotalUsers = users.Count,
            TotalDealers = users.Count(u => u.Role == UserRole.Dealer),
            TotalCustomers = users.Count(u => u.Role == UserRole.Customer),
            TotalProducts = products.Count,
            PendingProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Pending),
            ApprovedProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Approved),
            RejectedProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Rejected),
            TotalOrders = orders.Count,
            TotalRevenue = totalRevenue
        };
    }
}
