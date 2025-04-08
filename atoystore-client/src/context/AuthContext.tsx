import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextProps {
    isAuthenticated: boolean;
    role: string | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!sessionStorage.getItem("accessToken"));
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                console.log("[Auth] Декодированный токен:", decoded);
                setIsAuthenticated(true);
                setRole(decoded.role || "Client");
            } catch (error) {
                console.error("[Auth] Ошибка декодирования токена:", error);
                setRole(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        sessionStorage.setItem("accessToken", token);
        setIsAuthenticated(true);

        try {
            const decoded: any = jwtDecode(token);
            setRole(decoded.role || "Client");
        } catch (error) {
            console.error("[Auth] Ошибка декодирования токена:", error);
            setRole(null);
        }
    };

    const logout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
