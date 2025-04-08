import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import ClientPage from "../pages/ClientPage";
import AdminPage from "../pages/AdminPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ConfirmEmailPage from "../pages/ConfirmEmailPage";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { role } = useAuth();
    return role === "Admin" ? <>{children}</> : <Navigate to="/client" />;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/client" element={<ProtectedRoute><ClientPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email" element={<ConfirmEmailPage />} />
            <Route path="/auth" element={<LoginModal isOpen={true} onClose={() => {}} onOpenRegister={() => {}} />} />
            <Route path="/register" element={<RegisterModal isOpen={true} onClose={() => {}} onOpenLogin={() => {}} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
