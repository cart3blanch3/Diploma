import axios from "axios";
import { getDeviceFingerprint } from "../utils/fingerprint";

const API_URL = "http://localhost:5062/api";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Обязательно для отправки HttpOnly cookie
});

const isValidTokenFormat = (token: string | null) => {
    return token && token.split(".").length === 3;
};

// === Interceptor for adding accessToken to headers ===
api.interceptors.request.use(
    async (config) => {
        const accessToken = sessionStorage.getItem("accessToken");

        if (!isValidTokenFormat(accessToken)) {
            console.warn("⚠️ accessToken отсутствует или некорректный!");
            return config;
        }

        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// === Interceptor for refreshing token on 401 ===
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const fingerprint = await getDeviceFingerprint();

                console.warn("🔁 Токен истёк. Отправляем запрос на /refresh-token...");

                const refreshResponse = await axios.post(
                    "http://localhost:5115/auth/refresh-token",
                    { fingerprint },
                    {
                        withCredentials: true,
                        headers: { "Content-Type": "application/json" },
                    }
                );

                const newAccessToken = refreshResponse.data.accessToken;
                sessionStorage.setItem("accessToken", newAccessToken);

                console.info("✅ Токен успешно обновлён. Повтор запроса...");

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                console.error("❌ Ошибка при обновлении токена:", refreshError);
                sessionStorage.removeItem("accessToken");
                window.location.href = "/auth"; // Перенаправление на страницу входа
            }
        }

        return Promise.reject(error);
    }
);

export default api;
