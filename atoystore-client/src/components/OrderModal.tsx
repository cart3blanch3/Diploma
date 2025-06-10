import React, { useState } from "react";
import { PatternFormat } from "react-number-format";
import { Order } from "../types/Order";
import "../styles/OrderModal.css";

interface Props {
    order: Order;
    onClose: () => void;
    onSave: (updated: Partial<Order>) => void;
}

const OrderModal: React.FC<Props> = ({ order, onClose, onSave }) => {
    const [name, setName] = useState(order.customerName || "");
    const [phone, setPhone] = useState(order.customerPhone || "");
    const [note, setNote] = useState(order.note || "");
    const [address, setAddress] = useState(order.shipping.address || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isPhoneValid = (value: string) => {
        return /^\+7-\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(value);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            alert("Введите имя клиента.");
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

        onSave({
            id: order.id,
            customerName: name.trim(),
            customerPhone: phone.trim(),
            note: note.trim(),
            shipping: {
                ...order.shipping,
                address: address.trim(),
            },
        });

        setIsSubmitting(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Редактировать заказ</h3>

                <label>Имя *</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={25}
                    placeholder="Имя клиента"
                    disabled={isSubmitting}
                />

                <label>Телефон *</label>
                <PatternFormat
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    format="+7-(###)-###-##-##"
                    mask="_"
                    placeholder="+7-(XXX)-XXX-XX-XX"
                    className="order-modal-input"
                    disabled={isSubmitting}
                />

                <label>Комментарий</label>
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={255}
                    placeholder="Комментарий к заказу (необязательно)"
                    disabled={isSubmitting}
                />

                <label>Адрес доставки *</label>
                <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    maxLength={255}
                    placeholder="Улица, дом, квартира"
                    disabled={isSubmitting}
                />

                <div className="modal-actions">
                    <button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Сохраняем..." : "Сохранить"}
                    </button>
                    <button onClick={onClose} className="cancel" disabled={isSubmitting}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
