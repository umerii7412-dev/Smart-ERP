namespace ERP_System.DTOs
{
    public class InventoryReportDto
    {
        public int TotalProducts { get; set; }
        public int TotalStockQuantity { get; set; }
        public int OutOfStockItems { get; set; }
    }
}
