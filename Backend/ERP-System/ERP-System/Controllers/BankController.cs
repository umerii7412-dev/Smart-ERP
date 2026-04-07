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
        // Frontend dropdown ke liye data yahan se jaye ga
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bank>>> GetBanks()
        {
            return await _context.Banks.OrderBy(b => b.BankName).ToListAsync();
        }

        // POST: api/Bank
        // Naya bank (e.g. EasyPaisa, Cash) add karne ke liye
        [HttpPost]
        public async Task<ActionResult<Bank>> PostBank(Bank bank)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Banks.Add(bank);
            await _context.SaveChangesAsync();
            return Ok(bank);
        }
    }
}