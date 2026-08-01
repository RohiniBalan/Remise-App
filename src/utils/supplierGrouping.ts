export type TitleGroup = {
  titleKey: string;
  title: string;
  image: string;
  category: string;
  brandCount: number;
  lowestPrice: number;
  brands: any[]; // one ProductGroup per brand (each with its own `suppliers` array)
};

// You already had `groupByTitle` imported from SupplierBrandListDrawer.tsx on
// web — if you have that file's source, copy its exact implementation here
// instead of this reconstruction, to guarantee identical grouping behavior.
export function groupByTitle(groups: any[]): TitleGroup[] {
  const byTitle: Record<string, TitleGroup> = {};
  for (const g of groups) {
    const key = (g.title || '').toLowerCase().trim().replace(/\s+/g, ' ');
    if (!byTitle[key]) {
      byTitle[key] = { titleKey: key, title: g.title, image: g.image, category: g.category, brandCount: 0, lowestPrice: Infinity, brands: [] };
    }
    byTitle[key].brands.push(g);
    byTitle[key].brandCount++;
    const min = Math.min(...g.suppliers.map((s: any) => s.price ?? Infinity));
    if (min < byTitle[key].lowestPrice) byTitle[key].lowestPrice = min;
  }
  return Object.values(byTitle);
}