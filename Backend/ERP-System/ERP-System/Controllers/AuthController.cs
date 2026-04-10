using ERP.API.Data;
using ERP.API.DTOs;
using ERP.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace ERP_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ✅ Naya Method: Users fetch karne ke liye (Error 404 fix karne ke liye)
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            // Sare users fetch karein jo Active hain
            var users = await _context.Users
                .Include(u => u.Role)
                .OrderByDescending(u => u.UserId) // Naye users top par aayenge
                .Select(u => new {
                    u.UserId,
                    u.Name,
                    u.RoleId,
                    RoleName = u.Role != null ? u.Role.Name : "User",
                    u.IsActive
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Email already exists!");
            }

            if (registerDto.RoleId == 1 || registerDto.RoleId == 2 || registerDto.RoleId == 3)
            {
                var roleExists = await _context.Users.AnyAsync(u => u.RoleId == registerDto.RoleId);
                if (roleExists)
                {
                    string roleName = registerDto.RoleId == 1 ? "Admin" :
                                    (registerDto.RoleId == 2 ? "Manager" : "HR");
                    return BadRequest($"{roleName} already exists! System mein sirf aik hi {roleName} allow hai.");
                }
            }

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                RoleId = registerDto.RoleId,
                Phone = registerDto.Phone,     // Mapping Phone
                Address = registerDto.Address, // Mapping Addres /
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully!");
        }

        // ✅ Naya Method: User update karne ke liye
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, RegisterDto updateDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User nahi mila.");

            user.Name = updateDto.Name;
            user.Email = updateDto.Email;
            user.Phone = updateDto.Phone;
            user.Address = updateDto.Address;

            if (!string.IsNullOrEmpty(updateDto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
            }

            await _context.SaveChangesAsync();
            return Ok("User updated successfully!");
        }

        // ✅ Naya Method: User delete karne ke liye
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User nahi mila.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok("User deleted successfully!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized("Invalid Email or Password!");
            }

            if (!user.IsActive)
            {
                return BadRequest("Aapka account block kar diya gaya hai.");
            }

            var token = CreateToken(user);

            return Ok(new
            {
                Token = token,
                UserName = user.Name,
                Role = user.Role?.Name ?? "User",
                UserId = user.UserId
            });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
                new Claim("UserId", user.UserId.ToString()),
                new Claim("IsActive", user.IsActive.ToString())
            };

            var jwtKey = _configuration["Jwt:Key"] ?? "SmartERP_Secure_Key_32_Chars_Long_!!!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "SmartERP",
                audience: _configuration["Jwt:Audience"] ?? "SmartERP_Users",
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}