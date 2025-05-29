import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Product } from "../types/Product";
import "../styles/Catalog.css";

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<{ [productId: string]: number }>({});
  const { userId, isAuthenticated } = useAuth();
  const { addToCart, removeFromCart, getQuantity } = useCart();

  useEffect(() => {
    const loadFavorites = async () => {
      if (!userId || !isAuthenticated) return;

      try {
        const res = await api.get<Product[]>(`/favorites/${userId}`);
        setFavorites(res.data);
      } catch (error) {
        console.error("Ошибка при загрузке избранных товаров:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [userId, isAuthenticated]);

  const handlePrevImage = (productId: string, imagesLength: number) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  const handleNextImage = (productId: string, imagesLength: number) => {
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imagesLength,
    }));
  };

  if (loading) return <p>Загрузка...</p>;
  if (!isAuthenticated) return <p>Пожалуйста, войдите в систему, чтобы просматривать избранное.</p>;

  return (
    <div className="catalog-page">
      <h1>Избранные товары</h1>

      {favorites.length === 0 ? (
        <p>Вы ещё не добавили товары в избранное.</p>
      ) : (
        <div className="product-grid">
          {favorites.map((product) => {
            const imageObjects = product.images as unknown as { url: string }[];
            const currentImage = imageObjects?.[imageIndexes[product.id] || 0]?.url || "/placeholder.png";
            const quantity = getQuantity(product.id);

            return (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="carousel-container">
                    {imageObjects.length > 1 && (
                      <button className="carousel-button left" onClick={(e) => {
                        e.preventDefault();
                        handlePrevImage(product.id, imageObjects.length);
                      }}>
                        ←
                      </button>
                    )}
                    <img
                      src={`http://localhost:5062${currentImage}`}
                      alt={product.title}
                      className="product-image fade-in"
                    />
                    {imageObjects.length > 1 && (
                      <button className="carousel-button right" onClick={(e) => {
                        e.preventDefault();
                        handleNextImage(product.id, imageObjects.length);
                      }}>
                        →
                      </button>
                    )}
                  </div>
                </Link>

                <div className="product-info">
                  <Link to={`/product/${product.id}`} className="product-title-link">
                    <h3 className="product-title">{product.title}</h3>
                  </Link>
                  <p className="product-price">{product.price} ₸</p>
                  <p className={`product-availability ${product.quantity > 0 ? "in-stock" : "out-of-stock"}`}>
                    {product.quantity > 0 ? "В наличии" : "На заказ"}
                  </p>

                  <div className="product-actions">
                    {quantity === 0 ? (
                      <button className="cart-button" onClick={() => addToCart(product)}>
                        В корзину
                      </button>
                    ) : (
                      <div className="quantity-controls">
                        <button className="qty-btn" onClick={() => removeFromCart(product.id)}>
                          −
                        </button>
                        <span className="qty-count">{quantity}</span>
                        <button className="qty-btn" onClick={() => addToCart(product)}>
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
