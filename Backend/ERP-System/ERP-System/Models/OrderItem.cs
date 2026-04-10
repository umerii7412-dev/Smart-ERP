using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ERP.API.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        [JsonIgnore] // Loop error se bachne ke liye
        public virtual Order? Order { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        public int QtySold { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PriceAtSale { get; set; }
    }
}