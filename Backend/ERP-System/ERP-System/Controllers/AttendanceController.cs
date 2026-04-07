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
    public class AttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttendanceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. CHECK-IN (Present Mark Karein)
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] AttendanceDto dto)
        {
            // Aaj ki date fix karna taake duplicate na ho
            var today = dto.Date.Date;

            var existing = await _context.Set<Attendance>()
                .FirstOrDefaultAsync(a => a.UserId == dto.UserId && a.ClockIn.Date == today);

            if (existing != null) return BadRequest("Attendance for this date already exists!");

            var attendance = new Attendance
            {
                UserId = dto.UserId,
                ClockIn = DateTime.Now, // Asal time system se lega
                // Status yahan handle hoga (Logic: Agar check-in hua to 'Present')
            };

            _context.Set<Attendance>().Add(attendance);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Status: {dto.Status} marked successfully!", time = attendance.ClockIn });
        }

        // 2. CHECK-OUT
        [HttpPut("check-out")]
        public async Task<IActionResult> CheckOut(int userId)
        {
            var today = DateTime.Today;
            var attendance = await _context.Set<Attendance>()
                .FirstOrDefaultAsync(a => a.UserId == userId && a.ClockIn.Date == today && a.ClockOut == null);

            if (attendance == null) return NotFound("No active session found to clock-out.");

            attendance.ClockOut = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Clock-out recorded!", time = attendance.ClockOut });
        }

        // 3. ADMIN VIEW (Sab ki attendance dekhne ke liye)
        [Authorize(Roles = "Admin")]
        [HttpGet("all-records")]
        public async Task<IActionResult> GetAllAttendance()
        {
            var records = await _context.Set<Attendance>()
                .Include(a => a.User)
                .Select(a => new {
                    a.User.Name,
                    a.ClockIn,
                    a.ClockOut,
                    Date = a.ClockIn.ToShortDateString()
                })
                .ToListAsync();

            return Ok(records);
        }
    }
}