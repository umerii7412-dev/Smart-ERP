using System.ComponentModel.DataAnnotations;

namespace ERP.API.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        // --- Yeh Line Add Karein ---
        [StringLength(100)]
        public string Category { get; set; }

        public string Description { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}