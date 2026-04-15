namespace ERP.API.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty; 
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public bool IsActive { get; set; }

        // Ye properties add karein
        public string? Phone { get; set; } // Nullable (?) taake warning na aaye
        public string? Address { get; set; }
        public decimal Balance { get; set; }

        public Role? Role { get; set; }
    }
}