import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/Header.css";

const Header: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    return (
        <header className="header">
            <h1 className="logo">AToyStore</h1>
            <nav>
                {isAuthenticated ? (
                    <>
                        <span className="profile-link">Профиль</span>
                        <span className="logout-link" onClick={logout}>Выход</span>
                    </>
                ) : (
                    <span className="login-link" onClick={() => setIsLoginOpen(true)}>Вход</span>
                )}
            </nav>

            {/* ✅ Управляем открытием логина */}
            <LoginModal 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)}
                onOpenRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
            />
            <RegisterModal 
                isOpen={isRegisterOpen} 
                onClose={() => setIsRegisterOpen(false)}
                onOpenLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
            />
        </header>
    );
};

export default Header;
