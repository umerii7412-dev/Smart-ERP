namespace ERP.API.DTOs
{
    public class CustomerDto
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public decimal Balance { get; set; } // Initial balance set karne ke liye
    }
}