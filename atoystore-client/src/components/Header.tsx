import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import "../styles/Header.css";

const Header: React.FC = () => {
    const { isAuthenticated, role, logout } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (path: string) => () => navigate(path);

    return (
        <header className="header">
            <h1 className="logo" onClick={handleNavigate("/catalog")}>AToyStore</h1>

            <nav className="nav-links">
                {isAuthenticated ? (
                    <>
                        {role === "Admin" ? (
                            <>
                                <span onClick={handleNavigate("/admin/products")}>Товары</span>
                                <span onClick={handleNavigate("/admin/orders")}>Заказы</span>
                            </>
                        ) : (
                            <>
                                <span onClick={handleNavigate("/orders")}>Мои заказы</span>
                                <span onClick={handleNavigate("/profile")}>Профиль</span>
                                <span onClick={handleNavigate("/favorites")}>Избранное</span> {/* 👈 добавлено */}
                                <span onClick={handleNavigate("/checkout")}>Корзина</span>
                            </>
                        )}
                        <span className="logout-link" onClick={logout}>Выход</span>
                    </>
                ) : (
                    <span className="login-link" onClick={() => setIsLoginOpen(true)}>Вход</span>
                )}
            </nav>

            <LoginModal 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)}
                onOpenRegister={() => {
                    setIsLoginOpen(false);
                    setIsRegisterOpen(true);
                }}
            />
            <RegisterModal 
                isOpen={isRegisterOpen} 
                onClose={() => setIsRegisterOpen(false)}
                onOpenLogin={() => {
                    setIsRegisterOpen(false);
                    setIsLoginOpen(true);
                }}
            />
        </header>
    );
};

export default Header;
