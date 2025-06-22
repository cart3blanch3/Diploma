import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "../styles/AdminCatalogPage.css";
import "../styles/ProductCard.css";
import { Product } from "../types/Product";
import ProductModal from "../components/ProductModal";

const BASE_URL = "https://83.222.22.162:8001"

const AdminCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minQuantity, setMinQuantity] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const lastSwitchTimeRef = useRef<number>(Date.now());
  const lastPageSwitchRef = useRef<number>(0);

  const fetchProducts = async () => {
    const params = {
      query,
      category,
      minQuantity,
      pageNumber: page,
      pageSize: 12,
    };

    try {
      const res = await api.get("/products/filter", { params });
      console.log("📦 Полученные товары:", res.data); // ✅ логирование

      setProducts(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("❌ Ошибка при загрузке товаров:", error);
    }
  };

  const loadCategories = async () => {
    const res = await api.get<{ items: Product[] }>("/products/filter", {
      params: { pageNumber: 1, pageSize: 9999 },
    });

    const unique = new Set(res.data.items.map((p) => p.category));
    setAllCategories(Array.from(unique));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, category, minQuantity, page]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот товар?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Ошибка при удалении товара", error);
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleHover = (product: Product, direction: "left" | "right") => {
    if (!product || product.images.length <= 1) return;

    const now = Date.now();
    if (now - lastSwitchTimeRef.current < 300) return;
    lastSwitchTimeRef.current = now;

    const currentIndex = currentImageIndexes[product.id] || 0;
    let newIndex = currentIndex;

    if (direction === "left" && currentIndex > 0) newIndex--;
    if (direction === "right" && currentIndex < product.images.length - 1) newIndex++;

    if (newIndex !== currentIndex) {
      setCurrentImageIndexes((prev) => ({ ...prev, [product.id]: newIndex }));
    }
  };

  const changePage = (pageNumber: number) => {
    const now = Date.now();
    if (now - lastPageSwitchRef.current < 300) return; // не чаще чем раз в 300 мс
    lastPageSwitchRef.current = now;
    setPage(pageNumber);
  };

  return (
    <div className="admin-catalog-page">
      <h1>Управление каталогом</h1>

      <div className="admin-toolbar">
        <div className="toolbar-row">
          <button className="product-button" onClick={handleAdd}>Добавить товар</button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={query}
            maxLength={50} // ограничение длины ввода
            onChange={(e) => setQuery(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Все категории</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
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
        </div>
      </div>

      <div className="product-grid">
        {products.map((p, index) => {
          const currentImgIndex = currentImageIndexes[p.id] || 0;
          const imgUrl = p.images?.[currentImgIndex]
            ? `${BASE_URL}${p.images[currentImgIndex]}`
            : "/placeholder.png";

          return (
            <div
              key={p.id}
              className="product-card"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                const box = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - box.left;
                const middle = box.width / 2;

                if (x < middle - 10) {
                  handleHover(p, "left");
                } else if (x > middle + 10) {
                  handleHover(p, "right");
                }
              }}
            >
              <div className="carousel-container">
                <img
                  src={imgUrl}
                  alt={p.title}
                  className="product-image fade-in"
                />
                {hoveredIndex === index && p.images.length > 1 && (
                  <div className="dots">
                    {p.images.map((_, i) => (
                      <div key={i} className={`dot ${i === currentImgIndex ? "active" : ""}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-title">{p.title}</h3>
                <p className="product-price">{p.price} ₸</p>
                <p className="product-availability">
                  {p.quantity > 0 ? "В наличии" : "На заказ"}
                </p>
                <div className="product-actions">
                  <button className="details-button" onClick={() => handleEdit(p)}>Редактировать</button>
                  <button className="cart-button" onClick={() => handleDelete(p.id)}>Удалить</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => changePage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {modalOpen && (
        <ProductModal product={editingProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AdminCatalogPage;
