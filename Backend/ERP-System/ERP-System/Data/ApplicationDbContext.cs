using Microsoft.EntityFrameworkCore;
using ERP.API.Models;

namespace ERP.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Tables Definition
        public DbSet<User> Users { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Bank> Banks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; } // Diagram ke mutabiq add kiya
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<Category> Categories { get; set; }

        public DbSet<BankTransaction> BankTransactions { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Decimal Precision (Currency handling)
            var decimalProperties = modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?));

            foreach (var property in decimalProperties)
            {
                property.SetColumnType("decimal(18,2)");
            }

            // 2. Unique Constraints
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // 3. Relationships & Cascade Rules (Diagram-based)

            // Order -> OrderItems (Cascade Delete: Order delete to items bhi khatam)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order -> Bank (processed_via)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Bank)
                .WithMany() // Bank table mein Orders ki list optional hai
                .HasForeignKey(o => o.BankId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment -> Customer & Bank
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Customer)
                .WithMany()
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Default Seed Data (Zaroori Banks)
            modelBuilder.Entity<Bank>().HasData(
                new Bank { Id = 1, BankName = "Cash"  },
                new Bank { Id = 2, BankName = "EasyPaisa" },
                new Bank { Id = 3, BankName = "JazzCash"  }
            );
        }
    }
}