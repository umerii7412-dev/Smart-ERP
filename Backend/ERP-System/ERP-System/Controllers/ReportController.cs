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

        // 1. Inventory Summary
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

        // 2. Bank/Payment Report - FIXED LOGIC
        [HttpGet("payment-by-methods")]
        public async Task<IActionResult> GetPaymentMethodReport()
        {
            try
            {
                // Hum direct Orders se data nikaal rahe hain taake real-time bank sales nazar ayein
                var report = await _context.Orders
                    .Include(o => o.Bank)
                    .GroupBy(o => o.Bank != null ? o.Bank.BankName : "Cash/Other")
                    .Select(g => new PaymentSummaryDto
                    {
                        BankName = g.Key,
                        // TotalAmount use kar rahe hain jo us bank ke through order hua
                        TotalReceived = g.Sum(o => o.TotalAmount),
                        TransactionCount = g.Count()
                    })
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Bank Report Error: {ex.Message}" });
            }
        }

        // 3. Customer Report
        [HttpGet("customer-report")]
        public async Task<IActionResult> GetCustomerReport()
        {
            try
            {
                var customers = await _context.Customers
                    .Select(c => new {
                        // Null check taake agar Name null ho toh empty string show ho
                        Name = c.Name ?? "N/A",
                        Email = c.Email ?? "No Email",
                        Phone = c.Phone ?? "No Phone",
                        // .Value aur casting use ki hai taake decimal/double ka issue hal ho jaye
                        Balance = c.Balance != null ? (decimal)c.Balance : 0m
                    })
                    .ToListAsync();

                return Ok(customers);
            }
            catch (Exception ex)
            {
                // Inner exception ko check karein taake asal wajah pata chale
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { message = $"Customer Report Error: {errorMessage}" });
            }
        }

        // 4. Product Detailed Report
        [HttpGet("product-details")]
        public async Task<IActionResult> GetProductDetails()
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Select(p => new {
                        p.Name,
                        CategoryName = p.Category != null ? p.Category.Name : "General",
                        p.StockQuantity,
                        p.Price,
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

        // 5. Employee Performance
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
    }
}