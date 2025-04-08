import api from "./api";

export const getProducts = async () => {
    return await api.get("/products");
};

export const createProduct = async () => {
    return await api.post("/products");
};
