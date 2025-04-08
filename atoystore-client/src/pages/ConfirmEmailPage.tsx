import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { confirmEmail } from "../services/authService";
import LoginModal from "../components/LoginModal";
import "../styles/AuthModal.css";

const ConfirmEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";
    const [message, setMessage] = useState("Подтверждение email...");
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isCurrentModalOpen, setIsCurrentModalOpen] = useState(true); 

    useEffect(() => {
        if (email && token) {
            confirmEmail({ email, token })
                .then(() => {
                    setMessage("Ваш email успешно подтверждён!");
                    setTimeout(() => {
                        setIsLoginOpen(true); 
                        setIsCurrentModalOpen(false); 
                    }, 500);
                })
                .catch(() => setMessage("Ошибка подтверждения email."));
        } else {
            setMessage("Некорректная ссылка.");
        }
    }, [email, token]);

    return (
        <>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onOpenRegister={() => {}} />
            
            {isCurrentModalOpen && (
                <div className="overlay">
                    <div className="modal">
                        <h2>Подтверждение Email</h2>
                        <p className={`message ${message.includes("Ошибка") ? "error" : "success"}`}>
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConfirmEmailPage;
