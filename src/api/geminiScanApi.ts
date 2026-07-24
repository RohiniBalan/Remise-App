import { GOOGLE_AI_API_KEY } from './endpoints';

// Mobile-only equivalent of client/app/api/smart-product-upload/route.ts's
// "vision" path (VISION_PROMPT + Gemini/Claude, single request does OCR +
// translation + field extraction together) — see endpoints.ts's
// GOOGLE_AI_API_KEY comment for why this calls Gemini directly from the
// app instead of going through a backend. Skips the route's separate
// IndicTrans2 stage (mobile-unreachable, localhost-only) and its
// imageKeyword/auto-generated-image step (the store owner picks/keeps
// their own product photo on StoreProductFormScreen, same as manual entry).
const VISION_PROMPT = `This image contains a product label or product-related text. Extract and translate ALL text into English.
Do NOT describe the image, the paper, the ink color, or the handwriting — only extract product data.
The productName field must never be empty: use the main text/word shown, translated to English, even if no other product details (price, brand, etc.) are visible.
Reply ONLY with a raw JSON object — no markdown, no code fences:
{"productName":"<product name>","category":"<one of: Groceries, Dairy, Beverages, Snacks, Beauty & Skincare, Household, Electronics, Clothing, Vegetables, Fruits, Medicine, Stationery, General>","price":<MRP as number>,"discountedPrice":<sale price as number, same as price if not shown>,"validTill":"<YYYY-MM-DD or null>","description":"<2-3 sentence description of the PRODUCT ITSELF, not the image or paper, in English>","brand":"<brand name or empty string>"}`;

// Tried in order, same fallback idea as the web route trying multiple models.
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

export interface ScannedProduct {
  productName: string;
  category: string;
  price: number;
  discountedPrice: number;
  validTill: string;
  description: string;
  brand: string;
}

// Shared by every Gemini call in this file: POSTs a `parts` array, tries
// each model in turn (same fallback idea as the web routes trying multiple
// models), and returns the raw response text for the caller to parse as
// JSON. `callGeminiVision`/`callGeminiText` below just build the `parts`
// array differently (image+prompt vs. text-only prompt) on top of this.
async function callGemini(parts: any[]): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error("Scanning isn't set up yet — add a GOOGLE_AI_API_KEY in src/api/endpoints.ts.");
  }

  const body = JSON.stringify({ contents: [{ parts }] });

  let lastError: any;
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) {
        lastError = new Error(`Gemini (${model}) responded with ${res.status}.`);
        continue;
      }
      const json = await res.json();
      const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        lastError = new Error(`Gemini (${model}) returned no text.`);
        continue;
      }
      return text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Scan failed — could not reach Gemini.');
}

async function callGeminiVision(base64: string, mimeType: string, prompt: string): Promise<string> {
  return callGemini([{ inline_data: { mime_type: mimeType, data: base64 } }, { text: prompt }]);
}

async function callGeminiText(prompt: string): Promise<string> {
  return callGemini([{ text: prompt }]);
}

export async function scanProductImage(base64: string, mimeType: string): Promise<ScannedProduct> {
  const cleaned = await callGeminiVision(base64, mimeType, VISION_PROMPT);
  const parsed = JSON.parse(cleaned);
  return {
    productName: parsed.productName || '',
    category: parsed.category || 'General',
    price: Number(parsed.price) || 0,
    discountedPrice: Number(parsed.discountedPrice) || Number(parsed.price) || 0,
    validTill: parsed.validTill && parsed.validTill !== 'null' ? parsed.validTill : '',
    description: parsed.description || '',
    brand: parsed.brand || '',
  };
}

// Mobile-only equivalent of client/app/api/smart-bulk-scan/route.ts —
// same idea as scanProductImage above (single Gemini call does OCR +
// translation + structuring, skipping the route's separate IndicTrans2
// stage), but for a whole shopping list instead of one product.
const LIST_VISION_PROMPT = `This image shows a handwritten or printed shopping/purchase list. Read every line and translate all text into English.
Reply ONLY with a raw JSON array — no markdown, no code fences, no extra text:
[{"name":"<item name>","quantity":"<quantity with unit as written, e.g. \\"2 kg\\", or empty string if none>"}]
Skip lines that are headers, totals, dates, or purely numeric (e.g. "S.No", "Total", "Date:", page numbers). One array entry per actual item line.`;

export interface ScannedBulkItem {
  name: string;
  quantity: string;
}

export async function scanBulkList(base64: string, mimeType: string): Promise<ScannedBulkItem[]> {
  const cleaned = await callGeminiVision(base64, mimeType, LIST_VISION_PROMPT);
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Gemini returned an unexpected format.');
  return parsed
    .map((it: any) => ({ name: String(it?.name || '').trim(), quantity: String(it?.quantity || '').trim() }))
    .filter(it => it.name.length > 0);
}

// Bulk product scan for the Store Owner's "Scan Grocery List" flow — mobile
// equivalent of web's `smart-bulk-product-scan` route. One Gemini vision
// call both reads the list AND structures every line into the same field
// shape `scanProductImage` returns per item (Gemini already does this in
// one shot for scanBulkList's simpler {name, quantity} case above, so the
// richer per-item shape just extends that same prompt convention instead of
// doing a separate OCR-then-enrich round trip like the web route does).
const MAX_BULK_ITEMS = 25;

