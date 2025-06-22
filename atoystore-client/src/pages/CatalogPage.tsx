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

const BASE_URL = "https://atoystore.store";

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState<"any" | "available" | "preorder">("any");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

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
        minQuantity: availability === "available" ? 1 : availability === "preorder" ? 0 : null,
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

  const handleHover = (product: Product, direction: "left" | "right") => {
    if (!product || product.images.length <= 1) return;

    const currentIndex = currentImageIndexes[product.id] || 0;
    let newIndex = currentIndex;

    if (direction === "left" && currentIndex > 0) newIndex--;
    if (direction === "right" && currentIndex < product.images.length - 1) newIndex++;

    if (newIndex !== currentIndex) {
      setCurrentImageIndexes((prev) => ({ ...prev, [product.id]: newIndex }));
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, category, availability, minPrice, maxPrice, page]);

  if (loading) return <div className="loading">Загрузка товаров...</div>;
  if (hasError) return <div className="error">Ошибка загрузки товаров</div>;

  return (
    <div className="catalog-page">
      <h1>Каталог товаров</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value as "any" | "available" | "preorder")}
        >
          <option value="any">Все товары</option>
          <option value="available">В наличии</option>
          <option value="preorder">На заказ</option>
        </select>

        <div className="price-filter">
          <input
            type="number"
            placeholder="От"
            value={minPrice || ""}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
          />
          <input
            type="number"
            placeholder="До"
            value={maxPrice || ""}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => {
          const currentImgIndex = currentImageIndexes[product.id] || 0;
          const imgUrl = product.images?.[currentImgIndex]
            ? `${BASE_URL}${product.images[currentImgIndex]}`
            : "/placeholder.png";

          return (
            <div
              key={product.id}
              className="product-card"
              onMouseMove={(e) => {
                const box = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - box.left;
                const middle = box.width / 2;

                if (x < middle - 10) {
                  handleHover(product, "left");
                } else if (x > middle + 10) {
                  handleHover(product, "right");
                }
              }}
            >
              <div className="carousel-container">
                <img src={imgUrl} alt={product.title} className="product-image" />
                {product.images.length > 1 && (
                  <div className="dots">
                    {product.images.map((_, i) => (
                      <div key={i} className={`dot ${i === currentImgIndex ? "active" : ""}`} />
                    ))}
                  </div>
                )}
              </div>
              <ProductCard product={product} />
            </div>
          );
        })}
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