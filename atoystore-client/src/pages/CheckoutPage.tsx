import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PatternFormat } from "react-number-format";
import { createOrder } from "../services/orderService";
import "../styles/CheckoutPage.css";

const CheckoutPage: React.FC = () => {
    const { items, updateQuantity, removeFromCart, clearCart } = useCart();
    const { userId } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"Cash" | "YooKassa">("Cash");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPrice = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const isPhoneValid = (value: string) => {
        return /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(value);
    };

    const handleOrder = async () => {
        if (!userId) {
            alert("Вы должны быть авторизованы.");
            return;
        }

        if (!name.trim()) {
            alert("Введите ваше имя.");
            return;
        }

        if (!phone.trim() || !isPhoneValid(phone)) {
            alert("Введите корректный номер телефона в формате +7-(XXX)-XXX-XX-XX");
            return;
        }

        if (!address.trim()) {
            alert("Введите адрес доставки.");
            return;
        }

        setIsSubmitting(true);

        const dto = {
            userId,
            customerName: name,
            customerPhone: phone,
            totalPrice,
            items: items.map(i => ({
                productId: i.product.id,
                quantity: i.quantity,
                unitPrice: i.product.price
            })),
            shipping: {
                address,
                city: "Костанай",
                country: "Казахстан"
            },
            payment: {
                method: paymentMethod,
                isPaid: paymentMethod === "YooKassa"
            },
            note
        };

        try {
            const result = await createOrder(dto);
            clearCart();

            if (paymentMethod === "YooKassa" && result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                alert("✅ Заказ успешно оформлен!");
                navigate("/client");
            }
        } catch (err) {
            console.error("Ошибка при оформлении заказа:", err);
            alert("Произошла ошибка при отправке заказа.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-container">
            <h2>Оформление заказа</h2>

            <p
                style={{
                    backgroundColor: "#f6f0e4",
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    color: "#333",
                    fontWeight: "500"
                }}
            >
                🛵 Доставка осуществляется <strong>только по городу Костанай</strong>
            </p>

            {items.length === 0 ? (
                <p>Ваша корзина пуста.</p>
            ) : (
                <>
                    <ul className="checkout-order-summary">
                        {items.map(item => (
                            <li key={item.product.id} className="checkout-order-item">
                                <div className="checkout-item-info">
                                    {item.product.title} — {item.product.price} ₸ × {item.quantity} ={" "}
                                    <strong>{item.product.price * item.quantity} ₸</strong>
                                </div>
                                <div className="checkout-quantity-controls">
                                    <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                        disabled={item.quantity === 1}
                                    >
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="checkout-remove-button"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p><strong>Итого:</strong> {totalPrice.toFixed(2)} ₸</p>

                    <input
                        className="checkout-input"
                        maxLength={25}
                        type="text"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    <PatternFormat
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        format="+7-(###)-###-##-##"
                        mask="_"
                        className="checkout-input"
                        placeholder="+7-(XXX)-XXX-XX-XX"
                    />

                    <textarea
                        className="checkout-textarea"
                        placeholder="Адрес доставки"
                        maxLength={100}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />
                    <p style={{ fontSize: "0.9rem", color: "#888", marginTop: -10, marginBottom: 10 }}>
                        Укажите улицу, дом, квартиру. Пример: ул. Абая, д. 10, кв. 25
                    </p>

                    <textarea
                        className="checkout-textarea"
                        placeholder="Комментарий к заказу (необязательно)"
                        value={note}
                        maxLength={250}
                        onChange={e => setNote(e.target.value)}
                    />

                    <div className="checkout-payment-method">
                        <p><strong>Способ оплаты:</strong></p>
                        <label style={{ display: "block", marginBottom: "5px" }}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Cash"
                                checked={paymentMethod === "Cash"}
                                onChange={() => setPaymentMethod("Cash")}
                            />
                            {" "}Наличные при получении
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="YooKassa"
                                checked={paymentMethod === "YooKassa"}
                                onChange={() => setPaymentMethod("YooKassa")}
                            />
                            {" "}Онлайн-оплата (YooKassa)
                        </label>
                    </div>

                    <button
                        onClick={handleOrder}
                        disabled={isSubmitting}
                        className="checkout-button"
                    >
                        {isSubmitting ? "Отправка..." : "Оформить заказ"}
                    </button>
                </>
            )}
        </div>
    );
};

export default CheckoutPage;
