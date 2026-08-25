namespace ECommerce.Domain.Interfaces;
using ECommerce.Domain.Entities;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
