// reviewService.ts
import api from "./api";
import { ProductReview } from "../types/ProductReview";

// Создание отзыва
export const createReview = async (data: {
    productId: string;
    userId: string;
    rating: number;
    comment: string;
}) => {
    const response = await api.post(`/productreviews`, {
        productId: data.productId,
        userId: data.userId, // 👈 передаём userId
        rating: data.rating,
        comment: data.comment
    });
    return response.data as ProductReview;
};


// Обновление отзыва
export const updateReview = async (reviewId: string, data: {
    rating: number;
    comment: string;
}) => {
    const response = await api.put(`/productreviews/${reviewId}`, {
        rating: data.rating,
        comment: data.comment
    });
    return response.data as ProductReview;
};

// Удаление отзыва
export const deleteReview = async (reviewId: string) => {
    await api.delete(`/productreviews/${reviewId}`);
};
