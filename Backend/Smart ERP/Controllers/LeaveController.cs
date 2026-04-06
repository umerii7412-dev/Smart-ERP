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
    public class LeaveController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeaveController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. APPLY FOR LEAVE
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyLeave([FromBody] LeaveDto dto)
        {
            // Basic Validation: StartDate hamesha EndDate se pehle honi chahiye
            if (dto.StartDate > dto.EndDate)
                return BadRequest("Start Date cannot be after End Date.");

            var leave = new Leave
            {
                UserId = dto.UserId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = "Pending", // Default hamesha pending hoga
                AppliedDate = DateTime.Now
            };

            _context.Set<Leave>().Add(leave);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave application submitted!", id = leave.Id });
        }

        // 2. APPROVE / REJECT (Admin Only)
        [Authorize(Roles = "Admin")]
        [HttpPut("review/{id}")]
        public async Task<IActionResult> ReviewLeave(int id, [FromBody] LeaveReviewDto reviewDto)
        {
            var leave = await _context.Set<Leave>().FindAsync(id);
            if (leave == null) return NotFound("Leave record not found.");

            leave.Status = reviewDto.Status; // "Approved" ya "Rejected"
            leave.AdminRemarks = reviewDto.AdminRemarks;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Leave status updated to {reviewDto.Status}." });
        }

        // 3. GET MY LEAVES (User apne record dekh sakay)
        [HttpGet("my-leaves/{userId}")]
        public async Task<IActionResult> GetMyLeaves(int userId)
        {
            var leaves = await _context.Set<Leave>()
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.AppliedDate)
                .ToListAsync();

            return Ok(leaves);
        }

        // 4. GET PENDING LEAVES (Admin Dashboard ke liye)
        [Authorize(Roles = "Admin")]
        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingLeaves()
        {
            var pending = await _context.Set<Leave>()
                .Include(l => l.User)
                .Where(l => l.Status == "Pending")
                .Select(l => new {
                    l.Id,
                    EmployeeName = l.User.Name,
                    l.Reason,
                    l.StartDate,
                    l.EndDate,
                    TotalDays = (l.EndDate - l.StartDate).Days + 1
                })
                .ToListAsync();

            return Ok(pending);
        }
    }
}