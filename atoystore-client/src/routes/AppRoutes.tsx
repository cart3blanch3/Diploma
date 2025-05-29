import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ConfirmEmailPage from "../pages/ConfirmEmailPage";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import CatalogPage from "../pages/CatalogPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import OrdersPage from "../pages/OrdersPage";
import CheckoutPage from "../pages/CheckoutPage";
import AdminCatalogPage from "../pages/AdminCatalogPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import ProfilePage from "../pages/ProfilePage";
import FavoritesPage from "../pages/FavoritesPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { role } = useAuth();
    return role === "Admin" ? <>{children}</> : <Navigate to="/client" />;
};

const AppRoutes: React.FC = () => {
    const { role } = useAuth();

    return (
        <Routes>
            {/* Главная страница: если админ — на admin/products, иначе — на catalog */}
            <Route
                path="/"
                element={
                    role === "Admin" ? (
                        <Navigate to="/admin/products" replace />
                    ) : (
                        <Navigate to="/catalog" replace />
                    )
                }
            />

            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />

            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

            <Route path="/admin/products" element={<AdminRoute><AdminCatalogPage /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />

            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email" element={<ConfirmEmailPage />} />
            <Route path="/auth" element={<LoginModal isOpen={true} onClose={() => {}} onOpenRegister={() => {}} />} />
            <Route path="/register" element={<RegisterModal isOpen={true} onClose={() => {}} onOpenLogin={() => {}} />} />

            {/* Все несуществующие маршруты тоже ведут в нужное место */}
            <Route
                path="*"
                element={
                    role === "Admin" ? (
                        <Navigate to="/admin/products" replace />
                    ) : (
                        <Navigate to="/catalog" replace />
                    )
                }
            />
        </Routes>
    );
};

export default AppRoutes;
