using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using ERP.API.DTOs;

namespace ERP_System.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. RECEIVE PAYMENT (Update Customer Balance)
        [HttpPost("receive-payment")]
        public async Task<IActionResult> ReceivePayment([FromBody] PaymentDto dto)
        {
            // Transaction shuru karein (Safety)
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Payment Record Create Karein
                var payment = new Payment
                {
                    CustomerId = dto.CustomerId,
                    BankId = dto.BankId,
                    AmountPaid = dto.Amount,
                    TransactionRef = dto.TransactionRef,
                    PaymentDate = DateTime.Now
                };

                // Customer ka Balance Update Karein
                var customer = await _context.Customers.FindAsync(dto.CustomerId);
                if (customer == null) return NotFound("Customer nahi mila.");

                // Logic: Pehle balance negative tha (Udhaar), ab Amount add karne se wo zero ki taraf jaye ga
                customer.Balance += dto.Amount;

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                // Sab theek raha to Commit karein
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Payment Received Successfully!",
                    NewBalance = customer.Balance,
                    TransactionId = payment.Id
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest("Payment process fail: " + ex.Message);
            }
        }

        // 2. GET ALL PAYMENTS (History)
        [HttpGet]
        public async Task<IActionResult> GetPaymentHistory()
        {
            var payments = await _context.Payments
                .Include(p => p.Customer)
                .Include(p => p.Bank)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(payments);
        }
    }
}