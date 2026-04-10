using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using Microsoft.AspNetCore.Authorization;
using ERP.API.Models.DTOs;

namespace ERP.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new {
                    u.UserId,
                    u.Name,
                    u.Email,
                    RoleName = u.Role.Name,
                    u.IsActive
                }).ToListAsync();
            return Ok(users);
        }

        [HttpPost("ToggleUserStatus/{id}")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User nahi mila");

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User status updated", currentStatus = user.IsActive });
        }

        [HttpPost("UpdateUserRole")]
        public async Task<IActionResult> UpdateUserRole([FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound("User nahi mila");

            user.RoleId = request.NewRoleId;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User role updated successfully" });
        }

        // --- UPDATED: User Update Method ---
        [HttpPut("UpdateUser/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDTO model)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User nahi mila");

            user.Name = model.Name;
            user.Email = model.Email;

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully" });
        }

        [HttpGet("GetUserPermissions/{userId}")]
        public async Task<IActionResult> GetUserPermissions(int userId)
        {
            var allPermissions = await _context.Permissions.ToListAsync();
            var userAssignedIds = await _context.UserPermissions
                .Where(up => up.UserId == userId)
                .Select(up => up.PermissionId)
                .ToListAsync();

            var result = allPermissions.Select(p => new PermissionResponseDTO
            {
                Id = p.Id,
                Name = p.Name,
                Module = p.Module,
                IsAssigned = userAssignedIds.Contains(p.Id)
            }).ToList();

            return Ok(result);
        }

        [HttpPost("AssignUserPermissions")]
        public async Task<IActionResult> AssignUserPermissions([FromBody] AssignPermissionsRequest request)
        {
            var existing = _context.UserPermissions.Where(up => up.UserId == request.UserId);
            _context.UserPermissions.RemoveRange(existing);

            if (request.PermissionIds != null)
            {
                foreach (var pId in request.PermissionIds)
                {
                    _context.UserPermissions.Add(new UserPermission
                    {
                        UserId = request.UserId,
                        PermissionId = pId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Permissions successfully updated" });
        }
    }

    // --- DTOs ---
    public class UserUpdateDTO
    {
        public string Name { get; set; }
        public string Email { get; set; }
    }

    public class UpdateRoleRequest
    {
        public int UserId { get; set; }
        public int NewRoleId { get; set; }
    }

    public class PermissionResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Module { get; set; }
        public bool IsAssigned { get; set; }
    }

    public class AssignPermissionsRequest
    {
        public int UserId { get; set; }
        public List<int> PermissionIds { get; set; }
    }
}