using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.DTOs;

namespace ERP.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Inventory Summary (Existing)
        [HttpGet("inventory-summary")]
        public async Task<IActionResult> GetInventoryReport()
        {
            try
            {
                var report = new InventoryReportDto
                {
                    TotalProducts = await _context.Products.CountAsync(),
                    TotalStockQuantity = await _context.Products.SumAsync(p => (int?)p.StockQuantity) ?? 0,
                    OutOfStockItems = await _context.Products.CountAsync(p => p.StockQuantity <= 0)
                };
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Inventory error: {ex.Message}" });
            }
        }

        // 2. Bank/Payment Report (Existing - Updated for Bank Name)
        [HttpGet("payment-by-methods")]
        public async Task<IActionResult> GetPaymentMethodReport()
        {
            try
            {
                var report = await _context.Payments
                    .Include(p => p.Bank)
                    .GroupBy(p => p.Bank != null ? p.Bank.BankName : "Cash/Other")
                    .Select(g => new PaymentSummaryDto
                    {
                        BankName = g.Key,
                        TotalReceived = g.Sum(p => p.AmountPaid),
                        TransactionCount = g.Count()
                    })
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 3. Employee Performance (Existing)
        [HttpGet("employee-performance")]
        public async Task<IActionResult> GetEmployeeReport()
        {
            try
            {
                var report = await _context.Orders
                    .Include(o => o.User)
                    .Where(o => o.User != null)
                    .GroupBy(o => o.User.Name)
                    .Select(g => new EmployeePerformanceDto
                    {
                        EmployeeName = g.Key,
                        OrdersProcessed = g.Count(),
                        TotalSalesGenerated = g.Sum(o => o.TotalAmount)
                    })
                    .OrderByDescending(x => x.TotalSalesGenerated)
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ NEW: Customer Report (Aapki requirement ke mutabiq)
        [HttpGet("customer-report")]
        public async Task<IActionResult> GetCustomerReport()
        {
            try
            {
                var customers = await _context.Customers
                    .Select(c => new {
                        c.Name,
                        c.Email,
                        c.Phone,
                        Balance = c.Balance // Customer ka balance
                    })
                    .ToListAsync();
                return Ok(customers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ NEW: Product Detailed Report (Sale/Stock tracking ke liye)
        [HttpGet("product-details")]
        public async Task<IActionResult> GetProductDetails()
        {
            try
            {
                var products = await _context.Products
                    .Select(p => new {
                        p.Name,
                        p.Category,
                        p.StockQuantity, // Kitni reh gayi
                        p.Price,
                        // Sale logic: Total orders se count kar sakte hain ya simple stock dikha dein
                        Status = p.StockQuantity <= 0 ? "Out of Stock" : "Available"
                    })
                    .ToListAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}