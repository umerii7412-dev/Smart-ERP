namespace ERP.API.DTOs
{
    public class InventoryReportDto
    {
        public int TotalProducts { get; set; }
        public int OutOfStockItems { get; set; }
        public int TotalStockQuantity { get; set; }
    }

    public class PaymentSummaryDto
    {
        public string BankName { get; set; }
        public decimal TotalReceived { get; set; }
        public int TransactionCount { get; set; }
    }

    public class EmployeePerformanceDto
    {
        public string EmployeeName { get; set; }
        public int OrdersProcessed { get; set; }
        public decimal TotalSalesGenerated { get; set; }
    }
}