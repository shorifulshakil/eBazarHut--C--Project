using AutoMapper;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public AuthService(IUnitOfWork unitOfWork, IJwtTokenGenerator jwtTokenGenerator, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenGenerator = jwtTokenGenerator;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await _unitOfWork.Users.GetQueryable()
            .FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existing != null)
            throw new InvalidOperationException("Email already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            Role = Enum.TryParse<UserRole>(request.Role, true, out var role) ? role : UserRole.Customer,
            IsActive = true,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var token = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var userDto = _mapper.Map<UserDto>(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Id = userDto.Id.ToString(),
            Email = userDto.Email,
            FullName = userDto.FullName,
            Role = userDto.Role
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetQueryable()
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid credentials or inactive user");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        var token = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var userDto = _mapper.Map<UserDto>(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Id = userDto.Id.ToString(),
            Email = userDto.Email,
            FullName = userDto.FullName,
            Role = userDto.Role
        };
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");

        return _mapper.Map<UserDto>(user);
    }
}
