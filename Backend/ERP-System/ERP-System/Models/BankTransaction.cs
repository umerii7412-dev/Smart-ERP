using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.API.Models
{
    public class BankTransaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; } = DateTime.Now;

        [Required]
        [StringLength(200)]
        public string Description { get; set; } // e.g., "Order #102 Payment"

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string Type { get; set; } // "Credit" (Income) ya "Debit" (Expense)

        // Foreign Key to Bank
        [Required]
        public int BankId { get; set; }

        [ForeignKey("BankId")]
        public virtual Bank Bank { get; set; }
    }
}