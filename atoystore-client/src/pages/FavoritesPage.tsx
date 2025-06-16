import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Product } from "../types/Product";
import "../styles/Catalog.css";

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5062";

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId, isAuthenticated } = useAuth();
  const { addToCart, removeFromCart, getQuantity } = useCart();

  // Для каждого товара отдельный индекс текущего изображения
  const [imageIndexes, setImageIndexes] = useState<{ [productId: string]: number }>({});

  // Ref для последнего времени переключения для каждого товара, чтобы ограничить частоту
  const lastSwitchTimeRefs = useRef<{ [productId: string]: number }>({});

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

  const handleMouseMove = (
    productId: string,
    e: React.MouseEvent<HTMLDivElement>,
    imagesLength: number
  ) => {
    if (imagesLength <= 1) return;

    const now = Date.now();
    if (!lastSwitchTimeRefs.current[productId]) {
      lastSwitchTimeRefs.current[productId] = 0;
    }
    if (now - lastSwitchTimeRefs.current[productId] < 300) return;
    lastSwitchTimeRefs.current[productId] = now;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const middle = bounds.width / 2;

    setImageIndexes((prev) => {
      const currentIndex = prev[productId] || 0;
      if (x < middle && currentIndex > 0) return { ...prev, [productId]: currentIndex - 1 };
      if (x >= middle && currentIndex < imagesLength - 1) return { ...prev, [productId]: currentIndex + 1 };
      return prev;
    });
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
            const imagesLength = imageObjects.length;
            const currentImageIndex = imageIndexes[product.id] || 0;
            const currentImage = imageObjects?.[currentImageIndex]?.url || "/placeholder.png";
            const quantity = getQuantity(product.id);

            return (
              <div key={product.id} className="product-card">
                <div
                  className="carousel-container"
                  onMouseMove={(e) => handleMouseMove(product.id, e, imagesLength)}
                >
                  <img
                    src={`http://localhost:5062${currentImage}`}
                    alt={product.title}
                    className="product-image fade-in"
                  />
                  {imagesLength > 1 && (
                    <div className="dots">
                      {imageObjects.map((_, i) => (
                        <span
                          key={i}
                          className={`dot ${i === currentImageIndex ? "active" : ""}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

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
