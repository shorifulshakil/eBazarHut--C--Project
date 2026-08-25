using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerce.Application.Interfaces;
using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.DTOs.Product;
using ECommerce.Application.DTOs.Category;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IProductService _productService;
    private readonly ICategoryService _categoryService;

    public AdminController(IAdminService adminService, IProductService productService, ICategoryService categoryService)
    {
        _adminService = adminService;
        _productService = productService;
        _categoryService = categoryService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role, [FromQuery] bool? isActive, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var users = await _adminService.GetAllUsersAsync(role, isActive, search, page, pageSize);
        return Ok(new { items = users, total = users.Count, page, pageSize });
    }

    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UserStatusUpdate request)
    {
        var user = await _adminService.UpdateUserStatusAsync(id, request);
        return Ok(user);
    }

    [HttpGet("dealers")]
    public async Task<IActionResult> GetDealers()
    {
        var dealers = await _adminService.GetAllDealersAsync();
        return Ok(new { items = dealers, total = dealers.Count, page = 1, pageSize = dealers.Count });
    }

    [HttpGet("products/pending")]
    public async Task<IActionResult> GetPendingProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _productService.GetPendingProductsAsync(page, pageSize);
        return Ok(new { items = result.Items, total = result.Total, page, pageSize });
    }

    [HttpPut("products/{id}/approve")]
    public async Task<IActionResult> ApproveProduct(Guid id)
    {
        var product = await _productService.ApproveAsync(id);
        return Ok(product);
    }

    [HttpPut("products/{id}/reject")]
    public async Task<IActionResult> RejectProduct(Guid id, [FromBody] RejectProductRequest request)
    {
        var product = await _productService.RejectAsync(id, request.RejectionReason);
        return Ok(product);
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        await _productService.DeleteAsync(Guid.Empty, id);
        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(new { items = categories, total = categories.Count, page = 1, pageSize = categories.Count });
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest request)
    {
        var category = await _categoryService.CreateAsync(request);
        return Ok(category);
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryRequest request)
    {
        var category = await _categoryService.UpdateAsync(id, request);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await _categoryService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminService.GetStatsAsync();
        return Ok(stats);
    }
}
