using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace ERP_System.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public RoleController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            return await _context.Roles.ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleRequest request)
        {
            if (string.IsNullOrEmpty(request.RoleName)) return BadRequest("Role name is required");
            var newRole = new Role { Name = request.RoleName };
            _context.Roles.Add(newRole);
            await _context.SaveChangesAsync();
            return Ok(newRole);
        }

        // ✅ EDIT (UPDATE) METHOD
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleRequest request)
        {
            if (string.IsNullOrEmpty(request.RoleName)) return BadRequest("Role name is required");

            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound(new { message = "Role not found" });

            if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Cannot rename Admin role" });

            role.Name = request.RoleName;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Role updated successfully" });
        }

        // ✅ DELETE METHOD (Safe Version)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound(new { message = "Role not found" });

            // Admin delete nahi hona chahiye
            if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Cannot delete Admin role" });

            // Check if users are assigned to this role
            var hasUsers = await _context.Users.AnyAsync(u => u.RoleId == id);

            if (hasUsers)
            {
                // Agar users hain to delete mat karein, frontend ko message bhein
                return BadRequest(new { message = "Cannot delete: This role is assigned to users. Please change their roles first." });
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Role deleted successfully" });
        }

        [HttpGet("users-with-roles")]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetUsersWithRoles()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new RoleDto
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Email = u.Email,
                    RoleName = u.Role != null ? u.Role.Name : "No Role",
                    IsActive = u.IsActive
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("user-permissions/{userId}")]
        public async Task<IActionResult> GetUserPermissions(int userId)
        {
            var allPermissions = await _context.Permissions.ToListAsync();
            var userPermissions = await _context.UserPermissions.Where(up => up.UserId == userId).ToListAsync();
            var result = allPermissions.Select(p => {
                var up = userPermissions.FirstOrDefault(x => x.PermissionId == p.Id);
                return new
                {
                    PermissionId = p.Id,
                    PermissionName = p.Name,
                    Module = p.Module,
                    CanView = up?.CanView ?? false,
                    CanCreate = up?.CanCreate ?? false,
                    CanUpdate = up?.CanUpdate ?? false,
                    CanDelete = up?.CanDelete ?? false
                };
            });
            return Ok(result);
        }

        [HttpPost("assign-user-permissions")]
        public async Task<IActionResult> AssignUserPermissions([FromBody] List<UserPermissionRequest> requests)
        {
            if (requests == null || !requests.Any()) return BadRequest("No data provided");
            int userId = requests.First().UserId;
            var existing = _context.UserPermissions.Where(up => up.UserId == userId);
            _context.UserPermissions.RemoveRange(existing);
            foreach (var req in requests)
            {
                _context.UserPermissions.Add(new UserPermission
                {
                    UserId = req.UserId,
                    PermissionId = req.PermissionId,
                    CanView = req.CanView,
                    CanCreate = req.CanCreate,
                    CanUpdate = req.CanUpdate,
                    CanDelete = req.CanDelete
                });
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Permissions updated successfully" });
        }
    }

    public class RoleRequest { public string RoleName { get; set; } }
    public class UserPermissionRequest
    {
        public int UserId { get; set; }
        public int PermissionId { get; set; }
        public bool CanView { get; set; }
        public bool CanCreate { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
    }
}