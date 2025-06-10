import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Product } from "../types/Product";
import { ProductReview } from "../types/ProductReview";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { updateReview, deleteReview } from "../services/reviewService";
import { favoriteService } from "../services/favoriteService";
import "../styles/ProductDetailPage.css";

const REVIEWS_PER_PAGE = 5;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();
  const { addToCart, removeFromCart, getQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchReviews = async () => {
    const res = await api.get(`/productreviews/product/${id}`);
    setReviews(res.data || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);
        setQuantity(getQuantity(productRes.data.id));
        await fetchReviews();

        if (userId) {
          const favs = await favoriteService.getFavorites(userId);
          setFavorites(favs);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных о товаре и отзывах", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userId, getQuantity]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setQuantity((prev) => prev + 1);
    }
  };

  const handleRemoveFromCart = () => {
    if (product) {
      removeFromCart(product.id);
      setQuantity((prev) => Math.max(prev - 1, 0));
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      if (window.confirm("Чтобы добавить в избранное, необходимо авторизоваться. Перейти к авторизации?")) {
        navigate("/login");
      }
      return;
    }

    if (userId && product) {
      await favoriteService.toggle(userId, favorites, product.id, setFavorites);
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (!id || !editingReviewId) return;

      await updateReview(editingReviewId, { rating, comment });
      setEditingReviewId(null);
      setComment("");
      setRating(5);
      await fetchReviews();
    } catch (error) {
      console.error("Ошибка при обновлении отзыва", error);
    }
  };

  const handleEdit = (review: ProductReview) => {
    setEditingReviewId(review.id);
    setComment(review.comment);
    setRating(review.rating);
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (error) {
      console.error("Ошибка при удалении отзыва", error);
    }
  };

  const handlePrevImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const paginatedReviews = reviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE);
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const currentImageUrl = product?.images?.[currentImageIndex];
  const isFavorite = product ? favorites.includes(product.id) : false;

  if (loading) return <div>Загрузка...</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div className="product-detail">
      <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>

      <div className="product-detail-content">
        <div className="image-gallery-carousel">
          {currentImageUrl ? (
            <>
              {product.images.length > 1 && (
                <button className="carousel-button left" onClick={handlePrevImage}>←</button>
              )}
              <img src={`http://localhost:5062${currentImageUrl}`} alt="Изображение товара" className="gallery-image" />
              {product.images.length > 1 && (
                <button className="carousel-button right" onClick={handleNextImage}>→</button>
              )}
            </>
          ) : (
            <img src="/placeholder.png" alt="Нет изображения" className="gallery-image" />
          )}
        </div>

        <div className="detail-info">
          <h2>{product.title}</h2>
          <p className="price">{product.price} ₸</p>
          <p className="description">{product.description}</p>

          <div className="detail-controls">
            <div className="quantity-controls">
              <button className="qty-btn" onClick={handleRemoveFromCart}>−</button>
              <span className="qty-count">{quantity}</span>
              <button className="qty-btn" onClick={handleAddToCart}>+</button>
            </div>

            <button className="favorite-btn" title="Добавить в избранное" onClick={toggleFavorite}>
              {isFavorite ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>

      <hr />

      <div className="reviews-section">
        <h3>Отзывы</h3>

        {paginatedReviews.length === 0 && <p>Отзывов пока нет.</p>}

        {paginatedReviews.map((r) => (
          <div key={r.id} className="review">
            <div className="review-header">
              <strong>{r.fullName || "Пользователь"}</strong>
              <span className="rating">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            <p>{r.comment}</p>
            <small>{new Date(r.createdAt).toLocaleDateString()}</small>
            {r.userId === userId && (
              <div className="review-actions">
                <button onClick={() => handleEdit(r)}>✎</button>
                <button onClick={() => handleDelete(r.id)}>✖</button>
              </div>
            )}
          </div>
        ))}

        {editingReviewId && (
          <div className="review-form">
            <textarea
              placeholder="Редактировать отзыв..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="rating-select">
              <label>Оценка: </label>
              <select value={rating} onChange={(e) => setRating(+e.target.value)}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSubmitReview}>Обновить отзыв</button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === currentPage ? "active" : ""}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
