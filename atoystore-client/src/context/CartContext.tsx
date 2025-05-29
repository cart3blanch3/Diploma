import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Product } from "../types/Product";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextProps {
  items: CartItem[];
  totalQuantity: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_COOKIE_KEY = "cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartInitialized, setIsCartInitialized] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get(CART_COOKIE_KEY);
    if (cookie) {
      try {
        setItems(JSON.parse(cookie));
      } catch {
        console.error("Не удалось распарсить cart cookie");
        setItems([]);
      }
    }
    setIsCartInitialized(true);
  }, []);

  useEffect(() => {
    if (isCartInitialized) {
      Cookies.set(CART_COOKIE_KEY, JSON.stringify(items), { expires: 7 });
    }
  }, [items, isCartInitialized]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        return prev.filter((i) => i.product.id !== productId);
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.product.id !== productId);
      }

      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
    });
  };

  const clearCart = () => setItems([]);

  const getQuantity = (productId: string) => {
    return items.find((i) => i.product.id === productId)?.quantity || 0;
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  if (!isCartInitialized) return null;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getQuantity,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
