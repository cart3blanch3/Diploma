import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const PaymentSuccessPage: React.FC = () => {
    const [status, setStatus] = useState<"loading" | "succeeded" | "failed" | "error">("loading");
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkPaymentStatus = async () => {
            const params = new URLSearchParams(window.location.search);
            const paymentIdParam = params.get("paymentId");
            const orderIdParam = params.get("orderId");

            console.log("📦 Начало проверки платежа");
            console.log("🔗 URL-параметры:", { paymentId: paymentIdParam, orderId: orderIdParam });

            let paymentId = paymentIdParam;

            try {
                // Если paymentId отсутствует, получаем его по orderId
                if (!paymentId && orderIdParam) {
                    const lookupRes = await api.get(`/payments/by-order/${orderIdParam}`);
                    paymentId = lookupRes.data?.paymentId;
                    console.log("📥 Получен paymentId по orderId:", paymentId);
                }

                // Если всё равно нет paymentId — ошибка
                if (!paymentId) {
                    console.warn("❌ Не удалось получить paymentId");
                    setStatus("error");
                    return;
                }

                const statusUrl = `/payments/status/${paymentId}`;
                console.log("📤 Запрос статуса оплаты:", statusUrl);

                const statusRes = await api.get(statusUrl);
                const result = statusRes.data;
                console.log("📥 Ответ сервера:", result);

                setDebugInfo({ request: statusUrl, response: result });

                if (result.status === "succeeded" || result.paid === true) {
                    setStatus("succeeded");
                    setTimeout(() => navigate("/client"), 5000);
                } else {
                    setStatus("failed");
                }
            } catch (error) {
                console.error("❌ Ошибка при проверке статуса платежа:", error);
                setStatus("error");
            }
        };

        checkPaymentStatus();
    }, [navigate]);

    return (
        <div className="payment-success-page" style={{ maxWidth: 600, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
            {status === "loading" && <p>🔄 Проверяем статус платежа...</p>}

            {status === "succeeded" && (
                <>
                    <h2 style={{ color: "green" }}>✅ Оплата прошла успешно!</h2>
                    <p>Вы будете перенаправлены на главную через 5 секунд...</p>
                </>
            )}

            {status === "failed" && (
                <>
                    <h2 style={{ color: "orange" }}>⚠️ Платёж не завершён</h2>
                    <p>Платёж не был завершён. Пожалуйста, попробуйте снова или обратитесь в поддержку.</p>
                </>
            )}

            {status === "error" && (
                <>
                    <h2 style={{ color: "red" }}>❌ Ошибка</h2>
                    <p>Не удалось проверить статус оплаты. Обратитесь в поддержку.</p>
                </>
            )}
        </div>
    );
};

export default PaymentSuccessPage;
