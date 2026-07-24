import { legacyProductClient } from './client';

// Ported 1:1 from client/app/category/[categoryId]/page.tsx and
// client/app/product/[productId]/page.tsx — both fetch the FULL product
// list from this one endpoint (no server-side filtering/detail endpoint is
// actually used by either web page) and do all filtering/lookup client-side.
// Mirrored here rather than "fixed" to use a real /:id endpoint, since the
// plan is behavioral parity with the web app as it actually behaves today.

export interface Product {
  _id: string;
  id?: string;
  title: string;
  brand?: string;
  category?: string;
  type?: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  images?: string[];
  imageUrl?: string;
  totalStock: number;
  availability?: string;
  deliveryTime?: string;
  description?: string;
  aboutDescription?: string;
  aboutFeatures?: string[];
  idealFor?: string[];
  specifications?: Array<{ label: string; value: string }>;
}

export const productApi = {
  // Same cache-busted timestamp + no-store pattern as web (avoids a stale
  // CDN/browser cache serving one shop's product list to another session).
  getAll: () => legacyProductClient.get(`/admin/products?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }),
};

export function productImage(p: Product): string | undefined {
  return p.images && p.images.length > 0 ? p.images[0] : p.imageUrl;
}

export function productId(p: Product): string {
  return p._id || p.id || '';
}

export function discountPercent(p: Product): number {
  if (p.originalPrice && p.originalPrice > p.price) {
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }
  return 0;
}
