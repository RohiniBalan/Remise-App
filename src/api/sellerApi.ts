import { gatewayClient } from './client';

// Ported from client/app/store/seller/page.tsx (web). Three groups of
// additions the seller dashboard needs beyond what storeApi/orderApi/
// productApi already expose:
//
//  1. sellerOrderApi — incoming orders FOR this seller's store (not the
//     store's own outgoing wholesale orders, which orderApi.getMyWholesaleOrders
//     already covers), plus the status-update action seller support staff use.
//  2. sellerStoreApi — resolving a buyer's store name from their user id.
//     Mirrors web's storeApi.getStoresByOwnerIds: POST /api/stores/by-owners
//     with { ownerIds } in the body (gateway-hosted).
//  3. sellerAiApi — the paper-scan / voice-parse endpoints. On web these are
//     Next.js API routes (client/app/api/voice-product-parse,
//     smart-product-upload, smart-bulk-product-scan) that wrap an
//     OCR/LLM call server-side, NOT existing gateway microservice routes.
//     ⚠️ Confirm these three exist on your actual backend before wiring
//     screens to them — if they don't, they need to be added there (moving
//     the OCR/LLM call off the Next.js app and onto the gateway), since a
//     mobile app has no Next.js API-route layer to fall back on.

export interface SellerOrder {
  _id: string;
  orderId: string;
  buyerId: string;
  buyerRole?: string;
  contactEmail?: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: string; // "PENDING" | "PAID" | "SUCCESS" | "FAILED"
  orderStatus: string; // "Processing" | "Shipped" | "Delivered" | "Cancelled"
  createdAt: string;
  vendorTransfers?: {
    storeId: string;
    storeName?: string;
    razorpayAccountId?: string;
    grossAmount: number;
    commissionAmount: number;
    vendorAmount: number;
    transferStatus: string;
    processedAt?: string;
    failureReason?: string;
  }[];
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    tierLabel?: string | null;
  }[];
}

export const sellerOrderApi = {
  // Incoming orders placed BY OTHER STORES against this seller's store.
  getStoreOrders: (storeId: string) =>
    gatewayClient.get<{ data: SellerOrder[] }>(`/api/orders/store/${storeId}`),

  updateOrderStatus: (orderId: string, status: string) =>
    gatewayClient.patch(`/api/orders/internal/${orderId}/status`, { status }),
};

export const sellerStoreApi = {
  getStoresByOwnerIds: (ownerIds: string[]) =>
    gatewayClient.post<{ data: { ownerId: string; name: string }[] }>(
      '/api/stores/by-owners',
      { ownerIds },
    ),
};

export interface ExtractedProductFields {
  productName?: string;
  category?: string;
  price?: number;
  discountedPrice?: number;
  storePrice?: number;
  storeDiscountedPrice?: number;
  description?: string;
  brand?: string;
  totalStock?: number;
  imageUrl?: string;
}

export const sellerAiApi = {
  // text: transcribed voice input, sourceLang: e.g. "en", "hi"
  parseVoiceProduct: (text: string, sourceLang: string) =>
    gatewayClient.post<{ success: boolean; message?: string; extracted: ExtractedProductFields }>(
      '/api/voice-product-parse',
      { text, sourceLang },
    ),

  // Single product paper/label scan
  scanSingleProduct: (formData: FormData) =>
    gatewayClient.post<{ success: boolean; message?: string; engine?: string; extracted: ExtractedProductFields }>(
      '/api/smart-product-upload',
      formData,
    ),

  // Multi-product list/invoice/catalog-sheet scan
  scanProductList: (formData: FormData) =>
    gatewayClient.post<{
      success: boolean;
      message?: string;
      products: ExtractedProductFields[];
      failed: { name: string; reason: string }[];
    }>('/api/smart-bulk-product-scan', formData),
};