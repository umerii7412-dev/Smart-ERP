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
                    // ✅ Note: Model mein navigation property ka naam 'Customer' hi rehne dein 
                    // lekin wo point 'User' class ko karegi.
                    .Include(o => o.Customer)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Product)
                    .OrderByDescending(o => o.Id)
                    .Select(o => new
                    {
                        o.Id,
                        o.OrderDate,
                        totalAmount = o.TotalAmount,
                        subtotal = o.Subtotal,
                        discount = o.Discount,
                        taxAmount = o.TaxAmount,
                        o.PaymentStatus,
                        customerName = o.Customer != null ? o.Customer.Name : "N/A",
                        orderItems = o.OrderItems.Select(oi => new
                        {
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
                return BadRequest("Order data is missing.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Login user ki ID nikalna (Admin/Staff jo order place kar raha hai)
                var userIdString = User.FindFirst("UserId")?.Value;
                int userId = string.IsNullOrEmpty(userIdString) ? 1 : int.Parse(userIdString);

                // ✅ FIX: Customers table se customer check karein (Users table se nahi)
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == dto.CustomerId);

                if (customer == null)
                    return NotFound($"Customer with ID {dto.CustomerId} not found in Customers table.");

                var order = new Order
                {
                    UserId = userId,
                    CustomerId = dto.CustomerId,
                    BankId = dto.BankId,
                    OrderDate = DateTime.Now,
                    Subtotal = dto.Subtotal,
                    Discount = dto.Discount,
                    TaxAmount = dto.TaxAmount,
                    TotalAmount = dto.TotalAmount,
                    PaymentStatus = dto.PaymentStatus ?? "Paid",
                    OrderItems = new List<OrderItem>()
                };

                foreach (var itemDto in dto.Items)
                {
                    var product = await _context.Products.FindAsync(itemDto.ProductId);

                    if (product == null)
                        return NotFound($"Product ID {itemDto.ProductId} not found.");

                    if (product.StockQuantity < itemDto.Quantity)
                        return BadRequest($"{product.Name} has insufficient stock.");

                    // Stock update
                    product.StockQuantity -= itemDto.Quantity;

                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        QtySold = itemDto.Quantity,
                        PriceAtSale = itemDto.UnitPrice
                    });
                }

                // ✅ FIX: Balance update Customers table ke column par apply hoga
                // Note: Agar payment ho rahi hai to balance barhna chahiye ya kam, 
                // yeh aapki business logic par depend karta hai.
                customer.Balance -= dto.TotalAmount;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Order Processed & Balance Updated!", OrderId = order.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Order fail: " + (ex.InnerException?.Message ?? ex.Message));
            }
        }
    }
}