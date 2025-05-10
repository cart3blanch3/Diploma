import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import AppRoutes from "./routes/AppRoutes"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent: React.FC = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div>Загрузка...</div>; // Или спиннер, если хочешь
    }

    return (
        <>
            <Header />
            <AppRoutes />
        </>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            </Router>
        </AuthProvider>
    );
};

export default App;
