using ERP.API.Data;
using ERP.API.DTOs;
using ERP.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        // 1. REGISTER API
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Email already exists!");
            }

            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Role = registerDto.Role,
                IsActive = true // Naya user default active hoga
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully!");
        }

        // 2. LOGIN API
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // UPDATED: Password verify karne se pehle check karein user exist karta hai
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized("Invalid Email or Password!");
            }

            // ADDED: Block Check Logic
            // Agar Admin ne IsActive = false kiya hai, to login nahi hoga
            if (!user.IsActive)
            {
                return BadRequest("Aapka account block kar diya gaya hai. Meharbani farmakar Admin se rabta karein.");
            }

            var token = CreateToken(user);

            return Ok(new
            {
                Token = token,
                UserName = user.Name,
                Role = user.Role,
                UserId = user.UserId // Frontend management ke liye zaroori hai
            });
        }

        // 3. JWT TOKEN GENERATION LOGIC
        private string CreateToken(User user)
        {
            // UPDATED: Roles aur Claims ko strictly map kiya
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role), // Yeh Admin/Employee access control ke liye hai
                new Claim("UserId", user.UserId.ToString()),
                new Claim("IsActive", user.IsActive.ToString()) // Frontend par status check ke liye
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? "SmartERP_Secure_Key_32_Chars_Long_!!!"
            ));

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