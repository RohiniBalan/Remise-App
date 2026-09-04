import { productApi, Product } from './productApi';

// Ported from web's ShopByCategorySection.tsx, BestSellersSection.tsx, and NewArrivalsSection.tsx.
// All fetch from the product-service via the gateway (same as the web),
// NOT the legacy wow-lifebackend.

export const NEW_ARRIVAL_WINDOW_DAYS = 14;

export interface CategoryItem {
  id: string;
  title: string;
  img: string;
  color: string;
  accent: string;
  icon: string;
  count: number;
  description: string;
  badge: string;
}

export interface BestSellerItem {
  id: string;
  name: string;
  img: string;
  category?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  soldCount?: number;
  badge?: string;
}

// ── Constants ported from web's ShopByCategorySection.tsx ──────────────────

const DEFAULT_STORE_CATEGORIES = [
  'Food & Beverages',
  'Grocery',
  'Fashion',
  'Electronics',
  'Pharmacy',
  'Toys',
  'Home & Living',
  'Beauty',
  'Sports',
  'Other',
];

// Category-name (lowercase substring) -> icon name, same as web
export const CATEGORY_ICON_RULES: [string, string][] = [
  ['grocery', 'ShoppingBasket'],
  ['food', 'ShoppingBasket'],
  ['beauty', 'Heart'],
  ['toy', 'Gamepad2'],
  ['fashion', 'Shirt'],
  ['household', 'Home'],
  ['home', 'Home'],
  ['electronic', 'Smartphone'],
  ['fruit', 'Apple'],
  ['vegetable', 'Carrot'],
  ['flower', 'Flower2'],
  ['pharmacy', 'Pill'],
  ['sport', 'Dumbbell'],
];

const COLOR_PALETTE: { color: string; accent: string }[] = [
  { color: 'from-green-400 to-emerald-600', accent: 'text-green-600' },
  { color: 'from-pink-400 to-rose-600', accent: 'text-pink-500' },
  { color: 'from-yellow-400 to-orange-500', accent: 'text-orange-500' },
  { color: 'from-purple-400 to-indigo-600', accent: 'text-purple-500' },
  { color: 'from-teal-400 to-cyan-600', accent: 'text-teal-600' },
  { color: 'from-blue-400 to-sky-600', accent: 'text-blue-500' },
  { color: 'from-red-400 to-rose-500', accent: 'text-red-500' },
  { color: 'from-amber-400 to-yellow-600', accent: 'text-amber-600' },
  { color: 'from-lime-400 to-green-600', accent: 'text-lime-600' },
  { color: 'from-fuchsia-400 to-purple-600', accent: 'text-fuchsia-600' },
];

export function iconForCategory(name: string): string {
  const lower = name.toLowerCase();
  const match = CATEGORY_ICON_RULES.find(([key]) => lower.includes(key));
  return match ? match[1] : 'Package';
}

export function badgeForCount(count: number): string {
  if (count === 0) return 'New';
  if (count >= 50) return 'Popular';
  if (count >= 15) return 'Trending';
  return 'Shop';
}

// Maps a raw product document from the product-service into a BestSellerItem
// — same logic as web's BestSellersSection.tsx mapProduct().
export function mapProduct(p: any): BestSellerItem {
  const img = p.images?.length > 0 ? p.images[0] : p.imageUrl;
  const hasDiscount = p.discountedPrice != null && p.discountedPrice < p.price;
  return {
    id: p._id || p.id,
    name: p.title,
    img,
    category: p.category,
    price: hasDiscount ? p.discountedPrice : p.price,
    originalPrice: hasDiscount ? p.price : undefined,
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    reviews: typeof p.reviews === 'number' ? p.reviews : undefined,
    soldCount: p.soldCount,
    badge: 'Best Seller',
  };
}

// ── Build category items from real data (same as web's ShopByCategorySection) ──

export async function buildCategoryItems(): Promise<CategoryItem[]> {
  const [catRes, prodRes] = await Promise.all([
    productApi.getCategoriesViaGateway(),
    productApi.getProductsViaGateway({ limit: 10000, ownerRole: 'store_owner' }),
  ]);

  const apiCategories: { _id: string; name: string }[] =
    catRes?.data?.success && Array.isArray(catRes.data.data) ? catRes.data.data : [];
  const products: any[] = Array.isArray(prodRes?.data?.data)
    ? prodRes.data.data
    : [];

  // Merge admin-added categories with the fixed default list — same approach
  // as the web — so a default with zero products still shows up.
  const seen = new Set<string>();
  const names: string[] = [];
  const addIfNew = (name: string) => {
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    names.push(name);
  };
  apiCategories.forEach(c => addIfNew(c.name));
  DEFAULT_STORE_CATEGORIES.forEach(addIfNew);
  products.forEach(p => addIfNew(p.category));

  const built: CategoryItem[] = names.map((name, i) => {
    const catProducts = products.filter(
      (p: any) => (p.category || '').toLowerCase() === name.toLowerCase(),
    );
    // Use a real photo from one of this category's own products.
    const withImage = catProducts.find(
      (p: any) => (p.images && p.images[0]) || p.imageUrl,
    );
    const img = withImage
      ? withImage.images?.[0] || withImage.imageUrl
      : '';
    const palette = COLOR_PALETTE[i % COLOR_PALETTE.length];

    return {
      id: name,
      title: name,
      img,
      color: palette.color,
      accent: palette.accent,
      icon: iconForCategory(name),
      count: catProducts.length,
      description: `${catProducts.length} product${catProducts.length === 1 ? '' : 's'} available`,
      badge: badgeForCount(catProducts.length),
    };
  });

  // Show the categories with the most real inventory first
  const sorted = [...built].sort((a, b) => b.count - a.count);
  return sorted.length > 0 ? sorted.slice(0, 6) : CATEGORY_FALLBACK;
}

