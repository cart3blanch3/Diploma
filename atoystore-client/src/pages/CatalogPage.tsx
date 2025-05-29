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

  // Загрузка всех категорий (из всех товаров)
  const loadCategories = async () => {
    const res = await api.get<{ items: Product[] }>("/products/filter", {
      params: {
        pageNumber: 1,
        pageSize: 9999,
      },
    });

    const unique = new Set(res.data.items.map((p) => p.category));
    setAllCategories(Array.from(unique));
  };

  const fetchProducts = async () => {
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

      {/* Фильтры */}
      <div className="filters">
        <input
          type="text"
          maxLength={25}
          placeholder="Поиск по названию..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const val = e.target.value;
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
          maxLength={10}
          placeholder="Цена от"
          onChange={(e) => setMinPrice(Number(e.target.value))}
        />
        <input
          type="number"
          maxLength={10}
          placeholder="Цена до"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
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
