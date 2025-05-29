import api from "./api";
import { CreateOrderDto, Order } from "../types/Order";

export const createOrder = async (order: CreateOrderDto) => {
    const response = await api.post("/orders", order);
    return response.data;
};

export const fetchOrders = async (): Promise<{ items: Order[] }> => {
    const response = await api.get("/orders");
    return response.data;
};

export const fetchOrderById = async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};
