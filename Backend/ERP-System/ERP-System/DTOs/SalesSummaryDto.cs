namespace ERP_System.DTOs
{
    public class SalesSummaryDto
    {
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public int LowStockItems { get; set; }
    }
}
