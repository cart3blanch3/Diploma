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

  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

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

      const res = await api.get<{ items: Product[]; totalPages: number }>("/products/filter", { params });
      setProducts(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      setHasError(true);
      console.error("Ошибка загрузки товаров:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get<{ items: Product[] }>("/products/filter", {
        params: { pageNumber: 1, pageSize: 9999 },
      });
      const unique = new Set(res.data.items.map((p) => p.category));
      setAllCategories(Array.from(unique));
    } catch (error) {
      setHasError(true);
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, category, minQuantity, minPrice, maxPrice, page]);

  return (
    <div className="catalog-page">
      <h1>Каталог товаров</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={query}
          maxLength={50}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
        />

        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">Все категории</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const val = e.target.value;
            setPage(1);
            if (val === "any") setMinQuantity(null);
            else if (val === "available") setMinQuantity(1);
            else if (val === "preorder") setMinQuantity(0);
          }}
        >
          <option value="any">Все</option>
          <option value="available">В наличии</option>
          <option value="preorder">На заказ</option>
        </select>

        <input
          type="number"
          placeholder="Мин. цена"
          value={minPrice ?? ""}
          onChange={(e) => {
            setPage(1);
            setMinPrice(e.target.value ? parseFloat(e.target.value) : null);
          }}
        />

        <input
          type="number"
          placeholder="Макс. цена"
          value={maxPrice ?? ""}
          onChange={(e) => {
            setPage(1);
            setMaxPrice(e.target.value ? parseFloat(e.target.value) : null);
          }}
        />
      </div>

      {hasError && <div className="error-message">Ошибка загрузки товаров. Попробуйте позже.</div>}

      <div className="product-grid-wrapper">
        {loading && <div className="overlay-loading">Загрузка...</div>}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

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
