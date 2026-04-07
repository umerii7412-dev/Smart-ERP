using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;

namespace ERP_System.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .OrderByDescending(o => o.Id)
                    .Select(o => new {
                        o.Id,
                        o.OrderDate,
                        // UI ke liye property names asan kar diye hain
                        totalAmount = o.FinalTotal,
                        o.PaymentStatus,
                        customerName = o.Customer != null ? o.Customer.Name : "N/A",
                        orderItems = o.OrderItems.Select(oi => new {
                            productName = oi.Product != null ? oi.Product.Name : "Unknown Product",
                            qtySold = oi.QtySold,
                            priceAtSale = oi.PriceAtSale
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderDto dto)
        {
            if (dto == null || dto.Items == null || !dto.Items.Any())
                return BadRequest("Order data ya items missing hain.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // User ID extraction with fallback
                var userIdString = User.FindFirst("UserId")?.Value;
                int userId = string.IsNullOrEmpty(userIdString) ? 1 : int.Parse(userIdString);

                var order = new Order
                {
                    UserId = userId,
                    CustomerId = dto.CustomerId,
                    BankId = dto.BankId,
                    OrderDate = DateTime.Now,
                    TaxAmount = dto.TaxAmount,
                    FinalTotal = dto.TotalAmount,
                    PaymentStatus = dto.PaymentStatus,
                    OrderItems = new List<OrderItem>()
                };

                foreach (var itemDto in dto.Items)
                {
                    var product = await _context.Products.FindAsync(itemDto.ProductId);

                    if (product == null)
                        return NotFound($"Product ID {itemDto.ProductId} database mein nahi mili.");

                    if (product.StockQuantity < itemDto.Quantity)
                        return BadRequest($"{product.Name} ka stock kam hai. Mojood: {product.StockQuantity}");

                    // Stock update logic
                    product.StockQuantity -= itemDto.Quantity;

                    var orderItem = new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        QtySold = itemDto.Quantity,
                        PriceAtSale = itemDto.UnitPrice
                        // Note: Id aur OrderId EF Core khud handle karega mapping ke baad
                    };

                    order.OrderItems.Add(orderItem);
                }

                // Balance update for unpaid/partial orders
                if (dto.PaymentStatus != "Paid")
                {
                    var customer = await _context.Customers.FindAsync(dto.CustomerId);
                    if (customer != null)
                    {
                        customer.Balance -= dto.TotalAmount;
                    }
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Order Processed Successfully!", OrderId = order.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Specific inner exception message bhej rahay hain debugging ke liye
                var innerMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, "Order fail: " + innerMessage);
            }
        }
    }
}