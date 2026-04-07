using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.API.Data;
using ERP.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace ERP_System.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BankController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BankController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Bank
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bank>>> GetBanks()
        {
            return await _context.Banks.OrderBy(b => b.BankName).ToListAsync();
        }

        // POST: api/Bank
        [HttpPost]
        public async Task<ActionResult<Bank>> PostBank(Bank bank)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Banks.Add(bank);
            await _context.SaveChangesAsync();
            return Ok(bank);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Bank>> GetBank(int id)
        {
            var bank = await _context.Banks.FindAsync(id);
            if (bank == null) return NotFound("Bank nahi mila");
            return bank;
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBank(int id)
        {
            var bank = await _context.Banks.FindAsync(id);
            if (bank == null) return NotFound();

            _context.Banks.Remove(bank);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Bank successfully deleted" });
        }

        // ==========================================
        // NEW UPDATED CODE (FOR FRONTEND SYNC)
        // ==========================================

        // 1. Transactions List fetch karne ke liye
        [HttpGet("Transactions")]
        public async Task<ActionResult> GetTransactions()
        {
            var transactions = await _context.BankTransactions
                .Include(t => t.Bank)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
            return Ok(transactions);
        }

        // 2. Transaction add karne aur Balance update karne ke liye
        [HttpPost("AddTransaction")]
        public async Task<IActionResult> AddTransaction([FromBody] BankTransaction transaction)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var bank = await _context.Banks.FindAsync(transaction.BankId);
            if (bank == null) return NotFound("Bank nahi mila");

            // Logic: Balance update karna
            if (transaction.Type == "Credit")
                bank.CurrentBalance += transaction.Amount;
            else
                bank.CurrentBalance -= transaction.Amount;

            transaction.TransactionDate = DateTime.Now; // Date set karna
            _context.BankTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return Ok(transaction);
        }
    }
}