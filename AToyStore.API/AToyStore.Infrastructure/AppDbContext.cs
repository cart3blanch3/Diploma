using AToyStore.Core.Products.Entities;
using AToyStore.Core.Orders.Entities;
using Core.Products;
using Core.Products.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AToyStore.Core.Profile.Entities;
using AToyStore.Core.Favorites.Entities;
using AToyStore.Core.Payments.Entities;
using AToyStore.Core.Reviews.Entities;

namespace AToyStore.Infrastructure
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<ProductReview> ProductReviews => Set<ProductReview>();

        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<FavoriteItem> Favorites => Set<FavoriteItem>();

        public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();


        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // ВАЖНО: Identity конфигурации

            // === Products ===
            modelBuilder.Entity<Product>()
                .HasMany(p => p.Images)
                .WithOne()
                .HasForeignKey(img => img.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>()
                .HasMany(p => p.Reviews)
                .WithOne()
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Title);

            // === Orders ===
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne()
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);



            // === Favorites ===
            modelBuilder.Entity<FavoriteItem>()
                .HasKey(f => new { f.UserId, f.ProductId });

            modelBuilder.Entity<FavoriteItem>()
                .HasOne(f => f.Product)
                .WithMany()
                .HasForeignKey(f => f.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
