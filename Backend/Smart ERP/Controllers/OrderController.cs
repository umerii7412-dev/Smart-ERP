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

        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderDto dto)
        {
            // 1. Transaction: Ya pura order save hoga ya kuch bhi nahi (Data safety)
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Token se logged-in User (Employee) ki ID nikalna
                var userIdString = User.FindFirst("UserId")?.Value;
                int userId = string.IsNullOrEmpty(userIdString) ? 1 : int.Parse(userIdString);

                // 2. Order ki Main Header Entry
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

                // 3. Items Loop: Stock aur Products Check
                foreach (var itemDto in dto.Items)
                {
                    var product = await _context.Products.FindAsync(itemDto.ProductId);

                    if (product == null) return NotFound($"Product ID {itemDto.ProductId} nahi mili.");

                    // Stock Validation
                    if (product.StockQuantity < itemDto.Quantity)
                        return BadRequest($"{product.Name} ka stock kam hai. Mojood: {product.StockQuantity}");

                    // Stock Update: Saaman nikal raha hai to quantity kam hogi
                    product.StockQuantity -= itemDto.Quantity;

                    // Order Item details
                    var orderItem = new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        QtySold = itemDto.Quantity,
                        PriceAtSale = itemDto.UnitPrice
                    };

                    order.OrderItems.Add(orderItem);
                }

                // 4. Customer Balance Logic (ER Diagram ke mutabiq)
                if (dto.PaymentStatus != "Paid")
                {
                    var customer = await _context.Customers.FindAsync(dto.CustomerId);
                    if (customer != null)
                    {
                        // Agar paisa nahi mila, to Customer ka Balance negative (Udhaar) ho jaye ga
                        customer.Balance -= dto.TotalAmount;
                    }
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 5. Final Step: Database mein commit karna
                await transaction.CommitAsync();

                return Ok(new { Message = "Order Processed Successfully!", OrderId = order.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); // Error ki surat mein saari changes cancel
                return BadRequest("Order fail: " + ex.Message);
            }
        }
    }
}