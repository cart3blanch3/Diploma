import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Order, OrderStatus } from "../types/Order";
import "../styles/AdminOrdersPage.css";
import OrderModal from "../components/OrderModal";

const statusLabel: Record<OrderStatus, string> = {
  0: "В ожидании",
  1: "В обработке",
  2: "Оплачен",
  3: "Отправлен",
  4: "Завершён",
  5: "Отменён"
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data.items || []);
      } catch (err) {
        console.error("Ошибка при загрузке заказов:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { id: orderId, status: newStatus });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Ошибка при обновлении статуса заказа:", err);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
  };

  const handleSave = async (updated: Partial<Order>) => {
    try {
      await api.put(`/orders/${updated.id}`, updated);
      setOrders(prev =>
        prev.map(o => o.id === updated.id ? { ...o, ...updated } : o)
      );
      setEditingOrder(null);
    } catch (err) {
      console.error("Ошибка при сохранении заказа", err);
      alert("Не удалось сохранить заказ");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот заказ?")) return;

    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      console.error("Ошибка при удалении заказа:", err);
      alert("Не удалось удалить заказ.");
    }
  };

  return (
    <div className="admin-orders-page">
      <h2>Управление заказами</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <select
                  className="status-dropdown"
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, parseInt(e.target.value))}
                >
                  {Object.entries(statusLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="order-body">
                <p><strong>Пользователь:</strong> {order.customerName}</p>
                <p><strong>Телефон:</strong> {order.customerPhone}</p>
                <p><strong>Комментарий:</strong> {order.note || "—"}</p>
                <p><strong>Адрес:</strong> {order.shipping.address}</p>
                <p><strong>Сумма:</strong> {order.totalPrice.toFixed(2)} ₸</p>

                <p><strong>Товары:</strong></p>
                <ul className="order-items">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product.title} — {item.unitPrice} ₸ × {item.quantity}
                    </li>
                  ))}
                </ul>

                <button onClick={() => handleEdit(order)}>Редактировать</button>
                <button className="delete-button" onClick={() => handleDelete(order.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingOrder && (
        <OrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
