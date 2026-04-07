using System.ComponentModel.DataAnnotations;

namespace ERP.API.DTOs
{
    public class LeaveReviewDto
    {
        [Required]
        public string Status { get; set; } // "Approved" or "Rejected"

        public string AdminRemarks { get; set; } // Admin ki taraf se koi feedback
    }
}