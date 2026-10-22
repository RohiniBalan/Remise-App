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
// Handles BOTH handwritten/printed shopping lists AND single or multiple product images / packaging / boxes
const BULK_PURCHASE_VISION_PROMPT = `You are an AI assistant processing an image for a shopping / bulk purchase order.
The image contains EITHER:
1) A handwritten or printed shopping / grocery / purchase list in any language or script (such as English, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, or Tanglish).
OR
2) A single or multiple product image, product packaging, box, carton, bottle, or retail item (for example: a smartphone box like Samsung Galaxy, food package, grocery item, cosmetics, electronics, etc.).

Instructions:
- If it is a shopping list: Read every line and translate all product names into standard English. Extract the item name, brand (if mentioned), and quantity with unit (e.g. "2 kg", "500g", "1 packet", or empty string if not mentioned).
- If it is a product image, packaging, or box: Identify the product name by combining the brand and model/product title (e.g. "Samsung Galaxy A26 5G"). Extract the brand (e.g. "Samsung") and set quantity to "1" (or the package weight / count if clearly indicated).
- If multiple distinct products or boxes are shown, extract each as a separate item.
- Skip lines that are headers, totals, dates, store address/tax, or purely numeric (e.g. "S.No", "Total", "Date:", page numbers).

Reply ONLY with a raw JSON array of objects — no markdown, no code fences, no extra text:
[{"name":"<item or product name in English>","quantity":"<quantity with unit or count, e.g. \\"1\\", \\"2 kg\\", or empty string>","brand":"<brand name if visible or implied, else empty string>"}]`;

export interface ScannedBulkItem {
  name: string;
  quantity: string;
  brand?: string;
}

export async function scanBulkList(base64: string, mimeType: string): Promise<ScannedBulkItem[]> {
  try {
    const cleaned = await callGeminiVision(base64, mimeType, BULK_PURCHASE_VISION_PROMPT);
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      const items = parsed
        .map((it: any) => ({
          name: String(it?.name || '').trim(),
          quantity: String(it?.quantity || '').trim(),
          brand: String(it?.brand || '').trim(),
        }))
        .filter(it => it.name.length > 0);
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('[scanBulkList] primary bulk scan prompt error:', err);
  }

  // Fallback: If primary prompt returned 0 items (e.g. tricky product packaging),
  // try the dedicated single-product vision extractor (scanProductImage)
  try {
    const product = await scanProductImage(base64, mimeType);
    if (product && product.productName && product.productName.trim().length > 0) {
      const fullName = product.brand && !product.productName.toLowerCase().includes(product.brand.toLowerCase())
        ? `${product.brand} ${product.productName}`
        : product.productName;
      return [{
        name: fullName.trim(),
        quantity: '1',
        brand: product.brand || '',
      }];
    }
  } catch (err) {
    console.warn('[scanBulkList] product image fallback error:', err);
  }

  return [];
}

