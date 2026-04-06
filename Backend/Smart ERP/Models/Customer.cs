using System.ComponentModel.DataAnnotations;

namespace ERP.API.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(15)]
        public string Phone { get; set; }

        [Required]
        public decimal Balance { get; set; } // Credit ke liye negative, Advance ke liye positive
    }
}