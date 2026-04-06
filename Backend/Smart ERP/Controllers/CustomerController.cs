using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;

namespace ERP_System.Controllers
{
    [Authorize] // Sirf login users hi customers dekh saken
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL CUSTOMERS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.ToListAsync();
        }

        // 2. GET CUSTOMER BY ID (Search)
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound("Customer nahi mila.");
            return customer;
        }

        // 3. ADD NEW CUSTOMER
        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(CustomerDto dto)
        {
            var customer = new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Balance = dto.Balance
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer registered successfully!", customer });
        }

        // 4. UPDATE CUSTOMER BALANCE (Specific Action)
        // Ye tab kaam ayega jab hum order ya payment process karenge
        [HttpPut("update-balance/{id}")]
        public async Task<IActionResult> UpdateBalance(int id, [FromBody] decimal amount)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            customer.Balance += amount; // Amount positive bhi ho sakti hai (Payment) aur negative bhi (Order)
            await _context.SaveChangesAsync();

            return Ok(new { message = "Balance updated!", currentBalance = customer.Balance });
        }

        // 5. DELETE CUSTOMER (Admin Only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer record deleted." });
        }
    }
}