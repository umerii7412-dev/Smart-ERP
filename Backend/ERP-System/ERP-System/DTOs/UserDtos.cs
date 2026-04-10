namespace ERP.API.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // YEH LINE ADD KAREIN
        public int RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}