using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ERP.API.Models
{
    public class Bank
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string BankName { get; set; } // e.g., "Meezan Bank", "EasyPaisa"

        [Required]
        public decimal CurrentBalance { get; set; } = 0; // Har bank ka apna balance

        // Relationship: Ek bank ki bahut si transactions ho sakti hain
        public virtual ICollection<BankTransaction> Transactions { get; set; }
    }
}