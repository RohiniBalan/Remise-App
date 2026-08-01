import { legacyProductClient } from './client';
import axios from 'axios';
// Ported 1:1 from client/app/category/[categoryId]/page.tsx and
// client/app/product/[productId]/page.tsx — both fetch the FULL product
// list from this one endpoint (no server-side filtering/detail endpoint is
// actually used by either web page) and do all filtering/lookup client-side.
// Mirrored here rather than "fixed" to use a real /:id endpoint, since the
// plan is behavioral parity with the web app as it actually behaves today.

const BASE = 'YOUR_API_BASE_URL'; 
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

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
  getAll: (params?: Record<string, string | number>) => axios.get(`${BASE}/api/products`, { params }),
  getById: (id: string) => axios.get(`${BASE}/api/products/${id}`),
  getByStore: (storeId: string, params?: Record<string, string | number>) => axios.get(`${BASE}/api/products/store/${storeId}`, { params }),
  getCategories: () => axios.get(`${BASE}/api/categories`),

  getGroupedSuppliers: (ownerRole: 'whole_saler' | 'home_business', params?: Record<string, string | number | undefined>) =>
    axios.get(`${BASE}/api/products/suppliers-grouped`, { params: { ...params, ownerRole } }),

  create: (formData: FormData, token: string) => axios.post(`${BASE}/api/products`, formData, { headers: auth(token) }),
  update: (id: string, formData: FormData, token: string) => axios.put(`${BASE}/api/products/${id}`, formData, { headers: auth(token) }),
  delete: (id: string, token: string) => axios.delete(`${BASE}/api/products/${id}`, { headers: auth(token) }),
  createCategory: (name: string, token: string) => axios.post(`${BASE}/api/categories`, { name }, { headers: auth(token) }),
  deleteCategory: (id: string, token: string) => axios.delete(`${BASE}/api/categories/${id}`, { headers: auth(token) }),
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
