import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Platform, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ported from web's WishlistContext.tsx — persists wishlist to AsyncStorage
// (web uses localStorage) and shows a toast notification on add/remove.

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  brand?: string;
  category?: string;
  totalStock?: number;
}

export interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const showToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }
    // iOS: custom animated toast
    setToastMessage(message);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  }, [toastOpacity]);

  // Hydrate from storage
  useEffect(() => {
    setIsMounted(true);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved)) setWishlist(saved);
        }
      } catch {}
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (isMounted) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some(item => item.id === productId),
    [wishlist],
  );

  const toggleWishlist = useCallback((product: any) => {
    const productId = product._id || product.id;
    setWishlist(prev => {
      if (prev.some(item => item.id === productId)) {
        showToast('Removed from wishlist');
        return prev.filter(item => item.id !== productId);
      }
      const img =
        product.images?.length > 0
          ? product.images[0]
          : product.imageUrl || product.image;
      showToast('Added to wishlist ❤️');
      return [
        ...prev,
        {
          id: productId,
          title: product.title || product.name,
          price: product.price,
          image: img,
          brand: product.brand,
          category: product.category,
          totalStock: product.totalStock,
        },
      ];
    });
  }, [showToast]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    showToast('Removed from wishlist');
  }, [showToast]);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{ wishlist, wishlistCount, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist }}>
      {children}
      {/* iOS toast overlay */}
      {toastVisible && Platform.OS === 'ios' && (
        <Animated.View style={[toastStyles.container, { opacity: toastOpacity }]} pointerEvents="none">
          <View style={toastStyles.pill}>
            <Text style={toastStyles.text}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
