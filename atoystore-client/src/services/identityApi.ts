import axios from "axios";

const API_URL = process.env.REACT_APP_AUTH_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

api.interceptors.request.use(async (config) => {
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
