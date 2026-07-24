// Shared by StoreProductFormScreen (single manual/scan form) and
// StoreBulkProductScanScreen (one card per bulk-scanned item) — same field
// set ported from client/app/store/dashboard/page.tsx's ProductModal
// (title*/description/price*/discountedPrice/category/brand/totalStock/
// availability/tags), plus the FormData-building logic that used to live
// only in StoreProductFormScreen's handleSubmit.
export interface ProductFormFields {
  title: string;
  description: string;
  price: string;
  discountedPrice: string;
  category: string;
  brand: string;
  totalStock: string;
  availability: string;
  tags: string;
}

export const AVAILABILITY_OPTIONS = ['In Stock', 'Out Of Stock', 'Pre Order'];

export function emptyProductForm(prefill?: Partial<ProductFormFields & { price: any; discountedPrice: any; totalStock: any; tags: any }>): ProductFormFields {
  return {
    title: prefill?.title || '',
    description: prefill?.description || '',
    price: String(prefill?.price ?? ''),
    discountedPrice: String(prefill?.discountedPrice ?? ''),
    category: prefill?.category || '',
    brand: prefill?.brand || '',
    totalStock: String(prefill?.totalStock ?? ''),
    availability: prefill?.availability || 'In Stock',
    tags: Array.isArray(prefill?.tags) ? prefill!.tags.join(', ') : (prefill?.tags || ''),
  };
}

// Iterated explicitly (not `Object.entries(form)`) so callers can safely
// pass a superset object — e.g. StoreBulkProductScanScreen's BulkProductRow,
// which carries an extra `id` and `imageUrl` on top of these fields — without
// those extra properties leaking into the FormData (an `id` field ends up
// cast against Mongoose's `_id`, and a `row.imageUrl` alongside `opts.imageUrl`
// would double-append the field into a two-element array server-side).
const FIELD_KEYS: (keyof ProductFormFields)[] = [
  'title', 'description', 'price', 'discountedPrice',
  'category', 'brand', 'totalStock', 'availability', 'tags',
];

export function buildProductFormData(
  form: ProductFormFields,
  storeId: string,
  opts: { imageUri?: string | null; imageUrl?: string } = {},
): FormData {
  const fd = new FormData();
  FIELD_KEYS.forEach(k => { const v = form[k]; if (v !== '') fd.append(k, String(v)); });
  if (opts.imageUrl) fd.append('imageUrl', opts.imageUrl);
  fd.append('storeId', storeId);
  if (opts.imageUri) fd.append('image', { uri: opts.imageUri, name: 'product.jpg', type: 'image/jpeg' } as any);
  return fd;
}
