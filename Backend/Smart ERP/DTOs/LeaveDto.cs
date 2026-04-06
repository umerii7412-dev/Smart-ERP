using System.ComponentModel.DataAnnotations;

namespace ERP.API.DTOs
{
    public class LeaveDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Reason cannot be longer than 500 characters.")]
        public string Reason { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Optional: Agar aap leave ki type (Sick, Casual) batana chahte hain
        public string LeaveType { get; set; }
    }
}