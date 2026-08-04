export interface GroupedSupplier {
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  moq: number;
  bulkPricing: { minQty: number; price: number }[];
  totalStock: number;
}

export interface ProductGroup {
  groupKey: string;
  title: string;
  brand: string;
  category: string;
  image: string | null;
  lowestPrice: number;
  supplierCount: number;
  suppliers: GroupedSupplier[];
}

export interface TitleGroup {
  titleKey: string;
  title: string;
  image: string | null;
  brandCount: number;
  lowestPrice: number;
  brands: ProductGroup[];
}

// Best matching bulk-price tier for a given quantity — ported 1:1 from
// SupplierCompareDrawer.tsx (web).
export function tierFor(supplier: GroupedSupplier, qty: number) {
  if (!supplier.bulkPricing?.length) return { price: supplier.price, label: null as string | null };
  const sorted = [...supplier.bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find(t => qty >= t.minQty);
  if (!match) return { price: supplier.price, label: null as string | null };
  return { price: match.price, label: `${match.minQty}+ units @ ₹${match.price}` };
}

// Client-side rollup by title (ignoring brand) — ported 1:1 from
// SupplierBrandListDrawer.tsx (web). Note: brands are sorted ascending by
// lowestPrice, and titleGroup.lowestPrice is the first (cheapest) brand's
// price — NOT a re-scan of every supplier's raw price. This matches web
// exactly; do not "simplify" back to a min-scan, it changes which brand
// shows first in the carousel.
export function groupByTitle(groups: ProductGroup[]): TitleGroup[] {
  const byTitle: Record<string, { title: string; image: string | null; brands: ProductGroup[] }> = {};
  for (const g of groups) {
    const key = (g.title || '').toLowerCase().trim().replace(/\s+/g, ' ');
    if (!byTitle[key]) byTitle[key] = { title: g.title, image: g.image, brands: [] };
    byTitle[key].brands.push(g);
  }
  return Object.entries(byTitle).map(([titleKey, v]) => {
    const sortedBrands = [...v.brands].sort((a, b) => a.lowestPrice - b.lowestPrice);
    return {
      titleKey,
      title: v.title,
      image: v.image,
      brandCount: sortedBrands.length,
      lowestPrice: sortedBrands[0]?.lowestPrice ?? 0,
      brands: sortedBrands,
    };
  });
}

export interface CartLine {
  productId: string;
  storeId: string;
  storeName: string;
  title: string;
  image: string | null;
  price: number;
  qty: number;
  moq: number;
  tierLabel: string | null;
}