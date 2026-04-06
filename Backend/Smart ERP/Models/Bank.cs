using System.ComponentModel.DataAnnotations;

namespace ERP.API.Models
{
    public class Bank
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string BankName { get; set; } // e.g., "EasyPaisa", "Cash", "JazzCash"
    }
}