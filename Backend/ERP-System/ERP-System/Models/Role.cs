using System.ComponentModel.DataAnnotations;

namespace ERP.API.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; // e.g. Admin, HR

        public string Description { get; set; } = string.Empty;

        // Navigation property for Users
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}