using System.ComponentModel.DataAnnotations;

namespace ERP.API.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; } // Yaad rahe: Password humesha hash kar ke save karenge

        [Required]
        public string Role { get; set; } // "Admin" ya "Employee"

        public bool IsActive { get; set; } = true;

        // Navigation Properties (Relations)
        public virtual ICollection<UserPermission> UserPermissions { get; set; }
    }
}