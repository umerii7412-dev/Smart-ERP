using System.ComponentModel.DataAnnotations;

namespace ERP.API.Models
{
    public class Permission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } // e.g., "Create_Order", "View_Payroll"

        [Required]
        [StringLength(50)]
        public string Module { get; set; } // e.g., "Sales", "HR", "Inventory"
    }
}