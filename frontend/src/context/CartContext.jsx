import { createContext, useContext, useEffect, useState } from "react";
const CartContext = createContext(undefined);
const CART_STORAGE_KEY = "fc_cart";
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function CartProvider({
  children
}) {
  const [items, setItems] = useState(loadCart);
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  const addItem = (product, quantity = 1) => {
    if (items.length > 0 && items[0].farmerId !== product.farmerId) {
      return {
        ok: false,
        message: `Your cart has items from ${items[0].farmName}. Clear it first to order from ${product.farmName}.`
      };
    }
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? {
          ...i,
          quantity: Math.min(i.quantity + quantity, product.quantityAvailable)
        } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        pricePerUnit: product.pricePerUnit,
        unit: product.unit,
        imageUrl: product.imageUrl,
        quantityAvailable: product.quantityAvailable,
        quantity: Math.min(quantity, product.quantityAvailable),
        farmerId: product.farmerId,
        farmName: product.farmName
      }];
    });
    return {
      ok: true
    };
  };
  const updateQuantity = (productId, quantity) => {
    setItems(prev => quantity <= 0 ? prev.filter(i => i.productId !== productId) : prev.map(i => i.productId === productId ? {
      ...i,
      quantity: Math.min(quantity, i.quantityAvailable)
    } : i));
  };
  const removeItem = productId => setItems(prev => prev.filter(i => i.productId !== productId));
  const clearCart = () => setItems([]);
  const totalAmount = items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  return <CartContext.Provider value={{
    items,
    farmerId: items[0]?.farmerId ?? null,
    farmName: items[0]?.farmName ?? null,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalItems
  }}>
      {children}
    </CartContext.Provider>;
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}