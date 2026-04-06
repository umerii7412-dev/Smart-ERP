namespace ERP.API.DTOs
{
    public class PaymentDto
    {
        public int CustomerId { get; set; }
        public int BankId { get; set; } // Cash, EasyPaisa, Bank, etc.
        public decimal Amount { get; set; }
        public string TransactionRef { get; set; } // TID ya koi bhi reference
    }
}