using AToyStore.Application.Favorites.Interfaces;
using AToyStore.Core.Favorites.Entities;
using AToyStore.Core.Products.Entities;
using Microsoft.AspNetCore.Mvc;

namespace AToyStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    // GET: /api/favorites/{userId}
    [HttpGet("{userId}")]
    public async Task<ActionResult<List<Product>>> GetFavorites(string userId)
    {
        var favorites = await _favoriteService.GetFavoritesAsync(userId);

        // Возвращаем только продукты
        var products = favorites.Select(f => f.Product).ToList();
        return Ok(products);
    }

    // POST: /api/favorites/{userId}/{productId}
    [HttpPost("{userId}/{productId:guid}")]
    public async Task<IActionResult> AddToFavorites(string userId, Guid productId)
    {
        await _favoriteService.AddToFavoritesAsync(userId, productId);
        return NoContent();
    }

    // DELETE: /api/favorites/{userId}/{productId}
    [HttpDelete("{userId}/{productId:guid}")]
    public async Task<IActionResult> RemoveFromFavorites(string userId, Guid productId)
    {
        await _favoriteService.RemoveFromFavoritesAsync(userId, productId);
        return NoContent();
    }
}
