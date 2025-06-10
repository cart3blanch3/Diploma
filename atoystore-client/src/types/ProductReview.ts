export interface ProductReview {
  id: string; // обязательное для редактирования/удаления
  userId?: string;
  fullName?: string; // <-- здесь
  rating: number;
  comment: string;
  createdAt: string;
}
