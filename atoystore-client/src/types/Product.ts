export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  images: string[]; // ✅ изменено с { url: string }[] на string[]
  averageRating: number;
  reviewsCount: number;
}
