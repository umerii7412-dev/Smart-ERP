using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;

namespace ERP_System.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PayrollController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GENERATE PAYROLL
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateSalary([FromBody] PayrollDto dto)
        {
            // Month aur Year ko string mein convert karna (Model ke mutabiq)
            string monthYearStr = dto.Month.ToString("MMMM yyyy");

            // Check: Kya is mahine ki salary pehle hi generate ho chuki hai?
            var existing = await _context.Set<Payroll>()
                .FirstOrDefaultAsync(p => p.EmployeeId == dto.UserId && p.MonthYear == monthYearStr);

            if (existing != null) return BadRequest($"Salary for {monthYearStr} already exists!");

            // Net Salary Calculation: (Basic + Allowances) - Deductions
            decimal netSalary = (dto.BasicSalary + dto.Allowances) - dto.Deductions;

            var payroll = new Payroll
            {
                EmployeeId = dto.UserId,
                BasicSalary = dto.BasicSalary,
                Deductions = dto.Deductions,
                NetSalary = netSalary,
                MonthYear = monthYearStr,
                Status = "Pending" // Default status
            };

            _context.Set<Payroll>().Add(payroll);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Salary generated for {monthYearStr}",
                TotalNetPay = netSalary
            });
        }

        // 2. UPDATE STATUS (Paid/Unpaid)
        [HttpPut("update-status/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var payroll = await _context.Set<Payroll>().FindAsync(id);
            if (payroll == null) return NotFound("Record not found.");

            payroll.Status = newStatus; // e.g., "Paid"
            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Payroll marked as {newStatus}." });
        }
    }
}