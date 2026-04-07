using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.DTOs;

namespace ERP.API.Controllers
{
    [Authorize] // Filhal sirf Authorize rakha hai (Roles="Admin" baad mein add karein jab data show ho jaye)
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

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
                        TotalSalesGenerated = g.Sum(o => o.FinalTotal)
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