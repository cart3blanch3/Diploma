import axios from "axios";

const API_URL = "http://localhost:5062/api";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

const isValidTokenFormat = (token: string | null) => {
    return token && token.split(".").length === 3;
};

api.interceptors.request.use(
    async (config) => {
        const accessToken = sessionStorage.getItem("accessToken");

        if (!isValidTokenFormat(accessToken)) {
            console.error("Ошибка: accessToken отсутствует или некорректный!");
            return config;
        }

        console.log("Передаём токен в заголовке Authorization:", accessToken);
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                console.warn("⚠️ Токен истёк. Попытка обновления...");
                const refreshToken = sessionStorage.getItem("refreshToken");

                if (!refreshToken) {
                    console.error("Нет refresh-токена! Перенаправляем на авторизацию.");
                    throw new Error("Нет refresh-токена");
                }

                console.log("🔄 Попытка обновления токена с refreshToken:", refreshToken);

                const refreshResponse = await axios.post("http://localhost:5115/auth/refresh-token", {
                    refreshToken,
                });

                sessionStorage.setItem("accessToken", refreshResponse.data.accessToken);
                sessionStorage.setItem("refreshToken", refreshResponse.data.refreshToken);

                console.log("Токен обновлён, повторяем запрос...");
                error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
                return axios(error.config);
            } catch (refreshError) {
                console.error("Ошибка обновления токена:", refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
