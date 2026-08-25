using AutoMapper;
using ECommerce.Application.DTOs.Order;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;

namespace ECommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrderResponse> CreateAsync(Guid customerId, OrderRequest request)
    {
        var customerProfile = await _unitOfWork.CustomerProfiles.GetByIdAsync(customerId)
            ?? throw new KeyNotFoundException("Customer profile not found.");

        var cart = _unitOfWork.Carts.GetQueryable().FirstOrDefault(c => c.CustomerId == customerId)
            ?? throw new InvalidOperationException("Cart is empty.");

        if (!cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        var orderItems = new List<OrderItem>();
        decimal total = 0;

        foreach (var cartItem in cart.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(cartItem.ProductId)
                ?? throw new KeyNotFoundException($"Product {cartItem.ProductId} not found.");

            if (product.ApprovalStatus != ApprovalStatus.Approved)
                throw new InvalidOperationException($"Product '{product.Name}' is not available.");

            if (product.StockQuantity < cartItem.Quantity)
                throw new InvalidOperationException($"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}");

            var dealer = await _unitOfWork.DealerProfiles.GetByIdAsync(product.DealerId)
                ?? throw new KeyNotFoundException("Dealer not found.");

            var subtotal = cartItem.Quantity * product.Price;
            total += subtotal;

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = Guid.Empty,
                ProductId = product.Id,
                DealerId = dealer.Id,
                Quantity = cartItem.Quantity,
                UnitPriceAtPurchase = product.Price,
                Subtotal = subtotal
            });

            product.StockQuantity -= cartItem.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Products.UpdateAsync(product);
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerProfile.Id,
            Status = OrderStatus.Pending,
            TotalAmount = total,
            ShippingAddress = request.ShippingAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
            order.Items.Add(item);
        }

        await _unitOfWork.Orders.AddAsync(order);
        await ClearCartAsync(customerId);
        await _unitOfWork.SaveChangesAsync();

        return MapToResponse(order, customerProfile);
    }

    public async Task<OrderResponse?> GetByIdAsync(Guid orderId)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
        if (order == null) return null;
        var customer = await _unitOfWork.CustomerProfiles.GetByIdAsync(order.CustomerId);
        return MapToResponse(order, customer!);
    }

    public async Task<List<OrderResponse>> GetCustomerOrdersAsync(Guid customerId)
    {
        var orders = _unitOfWork.Orders.GetQueryable()
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToList();

        var result = new List<OrderResponse>();
        foreach (var order in orders)
        {
            var customer = await _unitOfWork.CustomerProfiles.GetByIdAsync(order.CustomerId);
            result.Add(MapToResponse(order, customer!));
        }
        return result;
    }

    public async Task<List<OrderResponse>> GetDealerOrdersAsync(Guid dealerId)
    {
        var orders = _unitOfWork.Orders.GetQueryable()
            .Where(o => o.Items.Any(i => i.DealerId == dealerId))
            .OrderByDescending(o => o.CreatedAt)
            .ToList();

        var result = new List<OrderResponse>();
        foreach (var order in orders)
        {
            var customer = await _unitOfWork.CustomerProfiles.GetByIdAsync(order.CustomerId);
            result.Add(MapToResponse(order, customer!));
        }
        return result;
    }

    public async Task<OrderResponse> UpdateStatusAsync(Guid orderId, string status)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(orderId)
            ?? throw new KeyNotFoundException("Order not found.");

        if (!Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            throw new ArgumentException("Invalid order status.");

        var allowedTransitions = new Dictionary<OrderStatus, OrderStatus[]>
        {
            [OrderStatus.Pending] = new[] { OrderStatus.Confirmed, OrderStatus.Cancelled },
            [OrderStatus.Confirmed] = new[] { OrderStatus.Processing, OrderStatus.Cancelled },
            [OrderStatus.Processing] = new[] { OrderStatus.Shipped },
            [OrderStatus.Shipped] = new[] { OrderStatus.Delivered },
            [OrderStatus.Delivered] = Array.Empty<OrderStatus>(),
            [OrderStatus.Cancelled] = Array.Empty<OrderStatus>()
        };

        if (!allowedTransitions[order.Status].Contains(newStatus))
            throw new InvalidOperationException($"Cannot transition from {order.Status} to {newStatus}.");

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Orders.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        var customer = await _unitOfWork.CustomerProfiles.GetByIdAsync(order.CustomerId);
        return MapToResponse(order, customer!);
    }

    private async Task ClearCartAsync(Guid customerId)
    {
        var cart = _unitOfWork.Carts.GetQueryable().FirstOrDefault(c => c.CustomerId == customerId);
        if (cart == null) return;
        foreach (var item in cart.Items.ToList())
        {
            await _unitOfWork.CartItems.DeleteAsync(item);
        }
    }

    private OrderResponse MapToResponse(Order order, CustomerProfile customer)
    {
        return new OrderResponse
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = customer.User.FullName,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            ShippingAddress = order.ShippingAddress,
            Items = order.Items.Select(i => new OrderItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductImageUrl = i.Product.Images.FirstOrDefault()?.ImageUrl,
                DealerId = i.DealerId,
                DealerName = i.Dealer.ShopName,
                Quantity = i.Quantity,
                UnitPriceAtPurchase = i.UnitPriceAtPurchase,
                Subtotal = i.Subtotal
            }).ToList(),
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };
    }
}
