import React, { useState } from "react";
import { getProducts } from "../services/productService";

const ClientPage: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);

    const handleCheckAccess = async () => {
        try {
            const response = await getProducts();
            setMessage(response.data.Message);
        } catch (error) {
            setMessage("Ошибка доступа!");
        }
    };

    return (
        <div className="container">
            <h2>Client Page</h2>
            <p>Проверка доступа клиента</p>
            <button onClick={handleCheckAccess}>Проверить доступ</button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default ClientPage;