const BULK_PRODUCT_VISION_PROMPT = `This image shows a grocery list, invoice, or handwritten/printed list of product names. Read every line and translate all text into English.
Reply ONLY with a raw JSON array — no markdown, no code fences, no extra text — with at most ${MAX_BULK_ITEMS} entries:
[{"productName":"<product name>","category":"<one of: Groceries, Dairy, Beverages, Snacks, Beauty & Skincare, Household, Electronics, Clothing, Vegetables, Fruits, Medicine, Stationery, General>","price":<MRP as number, 0 if not shown>,"discountedPrice":<sale price as number, same as price if not shown>,"description":"<1-2 sentence plausible product description in English>","brand":"<brand name if implied, else empty string>"}]
Skip lines that are headers, totals, dates, or purely numeric (e.g. "S.No", "Total", "Date:", page numbers). One array entry per actual product line.`;

export async function scanBulkProducts(base64: string, mimeType: string): Promise<ScannedProduct[]> {
  const cleaned = await callGeminiVision(base64, mimeType, BULK_PRODUCT_VISION_PROMPT);
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Gemini returned an unexpected format.');
  return parsed
    .map((p: any): ScannedProduct => ({
      productName: String(p?.productName || '').trim(),
      category: String(p?.category || 'General').trim(),
      price: Number(p?.price) || 0,
      discountedPrice: Number(p?.discountedPrice) || Number(p?.price) || 0,
      validTill: '',
      description: String(p?.description || '').trim(),
      brand: String(p?.brand || '').trim(),
    }))
    .filter(p => p.productName.length > 0)
    .slice(0, MAX_BULK_ITEMS);
}

// ── Voice input (Store Owner speak-to-add-product + Customer speak-your-list) ─
// Mobile-only equivalent of web's `/api/voice-product-parse` and
// `/api/voice-purchase-list` routes. Web translates non-English transcripts
// via the shared IndicTrans2 service (`indicTranslate()` in
// `_lib/productScan.ts`) before asking Claude to parse them; mobile can't
// reach that service (see the module comment above), so both functions here
// ask Gemini to translate-then-extract in a single text-only call instead —
// one round trip, same "if not already English, translate first" idea.

const VOICE_LANG_NAMES: Record<string, string> = {
  en: 'English', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
};

function voiceLangClause(sourceLang: string): string {
  const name = VOICE_LANG_NAMES[sourceLang];
  return sourceLang && sourceLang !== 'en' && name ? ` in ${name}` : '';
}

export async function parseVoiceProduct(text: string, sourceLang: string): Promise<ScannedProduct & { totalStock: number }> {
  const prompt = `You are helping a store owner add a product by speaking it aloud. The following was transcribed from speech${voiceLangClause(sourceLang)}. If it isn't already in English, translate it to English first, then extract the product details.
Reply ONLY with a raw JSON object — no markdown, no code fences:
{"productName":"<product name>","category":"<one of: Groceries, Dairy, Beverages, Snacks, Beauty & Skincare, Household, Electronics, Clothing, Vegetables, Fruits, Medicine, Stationery, General>","price":<MRP as number, 0 if not mentioned>,"discountedPrice":<sale price as number, same as price if not mentioned>,"totalStock":<stock quantity as number, 0 if not mentioned>,"description":"<1-2 sentence plausible product description in English>","brand":"<brand name if mentioned, else empty string>"}

Transcribed text: "${text}"`;

  const cleaned = await callGeminiText(prompt);
  const parsed = JSON.parse(cleaned);
  return {
    productName: String(parsed.productName || '').trim(),
    category: String(parsed.category || 'General').trim(),
    price: Number(parsed.price) || 0,
    discountedPrice: Number(parsed.discountedPrice) || Number(parsed.price) || 0,
    totalStock: Number(parsed.totalStock) || 0,
    validTill: '',
    description: String(parsed.description || '').trim(),
    brand: String(parsed.brand || '').trim(),
  };
}

export interface VoiceListItem extends ScannedBulkItem { needsClarification: boolean }

export async function parseVoiceList(text: string, sourceLang: string): Promise<VoiceListItem[]> {
  const prompt = `You are helping a customer build a shopping list by speaking it aloud. The following was transcribed from speech${voiceLangClause(sourceLang)}. If it isn't already in English, translate it to English first, then extract every product mentioned.
Reply ONLY with a raw JSON array — no markdown, no code fences, no extra text:
[{"name":"<item name in English>","quantity":"<quantity with unit as mentioned, e.g. \\"2 kg\\", or empty string if none>","needsClarification":<true if this item's name or quantity is genuinely ambiguous/unclear from the sentence, otherwise false>}]
Split naturally on "and", commas, or other separators. Do not skip anything the customer said, even if unclear — flag it instead.

Transcribed text: "${text}"`;

  const cleaned = await callGeminiText(prompt);
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Gemini returned an unexpected format.');
  return parsed
    .map((it: any): VoiceListItem => ({
      name: String(it?.name || '').trim(),
      quantity: String(it?.quantity || '').trim(),
      needsClarification: !!it?.needsClarification,
    }))
    .filter(it => it.name.length > 0);
}

// Pure URL builder — mobile equivalent of web's Pollinations.ai FLUX tier in
// `getProductImage()` (client/app/api/_lib/productScan.ts). No fetch here:
// the URL is handed straight to <Image> for preview and to the backend as a
// plain `imageUrl` string on product creation, same as the web flow's
// `imageResultToUrl` for a 'url' result.
export function buildGeneratedImageUrl(productName: string, category: string, seedOffset: number = 0): string {
  const prompt = `product photo of ${productName}${category ? `, ${category}` : ''}, white background, studio lighting, e-commerce product shot`;
  const seed = Math.floor(Date.now() / 1000) + seedOffset;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&model=flux&nologo=true&seed=${seed}`;
}
