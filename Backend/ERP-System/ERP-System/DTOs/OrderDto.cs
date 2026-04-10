namespace ERP.API.DTOs
{
    public class OrderDto
    {
        public int CustomerId { get; set; }
        public int BankId { get; set; }
        public string? PaymentStatus { get; set; } = "Paid"; // Nullable banayein
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItemDto> Items { get; set; } = new(); // Initialize karein taake 400 error na aaye
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}