// Bulk product scan for the Store Owner's "Scan Grocery List" flow — mobile
// equivalent of web's `smart-bulk-product-scan` route. One Gemini vision
// call both reads the list AND structures every line into the same field
// shape `scanProductImage` returns per item (Gemini already does this in
// one shot for scanBulkList's simpler {name, quantity} case above, so the
// richer per-item shape just extends that same prompt convention instead of
// doing a separate OCR-then-enrich round trip like the web route does).
const MAX_BULK_ITEMS = 10;

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
  en: 'English', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam', hi: 'Hindi',
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
  const langName = VOICE_LANG_NAMES[sourceLang] || sourceLang || 'English';
  const prompt = `You are helping a customer build a shopping list by speaking it aloud. The customer selected language preference "${langName}", but may speak in English, in a regional Indian language (Tamil, Telugu, Kannada, Malayalam, Hindi, etc.), in romanized Tanglish/Hinglish, or in a mix of languages.

CRITICAL LANGUAGE DETECTION & TRANSLATION RULES:
1. Detect the actual language of EACH item or phrase mentioned:
   - If an item name is spoken in a regional Indian language (in native script or romanized/Tanglish/Hinglish, e.g., "thengai ennai" -> "Coconut Oil", "arisi" -> "Rice", "vengayam" -> "Onion", "chawal" -> "Rice", "doodh" -> "Milk", "tamatar" -> "Tomato", "uppu" -> "Salt", "paruppu" -> "Dal/Lentils", "pala pazham" -> "Jackfruit", "kadala paruppu" -> "Chana Dal"), TRANSLATE ONLY that regional item name into standard English.
   - If an item name is ALREADY spoken in English (e.g., "Lifebuoy soap", "Colgate toothpaste", "Sunflower oil", "Apple", "Bread", "Milk", "Shampoo", "Dettol", "Biscuits", "Butter", "Eggs", "Dishwash bar", "Body lotion", "Basmati Rice"), KEEP IT UNCHANGED in English. Do NOT translate or transliterate English product names into anything else.
2. Maintain brand names accurately (e.g., "Lifebuoy", "Colgate", "Amul", "Dettol", "Tata", "Aashirvaad", "Fortune", "Surf Excel").
3. Extract quantity with units if mentioned (e.g. "2 kg", "1 litre", "500 g", "2 packets", "3 pcs", "half kg", "dozen", or empty string if none).

Reply ONLY with a raw JSON array — no markdown, no code fences, no extra text:
[{"name":"<proper item name in English>","quantity":"<quantity with unit as mentioned, e.g. \\"2 kg\\", or empty string if none>","needsClarification":<true if this item's name or quantity is genuinely ambiguous/unclear from the sentence, otherwise false>}]
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

/**
 * Builds a category-aware, e-commerce product photograph prompt.
 * Disambiguates homonyms and polysemous terms (e.g., Mouse in Electronics vs animal,
 * Hand Wash in Personal Care vs person washing hands, Apple in Fruits vs tech logo,
 * Charger in Electronics vs action/horse, etc.) using both product name and category
 * to ensure a sellable commercial retail product item is generated.
 */
export function guessCategory(text: string, description: string = ''): string {
  const combined = `${text || ''} ${description || ''}`.toLowerCase();
  const t = (text || '').toLowerCase().trim();

  // Priority disambiguation checks
  // 1. Apple: Fruit vs Tech
  if (/\bapple\b/i.test(t)) {
    if (/\b(iphone|ipad|macbook|ios|airpod|watch|laptop|phone|tech|gadget|gb|ram|pro\s*max)\b/i.test(combined)) {
      return 'Electronics';
    }
    return 'Fruits';
  }

  // 2. Mouse: Electronics vs Animal/Toy
  if (/\b(mouse|mice)\b/i.test(t)) {
    if (/\b(toy|plush|stuffed)\b/i.test(combined)) {
      return 'Toys';
    }
    return 'Electronics';
  }

  // 3. Bat: Sports/Toys vs Animal
  if (/\bbat\b/i.test(t)) {
    return 'Toys';
  }

  // 4. Tomato: Vegetables
  if (/\b(tomato|tomatoes)\b/i.test(combined)) {
    return 'Vegetables';
  }

  // 5. Kiwi: Fruit vs Shoe polish
  if (/\bkiwi\b/i.test(t)) {
    if (/\b(shoe|polish|wax|leather)\b/i.test(combined)) {
      return 'Household';
    }
    return 'Fruits';
  }

  const map: [string, string[]][] = [
    [
      'Vegetables',
      [
        'vegetable', 'onion', 'potato', 'tomato', 'chilli', 'chili', 'pepper', 'capsicum',
        'garlic', 'ginger', 'carrot', 'radish', 'cabbage', 'cauliflower', 'spinach', 'palak',
        'methi', 'brinjal', 'eggplant', 'bhindi', 'okra', 'gourd', 'cucumber', 'beans',
        'peas', 'beetroot', 'broccoli', 'lettuce', 'mint', 'coriander', 'sabzi',
        'सब्जी', 'आलू', 'प्याज', 'टमाटर',
      ],
    ],
    [
      'Fruits',
      [
        'fruit', 'apple', 'mango', 'banana', 'orange', 'grapes', 'kiwi', 'papaya',
        'guava', 'strawberry', 'blueberry', 'berry', 'berries', 'dates', 'plum',
        'peach', 'pear', 'watermelon', 'melon', 'pomegranate', 'pineapple', 'lemon',
        'avocado', 'dragonfruit', 'coconut', 'फल', 'आम', 'सेब', 'केला',
      ],
    ],
    [
      'Dairy',
      [
        'milk', 'curd', 'butter', 'ghee', 'paneer', 'cheese', 'yogurt', 'cream',
        'buttermilk', 'lassi', 'dairy', 'दूध', 'दही', 'मक्खन', 'घी',
      ],
    ],
    [
      'Groceries',
      [
        'rice', 'basmati', 'wheat', 'flour', 'dal', 'pulses', 'lentils', 'oil', 'sunflower oil',
        'mustard oil', 'cooking oil', 'sugar', 'salt', 'atta', 'maida', 'masala', 'spice',
        'spices', 'turmeric', 'haldi', 'cumin', 'jeera', 'pepper powder', 'grains', 'oats',
        'pasta', 'noodles', 'चावल', 'गेहूं', 'आटा', 'दाल', 'तेल', 'चीनी', 'नमक',
      ],
    ],
    [
      'Beverages',
      [
        'tea', 'coffee', 'juice', 'drink', 'water', 'soda', 'cola', 'chai',
        'soft drink', 'energy drink', 'cold drink', 'espresso', 'latte', 'चाय', 'कॉफी',
      ],
    ],
    [
      'Snacks',
      [
        'chips', 'biscuit', 'cookie', 'namkeen', 'snack', 'wafer', 'chocolate', 'candy',
        'popcorn', 'mixture', 'bhujia', 'cracker', 'rusks', 'sweet', 'sweets', 'mithai',
        'नमकीन', 'बिस्कुट',
      ],
    ],
    [
      'Electronics',
      [
        'phone', 'mobile', 'smartphone', 'battery', 'charger', 'adapter', 'cable', 'cord',
        'wire', 'earphone', 'headphone', 'airpod', 'earbud', 'speaker', 'soundbar', 'mouse',
        'keyboard', 'laptop', 'monitor', 'display', 'tv', 'television', 'usb', 'power bank',
        'bulb', 'led', 'gadget', 'camera', 'tablet', 'ipad', 'smartwatch', 'iron', 'fan',
      ],
    ],
    [
      'Beauty & Skincare',
      [
        'hand wash', 'handwash', 'face wash', 'facewash', 'body wash', 'shower gel',
        'cream', 'lotion', 'soap', 'shampoo', 'conditioner', 'hair oil', 'moisturizer',
        'serum', 'sunscreen', 'cleanser', 'scrub', 'cosmetic', 'lipstick', 'kajal',
        'perfume', 'deodorant', 'sanitary pad', 'साबुन', 'क्रीम',
      ],
    ],
    [
      'Household',
      [
        'detergent', 'washing', 'cleaner', 'floor cleaner', 'dish', 'dishwash', 'bleach',
        'matchbox', 'broom', 'mop', 'garbage bag', 'झाड़ू', 'डिटर्जेंट',
      ],
    ],
    [
      'Clothing',
      [
        'shirt', 'pant', 't-shirt', 'jeans', 'trousers', 'saree', 'kurta', 'kurti',
        'dress', 'cloth', 'fabric', 'shoes', 'sneakers', 'footwear', 'sandals', 'slippers',
        'साड़ी', 'कुर्ता',
      ],
    ],
    [
      'Medicine',
      [
        'tablet', 'capsule', 'syrup', 'ointment', 'bandage', 'medicine', 'pharma',
        'dawa', 'multivitamin', 'pain relief', 'antiseptic', 'दवा',
      ],
    ],
    [
      'Stationery',
      [
        'pen', 'pencil', 'notebook', 'book', 'diary', 'marker', 'eraser', 'stapler',
        'paper', 'stationery', 'calculator', 'ruler', 'scissors',
      ],
    ],
    [
      'Toys',
      [
        'toy', 'doll', 'puzzle', 'ball', 'bat', 'board game', 'lego', 'building blocks',
        'action figure', 'teddy bear', 'खिलौना',
      ],
    ],
  ];

  // First try matching product name directly
  for (const [cat, kws] of map) {
    if (kws.some(kw => t.includes(kw))) return cat;
  }

  // Second try matching description
  if (description) {
    const descLower = description.toLowerCase();
    for (const [cat, kws] of map) {
      if (kws.some(kw => descLower.includes(kw))) return cat;
    }
  }

  return 'General';
}

export function buildProductImagePrompt(
  productName: string,
  category: string = '',
  description: string = '',
  attributes?: Record<string, any> | string
): string {
  const name = (productName || '').trim();
  if (!name) return '';

  const nameLower = name.toLowerCase();
  const rawCat = (category || '').trim();
  // If category is provided and not generic, respect the explicitly chosen category;
  // otherwise, infer it accurately from product name and available description
  const isGeneric = !rawCat || ['general', 'other', 'undefined'].includes(rawCat.toLowerCase());
  const cat = isGeneric ? guessCategory(name, description) : rawCat;
  const catLower = cat.toLowerCase();

  // Determine specific item type, visual cues and disambiguation
  let visualGuidance = '';
  let negativeDirectives = 'no people, no human hands, no human face, no action, no live animals, no text, no watermark, no illustrations, no logos';

  if (
    catLower.includes('electr') ||
    catLower.includes('gadget') ||
    catLower.includes('tech') ||
    catLower.includes('appliance') ||
    catLower.includes('computer') ||
    catLower.includes('mobile') ||
    catLower.includes('phone')
  ) {
    negativeDirectives = 'no rodents, no live animals, no rat, no rodent paws, no people, no human hands, no animal charger, no horses, no vehicles, no swimming boats, no real fruit, no food, packaged hardware electronic accessory product only, solid plain white background, no text, no watermark';

    if (/\b(mouse|mice)\b/i.test(nameLower)) {
      visualGuidance = 'computer mouse USB optical hardware peripheral device, electronic desktop computer mouse';
    } else if (/\b(dslr|camera|canon|nikon|sony|eos)\b/i.test(nameLower)) {
      visualGuidance = 'digital DSLR camera photography equipment device with kit lens';
    } else if (/\b(charger|adapter|cable|cord|wire|power\s*bank)\b/i.test(nameLower)) {
      visualGuidance = 'electronic power charger adapter unit and charging cable';
    } else if (/\b(apple|iphone|ipad|macbook)\b/i.test(nameLower)) {
      visualGuidance = 'Apple brand electronic tech smartphone device hardware';
    } else if (/\b(phone|smartphone|mobile)\b/i.test(nameLower)) {
      visualGuidance = 'modern smartphone mobile phone hardware device';
    } else if (/\b(laptop|notebook)\b/i.test(nameLower)) {
      visualGuidance = 'laptop computer electronic device';
    } else if (/\b(headphone|earphone|airpod|earbud|headset)\b/i.test(nameLower)) {
      visualGuidance = 'wireless audio Bluetooth headphones earbuds device';
    } else if (/\b(tv|television|monitor)\b/i.test(nameLower)) {
      visualGuidance = 'smart LED display television monitor screen appliance';
    } else if (/\b(watch|smartwatch)\b/i.test(nameLower)) {
      visualGuidance = 'smartwatch digital wrist wearable device';
    } else {
      visualGuidance = 'electronic hardware device or tech accessory';
    }
  } else if (
    catLower.includes('beauty') ||
    catLower.includes('skin') ||
    catLower.includes('personal') ||
    catLower.includes('care') ||
    catLower.includes('cosmetic') ||
    catLower.includes('toiletr')
  ) {
    negativeDirectives = 'no person washing hands, no human body, no people, no hands, no water splashing, no bathroom sink, no live birds, product container packaging bottle or jar only, solid plain white background, no text, no watermark';

    if (/\b(hand\s*wash|handwash|soap)\b/i.test(nameLower)) {
      visualGuidance = 'liquid hand wash soap pump dispenser bottle packaging or packaged soap bar';
    } else if (/\b(shampoo|conditioner|hair\s*oil)\b/i.test(nameLower)) {
      visualGuidance = 'haircare shampoo or conditioner bottle product';
    } else if (/\b(scrub|cream|lotion|moisturizer|serum)\b/i.test(nameLower)) {
      visualGuidance = 'cosmetic skincare cream bottle, lotion pump, or serum dropper packaging';
    } else {
      visualGuidance = 'personal care cosmetic bottled or packaged retail product container';
    }
  } else if (catLower.includes('fruit')) {
    negativeDirectives = 'no electronic devices, no tech logos, no smartphones, no laptops, no computers, no people, no trees, no orchard, fresh edible fruit produce item only, solid plain white background, no text, no watermark';

    if (/\b(apple)\b/i.test(nameLower)) {
      visualGuidance = 'fresh ripe natural red edible apple fruit produce, fresh orchard fruit';
    } else if (/\b(orange)\b/i.test(nameLower)) {
      visualGuidance = 'fresh juicy orange citrus fruit produce';
    } else if (/\b(banana)\b/i.test(nameLower)) {
      visualGuidance = 'fresh ripe yellow banana fruit produce';
    } else if (/\b(mango)\b/i.test(nameLower)) {
      visualGuidance = 'fresh ripe sweet mango fruit produce';
    } else {
      visualGuidance = 'fresh raw edible agricultural fruit produce';
    }
  } else if (catLower.includes('veg') || catLower.includes('vegetable')) {
    negativeDirectives = 'no cooked food, no cooking pots, no kitchen, no recipes, no people, no apples, fresh raw vegetable produce item only, solid plain white background, no text, no watermark';

    if (/\b(tomato|tomatoes)\b/i.test(nameLower)) {
      visualGuidance = 'fresh red country tomatoes, fresh farm raw vegetable produce, smooth red skin with natural green stem calyx';
    } else if (/\b(potato|potatoes)\b/i.test(nameLower)) {
      visualGuidance = 'fresh raw brown farm potatoes root vegetable';
    } else if (/\b(onion|onions)\b/i.test(nameLower)) {
      visualGuidance = 'fresh raw red/pink farm onions vegetable';
    } else {
      visualGuidance = 'fresh raw agricultural vegetable grocery produce';
    }
  } else if (catLower.includes('dairy') || catLower.includes('egg')) {
    negativeDirectives = 'no live cows, no farm animals, no farm, no people, packaged dairy food product only, solid plain white background, no text, no watermark';
    visualGuidance = 'packaged dairy grocery product, milk carton, butter tub, ghee jar, or cheese pack';
  } else if (catLower.includes('beverage') || catLower.includes('drink') || catLower.includes('juice') || catLower.includes('tea') || catLower.includes('coffee')) {
    negativeDirectives = 'no people drinking, no hands, no glasses on dining table, packaged beverage bottle or can retail drink product only, solid plain white background, no text, no watermark';
    visualGuidance = 'packaged beverage bottle, can, or drink pack';
  } else if (catLower.includes('snack') || catLower.includes('bakery') || catLower.includes('sweet') || catLower.includes('biscuit')) {
    negativeDirectives = 'no people eating, no hands, no dining table, packaged retail snack food packet pouch or box only, solid plain white background, no text, no watermark';
    visualGuidance = 'packaged retail snack food packet, pouch, or box';
  } else if (catLower.includes('grocer') || catLower.includes('food') || catLower.includes('staple')) {
    negativeDirectives = 'no people cooking, no farm, no live animals, packaged supermarket grocery food retail product only, solid plain white background, no text, no watermark';
    if (/\b(rice|basmati)\b/i.test(nameLower)) {
      visualGuidance = 'packaged retail bag of uncooked white grain rice grocery staple';
    } else if (/\b(oil|sunflower|mustard)\b/i.test(nameLower)) {
      visualGuidance = 'packaged cooking oil bottle or pouch grocery product';
    } else {
      visualGuidance = 'packaged supermarket grocery food retail staple product';
    }
  } else if (catLower.includes('house') || catLower.includes('clean') || catLower.includes('home') || catLower.includes('laundry')) {
    negativeDirectives = 'no people cleaning, no hands, no dirty dishes, no bathroom, packaged cleaning product bottle or box only, solid plain white background, no text, no watermark';
    visualGuidance = 'household cleaning utility packaged retail product bottle or pack';
  } else if (catLower.includes('cloth') || catLower.includes('apparel') || catLower.includes('fashion') || catLower.includes('wear')) {
    negativeDirectives = 'no human model, no human face, no human body, no wild animals, flat lay or retail folded garment product only, solid plain white background, no text, no watermark';
    visualGuidance = 'apparel clothing fashion garment product, neatly folded or flat lay display';
  } else if (catLower.includes('med') || catLower.includes('pharm') || catLower.includes('health')) {
    negativeDirectives = 'no sick patients, no doctors, no hospital, packaged pharmaceutical medicine product only, solid plain white background, no text, no watermark';
    visualGuidance = 'pharmaceutical healthcare medicine packaged box, bottle, or blister pack';
  } else if (catLower.includes('station') || catLower.includes('office') || catLower.includes('school') || catLower.includes('book')) {
    negativeDirectives = 'no people writing, no snakes, stationery product item only, solid plain white background, no text, no watermark';
    visualGuidance = 'stationery office school supply product item';
  } else if (catLower.includes('toy') || catLower.includes('game') || catLower.includes('sport')) {
    negativeDirectives = 'no live animals, no flying bat animals, no children, toy retail product packaging only, solid plain white background, no text, no watermark';
    if (/\b(bat)\b/i.test(nameLower)) {
      visualGuidance = 'sports cricket or baseball bat wooden equipment';
    } else {
      visualGuidance = 'packaged recreational toy game merchandise item';
    }
  }

  // Build the mandatory required ecommerce prompt
  const basePrompt = `Generate a realistic, high-quality ecommerce product photograph of ${name}, belonging to the ${cat} category. The image must clearly show the exact named product. Match its typical real-world appearance, shape, color, and form. Display only the relevant product, centered against a clean, neutral background with good lighting. Do not substitute another product, generate unrelated objects, or add unnecessary text, logos, or watermarks. Use a square 1:1 composition suitable for an ecommerce product listing.`;

  // Additional context parts
  const contextParts: string[] = [basePrompt];

  if (visualGuidance) {
    contextParts.push(`Product identity specification: ${visualGuidance}.`);
  }

  const cleanDesc = (description || '').trim();
  if (cleanDesc && cleanDesc.length > 2) {
    contextParts.push(`Product description: ${cleanDesc.slice(0, 200)}.`);
  }

  if (attributes) {
    let attrStr = '';
    if (typeof attributes === 'string') {
      attrStr = attributes.trim();
    } else if (typeof attributes === 'object') {
      attrStr = Object.entries(attributes)
        .filter(([k, v]) => v !== undefined && v !== null && String(v).trim().length > 0)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    if (attrStr) {
      contextParts.push(`Key attributes: ${attrStr.slice(0, 150)}.`);
    }
  }

  contextParts.push(`Studio lighting, crisp sharp focus, solid white neutral backdrop, 4k high resolution, ${negativeDirectives}, photo only.`);

  return contextParts.join(' ');
}

// Curated high-resolution food & e-commerce photography fallback
export function getCuratedPhotoFallback(productName: string, category: string = ''): string {
  const nameLower = productName.toLowerCase();
  const catLower = (category || guessCategory(productName)).toLowerCase();

  if (catLower.includes('food') || catLower.includes('grocer') || /\b(biryani|rice|chicken|curry|masala|paneer|dosa|idli|roti|dal)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('fruit') || /\b(apple|banana|mango|orange|grape)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('veg') || /\b(tomato|potato|onion|carrot)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('dairy') || /\b(milk|butter|cheese|paneer|curd|ghee)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('beverage') || catLower.includes('drink') || /\b(juice|tea|coffee|soda)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('electr') || /\b(phone|laptop|charger|cable|mouse|headphone)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('cloth') || /\b(shirt|t-shirt|pant|dress|saree)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  }
  if (catLower.includes('beauty') || /\b(soap|shampoo|lotion|cream|wash)\b/i.test(nameLower)) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
}

/**
 * Searches real high-resolution product and food photography from Wikimedia Commons.
 * Fast, authentic, real-world photographs for dishes, produce, and merchandise.
 */
export async function fetchProductPhotoUrl(productName: string, category: string = ''): Promise<string> {
  const cleanName = productName
    .replace(/^[•\-\*\d\.\)]+\s*/, '')
    .replace(/\s*[-–]\s*\d[\d.,]*\s*(?:kg|g|ml|l|gm|gms|ltr|pcs|pc|count)\s*$/i, '')
    .trim();
  if (!cleanName || cleanName.length < 2) {
    return getCuratedPhotoFallback(productName, category);
  }

  const queries = [
    cleanName,
    `${cleanName} dish food`,
    `${cleanName} product`,
  ];

  for (const q of queries) {
    try {
      const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        q
      )}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
      const res = await fetch(wikiUrl);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) continue;

      for (const page of Object.values(pages) as any[]) {
        const info = page?.imageinfo?.[0];
        const thumbUrl = info?.thumburl || info?.url;
        if (
          thumbUrl &&
          typeof thumbUrl === 'string' &&
          thumbUrl.startsWith('http') &&
          /\.(jpg|jpeg|png|webp)/i.test(thumbUrl) &&
          !/icon|logo|flag|coat_of_arms|symbol|map|diagram/i.test(thumbUrl)
        ) {
          return thumbUrl;
        }
      }
    } catch {
      // ignore and try next query
    }
  }

  return getCuratedPhotoFallback(productName, category);
}

// Pure URL builder with context-aware prompt & curated fallback
export function buildGeneratedImageUrl(productName: string, category: string = '', seedOffset: number = 0, description: string = ''): string {
  const cleanName = (productName || '').trim();
  if (!cleanName) return getCuratedPhotoFallback('', category);

  const promptText = buildProductImagePrompt(cleanName, category, description);
  const prompt = encodeURIComponent(promptText);
  const seed = Date.now() + seedOffset;
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&model=turbo&nologo=true&seed=${seed}`;
}

/**
 * Translates any manually typed regional grocery term (Tamil, Malayalam, Telugu,
 * Kannada, Hindi, Tanglish, Hinglish, etc.) into a standard English grocery item name
 * for catalog and store comparison matching.
 */
export async function translateGroceryTerm(text: string): Promise<{ englishName: string; quantity?: string }> {
  const trimmed = (text || '').trim();
  if (!trimmed) return { englishName: '' };
  const prompt = `You are an Indian grocery and household item translator.
The customer typed a grocery or household item: "${trimmed}".
Translate it to the canonical standard English grocery item name (e.g., "Rice", "Fresh Milk", "Toor Dal", "Coconut Oil", "Fresh Tomatoes", "Wheat Flour", "Cooking Oil", etc.) and extract any quantity if present.
Reply ONLY with a raw JSON object (no markdown, no code fences):
{"englishName":"<standard English product name>","quantity":"<extracted quantity with unit, or empty string if none>"}`;

  try {
    const raw = await callGeminiText(prompt);
    const parsed = JSON.parse(raw);
    return {
      englishName: String(parsed.englishName || trimmed).trim(),
      quantity: String(parsed.quantity || '').trim() || undefined,
    };
  } catch {
    return { englishName: trimmed };
  }
}


