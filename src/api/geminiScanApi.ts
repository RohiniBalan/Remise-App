import { GOOGLE_AI_API_KEYS, GOOGLE_AI_API_KEY } from './endpoints';

// Mobile-only equivalent of client/app/api/smart-product-upload/route.ts's
// "vision" path (VISION_PROMPT + Gemini/Claude, single request does OCR +
// translation + field extraction together) — see endpoints.ts's
// GOOGLE_AI_API_KEY comment for why this calls Gemini directly from the
// app instead of going through a backend. Skips the route's separate
// IndicTrans2 stage (mobile-unreachable, localhost-only) and its
// imageKeyword/auto-generated-image step (the store owner picks/keeps
// their own product photo on StoreProductFormScreen, same as manual entry).
const VISION_PROMPT = `This image contains comprehensive product details (such as About & Details, Specifications, Highlights, Features, Pricing, Brand, Model). Extract and translate ALL text into English.
Do NOT describe the image, the paper, the ink color, or the handwriting — extract all structured product data, specifications, features, and highlights.
The productName field must never be empty.
Reply ONLY with a raw JSON object — no markdown, no code fences:
{"productName":"<product name>","category":"<one of: Groceries, Dairy, Beverages, Snacks, Beauty & Skincare, Household, Electronics, Clothing, Vegetables, Fruits, Medicine, Stationery, General>","subcategory":"<appropriate subcategory or empty string>","price":<MRP as number, 0 if not shown>,"discountedPrice":<sale price as number, same as price if not shown>,"validTill":"<YYYY-MM-DD or null>","description":"<2-4 sentence rich overview of the product in English>","aboutDescription":"<description paragraph or empty string>","aboutFeatures":["<feature bullet 1>","<feature bullet 2>"],"brand":"<brand name or empty string>","attributes":{"<key>":"<value>"},"specifications":[{"label":"<spec label>","value":"<spec value>"}],"idealFor":["<highlight/suitable for bullet 1>","<highlight/suitable for bullet 2>"]}`;

// Tried in order, same fallback idea as the web route trying multiple models.
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-lite',
];

export interface ScannedProduct {
  productName: string;
  category: string;
  subcategory?: string;
  price: number;
  discountedPrice: number;
  validTill: string;
  description: string;
  aboutDescription?: string;
  aboutFeatures?: string[];
  attributes?: Record<string, any>;
  specifications?: Array<{ label: string; value: string }>;
  idealFor?: string[];
  brand: string;
}

function isQuotaOrKeyError(status: number, errorText: string): boolean {
  if (status === 429 || status === 401 || status === 403) return true;
  const lower = (errorText || '').toLowerCase();
  return (
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('exceeded') ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('permission_denied') ||
    lower.includes('billing_disabled') ||
    lower.includes('consumer_invalid') ||
    lower.includes('consumer_suspended')
  );
}

