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
export function guessCategory(text: string): string {
  const t = text.toLowerCase();
  const map: [string, string[]][] = [
    [
      'Electronics',
      [
        'phone',
        'mobile',
        'battery',
        'charger',
        'adapter',
        'cable',
        'cord',
        'wire',
        'earphone',
        'headphone',
        'speaker',
        'mouse',
        'keyboard',
        'laptop',
        'monitor',
        'usb',
        'power bank',
        'bulb',
        'led',
        'gadget',
        'camera',
        'tablet',
      ],
    ],
    [
      'Beauty & Skincare',
      [
        'hand wash',
        'handwash',
        'face wash',
        'facewash',
        'body wash',
        'shower gel',
        'cream',
        'lotion',
        'soap',
        'shampoo',
        'conditioner',
        'hair oil',
        'moisturizer',
        'serum',
        'sunscreen',
        'cleanser',
        'scrub',
        'cosmetic',
      ],
    ],
    [
      'Fruits',
      [
        'fruit',
        'apple',
        'mango',
        'banana',
        'orange',
        'grapes',
        'kiwi',
        'papaya',
        'guava',
        'strawberry',
        'blueberry',
        'berry',
        'berries',
        'dates',
        'plum',
        'peach',
        'pear',
      ],
    ],
    [
      'Vegetables',
      [
        'vegetable',
        'onion',
        'potato',
        'tomato',
        'chilli',
        'pepper',
        'capsicum',
        'garlic',
        'ginger',
        'carrot',
        'radish',
        'cabbage',
        'cauliflower',
        'spinach',
        'sabzi',
      ],
    ],
    [
      'Dairy',
      [
        'milk',
        'curd',
        'butter',
        'ghee',
        'paneer',
        'cheese',
        'yogurt',
      ],
    ],
    [
      'Beverages',
      ['tea', 'coffee', 'juice', 'drink', 'water', 'soda', 'cola', 'chai'],
    ],
    [
      'Snacks',
      [
        'chips',
        'biscuit',
        'cookie',
        'namkeen',
        'snack',
        'wafer',
        'chocolate',
        'candy',
      ],
    ],
    [
      'Groceries',
      [
        'rice',
        'wheat',
        'flour',
        'dal',
        'oil',
        'sugar',
        'salt',
        'atta',
        'maida',
        'masala',
        'spice',
      ],
    ],
    [
      'Household',
      [
        'detergent',
        'washing',
        'cleaner',
        'floor',
        'dish',
        'dishwash',
        'bleach',
        'matchbox',
        'broom',
        'mop',
      ],
    ],
    [
      'Clothing',
      [
        'shirt',
        'pant',
        't-shirt',
        'jeans',
        'trousers',
        'saree',
        'kurta',
        'dress',
        'cloth',
        'fabric',
        'shoes',
        'sneakers',
      ],
    ],
    [
      'Medicine',
      [
        'tablet',
        'capsule',
        'syrup',
        'ointment',
        'bandage',
        'medicine',
        'pharma',
        'dawa',
      ],
    ],
    [
      'Stationery',
      [
        'pen',
        'pencil',
        'notebook',
        'book',
        'diary',
        'marker',
        'eraser',
        'stapler',
        'paper',
        'stationery',
      ],
    ],
    [
      'Toys',
      [
        'toy',
        'doll',
        'puzzle',
        'ball',
        'bat',
        'board game',
      ],
    ],
  ];
  for (const [cat, kws] of map) {
    if (kws.some(kw => t.includes(kw))) return cat;
  }
  return 'General';
}

