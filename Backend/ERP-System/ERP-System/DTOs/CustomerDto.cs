namespace ERP.API.DTOs
{
    public class CustomerDto
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string? Email { get; set; }    // Added
        public string? Address { get; set; }  // Added
        public decimal Balance { get; set; }
    }
}