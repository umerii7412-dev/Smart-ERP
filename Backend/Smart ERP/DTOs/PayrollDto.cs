namespace ERP.API.DTOs
{
    public class PayrollDto
    {
        public int UserId { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal Allowances { get; set; }
        public decimal Deductions { get; set; }
        public DateTime Month { get; set; }
    }
}