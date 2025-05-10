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
    fingerprint: string;
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

export interface RefreshTokenRequest {
    fingerprint: string;
}

export const confirmEmail = async (data: ConfirmEmailRequest) => {
    return await api.post("/confirm-email", data);
};

export const register = async (data: RegisterRequest) => {
    return await api.post("/register", data);
};

export const login = async (data: LoginRequest) => {
    console.log(data);
    const response = await api.post("/login", data, { withCredentials: true });
    console.log(response);
    if (response.data.Requires2FA) {
        return { Requires2FA: true };
    }

    sessionStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
};

export const verify2FA = async (
    email: string,
    code: string,
    fingerprint: string
) => {
    const response = await api.post(
        "/verify-2fa",
        { email, code, fingerprint },
        { withCredentials: true }
    );

    sessionStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
};

export const refreshAccessToken = async (
    fingerprint: string
): Promise<string | null> => {
    try {
        const response = await api.post(
            "/refresh-token",
            { fingerprint },
            { withCredentials: true }
        );
        const { accessToken } = response.data;
        sessionStorage.setItem("accessToken", accessToken);
        return accessToken;
    } catch (err) {
        sessionStorage.removeItem("accessToken");
        return null;
    }
};

export const forgotPassword = async (email: string) => {
    return await api.post("/forgot-password", { email });
};

export const resetPassword = async (data: ResetPasswordRequest) => {
    return await api.post("/reset-password", data);
};
