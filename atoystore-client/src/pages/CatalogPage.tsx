import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import "../styles/Catalog.css";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  images: string[];
  averageRating: number;
  reviewsCount: number;
}

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minQuantity, setMinQuantity] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);   // <-- состояние загрузки
  const [hasError, setHasError] = useState(false); // <-- состояние ошибки

  const loadCategories = async () => {
    try {
      const res = await api.get<{ items: Product[] }>("/products/filter", {
        params: {
          pageNumber: 1,
          pageSize: 9999,
        },
      });

      const unique = new Set(res.data.items.map((p) => p.category));
      setAllCategories(Array.from(unique));
    } catch (error) {
      // Ошибку не показываем пользователю, просто ставим флаг ошибки
      setHasError(true);
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const params = {
        query,
        category,
        minQuantity,
        minPrice,
        maxPrice,
        pageNumber: page,
        pageSize: 12,
      };

      const response = await api.get<{ items: Product[]; totalPages: number }>("/products/filter", { params });
      setProducts(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setHasError(true);
      console.error("Ошибка загрузки товаров:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, category, minQuantity, minPrice, maxPrice, page]);

  // Если загрузка идет — показываем спиннер/заглушку
  if (loading) return <div>Загрузка товаров...</div>;

  // Если ошибка — тоже показываем, что идет загрузка (требование), можно кастомно:
  if (hasError) return <div>Загрузка товаров...</div>;

  return (
    <div className="catalog-page">
      <h1>Каталог товаров</h1>

      {/* Фильтры */}
      <div className="filters">
        {/* ... твои инпуты и селекты ... */}
      </div>

      {/* Список товаров */}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Пагинация */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;
