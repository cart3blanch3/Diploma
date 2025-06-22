import React, { useState, useRef, useEffect } from "react";
import { Product } from "../types/Product";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { favoriteService } from "../services/favoriteService";
import StarRating from "./StarRating";
import "../styles/ProductCard.css";

const API_BASE_URL = "https://atoystore.store"

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart, removeFromCart, getQuantity } = useCart();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const lastSwitchTimeRef = useRef(Date.now());

  useEffect(() => {
    const qty = getQuantity(product.id);
    setQuantity(qty);
  }, [getQuantity, product.id]);

  useEffect(() => {
    const loadFavorite = async () => {
      if (userId) {
        const favorites = await favoriteService.getFavorites(userId);
        setIsFavorite(favorites.includes(product.id));
      }
    };
    loadFavorite();
  }, [userId, product.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (window.confirm("Чтобы добавить в избранное, необходимо авторизоваться. Перейти к авторизации?")) {
        navigate("/login");
      }
      return;
    }

    if (userId) {
      await favoriteService.toggle(userId, isFavorite ? [product.id] : [], product.id, () => {});
      setIsFavorite(!isFavorite);
    }
  };

  const images = product.images?.length ? product.images : ["/placeholder.png"];
  const imageCount = images.length;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;

    const now = Date.now();
    if (now - lastSwitchTimeRef.current < 300) return;
    lastSwitchTimeRef.current = now;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const middle = bounds.width / 2;

    setCurrentImageIndex((prev) => {
      if (x < middle && prev > 0) return prev - 1;
      if (x >= middle && prev < imageCount - 1) return prev + 1;
      return prev;
    });
  };

  const handleAddToCart = () => {
    addToCart(product);
    setQuantity((prev) => prev + 1);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
    setQuantity((prev) => Math.max(prev - 1, 0));
  };

  const handleNavigate = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card">
      <div className="carousel-container" onMouseMove={handleMouseMove} onClick={handleNavigate}>
        <button
          className={`favorite-icon ${isFavorite ? "active" : ""}`}
          title="Добавить в избранное"
          onClick={toggleFavorite}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <img
          src={`${API_BASE_URL}${images[currentImageIndex]}`}
          alt={product.title}
          className="product-image fade-in"
        />
        {imageCount > 1 && (
          <div className="dots">
            {images.map((_, i) => (
              <span key={i} className={`dot ${i === currentImageIndex ? "active" : ""}`} />
            ))}
          </div>
        )}
      </div>

      <div
        className="product-info"
        onClick={handleNavigate}
        style={{ cursor: "pointer" }}
      >
        <h3 className="product-title">{product.title}</h3>

        <div className="product-rating" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StarRating rating={product.averageRating || 0} />
          <span className="review-count" style={{ color: "#666", fontSize: "14px" }}>
            ({product.reviewsCount})
          </span>
        </div>

        <p className="product-price">{product.price} ₸</p>
        <p
          className={`product-availability ${product.quantity > 0 ? "in-stock" : "out-of-stock"}`}
        >
          {product.quantity > 0
            ? `В наличии (${product.quantity} шт.)`
            : "На заказ"}
        </p>

        <div className="product-actions" onClick={(e) => e.stopPropagation()}>
          {quantity === 0 ? (
            <button className="cart-button" onClick={handleAddToCart}>
              В корзину
            </button>
          ) : (
            <div className="quantity-controls">
              <button className="qty-btn" onClick={handleRemoveFromCart}>−</button>
              <span className="qty-count">{quantity}</span>
              <button className="qty-btn" onClick={handleAddToCart}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
