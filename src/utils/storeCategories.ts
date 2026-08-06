// mobile/utils/storeCategories.ts

// Same list as STORE_CATEGORIES in StoreSettingsScreen/SellerSettingsScreen —
// kept here as the single source of truth so all category UIs (Categories
// tab, Products filter, product category picker) stay consistent.
export const DEFAULT_STORE_CATEGORIES = [
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

export type MergedCategory = {
  _id: string;
  name: string;
  isDefault: boolean;
};

// Merges the store's custom (backend-saved) categories with the built-in
// defaults, de-duplicated by name (case-insensitive) — custom entries win
// if a name collides, since they carry a real _id used for deletion.
export function mergeCategories(customCategories: { _id: string; name: string }[]): MergedCategory[] {
  const customNames = new Set(customCategories.map(c => c.name.toLowerCase()));

  const defaults: MergedCategory[] = DEFAULT_STORE_CATEGORIES
    .filter(name => !customNames.has(name.toLowerCase()))
    .map(name => ({ _id: `default-${name}`, name, isDefault: true }));

  const custom: MergedCategory[] = customCategories.map(c => ({
    _id: c._id,
    name: c.name,
    isDefault: false,
  }));

  return [...custom, ...defaults];
}