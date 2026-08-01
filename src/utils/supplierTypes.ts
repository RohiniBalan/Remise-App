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
  suppliers: GroupedSupplier[]; // pre-sorted ascending by price
}

export interface TitleGroup {
  titleKey: string;
  title: string;
  image: string | null;
  brandCount: number;
  lowestPrice: number;
  brands: ProductGroup[]; // sorted by lowestPrice ascending
}

// Exact port of SupplierCompareDrawer.tsx's tierFor
export function tierFor(supplier: GroupedSupplier, qty: number) {
  if (!supplier.bulkPricing?.length) return { price: supplier.price, label: null as string | null };
  const sorted = [...supplier.bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find(t => qty >= t.minQty);
  if (!match) return { price: supplier.price, label: null as string | null };
  return { price: match.price, label: `${match.minQty}+ units @ ₹${match.price}` };
}

// Exact port of SupplierBrandListDrawer.tsx's groupByTitle
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