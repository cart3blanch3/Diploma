import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/FloatingCart.css";
import { FaShoppingCart as IconCartRaw } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const IconCart = IconCartRaw as unknown as React.FC<{ size?: number }>;

const FloatingCart: React.FC = () => {
    const { items, totalQuantity, addToCart, removeFromCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const readyToShip = items.filter(item => item.quantity <= item.product.quantity);
    const madeToOrder = items.filter(item => item.quantity > item.product.quantity);

    return (
        <>
            <div className="floating-cart-icon" onClick={() => setOpen(!open)}>
                <IconCart size={22} />
                {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
            </div>

            {open && (
                <div className="floating-cart-dropdown">
                    <h4>Корзина</h4>
                    {items.length === 0 ? (
                        <p>Корзина пуста</p>
                    ) : (
                        <>
                            {readyToShip.length > 0 && (
                                <>
                                    <h5 className="cart-section-title">✅ Готовые к отправке</h5>
                                    <div className="cart-items-list">
                                        {readyToShip.map(item => (
                                            <div className="cart-item" key={item.product.id}>
                                                <div className="cart-item-title">{item.product.title}</div>
                                                <div className="cart-item-price">{item.product.price} ₸</div>
                                                <div className="cart-item-qty">
                                                    <button onClick={() => removeFromCart(item.product.id)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        onClick={() => item.quantity < 20 && addToCart(item.product)}
                                                        disabled={item.quantity >= 20}
                                                        title={item.quantity >= 20 ? "Максимум 20 штук" : "Добавить ещё"}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {madeToOrder.length > 0 && (
                                <>
                                    <h5 className="cart-section-title">🧶 Будут изготовлены на заказ</h5>
                                    <div className="cart-items-list">
                                        {madeToOrder.map(item => (
                                            <div className="cart-item" key={item.product.id}>
                                                <div className="cart-item-title">{item.product.title}</div>
                                                <div className="cart-item-price">{item.product.price} ₸</div>
                                                <div className="cart-item-qty">
                                                    <button onClick={() => removeFromCart(item.product.id)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        onClick={() => item.quantity < 20 && addToCart(item.product)}
                                                        disabled={item.quantity >= 20}
                                                        title={item.quantity >= 20 ? "Максимум 20 штук" : "Добавить ещё"}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {isAuthenticated ? (
                                <button
                                    className="checkout-button"
                                    onClick={() => {
                                        setOpen(false);
                                        navigate("/checkout");
                                    }}
                                >
                                    Оформить заказ
                                </button>
                            ) : (
                                <p className="auth-required-message">Войдите в систему, чтобы оформить заказ</p>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default FloatingCart;
