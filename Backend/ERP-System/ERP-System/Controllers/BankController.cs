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

        [HttpPut("{id}")]
        public async Task<IActionResult> PutBank(int id, [FromBody] Bank bank)
        {
            if (id != bank.Id) return BadRequest("ID Mismatch");

            // Purana data check karne ke liye taake tracking issue na ho
            var existingBank = await _context.Banks.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);
            if (existingBank == null) return NotFound("Bank nahi mila");

            // Poore object ko modified mark karein
            _context.Entry(bank).State = EntityState.Modified;

            // IMPORTANT: Transactions ko update se exclude karne ke liye ye line use karein
            // Kyunke collection update ke liye alag logic chahiye hota hai
            _context.Entry(bank).Navigation("Transactions").IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BankExists(id)) return NotFound();
                else throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }

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

        private bool BankExists(int id)
        {
            return _context.Banks.Any(e => e.Id == id);
        }

        // --- Transaction Methods (Same as before) ---
        [HttpGet("Transactions")]
        public async Task<ActionResult> GetTransactions()
        {
            var transactions = await _context.BankTransactions
                .Include(t => t.Bank)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
            return Ok(transactions);
        }

        [HttpPost("AddTransaction")]
        public async Task<IActionResult> AddTransaction([FromBody] BankTransaction transaction)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Check karein ke bank exist karta hai ya nahi
            var bankExists = await _context.Banks.AnyAsync(b => b.Id == transaction.BankId);
            if (!bankExists) return NotFound("Bank nahi mila");

            // Balance update logic yahan se remove kar diya gaya hai
            transaction.TransactionDate = DateTime.Now;

            _context.BankTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(transaction);
        }
    }
}