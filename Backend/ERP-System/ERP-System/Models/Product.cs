using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation; // Yeh add karein

namespace ERP.API.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int CategoryId { get; set; } // Foreign Key

        [ForeignKey("CategoryId")]
        [ValidateNever] // 1. Yeh attribute validation ko rok dega
        public Category? Category { get; set; } // 2. '?' lagane se error khatam ho jayega
    }
}