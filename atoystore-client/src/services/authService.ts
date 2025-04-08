import api from "./identityApi";

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    enableTwoFactor?: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export interface ConfirmEmailRequest {
    email: string;
    token: string;
}

export const confirmEmail = async (data: ConfirmEmailRequest) => {
    return await api.post("/confirm-email", data);
};

export const register = async (data: RegisterRequest) => {
    return await api.post("/register", data);
};

export const login = async (data: LoginRequest) => {
    const response = await api.post("/login", data);
    
    if (response.data.Requires2FA) {
        return { Requires2FA: true };
    }

    sessionStorage.setItem("accessToken", response.data.accessToken);
    sessionStorage.setItem("refreshToken", response.data.refreshToken);
    return response.data;
};

export const verify2FA = async (email: string, code: string) => {
    const response = await api.post("/verify-2fa", { email, code });

    sessionStorage.setItem("accessToken", response.data.accessToken);
    sessionStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
};

export const forgotPassword = async (email: string) => {
    return await api.post("/forgot-password", { email });
};

export const resetPassword = async (data: ResetPasswordRequest) => {
    return await api.post("/reset-password", data);
};

export {};
