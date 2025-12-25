import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, FoodItem, FoodOption, Cart } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  cart: Cart;
  addToCart: (item: FoodItem, quantity?: number, options?: FoodOption[], instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.05; // 5% GST
const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

const COUPONS: Record<string, number> = {
  'WELCOME10': 10,
  'SAVE20': 20,
  'FESTIVE15': 15,
};

import { useRestaurant } from './RestaurantContext';

const BASE_STORAGE_KEY = 'cafe_resto_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { restaurant } = useRestaurant();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Dynamic storage key based on tenant
  const storageKey = restaurant?.id ? `${BASE_STORAGE_KEY}_${restaurant.id}` : null;

  useEffect(() => {
    if (!storageKey) {
      setItems([]);
      setCouponCode(undefined);
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
        setCouponCode(parsed.couponCode);
      } catch (e) {
        localStorage.removeItem(storageKey);
        setItems([]); // Reset on error
      }
    } else {
      setItems([]); // Reset if nothing stored
      setCouponCode(undefined);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ items, couponCode }));
    }
  }, [items, couponCode, storageKey]);

  const calculateCart = (): Cart => {
    const subtotal = items.reduce((sum, item) => {
      const optionsPrice = item.selectedOptions?.reduce((o, opt) => o + opt.price, 0) || 0;
      return sum + (item.foodItem.price + optionsPrice) * item.quantity;
    }, 0);

    const tax = subtotal * TAX_RATE;
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const discountPercent = couponCode ? COUPONS[couponCode] || 0 : 0;
    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal + tax + deliveryCharge - discount;

    return {
      items,
      subtotal,
      tax,
      deliveryCharge,
      discount,
      total,
      couponCode,
    };
  };

  const addToCart = (item: FoodItem, quantity = 1, options?: FoodOption[], instructions?: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.foodItem.id === item.id &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(options)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, {
        id: `${item.id}_${Date.now()}`,
        foodItem: item,
        quantity,
        selectedOptions: options,
        specialInstructions: instructions,
      }];
    });

    toast({
      title: "Added to cart",
      description: `${item.name} x${quantity}`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    toast({
      title: "Removed from cart",
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(undefined);
  };

  const applyCoupon = (code: string): boolean => {
    const upperCode = code.toUpperCase();
    if (COUPONS[upperCode]) {
      setCouponCode(upperCode);
      toast({
        title: "Coupon applied!",
        description: `${COUPONS[upperCode]}% discount added`,
      });
      return true;
    }
    toast({
      title: "Invalid coupon",
      description: "This coupon code is not valid",
      variant: "destructive",
    });
    return false;
  };

  const removeCoupon = () => {
    setCouponCode(undefined);
    toast({
      title: "Coupon removed",
    });
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart: calculateCart(),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      itemCount,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
