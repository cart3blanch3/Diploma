using AToyStore.Application.Reviews.Interfaces;
using AToyStore.Core.Products.Entities;
using AToyStore.Core.Reviews.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AToyStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductReviewsController : ControllerBase
{
    private readonly IProductReviewService _reviewService;

    public ProductReviewsController(IProductReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // GET: api/ProductReviews/product/{productId}
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(Guid productId)
    {
        var reviews = await _reviewService.GetByProductIdAsync(productId);
        return Ok(reviews);
    }

    // GET: api/ProductReviews/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var review = await _reviewService.GetByIdAsync(id);
        if (review == null)
            return NotFound();

        return Ok(review);
    }

    // POST: api/ProductReviews
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductReview review)
    {
        var created = await _reviewService.AddAsync(review);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // DELETE: api/ProductReviews/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _reviewService.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    // GET: api/ProductReviews/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(string userId)
    {
        var reviews = await _reviewService.GetByUserIdAsync(userId);
        return Ok(reviews);
    }
}
