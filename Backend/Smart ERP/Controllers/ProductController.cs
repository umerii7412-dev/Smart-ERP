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
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL PRODUCTS (Sab dekh sakte hain)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll()
        {
            return await _context.Set<Product>().ToListAsync();
        }

        // 2. GET PRODUCT BY ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(int id)
        {
            var product = await _context.Set<Product>().FindAsync(id);
            if (product == null) return NotFound("Product nahi mila.");
            return Ok(product);
        }

        // 3. CREATE PRODUCT (Sirf Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                StockQuantity = dto.StockQuantity,
                Price = dto.Price
            };

            _context.Set<Product>().Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Product added successfully!", Product = product });
        }

        // 4. UPDATE STOCK (Inventory Management)
        [HttpPut("update-stock/{id}")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] int newQuantity)
        {
            var product = await _context.Set<Product>().FindAsync(id);
            if (product == null) return NotFound("Product record not found.");

            product.StockQuantity = newQuantity;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Stock updated!", NewQuantity = product.StockQuantity });
        }

        // 5. DELETE PRODUCT (Sirf Admin)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Set<Product>().FindAsync(id);
            if (product == null) return NotFound();

            _context.Set<Product>().Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Product deleted from system." });
        }
    }
}