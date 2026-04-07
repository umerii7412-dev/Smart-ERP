namespace ERP_System.DTOs
{
    public class PaymentSummaryDto
    {
        public string BankName { get; set; }
        public decimal TotalReceived { get; set; }
        public int TransactionCount { get; set; }
    }
}
