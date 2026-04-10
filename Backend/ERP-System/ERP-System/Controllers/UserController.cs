using ERP.API.Data;
using ERP.API.DTOs;
using ERP.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public UserController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _context.Users.Include(u => u.Role).Select(u => new UserDto
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                RoleId = u.RoleId,
                RoleName = u.Role.Name,
                IsActive = u.IsActive
            }).ToListAsync();
            return Ok(users);
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(User user)
        {
            // Note: Make sure user.RoleId is coming from frontend
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User Created Successfully" });
        }
    }
}