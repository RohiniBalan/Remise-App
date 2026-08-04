import { legacyProductClient } from './client';

// Ported from client/app/components-sections/ShopByCategorySection.tsx and
// BestSellersSection.tsx. Both hit dedicated endpoints on the same
// wow-lifebackend host productApi.ts/contentApi.ts already use — NOT the
// generic /api/products list. The mobile Home screen previously derived
// "categories" by de-duplicating the `category` field off the full product
// list, which doesn't match what web actually shows (real icons, cover
// images, item counts, descriptions, badges) and isn't how web fetches Best
// Sellers either (a curated list, not "first 8 products").

export interface CategoryItem {
  id: string;
  title: string;
  img: string;
  color: string; // web-only Tailwind gradient class, unused on mobile — see CATEGORY_TINTS
  accent: string; // web-only Tailwind text-color class, unused on mobile
  icon: string; // lucide icon name, see ICON_MAP in HomeScreen.tsx
  count: number;
  description: string;
  badge: string;
}

export interface BestSellerItem {
  id: string | number;
  name: string;
  img: string;
  color: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
}

// Identical to web's FALLBACK arrays (same ids/titles/images/copy) so mobile
// shows the exact same placeholder content when the endpoint is unreachable.
export const CATEGORY_FALLBACK: CategoryItem[] = [
  { id: 'groceries', title: 'Groceries & Fresh', img: 'https://images.unsplash.com/photo-1542838132-29423eda0ea4?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-green-400 to-emerald-600', accent: 'text-green-600', icon: 'ShoppingBasket', count: 120, description: 'Daily essentials & fresh produce', badge: 'Daily' },
  { id: 'beauty', title: 'Beauty & Cosmetics', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-pink-400 to-rose-600', accent: 'text-pink-500', icon: 'Heart', count: 85, description: 'Skincare, makeup & wellness', badge: 'Trending' },
  { id: 'toys', title: 'Toys & Games', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-yellow-400 to-orange-500', accent: 'text-orange-500', icon: 'Gamepad2', count: 74, description: 'Fun for kids of all ages', badge: 'Popular' },
  { id: 'fashion', title: 'Fashion & Apparel', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-purple-400 to-indigo-600', accent: 'text-purple-500', icon: 'Shirt', count: 96, description: 'Clothing, footwear & accessories', badge: 'New' },
  { id: 'home', title: 'Home & Living', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-teal-400 to-cyan-600', accent: 'text-teal-600', icon: 'Home', count: 58, description: 'Décor, kitchen & household items', badge: 'Top Pick' },
  { id: 'electronics', title: 'Electronics', img: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-blue-400 to-sky-600', accent: 'text-blue-500', icon: 'Smartphone', count: 43, description: 'Gadgets, accessories & more', badge: 'Hot' },
];

export const BEST_SELLER_FALLBACK: BestSellerItem[] = [
  { id: 1, name: 'Organic Face Moisturizer', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&auto=format&fit=crop&q=80', color: '#831843', price: 799, originalPrice: 1199, rating: 4.6, reviews: 312, badge: 'Best Seller' },
  { id: 2, name: 'Fresh Fruit Combo Pack', img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300&h=300&auto=format&fit=crop&q=80', color: '#14532d', price: 349, originalPrice: 499, rating: 4.4, reviews: 198, badge: 'Daily Deal' },
  { id: 3, name: 'Marvel Avengers Toy Set', img: 'https://images.unsplash.com/photo-1587654780291-39c59be1b31c?w=300&h=300&auto=format&fit=crop&q=80', color: '#7f1d1d', price: 1299, originalPrice: 1799, rating: 4.7, reviews: 213, badge: 'Top Rated' },
  { id: 4, name: 'Wireless Earbuds Pro', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80', color: '#1e3a8a', price: 1499, originalPrice: 2499, rating: 4.5, reviews: 521, badge: 'Hot' },
  { id: 5, name: 'Vitamin C Serum 30ml', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&auto=format&fit=crop&q=80', color: '#78350f', price: 599, originalPrice: 899, rating: 4.8, reviews: 447, badge: 'Sale' },
];

export const homeSectionsApi = {
  // NOTE: web calls these with plain fetch() against the hardcoded
  // wow-lifebackend host directly (not through its own axios api-services
  // wrapper) — legacyProductClient already points at that same host via
  // LEGACY_PRODUCT_URL, so this is the same request web makes.
  getShopByCategory: () => legacyProductClient.get('/shopbycategory'),
  getBestSellers: () => legacyProductClient.get('/bestsellers'),
};
