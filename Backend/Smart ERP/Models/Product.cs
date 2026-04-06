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

        // Mismatch Fixed: Description add kar di
        public string Description { get; set; }

        // Mismatch Fixed: Quantity ka naam StockQuantity kar diya (ya purana rehne dein)
        [Required]
        public int StockQuantity { get; set; }

        [Required]
        public decimal Price { get; set; } // UnitPrice ko Price kar diya DTO ki tarah
    }
}