// Shared by every Gemini call in this file: POSTs a `parts` array, tries
// each configured API key in turn (with automatic fallback on 429/quota/auth errors)
// and each model in turn, returning the raw response text for the caller to parse as JSON.
async function callGemini(parts: any[]): Promise<string> {
  const keys = GOOGLE_AI_API_KEYS.length > 0 ? GOOGLE_AI_API_KEYS : (GOOGLE_AI_API_KEY ? [GOOGLE_AI_API_KEY] : []);
  if (keys.length === 0) {
    throw new Error(
      "Scanning isn't set up yet — add GEMINI_API_KEY_1..N or GOOGLE_AI_API_KEY to your .env file, then rebuild the app."
    );
  }

  const body = JSON.stringify({ contents: [{ parts }] });

  let lastError: any;

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const currentKey = keys[keyIdx];
    let shouldSkipToNextKey = false;

    for (const model of MODELS) {
      if (shouldSkipToNextKey) break;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }
        );

        if (res.status === 429) {
          console.warn(`[GeminiScanApi] Key #${keyIdx + 1} hit 429 quota/rate limit on ${model}. Switching to next key...`);
          lastError = new Error(`Key #${keyIdx + 1} 429 Rate Limit / Quota Exceeded`);
          shouldSkipToNextKey = true;
          break;
        }

        if (res.status === 401 || res.status === 403) {
          console.warn(`[GeminiScanApi] Key #${keyIdx + 1} hit ${res.status} auth error on ${model}. Skipping this key...`);
          lastError = new Error(`Key #${keyIdx + 1} Auth Error (${res.status})`);
          shouldSkipToNextKey = true;
          break;
        }

        if (!res.ok) {
          const rawErr = await res.text().catch(() => '');
          if (isQuotaOrKeyError(res.status, rawErr)) {
            console.warn(`[GeminiScanApi] Key #${keyIdx + 1} failed with quota/auth error (${res.status}). Switching to next key...`);
            lastError = new Error(`Key #${keyIdx + 1} Quota Error (${res.status})`);
            shouldSkipToNextKey = true;
            break;
          }
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
  }

  throw lastError instanceof Error ? lastError : new Error(`Scan failed — all ${keys.length} Gemini API keys failed.`);
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

  const specifications: Array<{ label: string; value: string }> = Array.isArray(parsed.specifications)
    ? parsed.specifications.filter((s: any) => s && s.label && s.value).map((s: any) => ({ label: String(s.label).trim(), value: String(s.value).trim() }))
    : [];

  const attributes: Record<string, any> = (parsed.attributes && typeof parsed.attributes === 'object') ? parsed.attributes : {};
  for (const spec of specifications) {
    if (!attributes[spec.label]) attributes[spec.label] = spec.value;
  }

  const aboutFeatures: string[] = Array.isArray(parsed.aboutFeatures) ? parsed.aboutFeatures.map((f: any) => String(f).trim()).filter(Boolean) : [];
  const idealFor: string[] = Array.isArray(parsed.idealFor) ? parsed.idealFor.map((h: any) => String(h).trim()).filter(Boolean) : [];

  return {
    productName: parsed.productName || '',
    category: parsed.category || 'General',
    subcategory: parsed.subcategory || '',
    price: Number(parsed.price) || 0,
    discountedPrice: Number(parsed.discountedPrice) || Number(parsed.price) || 0,
    validTill: parsed.validTill && parsed.validTill !== 'null' ? parsed.validTill : '',
    description: parsed.description || parsed.aboutDescription || '',
    aboutDescription: parsed.aboutDescription || parsed.description || '',
    aboutFeatures: aboutFeatures.length > 0 ? aboutFeatures : idealFor,
    attributes,
    specifications,
    idealFor: idealFor.length > 0 ? idealFor : aboutFeatures,
    brand: parsed.brand || '',
  };
}

// Mobile-only equivalent of client/app/api/smart-bulk-scan/route.ts —
// single Gemini call does OCR + multilingual translation to English + structuring
const LIST_VISION_PROMPT = `This image shows a handwritten or printed shopping/purchase list in any language or script (such as Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, English, or Tanglish). Read every line and translate all product names and text into standard English.
Reply ONLY with a raw JSON array — no markdown, no code fences, no extra text:
[{"name":"<item name in English>","quantity":"<quantity with unit as written, e.g. \\"2 kg\\", or empty string if none>"}]
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

const BULK_PRODUCT_VISION_PROMPT = `This image shows a grocery list, invoice, or handwritten/printed list of product names in any language or script. Read every line and translate all text into standard English.
Reply ONLY with a raw JSON array — no markdown, no code fences, no extra text — with at most ${MAX_BULK_ITEMS} entries:
[{"productName":"<product name in English>","category":"<one of: Groceries, Dairy, Beverages, Snacks, Beauty & Skincare, Household, Electronics, Clothing, Vegetables, Fruits, Medicine, Stationery, General>","price":<MRP as number, 0 if not shown>,"discountedPrice":<sale price as number, same as price if not shown>,"description":"<1-2 sentence plausible product description in English>","brand":"<brand name if implied, else empty string>"}]
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
  const prompt = `You are helping a store owner add a product by speaking it aloud. The following was transcribed from speech${voiceLangClause(sourceLang)}. Translate everything into standard English if not already in English, then extract the product details.
Reply ONLY with a raw JSON object — no markdown, no code fences:
{"productName":"<product name in English>","category":"<one of: Groceries, Dairy, Beverages, Snacks, Beauty & Skincare, Household, Electronics, Clothing, Vegetables, Fruits, Medicine, Stationery, General>","price":<MRP as number, 0 if not mentioned>,"discountedPrice":<sale price as number, same as price if not mentioned>,"totalStock":<stock quantity as number, 0 if not mentioned>,"description":"<1-2 sentence plausible product description in English>","brand":"<brand name if mentioned, else empty string>"}

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
  const prompt = `You are helping a customer build a shopping list by speaking it aloud. The following was transcribed from speech${voiceLangClause(sourceLang)}. Extract every product mentioned and ALWAYS translate the product name into standard English (e.g. "thengai ennai" -> "Coconut Oil", "arisi" -> "Rice", "vengayam" -> "Onion", "chawal" -> "Rice", "doodh" -> "Milk", "tamatar" -> "Tomato").
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
