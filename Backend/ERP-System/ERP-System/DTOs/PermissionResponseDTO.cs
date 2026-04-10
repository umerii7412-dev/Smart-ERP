using System;

namespace ERP.API.Models.DTOs
{
    // Ye class React ko batayegi ke permission ka naam kya hai aur kya user ke paas ye pehle se hai
    public class PermissionResponseDTO
    {
        public int Id { get; set; }          // Permission ki Unique ID
        public string Name { get; set; }      // e.g., "VIEW_INVENTORY"
        public string Module { get; set; }    // e.g., "Inventory"
        public bool IsAssigned { get; set; }  // Checkbox tick karne ke liye: true ya false
    }

    // Ye class tab kaam ayegi jab hum React se wapis data bhejenge save karne ke liye
    public class AssignPermissionsRequest
    {
        public int UserId { get; set; }
        public List<int> PermissionIds { get; set; } // Tamam selected permissions ki IDs
    }
}