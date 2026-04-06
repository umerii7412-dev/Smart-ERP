namespace ERP.API.DTOs
{
    public class OrderDto
    {
        public int CustomerId { get; set; }

        // Naya Field: Pata chale ke paise Cash mein hain ya Bank mein
        public int BankId { get; set; }

        // Naya Field: Status se pata chalay ga ke ye Udhaar (Unpaid) hai ya nahi
        public string PaymentStatus { get; set; } // "Paid", "Unpaid", "Partial"

        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}