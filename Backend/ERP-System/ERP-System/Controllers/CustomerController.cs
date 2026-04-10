using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;

namespace ERP_System.Controllers
{
    [Authorize]
    [Route("api/Customers")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            try
            {
                // ✅ Change: Ab Users ki jagah direct Customers table se data le rahe hain
                return await _context.Customers.OrderByDescending(c => c.Id).ToListAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Data fetch karne mein masla hai: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            // ✅ Change: Customers table mein ID check ho rahi hai
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Customer nahi mila." });
            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(CustomerDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // ✅ Change: Naya record 'Customer' model ka ban raha hai aur Customers table mein save ho raha hai
            var customer = new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                Balance = dto.Balance
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer added successfully!", customer });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, CustomerDto dto)
        {
            // ✅ Change: Customers table se record find ho raha hai
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Customer record not found." });

            customer.Name = dto.Name;
            customer.Phone = dto.Phone;
            customer.Email = dto.Email;
            customer.Address = dto.Address;
            customer.Balance = dto.Balance;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Customer updated successfully!", customer });
            }
            catch (DbUpdateConcurrencyException)
            {
                return BadRequest(new { message = "Update fail ho gaya." });
            }
        }

        [HttpPut("update-balance/{id}")]
        public async Task<IActionResult> UpdateBalance(int id, [FromBody] decimal amount)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Customer nahi mila." });

            customer.Balance += amount;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Balance updated!", currentBalance = customer.Balance });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Record pehle hi delete ho chuka hai." });

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer record deleted." });
        }
    }
}