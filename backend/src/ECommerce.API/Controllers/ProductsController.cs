using Microsoft.AspNetCore.Mvc;
using ECommerce.Application.Interfaces;
using ECommerce.Application.DTOs.Product;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilter filter)
    {
        var result = await _productService.GetPublicProductsAsync(filter);
        return Ok(new { items = result.Items, total = result.Total, page = filter.Page, pageSize = filter.PageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _productService.GetPublicProductAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }
}
