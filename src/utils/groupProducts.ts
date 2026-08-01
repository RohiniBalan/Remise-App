export type ProductTypeGroup = {
  typeKey: string;
  title: string;
  image: string;
  category: string;
  items: any[];
  brandCount: number;
  totalStock: number;
};

// Mirrors client/app/store/dashboard/page.tsx's groupProductsByType exactly —
// groups products by normalized title so multiple brands of the same
// product type ("Basmati Rice" from 3 different brands) collapse into one card.
export function groupProductsByType(products: any[]): ProductTypeGroup[] {
  const byTitle: Record<string, { title: string; image: string; category: string; items: any[] }> = {};

  for (const p of products) {
    const key = (p.title || '').toLowerCase().trim().replace(/\s+/g, ' ');
    if (!byTitle[key]) {
      byTitle[key] = {
        title: p.title,
        image: p.imageUrl || p.images?.[0] || '',
        category: p.category || '',
        items: [],
      };
    }
    byTitle[key].items.push(p);
  }

  return Object.values(byTitle).map(v => ({
    typeKey: v.title.toLowerCase().trim().replace(/\s+/g, ' '),
    title: v.title,
    image: v.image,
    category: v.category,
    items: v.items,
    brandCount: v.items.length,
    totalStock: v.items.reduce((s: number, p: any) => s + (p.totalStock || 0), 0),
  }));
}