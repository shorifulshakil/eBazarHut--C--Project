using AutoMapper;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;

namespace ECommerce.Application.Services;

public class DealerService : IDealerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DealerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DealerProfileResponse> GetProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (user.Role != UserRole.Dealer)
            throw new InvalidOperationException("User is not a dealer.");

        var profileList = await _unitOfWork.DealerProfiles.FindAsync(d => d.UserId == userId);
        var profile = user.DealerProfile ?? profileList.FirstOrDefault();
        if (profile == null)
            throw new KeyNotFoundException("Dealer profile not found.");

        return _mapper.Map<DealerProfileResponse>(profile);
    }

    public async Task<DealerProfileResponse> CreateProfileAsync(Guid userId, DealerProfileRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (user.Role != UserRole.Dealer)
            throw new InvalidOperationException("User is not a dealer.");

        var existing = await _unitOfWork.DealerProfiles.FindAsync(d => d.UserId == userId);
        if (existing.Any())
            throw new InvalidOperationException("Dealer profile already exists.");

        var profile = new DealerProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ShopName = request.ShopName ?? string.Empty,
            ShopDescription = request.ShopDescription,
            ShopCategory = request.ShopCategory ?? string.Empty,
            Address = request.Address ?? string.Empty,
            LogoUrl = request.LogoUrl,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.DealerProfiles.AddAsync(profile);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<DealerProfileResponse>(profile);
    }

    public async Task<DealerProfileResponse> UpdateProfileAsync(Guid userId, DealerProfileRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        var profile = await _unitOfWork.DealerProfiles.FindAsync(d => d.UserId == userId);
        var existing = profile.FirstOrDefault() ?? throw new KeyNotFoundException("Dealer profile not found.");

        existing.ShopName = request.ShopName ?? existing.ShopName;
        existing.ShopDescription = request.ShopDescription ?? existing.ShopDescription;
        existing.ShopCategory = request.ShopCategory ?? existing.ShopCategory;
        existing.Address = request.Address ?? existing.Address;
        existing.LogoUrl = request.LogoUrl ?? existing.LogoUrl;
        existing.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.DealerProfiles.UpdateAsync(existing);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<DealerProfileResponse>(existing);
    }
}
