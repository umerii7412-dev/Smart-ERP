using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ERP.API.Models
{
    public class Bank
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string BankName { get; set; }

        [Required]
        public decimal TaxPercentage { get; set; }

        // Navigation Property
        public virtual ICollection<BankTransaction>? Transactions { get; set; }
    }
}