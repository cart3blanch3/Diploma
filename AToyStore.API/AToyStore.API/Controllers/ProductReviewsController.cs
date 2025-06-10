using AToyStore.API.DTOs;
using AToyStore.Application.Profile.Interfaces;
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
    private readonly IUserProfileService _userProfileService;

    public ProductReviewsController(IProductReviewService reviewService, IUserProfileService userProfileService)
    {
        _reviewService = reviewService;
        _userProfileService = userProfileService;
    }

    // GET: api/ProductReviews/product/{productId}
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(Guid productId)
    {
        var reviews = await _reviewService.GetByProductIdAsync(productId);
        var dtoList = new List<ProductReviewDto>();

        foreach (var review in reviews)
        {
            var user = await _userProfileService.GetByIdAsync(review.UserId.ToString());

            dtoList.Add(new ProductReviewDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UserId = review.UserId.ToString(),
                FullName = user?.FullName
            });
        }

        return Ok(dtoList);
    }

    // GET: api/ProductReviews/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var review = await _reviewService.GetByIdAsync(id);
        if (review == null)
            return NotFound();

        var user = await _userProfileService.GetByIdAsync(review.UserId.ToString());

        var dto = new ProductReviewDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            UserId = review.UserId.ToString(),
            FullName = user?.FullName
        };

        return Ok(dto);
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
