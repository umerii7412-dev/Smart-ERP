using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.DTOs;

namespace ERP_System.Controllers
{
    [Authorize(Roles = "Admin")] // Reports sirf Admin dekh sakay
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. PRODUCT/INVENTORY REPORT
        [HttpGet("inventory-summary")]
        public async Task<IActionResult> GetInventoryReport()
        {
            var report = new InventoryReportDto
            {
                TotalProducts = await _context.Products.CountAsync(),
                TotalStockQuantity = await _context.Products.SumAsync(p => p.StockQuantity),
                OutOfStockItems = await _context.Products.CountAsync(p => p.StockQuantity == 0)
            };
            return Ok(report);
        }

        // 2. PAYMENT METHOD REPORT (Cash vs EasyPaisa vs Bank)
        [HttpGet("payment-by-methods")]
        public async Task<IActionResult> GetPaymentMethodReport()
        {
            var report = await _context.Payments
                .Include(p => p.Bank)
                .GroupBy(p => p.Bank.BankName)
                .Select(g => new PaymentSummaryDto
                {
                    BankName = g.Key,
                    TotalReceived = g.Sum(p => p.AmountPaid),
                    TransactionCount = g.Count()
                })
                .ToListAsync();

            return Ok(report);
        }

        // 3. EMPLOYEE SALES REPORT
        [HttpGet("employee-performance")]
        public async Task<IActionResult> GetEmployeeReport()
        {
            var report = await _context.Orders
                .Include(o => o.User)
                .GroupBy(o => o.User.Name)
                .Select(g => new EmployeePerformanceDto
                {
                    EmployeeName = g.Key,
                    OrdersProcessed = g.Count(),
                    TotalSalesGenerated = g.Sum(o => o.FinalTotal)
                })
                .ToListAsync();

            return Ok(report);
        }
    }
}