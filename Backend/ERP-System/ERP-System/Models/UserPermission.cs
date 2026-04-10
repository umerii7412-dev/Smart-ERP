using ERP.API.Models;
using System.ComponentModel.DataAnnotations;

public class UserPermission
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!; // Fix

    public int PermissionId { get; set; }
    public virtual Permission Permission { get; set; } = null!; // Fix

    public bool CanView { get; set; } = true;
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDelete { get; set; }
}