using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // 1. Yeh namespace zaroori hai

namespace ERP.API.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        // Navigation Property
        [JsonIgnore] // 2. Yeh line loop/cycle ko rok degi
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}