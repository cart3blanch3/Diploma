using AToyStore.API.DTOs;
using AToyStore.API.Mappers;
using AToyStore.Application.Products.Interfaces;
using AToyStore.Core.Products.Common.Models;
using AToyStore.Core.Products.Entities;
using Core.Products.Entities;
using Core.Products.Models;
using Microsoft.AspNetCore.Mvc;

namespace AToyStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWebHostEnvironment _environment;

    public ProductsController(IProductService productService, IWebHostEnvironment environment)
    {
        _productService = productService;
        _environment = environment;
    }

    // GET: api/products
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _productService.GetAllAsync(pageNumber, pageSize);

        var dtoResult = new PagedResult<ProductDto>
        {
            Items = result.Items.Select(ProductMapper.ToDto).ToList(),
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(dtoResult);
    }

    // GET: api/products/search
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string keyword, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _productService.SearchAsync(keyword, pageNumber, pageSize);

        var dtoResult = new PagedResult<ProductDto>
        {
            Items = result.Items.Select(ProductMapper.ToDto).ToList(),
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(dtoResult);
    }

    // GET: api/products/filter
    [HttpGet("filter")]
    public async Task<IActionResult> Filter([FromQuery] ProductFilter filter)
    {
        var result = await _productService.FilterAsync(filter);

        var dtoResult = new PagedResult<ProductDto>
        {
            Items = result.Items.Select(ProductMapper.ToDto).ToList(),
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(dtoResult);
    }

    // GET: api/products/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        var dto = ProductMapper.ToDto(product);
        return Ok(dto);
    }

    // POST: api/products
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] Product product, [FromForm] List<IFormFile> images)
    {
        if (images.Any())
        {
            product.Images = await SaveImagesAsync(images);
        }

        var created = await _productService.CreateAsync(product);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ProductMapper.ToDto(created));
    }

    // PUT: api/products/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromForm] Product product, [FromForm] List<IFormFile> images)
    {
        if (id != product.Id)
            return BadRequest("ID mismatch.");

        if (images.Any())
        {
            product.Images = await SaveImagesAsync(images);
        }

        var success = await _productService.UpdateAsync(product);
        if (!success)
            return NotFound();

        return NoContent();
    }

    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _productService.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    private async Task<List<ProductImage>> SaveImagesAsync(List<IFormFile> images)
    {
        var savedImages = new List<ProductImage>();
        var uploadPath = Path.Combine(_environment.WebRootPath, "uploads");

        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        foreach (var file in images)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            savedImages.Add(new ProductImage
            {
                Url = $"/uploads/{fileName}"
            });
        }

        return savedImages;
    }
}
