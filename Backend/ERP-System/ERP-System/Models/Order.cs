using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        // System User (Admin/Manager jo order create kar raha hai)
        public int UserId { get; set; } = 1;
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }

        public int BankId { get; set; }
        [ForeignKey("BankId")]
        public virtual Bank? Bank { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        // ✅ Frontend 'totalAmount' bhej raha hai, isay 'TotalAmount' kar dein ya 'FinalTotal' hi rehnay dein
        // Magar mapping mein asani ke liye isay TotalAmount kehna behtar hai agar aapne DTO update kiya hai
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string PaymentStatus { get; set; } = "Paid";

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}