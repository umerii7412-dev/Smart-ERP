using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.API.Models
{
    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public DateTime ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }
        public string Status { get; set; } = "Present";
    }
}