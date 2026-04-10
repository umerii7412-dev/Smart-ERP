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

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Bank> Banks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
        public DbSet<Leave> Leaves { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<BankTransaction> BankTransactions { get; set; }
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Decimal Precision
            var decimalProperties = modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?));

            foreach (var property in decimalProperties)
            {
                property.SetColumnType("decimal(18,2)");
            }

            // 2. Unique Constraints
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // 3. Relationships & Cascade Rules (FIXED)

            // Order -> Customer (Strict)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict); // Cycle fix

            // Order -> User (NoAction)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.NoAction); // Cycle fix

            // Order -> OrderItems (Cascade is fine here)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Payment -> Customer
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Customer)
                .WithMany()
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order -> Bank
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Bank)
                .WithMany()
                .HasForeignKey(o => o.BankId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Seed Data
            modelBuilder.Entity<Bank>().HasData(
                new Bank { Id = 1, BankName = "Cash" },
                new Bank { Id = 2, BankName = "EasyPaisa" },
                new Bank { Id = 3, BankName = "JazzCash" }
            );

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "Full System Access" },
                new Role { Id = 2, Name = "Manager", Description = "Management and Reports Access" },
                new Role { Id = 3, Name = "HR", Description = "Limited Operational Access" }
            );
        }
    }
}