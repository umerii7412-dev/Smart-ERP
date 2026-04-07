namespace ERP.API.DTOs
{
    public class AttendanceDto
    {
        public int UserId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } // Present, Absent, Leave
    }
}