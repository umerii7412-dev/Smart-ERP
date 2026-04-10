namespace ERP.API.DTOs
{
    public class RoleDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty; // Role object nahi, sirf naam
        public bool IsActive { get; set; }
    }
}

public class PermissionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Module { get; set; }
        public bool IsAssigned { get; set; } // UI checkbox ke liye
    }