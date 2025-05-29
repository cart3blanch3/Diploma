import React, { useState } from "react";
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

    const handleSubmit = () => {
        onSave({
            id: order.id,
            customerName: name,
            customerPhone: phone,
            note,
            shipping: {
                ...order.shipping,
                address,
            },
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Редактировать заказ</h3>

                <label>Имя</label>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={25}
                />

                <label>Телефон</label>
                <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    maxLength={25}
                />

                <label>Комментарий</label>
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={255}
                />

                <label>Адрес</label>
                <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    maxLength={255}
                />

                <div className="modal-actions">
                    <button onClick={handleSubmit}>Сохранить</button>
                    <button onClick={onClose} className="cancel">Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