export function buildProductImagePrompt(productName: string, category: string = ''): string {
  const name = (productName || '').trim();
  const nameLower = name.toLowerCase();
  const rawCat = (category || '').trim();
  // If category is missing or 'General', fall back to guessCategory(name)
  const cat = rawCat && rawCat.toLowerCase() !== 'general' ? rawCat : guessCategory(name);
  const catLower = cat.toLowerCase();

  let itemType = 'packaged commercial retail product item';
  let categoryDescriptor = cat && cat.toLowerCase() !== 'general' ? `${cat} retail product` : 'retail merchandise';
  let disambiguatedName = name;
  let negativeDirectives = 'no people, no human hands, no human face, no action, no live animals, no text, no watermark, no illustrations, no logos';

  // 1. Electronics / Gadgets / Tech / Appliances / Computers / Mobile
  if (
    catLower.includes('electr') ||
    catLower.includes('gadget') ||
    catLower.includes('tech') ||
    catLower.includes('appliance') ||
    catLower.includes('computer') ||
    catLower.includes('mobile') ||
    catLower.includes('phone')
  ) {
    itemType = 'electronic hardware device or tech accessory';
    categoryDescriptor = 'Electronics';
    negativeDirectives = 'no rodents, no live animals, no rat, no rodent paws, no people, no human hands, no animal charger, no horses, no vehicles, no swimming boats, no real fruit, no food, packaged hardware electronic accessory product only, solid plain white background, no text, no watermark';

    if (/\b(mouse|mice)\b/i.test(nameLower)) {
      disambiguatedName = `computer mouse USB optical hardware peripheral device (${name})`;
    } else if (/\b(dslr|camera|canon|nikon|sony|eos)\b/i.test(nameLower)) {
      disambiguatedName = `digital DSLR camera photography equipment device with kit lens (${name})`;
    } else if (/\b(charger|adapter|cable|cord|wire|power\s*bank)\b/i.test(nameLower)) {
      disambiguatedName = `electronic power charger adapter unit (${name})`;
    } else if (/\b(apple|iphone|ipad|macbook)\b/i.test(nameLower)) {
      disambiguatedName = `Apple brand electronic tech device hardware (${name})`;
    } else if (/\b(phone|smartphone|mobile)\b/i.test(nameLower)) {
      disambiguatedName = `modern smartphone mobile phone hardware device (${name})`;
    } else if (/\b(laptop|notebook)\b/i.test(nameLower)) {
      disambiguatedName = `laptop computer electronic device (${name})`;
    } else if (/\b(fan|cooler)\b/i.test(nameLower)) {
      disambiguatedName = `electric cooling fan room appliance (${name})`;
    } else if (/\b(pad|mat)\b/i.test(nameLower)) {
      disambiguatedName = `electronic gaming mouse pad desk mat accessory (${name})`;
    } else if (/\b(plug|switch|socket)\b/i.test(nameLower)) {
      disambiguatedName = `electrical plug socket switch hardware unit (${name})`;
    } else if (/\b(keyboard|keypad)\b/i.test(nameLower)) {
      disambiguatedName = `computer keyboard hardware peripheral (${name})`;
    } else if (/\b(battery|cell)\b/i.test(nameLower)) {
      disambiguatedName = `electronic battery pack cell unit (${name})`;
    } else if (/\b(headphone|earphone|airpod|earbud|headset)\b/i.test(nameLower)) {
      disambiguatedName = `wireless audio Bluetooth headphones earbuds device (${name})`;
    } else if (/\b(boat)\b/i.test(nameLower)) {
      disambiguatedName = `boAt audio electronic headphones earphones product (${name})`;
    } else if (/\b(tv|television|monitor)\b/i.test(nameLower)) {
      disambiguatedName = `smart LED display television monitor screen screen appliance (${name})`;
    } else if (/\b(watch|smartwatch)\b/i.test(nameLower)) {
      disambiguatedName = `smartwatch digital wrist wearable device (${name})`;
    } else if (/\b(iron)\b/i.test(nameLower)) {
      disambiguatedName = `electric dry clothes iron home appliance (${name})`;
    }
  }
  // 2. Beauty & Skincare / Personal Care / Cosmetics / Toiletries / Salon
  else if (
    catLower.includes('beauty') ||
    catLower.includes('skin') ||
    catLower.includes('personal') ||
    catLower.includes('care') ||
    catLower.includes('cosmetic') ||
    catLower.includes('toiletr')
  ) {
    itemType = 'personal care cosmetic bottled or packaged retail product container';
    categoryDescriptor = 'Beauty & Personal Care';
    negativeDirectives = 'no person washing hands, no human body, no people, no hands, no water splashing, no bathroom sink, no live birds, no real flowers in ponds, product container packaging bottle or jar only, solid plain white background, no text, no watermark';

    if (/\b(hand\s*wash|handwash|soap)\b/i.test(nameLower)) {
      disambiguatedName = `liquid hand wash soap pump dispenser bottle packaging (${name})`;
    } else if (/\b(body\s*wash|shower\s*gel)\b/i.test(nameLower)) {
      disambiguatedName = `body wash shower gel plastic bottle container (${name})`;
    } else if (/\b(face\s*wash|facewash|cleanser)\b/i.test(nameLower)) {
      disambiguatedName = `facial cleanser face wash tube bottle container (${name})`;
    } else if (/\b(dove)\b/i.test(nameLower)) {
      disambiguatedName = `Dove personal care beauty soap bar or moisturizer bottle product (${name})`;
    } else if (/\b(lotus)\b/i.test(nameLower)) {
      disambiguatedName = `Lotus Herbals cosmetic skincare cream lotion bottle (${name})`;
    } else if (/\b(scrub|cream|lotion|moisturizer|serum)\b/i.test(nameLower)) {
      disambiguatedName = `cosmetic skincare bottle jar packaging (${name})`;
    } else if (/\b(shampoo|conditioner|hair\s*oil)\b/i.test(nameLower)) {
      disambiguatedName = `haircare shampoo conditioner bottle product (${name})`;
    } else if (/\b(pad|pads|napkin)\b/i.test(nameLower)) {
      disambiguatedName = `feminine sanitary hygiene pad packaging box (${name})`;
    }
  }
  // 3. Fruits / Fresh Produce
  else if (catLower.includes('fruit')) {
    itemType = 'fresh raw edible agricultural fruit produce';
    categoryDescriptor = 'fresh Fruits grocery produce';
    negativeDirectives = 'no electronic devices, no tech logos, no smartphones, no laptops, no computers, no people, no trees, no orchard, fresh edible fruit produce item only, solid plain white background, no text, no watermark';

    if (/\b(apple)\b/i.test(nameLower)) {
      disambiguatedName = `fresh ripe red apple fruit produce (${name})`;
    } else if (/\b(orange)\b/i.test(nameLower)) {
      disambiguatedName = `fresh juicy orange citrus fruit produce (${name})`;
    } else if (/\b(kiwi)\b/i.test(nameLower)) {
      disambiguatedName = `fresh whole ripe kiwi fruit produce (${name})`;
    } else if (/\b(mango)\b/i.test(nameLower)) {
      disambiguatedName = `fresh ripe mango fruit produce (${name})`;
    } else if (/\b(banana)\b/i.test(nameLower)) {
      disambiguatedName = `fresh ripe yellow banana bunch fruit produce (${name})`;
    } else if (/\b(berry|berries|strawberry|blueberry)\b/i.test(nameLower)) {
      disambiguatedName = `fresh ripe berries fruit produce (${name})`;
    } else if (/\b(date|dates)\b/i.test(nameLower)) {
      disambiguatedName = `fresh edible sweet dates fruit produce (${name})`;
    }
  }
  // 4. Vegetables / Greens
  else if (catLower.includes('veg') || catLower.includes('vegetable')) {
    itemType = 'fresh raw agricultural vegetable grocery produce';
    categoryDescriptor = 'fresh Vegetables grocery';
    negativeDirectives = 'no cooked food, no cooking pots, no kitchen, no recipes, no people, fresh raw vegetable produce item only, solid plain white background, no text, no watermark';
  }
  // 5. Dairy / Eggs
  else if (catLower.includes('dairy') || catLower.includes('egg')) {
    itemType = 'packaged dairy grocery product, milk carton, butter tub, or cheese pack';
    categoryDescriptor = 'Dairy';
    negativeDirectives = 'no live cows, no farm animals, no farm, no people, packaged dairy food product only, solid plain white background, no text, no watermark';
    if (/\b(milk)\b/i.test(nameLower)) {
      disambiguatedName = `packaged fresh milk carton or bottle (${name})`;
    } else if (/\b(butter|cheese|paneer|curd|yogurt|ghee)\b/i.test(nameLower)) {
      disambiguatedName = `packaged retail dairy product (${name})`;
    } else if (/\b(egg|eggs)\b/i.test(nameLower)) {
      disambiguatedName = `fresh poultry eggs pack in carton tray packaging (${name})`;
    }
  }
  // 6. Beverages / Drinks / Juice / Tea / Coffee
  else if (catLower.includes('beverage') || catLower.includes('drink') || catLower.includes('juice') || catLower.includes('tea') || catLower.includes('coffee')) {
    itemType = 'packaged beverage bottle or can retail drink product';
    categoryDescriptor = 'Beverages';
    negativeDirectives = 'no people drinking, no hands, no glasses on table, no restaurant, packaged beverage bottle or can retail drink product only, solid plain white background, no text, no watermark';
    if (/\b(apple)\b/i.test(nameLower)) {
      disambiguatedName = `apple juice beverage bottle or can drink (${name})`;
    } else if (/\b(orange)\b/i.test(nameLower)) {
      disambiguatedName = `orange juice beverage bottle or can drink (${name})`;
    } else if (/\b(coffee|java)\b/i.test(nameLower)) {
      disambiguatedName = `packaged coffee beans, powder jar or pouch drink (${name})`;
    }
  }
  // 7. Snacks / Bakery / Sweets
  else if (catLower.includes('snack') || catLower.includes('bakery') || catLower.includes('sweet') || catLower.includes('biscuit')) {
    itemType = 'packaged retail snack food packet pouch or box';
    categoryDescriptor = 'Snacks';
    negativeDirectives = 'no people eating, no hands, no dining table, packaged retail snack food packet pouch or box only, solid plain white background, no text, no watermark';
  }
  // 8. Groceries / Food & Beverages / Staples / Prepared Dishes / Indian Cuisine
  else if (catLower.includes('grocer') || catLower.includes('food') || catLower.includes('staple') || catLower.includes('beverage') || catLower.includes('cuisine') || catLower.includes('restaurant')) {
    const isPreparedDish = /\b(biryani|briyani|rice|fried\s*rice|pulao|curry|gravy|paneer|chicken|mutton|fish|prawn|egg|masala|dosa|idli|vada|sambar|chutney|naan|roti|paratha|chapati|poori|burger|pizza|sandwich|pasta|noodle|noodles|soup|salad|roll|shawarma|kebab|tikka|tandoori|momos|manchurian|chilli|pakora|samosa|chaat|bhel|pani\s*puri|pav\s*bhaji|chole|bhature|dal|sweet|halwa|gulab\s*jamun|ladoo|laddu|rasgulla|jalebi|cake|pastry|ice\s*cream|kulfi|shake|smoothie|lassi|meal|thali|platter|combo)\b/i.test(nameLower);

    if (isPreparedDish) {
      itemType = 'freshly prepared authentic culinary food dish, delicious gourmet plating on a clean serving bowl or plate with fresh garnish';
      categoryDescriptor = 'Food & Beverages gourmet culinary dish';
      disambiguatedName = `freshly cooked appetizing ${name} dish served in a restaurant platter`;
      negativeDirectives = 'no raw meat, no raw chicken, no packaged boxes, no plastic bags, no live animals, no people, no human hands, professional commercial food photography, appetizing meal on plate, studio lighting, clean background, 4k high resolution, no text, no watermark, no logos, photo only';
    } else if (/\b(fish|salmon|tuna|prawn|shrimp)\b/i.test(nameLower)) {
      disambiguatedName = `fresh culinary food seafood item (${name})`;
      itemType = 'fresh culinary seafood food product';
      categoryDescriptor = 'Food & Groceries';
      negativeDirectives = 'no aquarium, no swimming live fish, culinary food item only, no text, no watermark';
    } else {
      itemType = 'packaged supermarket grocery food retail product';
      categoryDescriptor = 'Groceries';
      negativeDirectives = 'no people cooking, no farm, no live animals, packaged supermarket grocery food retail product only, solid plain white background, no text, no watermark';
    }
  }
  // 9. Household / Cleaning / Laundry
  else if (catLower.includes('house') || catLower.includes('clean') || catLower.includes('home') || catLower.includes('laundry')) {
    itemType = 'household cleaning utility packaged retail product';
    categoryDescriptor = 'Household & Cleaning';
    negativeDirectives = 'no people cleaning, no hands, no dirty dishes, no bathroom, packaged cleaning product bottle or box only, solid plain white background, no text, no watermark';
    if (/\b(hand\s*wash|handwash|soap)\b/i.test(nameLower)) {
      disambiguatedName = `liquid hand wash cleaning soap bottle dispenser (${name})`;
    } else if (/\b(wash|detergent|bleach|cleaner)\b/i.test(nameLower)) {
      disambiguatedName = `household cleaning detergent liquid bottle or powder pack (${name})`;
    } else if (/\b(kiwi)\b/i.test(nameLower)) {
      disambiguatedName = `Kiwi shoe polish tin can container (${name})`;
    } else if (/\b(match|matches|matchbox)\b/i.test(nameLower)) {
      disambiguatedName = `household matchbox safety matches pack (${name})`;
    }
  }
  // 10. Clothing / Fashion / Apparel / Footwear
  else if (catLower.includes('cloth') || catLower.includes('apparel') || catLower.includes('fashion') || catLower.includes('wear') || catLower.includes('shoe')) {
    itemType = 'apparel clothing fashion garment product, neatly folded or flat lay display';
    categoryDescriptor = 'Clothing & Apparel';
    negativeDirectives = 'no human model, no human face, no human body, no wild animals, no big cats, flat lay or retail folded garment product only, solid plain white background, no text, no watermark';
    if (/\b(puma|jaguar)\b/i.test(nameLower)) {
      disambiguatedName = `branded athletic apparel footwear sportswear item (${name})`;
      negativeDirectives = 'no wild animals, no big cats, clothing apparel product only, no text';
    }
  }
  // 11. Medicine / Pharmacy / Healthcare / Wellness
  else if (catLower.includes('med') || catLower.includes('pharm') || catLower.includes('health')) {
    itemType = 'pharmaceutical healthcare medicine packaged box, bottle, or blister pack';
    categoryDescriptor = 'Medicine & Pharmacy';
    negativeDirectives = 'no sick patients, no doctors, no hospital, packaged pharmaceutical medicine product only, solid plain white background, no text, no watermark';
  }
  // 12. Stationery / Office / Books
  else if (catLower.includes('station') || catLower.includes('office') || catLower.includes('school') || catLower.includes('book')) {
    itemType = 'stationery office school supply product';
    categoryDescriptor = 'Stationery & Office';
    negativeDirectives = 'no people writing, no snakes, no reptiles, stationery product item only, solid plain white background, no text, no watermark';
    if (/\b(mouse)\b/i.test(nameLower)) {
      disambiguatedName = `desk stationery mouse pad accessory or computer mouse (${name})`;
    } else if (/\b(python|java|c\+\+)\b/i.test(nameLower)) {
      disambiguatedName = `programming educational study textbook book (${name})`;
      negativeDirectives = 'no snakes, no reptiles, textbook book product only, no text';
    }
  }
  // 13. Toys / Games / Sports
  else if (catLower.includes('toy') || catLower.includes('game') || catLower.includes('sport') || catLower.includes('kid') || catLower.includes('baby')) {
    itemType = 'packaged toy games retail merchandise product box';
    categoryDescriptor = 'Toys & Games';
    negativeDirectives = 'no live animals, no flying bat animals, no children, toy retail product packaging only, solid plain white background, no text, no watermark';
    if (/\b(bat)\b/i.test(nameLower)) {
      disambiguatedName = `sports toy cricket or baseball bat wooden product (${name})`;
    }
  }

  return `Commercial studio product photography of a sellable ${disambiguatedName}, ${itemType}, ${categoryDescriptor}. Centered standalone physical retail product, solid clean plain white studio background, professional e-commerce product catalog photo, soft studio lighting, sharp focus, 4k high resolution, ${negativeDirectives}, photo only.`;
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

// Pure URL builder with high-res curated fallback
export function buildGeneratedImageUrl(productName: string, category: string, seedOffset: number = 0): string {
  return getCuratedPhotoFallback(productName, category);
}

