import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Order, OrderStatus } from "../types/Order";
import { createReview } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../styles/OrdersPage.css";

const statusLabel: Record<OrderStatus, string> = {
  0: "В ожидании",
  1: "В обработке",
  2: "Оплачен",
  3: "Отправлен",
  4: "Завершён",
  5: "Отменён",
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([]);
  const [commentError, setCommentError] = useState("");
  const { userId } = useAuth();

  const loadOrders = async () => {
    try {
      const res = await api.get(`/profile/orders`);
      setOrders(res.data || []);
    } catch (error) {
      console.error("Ошибка при загрузке заказов", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const loadUserReviews = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/productreviews/user/${userId}`);
        const reviewedIds = res.data.map((r: any) => r.productId);
        setReviewedProductIds(reviewedIds);
      } catch (error) {
        console.error("Ошибка при загрузке отзывов пользователя", error);
      }
    };
    loadUserReviews();
  }, [userId]);

  const handleSendReview = async (productId: string, orderId: string) => {
    if (comment.trim().length < 5) {
      setCommentError("Отзыв должен содержать минимум 5 символов");
      return;
    } else {
      setCommentError("");
    }

    try {
      if (!userId) return;
      await createReview({ productId, userId, comment, rating });
      setComment("");
      setRating(5);
      setReviewingProductId(null);
      setReviewedProductIds(prev => [...prev, productId]);
      toast.success("Спасибо за отзыв!");
    } catch (err) {
      console.error("Ошибка при отправке отзыва:", err);
      toast.error("Не удалось отправить отзыв.");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Вы уверены, что хотите отменить заказ?")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.info("Заказ отменён");
      loadOrders();
    } catch (err) {
      toast.error("Не удалось отменить заказ.");
    }
  };

  const handlePay = async (orderId: string) => {
    try {
      const res = await api.get(`/payments/by-order/${orderId}`);
      const { paymentId } = res.data;
      const statusRes = await api.get(`/payments/status/${paymentId}`);
      if (statusRes.data.paid) {
        toast.info("Заказ уже оплачен.");
      } else {
        window.location.href = statusRes.data.confirmationUrl;
      }
    } catch (err) {
      toast.error("Ошибка при инициализации оплаты.");
    }
  };

  return (
    <div className="orders-page">
      <h2 className="orders-title">Мои заказы</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : orders.length === 0 ? (
        <p>У вас пока нет заказов.</p>
      ) : (
        <div className="orders-grid">
          {orders.map(order => {
            const shortOrderId = order.id.substring(0, 8);

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="order-id">
                    Номер заказа: <strong>#{shortOrderId}</strong>
                  </span>
                  <span className={`order-status status-${order.status}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>

                <p><strong>Адрес:</strong> {order.shipping.address}</p>
                <p><strong>Сумма:</strong> {order.totalPrice.toFixed(2)} ₸</p>

                <div className="order-actions">
                  {(order.status === 0 || order.status === 1) && (
                    <>
                      <button onClick={() => handleCancelOrder(order.id)}>Отменить заказ</button>
                      <p className="cancel-note">Можно отменить до отправки</p>
                    </>
                  )}
                  {order.status === 0 && order.payment?.method === "YooKassa" && (
                    <button onClick={() => handlePay(order.id)}>Оплатить онлайн</button>
                  )}
                </div>

                <p><strong>Товары:</strong></p>
                <ul className="order-items">
                  {order.items.map((item, idx) => {
                    const alreadyReviewed = reviewedProductIds.includes(item.product.id);

                    return (
                      <li key={idx}>
                        {item.product.title} — {item.unitPrice} ₸ × {item.quantity}
                        {order.status === 4 && !alreadyReviewed && (
                          <>
                            <button onClick={() => setReviewingProductId(item.product.id)}>
                              Оставить отзыв
                            </button>
                            {reviewingProductId === item.product.id && (
                              <div className="review-form-inline">
                                <textarea
                                  placeholder="Ваш отзыв"
                                  value={comment}
                                  onChange={(e) => {
                                    if (e.target.value.length <= 500) setComment(e.target.value);
                                  }}
                                  maxLength={500}
                                />
                                <div className="char-counter">{comment.length} / 500</div>
                                {commentError && <div className="error-text">{commentError}</div>}

                                <select
                                  value={rating}
                                  onChange={(e) => setRating(+e.target.value)}
                                >
                                  {[5, 4, 3, 2, 1].map(r => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                                <button onClick={() => handleSendReview(item.product.id, order.id)}>
                                  Отправить
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        {order.status === 4 && alreadyReviewed && (
                          <span className="review-sent-label">✔️ Отзыв оставлен</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
