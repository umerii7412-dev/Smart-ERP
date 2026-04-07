using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; } // Kis employee ne banaya
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public virtual Customer Customer { get; set; }

        public int BankId { get; set; }
        [ForeignKey("BankId")]
        public virtual Bank Bank { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal FinalTotal { get; set; }
        public string PaymentStatus { get; set; } // "Paid", "Unpaid", "Partial"

        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}