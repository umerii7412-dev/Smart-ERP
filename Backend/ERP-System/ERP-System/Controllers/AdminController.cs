using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace ERP.API.Controllers
{
    [Authorize(Roles = "Admin")] // Sirf Admin access kar sakay ga
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Saare Users ki list mangwana
        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new {
                    u.UserId,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.IsActive
                }).ToListAsync();
            return Ok(users);
        }

        // 2. Block/Unblock Logic (Toggle IsActive)
        [HttpPost("ToggleUserStatus/{id}")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User nahi mila");

            user.IsActive = !user.IsActive; // Agar true hai to false kar do, aur vice versa
            await _context.SaveChangesAsync();
            return Ok(new { message = "User status updated", currentStatus = user.IsActive });
        }

        // 3. Role/Permission Update
        [HttpPost("UpdateUserRole")]
        public async Task<IActionResult> UpdateUserRole([FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound("User nahi mila");

            user.Role = request.NewRole;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User role updated successfully" });
        }
    }

    public class UpdateRoleRequest
    {
        public int UserId { get; set; }
        public string NewRole { get; set; }
    }
}