import React, { useState } from "react";
import { createProduct } from "../services/productService";

const AdminPage: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);

    const handleAdminAccess = async () => {
        try {
            const response = await createProduct();
            setMessage(response.data.Message);
        } catch (error) {
            setMessage("Ошибка доступа! Только для администраторов.");
        }
    };

    return (
        <div className="container">
            <h2>Admin Page</h2>
            <p>Проверка доступа администратора</p>
            <button onClick={handleAdminAccess}>Создать продукт</button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default AdminPage;
