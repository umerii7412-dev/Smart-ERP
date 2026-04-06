using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.API.Models
{
    public class Leave
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } // Kis employee ne apply kiya

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [Required]
        [StringLength(500)]
        public string Reason { get; set; } // Chutti ki wajah

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string Status { get; set; } // "Pending", "Approved", "Rejected"

        public DateTime AppliedDate { get; set; } = DateTime.Now;

        // Optional: Admin ka feedback ya rejection ki wajah
        public string AdminRemarks { get; set; }
    }
}