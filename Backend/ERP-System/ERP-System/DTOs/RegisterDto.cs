namespace ERP.API.DTOs
{
    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RoleId { get; set; }

        // Add these fields
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}