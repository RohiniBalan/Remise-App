import React, { createContext, useContext, useState } from 'react';
import { GroupedSupplier, ProductGroup } from '../utils/supplierTypes';

export type SupplierCartLine = {
  productId: string;
  storeId: string;
  storeName: string;
  title: string;
  image: string | null;
  price: number;
  qty: number;
  moq: number;
  tierLabel: string | null;
};

type Ctx = {
  cart: Record<string, SupplierCartLine>;
  addToCart: (supplier: GroupedSupplier, qty: number, price: number, tierLabel: string | null, group: ProductGroup) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const SupplierCartContext = createContext<Ctx | undefined>(undefined);

export function SupplierCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, SupplierCartLine>>({});

  // Same shape as web's SuppliersTab.handleAddToCart
  const addToCart = (supplier: GroupedSupplier, qty: number, price: number, tierLabel: string | null, group: ProductGroup) => {
    setCart(c => ({
      ...c,
      [supplier.productId]: {
        productId: supplier.productId,
        storeId: supplier.storeId,
        storeName: supplier.storeName,
        title: group.title,
        image: group.image,
        price,
        qty,
        moq: supplier.moq,
        tierLabel,
      },
    }));
  };

  const clearCart = () => setCart({});
  const lines = Object.values(cart);
  return (
    <SupplierCartContext.Provider value={{ cart, addToCart, clearCart, cartCount: lines.length, cartTotal: lines.reduce((s, i) => s + i.price * i.qty, 0) }}>
      {children}
    </SupplierCartContext.Provider>
  );
}

export function useSupplierCart() {
  const ctx = useContext(SupplierCartContext);
  if (!ctx) throw new Error('useSupplierCart must be used within SupplierCartProvider');
  return ctx;
}