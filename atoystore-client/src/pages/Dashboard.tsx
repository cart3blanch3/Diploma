import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            <h1>Личный кабинет</h1>
            <p>Добро пожаловать!</p>
            <button onClick={handleLogout}>Выйти</button>
        </div>
    );
};

export default Dashboard;
