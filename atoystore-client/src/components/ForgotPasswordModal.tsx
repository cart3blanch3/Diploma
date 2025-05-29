import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { forgotPassword } from "../services/authService";
import "../styles/AuthModal.css";

Modal.setAppElement("#root");

const schema = yup.object().shape({
    email: yup
        .string()
        .email("Введите корректный email")
        .max(50, "Максимум 50 символов")
        .required("Поле обязательно"),
});

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
    const [message, setMessage] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setMessage("");
        try {
            await forgotPassword(data.email);
            setMessage("Ссылка для сброса пароля отправлена на email.");
            setCooldown(60);
        } catch (error) {
            setMessage("Ошибка отправки запроса.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
            <span className="close-icon" onClick={onClose}>&times;</span>
            <div className="modal-content">
                <h2>Восстановление пароля</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="email"
                        placeholder="Email"
                        maxLength={50}
                        {...register("email")}
                    />
                    {errors.email && <p className="error">{errors.email.message}</p>}

                    <button type="submit" disabled={cooldown > 0 || isSubmitting}>
                        {isSubmitting
                            ? "Отправка..."
                            : cooldown > 0
                                ? `Отправить повторно через ${cooldown}с`
                                : "Отправить код"}
                    </button>
                </form>
                {message && <p className="success-message">{message}</p>}
            </div>
        </Modal>
    );
};

export default ForgotPasswordModal;
