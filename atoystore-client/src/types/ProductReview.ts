export interface ProductReview {
    id: string; // ✅ обязательное поле для редактирования/удаления
    userId?: string;
    userName?: string;
    rating: number;
    comment: string;
    createdAt: string;
}