// ── Fetch best sellers from product-service (same as web) ──

export async function fetchBestSellers(): Promise<BestSellerItem[]> {
  const res = await productApi.getProductsViaGateway({
    ownerRole: 'store_owner',
    sort: 'bestselling',
    limit: 5,
  });
  const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
  if (raw.length === 0) return BEST_SELLER_FALLBACK;
  return raw.map(mapProduct);
}

// ── Fetch new arrivals from product-service (same as web) ──
// Filters products created/updated within NEW_ARRIVAL_WINDOW_DAYS (14 days).

export async function fetchNewArrivals(): Promise<Product[]> {
  try {
    const res = await productApi.getProductsViaGateway({
      limit: 10000,
      ownerRole: 'store_owner',
    });
    const data = res.data;
    const products: Product[] = Array.isArray(data)
      ? data
      : data?.products || data?.data || [];

    const cutoff = Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return products
      .filter(p => {
        const created = new Date((p as any).createdAt || (p as any).updatedAt || 0).getTime();
        return created >= cutoff;
      })
      .sort(
        (a, b) =>
          new Date((b as any).createdAt || 0).getTime() -
          new Date((a as any).createdAt || 0).getTime(),
      );
  } catch (err) {
    console.error('Failed to fetch new arrivals:', err);
    return [];
  }
}

// ── Fallback data (same as web's FALLBACK arrays) ──

export const CATEGORY_FALLBACK: CategoryItem[] = [
  { id: 'groceries', title: 'Groceries & Fresh', img: 'https://images.unsplash.com/photo-1542838132-29423eda0ea4?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-green-400 to-emerald-600', accent: 'text-green-600', icon: 'ShoppingBasket', count: 120, description: 'Daily essentials & fresh produce', badge: 'Daily' },
  { id: 'beauty', title: 'Beauty & Cosmetics', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-pink-400 to-rose-600', accent: 'text-pink-500', icon: 'Heart', count: 85, description: 'Skincare, makeup & wellness', badge: 'Trending' },
  { id: 'toys', title: 'Toys & Games', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-yellow-400 to-orange-500', accent: 'text-orange-500', icon: 'Gamepad2', count: 74, description: 'Fun for kids of all ages', badge: 'Popular' },
  { id: 'fashion', title: 'Fashion & Apparel', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-purple-400 to-indigo-600', accent: 'text-purple-500', icon: 'Shirt', count: 96, description: 'Clothing, footwear & accessories', badge: 'New' },
  { id: 'home', title: 'Home & Living', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-teal-400 to-cyan-600', accent: 'text-teal-600', icon: 'Home', count: 58, description: 'Décor, kitchen & household items', badge: 'Top Pick' },
  { id: 'electronics', title: 'Electronics', img: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=400&h=300&auto=format&fit=crop&q=80', color: 'from-blue-400 to-sky-600', accent: 'text-blue-500', icon: 'Smartphone', count: 43, description: 'Gadgets, accessories & more', badge: 'Hot' },
];

export const BEST_SELLER_FALLBACK: BestSellerItem[] = [
  { id: '1', name: 'Organic Face Moisturizer', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=300&auto=format&fit=crop&q=80', price: 799, originalPrice: 1199, rating: 4.6, reviews: 312, badge: 'Best Seller' },
  { id: '2', name: 'Fresh Fruit Combo Pack', img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300&h=300&auto=format&fit=crop&q=80', price: 349, originalPrice: 499, rating: 4.4, reviews: 198, badge: 'Daily Deal' },
  { id: '3', name: 'Marvel Avengers Toy Set', img: 'https://images.unsplash.com/photo-1587654780291-39c59be1b31c?w=300&h=300&auto=format&fit=crop&q=80', price: 1299, originalPrice: 1799, rating: 4.7, reviews: 213, badge: 'Top Rated' },
  { id: '4', name: 'Wireless Earbuds Pro', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80', price: 1499, originalPrice: 2499, rating: 4.5, reviews: 521, badge: 'Hot' },
  { id: '5', name: 'Vitamin C Serum 30ml', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&auto=format&fit=crop&q=80', price: 599, originalPrice: 899, rating: 4.8, reviews: 447, badge: 'Sale' },
];

// Legacy API methods — kept for backward compatibility but no longer used
// by the HomeScreen (which now calls buildCategoryItems / fetchBestSellers).
export const homeSectionsApi = {
  getShopByCategory: () => productApi.getCategoriesViaGateway(),
  getBestSellers: () => productApi.getProductsViaGateway({ ownerRole: 'store_owner', sort: 'bestselling', limit: 5 }),
};
