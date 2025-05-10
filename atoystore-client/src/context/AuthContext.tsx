import React, { createContext,useState,useContext,useEffect,useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "../services/authService";
import { getDeviceFingerprint } from "../utils/fingerprint";

interface AuthContextProps {
    isAuthenticated: boolean;
    role: string | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const tryDecodeToken = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            setIsAuthenticated(true);
            setRole(decoded.role || "Client");
        } catch (error) {
            console.error("[Auth] Ошибка декодирования токена:", error);
            setIsAuthenticated(false);
            setRole(null);
        }
    };

    const initializeAuth = useCallback(async () => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            tryDecodeToken(token);
            setIsLoading(false);
            return;
        }

        // Обновление токена с учётом fingerprint
        const fingerprint = await getDeviceFingerprint();
        const newToken = await refreshAccessToken(fingerprint);
        if (newToken) {
            sessionStorage.setItem("accessToken", newToken);
            tryDecodeToken(newToken);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const login = (token: string) => {
        sessionStorage.setItem("accessToken", token);
        tryDecodeToken(token);
    };

    const logout = () => {
        sessionStorage.removeItem("accessToken");
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
