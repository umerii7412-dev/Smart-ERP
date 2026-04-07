using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;
using System.Security.Claims;

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

        // --- NAYA ADD KIYA GAYA GET METHOD ---
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            // Include ka maqsad Customer aur User ka data saath nikalna hai
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
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

                    if (product == null) return NotFound($"Product ID {itemDto.ProductId} nahi mili.");

                    if (product.StockQuantity < itemDto.Quantity)
                        return BadRequest($"{product.Name} ka stock kam hai. Mojood: {product.StockQuantity}");

                    product.StockQuantity -= itemDto.Quantity;

                    var orderItem = new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        QtySold = itemDto.Quantity,
                        PriceAtSale = itemDto.UnitPrice
                    };

                    order.OrderItems.Add(orderItem);
                }

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
                return BadRequest("Order fail: " + ex.Message);
            }
        }
    }
}