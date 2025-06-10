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
    const [price, setPrice] = useState(product ? product.price.toString() : "");
    const [category, setCategory] = useState(product?.category || "");
    const [quantity, setQuantity] = useState(product ? product.quantity.toString() : "");
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
            const filesArray = Array.from(e.target.files);
            // Фильтруем только изображения
            const imageFiles = filesArray.filter(file => file.type.startsWith("image/"));
            if (imageFiles.length !== filesArray.length) {
                alert("Разрешены только файлы изображений (jpeg, png, gif и т.д.)");
            }
            setImages(imageFiles);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !category.trim()) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        const numericPrice = Number(price);
        const numericQuantity = Number(quantity);

        if (
            isNaN(numericPrice) || isNaN(numericQuantity) ||
            numericPrice < 0 || numericQuantity < 0
        ) {
            alert("Цена и количество должны быть неотрицательными числами.");
            return;
        }

        const formData = new FormData();
        if (product?.id) {
            formData.append("id", product.id);
        }

        formData.append("title", title);
        formData.append("description", description);
        formData.append("price", numericPrice.toString());
        formData.append("category", category);
        formData.append("quantity", numericQuantity.toString());

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
                        type="text"
                        inputMode="numeric"
                        value={price}
                        onChange={e => {
                            const val = e.target.value;
                            if (/^\d{0,7}$/.test(val)) setPrice(val);
                        }}
                        placeholder="Введите цену"
                        maxLength={7}
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
                        type="text"
                        inputMode="numeric"
                        value={quantity}
                        onChange={e => {
                            const val = e.target.value;
                            if (/^\d{0,5}$/.test(val)) setQuantity(val);
                        }}
                        placeholder="Введите количество"
                        maxLength={5}
                        required
                    />
                </label>

                <label>
                    Загрузить изображения:
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                    />
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
