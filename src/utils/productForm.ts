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
  subcategory?: string;
  brand: string;
  totalStock: string;
  availability: string;
  tags: string;
}

export const AVAILABILITY_OPTIONS = ['In Stock', 'Out Of Stock', 'Pre Order'];

export function emptyProductForm(prefill?: Partial<ProductFormFields & { price: any; discountedPrice: any; totalStock: any; tags: any; subcategory?: any }>): ProductFormFields {
  return {
    title: prefill?.title || '',
    description: prefill?.description || '',
    price: String(prefill?.price ?? ''),
    discountedPrice: String(prefill?.discountedPrice ?? ''),
    category: prefill?.category || '',
    subcategory: prefill?.subcategory || '',
    brand: prefill?.brand || '',
    totalStock: String(prefill?.totalStock ?? ''),
    availability: prefill?.availability || 'In Stock',
    tags: Array.isArray(prefill?.tags) ? prefill!.tags.join(', ') : (prefill?.tags || ''),
  };
}

const FIELD_KEYS: (keyof ProductFormFields)[] = [
  'title', 'description', 'price', 'discountedPrice',
  'category', 'subcategory', 'brand', 'totalStock', 'availability', 'tags',
];

export function buildProductFormData(
  form: ProductFormFields,
  storeId: string,
  opts: {
    imageUri?: string | null;
    imageUrl?: string;
    attributes?: Record<string, any>;
    specifications?: any[];
  } = {},
): FormData {
  const fd = new FormData();
  FIELD_KEYS.forEach(k => {
    const v = form[k];
    if (v !== undefined && v !== '') fd.append(k, String(v));
  });
  if (opts.imageUrl) fd.append('imageUrl', opts.imageUrl);
  if (opts.attributes) fd.append('attributes', JSON.stringify(opts.attributes));
  if (opts.specifications) fd.append('specifications', JSON.stringify(opts.specifications));
  fd.append('storeId', storeId);
  if (opts.imageUri) fd.append('image', { uri: opts.imageUri, name: 'product.jpg', type: 'image/jpeg' } as any);
  return fd;
}
