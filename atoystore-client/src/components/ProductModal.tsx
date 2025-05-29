import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Product } from "../types/Product";
import "../styles/ProductModal.css";

interface Props {
    product: Product | null;
    onClose: () => void;
}

const ProductModal: React.FC<Props> = ({ product, onClose }) => {
    const [title, setTitle] = useState(product?.title || "");
    const [description, setDescription] = useState(product?.description || "");
    const [price, setPrice] = useState(product?.price || 0);
    const [category, setCategory] = useState(product?.category || "");
    const [quantity, setQuantity] = useState(product?.quantity ?? 0);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        const urls = images.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => {
            urls.forEach(URL.revokeObjectURL);
        };
    }, [images]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !category.trim()) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        const formData = new FormData();
        if (product?.id) {
            formData.append("id", product.id);
        }

        formData.append("title", title);
        formData.append("description", description);
        formData.append("price", price.toString());
        formData.append("category", category);
        formData.append("quantity", quantity.toString());

        images.forEach(file => {
            formData.append("images", file);
        });

        try {
            if (product) {
                await api.put(`/products/${product.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await api.post("/products", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении товара:", error);
            alert("Не удалось сохранить товар");
        }
    };

    return (
        <div className="product-modal-backdrop">
            <div className="product-modal">
                <h2>{product ? "Редактировать товар" : "Добавить товар"}</h2>

                <label>
                    Название:
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={100}
                        required
                    />
                </label>

                <label>
                    Описание:
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={500}
                        required
                    />
                </label>

                <label>
                    Цена (₸):
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(+e.target.value)}
                        required
                    />
                </label>

                <label>
                    Категория:
                    <input
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        maxLength={50}
                        required
                    />
                </label>

                <label>
                    Количество:
                    <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(+e.target.value)}
                    />
                </label>

                <label>
                    Загрузить изображения:
                    <input type="file" multiple onChange={handleImageChange} />
                </label>

                {previewUrls.length > 0 && (
                    <div className="image-preview">
                        {previewUrls.map((url, i) => (
                            <img key={i} src={url} alt={`preview-${i}`} className="preview-img" />
                        ))}
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={handleSubmit}>Сохранить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
