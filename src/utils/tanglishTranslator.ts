/**
 * Comprehensive Tanglish to English Grocery Dictionary & Smart Matcher
 * Provides 100% offline, zero-quota, instant translation for Tamil/Tanglish grocery terms.
 * Never runs out of API limits.
 */

export interface TranslationResult {
  translated: string;
  matched: boolean;
  extractedQuantity?: string;
  source: 'dictionary' | 'gemini' | 'indic' | 'original';
}

// ── Dictionary Mapping ─────────────────────────────────────────────────────────
// Keys are normalized (lowercase, no punctuation, trimmed)
const TANGLISH_GROCERY_MAP: Record<string, string> = {
  // ── Oils, Fats & Ghee ──
  'thengai ennai': 'Coconut Oil',
  'thengai yennai': 'Coconut Oil',
  'thengai enna': 'Coconut Oil',
  'thenga ennai': 'Coconut Oil',
  'coconut oil': 'Coconut Oil',
  'nallenai': 'Sesame Oil (Gingelly Oil)',
  'nallennai': 'Sesame Oil (Gingelly Oil)',
  'nalla ennai': 'Sesame Oil (Gingelly Oil)',
  'gingelly oil': 'Sesame Oil (Gingelly Oil)',
  'sesame oil': 'Sesame Oil (Gingelly Oil)',
  'til oil': 'Sesame Oil (Gingelly Oil)',
  'kadalai ennai': 'Groundnut Oil',
  'kadalai yennai': 'Groundnut Oil',
  'kadala ennai': 'Groundnut Oil',
  'groundnut oil': 'Groundnut Oil',
  'peanut oil': 'Groundnut Oil',
  'sooriyaganthi ennai': 'Sunflower Oil',
  'sunflower ennai': 'Sunflower Oil',
  'sunflower oil': 'Sunflower Oil',
  'kadugu ennai': 'Mustard Oil',
  'kadugu yennai': 'Mustard Oil',
  'mustard oil': 'Mustard Oil',
  'vilakku ennai': 'Castor Oil',
  'aamanakku ennai': 'Castor Oil',
  'castor oil': 'Castor Oil',
  'nei': 'Pure Ghee',
  'ghee': 'Pure Ghee',
  'pasu nei': 'Pure Cow Ghee',
  'vennai': 'Butter',
  'butter': 'Butter',
  'dalda': 'Vanaspati (Dalda)',
  'vanaspati': 'Vanaspati (Dalda)',

  // ── Rice, Grains & Flours ──
  'arisi': 'Rice',
  'ari': 'Rice',
  'rice': 'Rice',
  'ponni arisi': 'Ponni Rice',
  'ponni rice': 'Ponni Rice',
  'basmati arisi': 'Basmati Rice',
  'basmati rice': 'Basmati Rice',
  'seeraga samba': 'Seeraga Samba Rice',
  'seeraga samba arisi': 'Seeraga Samba Rice',
  'jeera rice': 'Seeraga Samba Rice',
  'puzhungal arisi': 'Boiled Rice',
  'boiled rice': 'Boiled Rice',
  'pacharisi': 'Raw Rice',
  'pacha arisi': 'Raw Rice',
  'raw rice': 'Raw Rice',
  'idli arisi': 'Idli Rice',
  'idly arisi': 'Idli Rice',
  'idli rice': 'Idli Rice',
  'sivappu arisi': 'Red Rice',
  'kai kuthal arisi': 'Brown Rice (Hand Pounded Rice)',
  'brown rice': 'Brown Rice',
  'kothumai': 'Wheat',
  'godhumai': 'Wheat',
  'wheat': 'Wheat',
  'godhumai arisi': 'Whole Wheat Grains',
  'godhumai maavu': 'Wheat Flour (Atta)',
  'kothumai maavu': 'Wheat Flour (Atta)',
  'wheat flour': 'Wheat Flour (Atta)',
  'atta': 'Wheat Flour (Atta)',
  'maida': 'All Purpose Flour (Maida)',
  'maida maavu': 'All Purpose Flour (Maida)',
  'kadala maavu': 'Gram Flour (Besan)',
  'kadalai maavu': 'Gram Flour (Besan)',
  'besan': 'Gram Flour (Besan)',
  'gram flour': 'Gram Flour (Besan)',
  'arisi maavu': 'Rice Flour',
  'rice flour': 'Rice Flour',
  'rava': 'Semolina (Rava)',
  'ravai': 'Semolina (Rava)',
  'sooji': 'Semolina (Rava)',
  'semolina': 'Semolina (Rava)',
  'samba rava': 'Wheat Rava (Samba Rava)',
  'godhumai rava': 'Wheat Rava (Samba Rava)',
  'ragi': 'Ragi (Finger Millet)',
  'kelvaragu': 'Ragi (Finger Millet)',
  'kezhvaragu': 'Ragi (Finger Millet)',
  'ragi maavu': 'Ragi Flour',
  'kambu': 'Pearl Millet (Kambu)',
  'bajra': 'Pearl Millet (Kambu)',
  'cholam': 'Corn / Sorghum (Cholam)',
  'jowar': 'Sorghum (Jowar)',
  'makka cholam': 'Corn (Maize)',
  'aval': 'Poha (Flattened Rice)',
  'avul': 'Poha (Flattened Rice)',
  'poha': 'Poha (Flattened Rice)',
  'semiya': 'Vermicelli (Semiya)',
  'vermicelli': 'Vermicelli (Semiya)',
  'sevai': 'Rice Noodles (Sevai)',
  'javvarisi': 'Sago (Javvarisi)',
  'sabudana': 'Sago (Javvarisi)',
  'appalam': 'Papad (Appalam)',
  'pappadam': 'Papad (Appalam)',
  'vadagam': 'Vathal / Fryums (Vadagam)',
  'vathal': 'Vathal / Fryums',

  // ── Dals & Pulses (Paruppu) ──
  'paruppu': 'Toor Dal',
  'thuvaram paruppu': 'Toor Dal',
  'thuvarai paruppu': 'Toor Dal',
  'thoor dhal': 'Toor Dal',
  'toor dal': 'Toor Dal',
  'sambar paruppu': 'Toor Dal (Sambar Dal)',
  'ulunthu': 'Urad Dal',
  'ulutham paruppu': 'Urad Dal',
  'vellai ulunthu': 'White Urad Dal',
  'karuppu ulunthu': 'Black Urad Dal',
  'urad dal': 'Urad Dal',
  'pasi paruppu': 'Moong Dal',
  'paasi paruppu': 'Moong Dal',
  'moong dal': 'Moong Dal',
  'pachai payiru': 'Green Gram (Whole Moong)',
  'green gram': 'Green Gram',
  'kadala paruppu': 'Chana Dal',
  'kadalai paruppu': 'Chana Dal',
  'chana dal': 'Chana Dal',
  'kondakadalai': 'Chickpeas (Kondaikadalai)',
  'kondai kadalai': 'Chickpeas (Kondaikadalai)',
  'vellai sundal': 'White Chickpeas (Kabuli Chana)',
  'karuppu sundal': 'Black Chickpeas (Kala Chana)',
  'kabuli chana': 'Kabuli Chickpeas',
  'chickpeas': 'Chickpeas',
  'pottukadala': 'Roasted Gram (Pottukadalai)',
  'pottukadalai': 'Roasted Gram (Pottukadalai)',
  'porikadalai': 'Roasted Gram (Porikadalai)',
  'roasted gram': 'Roasted Gram',
  'verkkadalai': 'Peanuts (Groundnuts)',
  'verkadalai': 'Peanuts (Groundnuts)',
  'kadalai kaai': 'Groundnuts',
  'peanuts': 'Peanuts',
  'kollu': 'Horse Gram',
  'horse gram': 'Horse Gram',
  'thattai payiru': 'Cowpea / Black Eyed Peas',
  'karamani': 'Cowpea / Black Eyed Peas',
  'rajma': 'Kidney Beans (Rajma)',
  'pattani': 'Green Peas (Dry Peas)',
  'vellai pattani': 'White Dried Peas',
  'pachai pattani': 'Green Peas',
  'green peas': 'Green Peas',
  'soya chunks': 'Soya Chunks (Meal Maker)',
  'meal maker': 'Soya Chunks (Meal Maker)',

  // ── Spices, Podi & Masalas ──
  'kadugu': 'Mustard Seeds',
  'mustard': 'Mustard Seeds',
  'mustard seeds': 'Mustard Seeds',
  'seeragam': 'Cumin Seeds (Jeera)',
  'jeeragam': 'Cumin Seeds (Jeera)',
  'jeera': 'Cumin Seeds (Jeera)',
  'cumin': 'Cumin Seeds (Jeera)',
  'sombu': 'Fennel Seeds (Saunf)',
  'soambu': 'Fennel Seeds (Saunf)',
  'perunjeeragam': 'Fennel Seeds (Saunf)',
  'saunf': 'Fennel Seeds (Saunf)',
  'vendhayam': 'Fenugreek Seeds',
  'methi': 'Fenugreek Seeds',
  'fenugreek': 'Fenugreek Seeds',
  'milagu': 'Black Pepper',
  'black pepper': 'Black Pepper',
  'pepper': 'Black Pepper',
  'kurumilagu': 'Black Pepper',
  'manjal': 'Turmeric',
  'turmeric': 'Turmeric',
  'manjal thool': 'Turmeric Powder',
  'manjal podi': 'Turmeric Powder',
  'turmeric powder': 'Turmeric Powder',
  'milagai': 'Chilli',
  'pachai milagai': 'Green Chilli',
  'green chilli': 'Green Chilli',
  'kanja milagai': 'Dry Red Chilli',
  'vara milagai': 'Dry Red Chilli',
  'kaintha milagai': 'Dry Red Chilli',
  'red chilli': 'Dry Red Chilli',
  'milagai thool': 'Red Chilli Powder',
  'milagai podi': 'Red Chilli Powder',
  'chilli powder': 'Red Chilli Powder',
  'malli': 'Coriander Seeds',
  'kothamalli vithai': 'Coriander Seeds',
  'dhaniya': 'Coriander Seeds',
  'coriander seeds': 'Coriander Seeds',
  'malli thool': 'Coriander Powder',
  'malli podi': 'Coriander Powder',
  'kothamalli thool': 'Coriander Powder',
  'dhaniya powder': 'Coriander Powder',
  'coriander powder': 'Coriander Powder',
  'sambar thool': 'Sambar Powder',
  'sambar podi': 'Sambar Powder',
  'sambar powder': 'Sambar Powder',
  'rasam thool': 'Rasam Powder',
  'rasam podi': 'Rasam Powder',
  'rasam powder': 'Rasam Powder',
  'garam masala': 'Garam Masala',
  'garam masala thool': 'Garam Masala Powder',
  'garam masala podi': 'Garam Masala Powder',
  'biryani masala': 'Biryani Masala',
  'briyani masala': 'Biryani Masala',
  'chicken masala': 'Chicken Curry Masala',
  'mutton masala': 'Mutton Curry Masala',
  'fish masala': 'Fish Curry Masala',
  'perungayam': 'Asafoetida (Hing)',
  'asafoetida': 'Asafoetida (Hing)',
  'hing': 'Asafoetida (Hing)',
  'perungaya thool': 'Asafoetida Powder (Hing)',
  'perungaya podi': 'Asafoetida Powder (Hing)',
  'elakkai': 'Cardamom',
  'yelakkai': 'Cardamom',
  'elaichi': 'Cardamom',
  'cardamom': 'Cardamom',
  'lavangam': 'Cloves',
  'krambu': 'Cloves',
  'grambu': 'Cloves',
  'cloves': 'Cloves',
  'pattai': 'Cinnamon',
  'cinnamon': 'Cinnamon',
  'dalchini': 'Cinnamon',
  'biryani ilai': 'Bay Leaf',
  'brinji ilai': 'Bay Leaf',
  'bay leaf': 'Bay Leaf',
  'annasi poo': 'Star Anise',
  'star anise': 'Star Anise',
  'jathikai': 'Nutmeg',
  'nutmeg': 'Nutmeg',
  'kalpasi': 'Black Stone Flower (Kalpasi)',
  'kasakasa': 'Poppy Seeds (Khas Khas)',
  'poppy seeds': 'Poppy Seeds (Khas Khas)',
  'yellu': 'Sesame Seeds',
  'karuppu yellu': 'Black Sesame Seeds',
  'vellai yellu': 'White Sesame Seeds',
  'omam': 'Carom Seeds (Ajwain)',
  'ajwain': 'Carom Seeds (Ajwain)',
  'puli': 'Tamarind',
  'tamarind': 'Tamarind',
  'samayal puli': 'Cooking Tamarind',
  'uppu': 'Salt',
  'salt': 'Salt',
  'kallu uppu': 'Rock Salt (Crystal Salt)',
  'thool uppu': 'Table Salt (Powder Salt)',
  'indu uppu': 'Himalayan Pink Salt',
  'pink salt': 'Pink Salt',
  'poondu': 'Garlic',
  'vellai poondu': 'Garlic',
  'garlic': 'Garlic',
  'inji': 'Fresh Ginger',
  'ginger': 'Fresh Ginger',
  'inji poondu paste': 'Ginger Garlic Paste',
  'ginger garlic paste': 'Ginger Garlic Paste',

  // ── Sweeteners & Dry Fruits ──
  'sarkarai': 'Sugar',
  'sakkarai': 'Sugar',
  'sugar': 'Sugar',
  'vellai sarkarai': 'White Sugar',
  'naatu sarkarai': 'Country Sugar (Organic Cane Sugar)',
  'nattu sakkarai': 'Country Sugar (Organic Cane Sugar)',
  'brown sugar': 'Brown Sugar',
  'cane sugar': 'Cane Sugar',
  'vellam': 'Jaggery',
  'jaggery': 'Jaggery',
  'manda vellam': 'Round Jaggery Ball',
  'achu vellam': 'Cube Jaggery (Achu Vellam)',
  'karuppatti': 'Palm Jaggery (Karupatti)',
  'palm jaggery': 'Palm Jaggery',
  'kalkandu': 'Sugar Candy (Kalkandu)',
  'panamkarkandu': 'Palm Sugar Candy (Panamkarkandu)',
  'then': 'Pure Honey',
  'honey': 'Pure Honey',
  'mundhiri': 'Cashew Nuts',
  'cashew': 'Cashew Nuts',
  'cashew nuts': 'Cashew Nuts',
  'munthiri paruppu': 'Cashew Nuts',
  'badam': 'Almonds (Badam)',
  'almonds': 'Almonds (Badam)',
  'pista': 'Pistachios',
  'kismis': 'Raisins (Dry Grapes)',
  'thiratchai': 'Raisins (Dry Grapes)',
  'dry grapes': 'Raisins (Dry Grapes)',
  'raisins': 'Raisins',
  'pericham pazham': 'Dates',
  'perichai': 'Dates',
  'dates': 'Dates',
  'anjoor': 'Dry Figs (Anjeer)',
  'athi pazham': 'Figs',

  // ── Dairy & Beverages ──
  'paal': 'Milk',
  'pasum paal': 'Cow Milk',
  'milk': 'Milk',
  'tayir': 'Curd / Yogurt',
  'thayir': 'Curd / Yogurt',
  'curd': 'Curd / Yogurt',
  'moru': 'Buttermilk',
  'buttermilk': 'Buttermilk',
  'paneer': 'Paneer (Cottage Cheese)',
  'tea thool': 'Tea Powder',
  'tea podi': 'Tea Powder',
  'theila': 'Tea Powder',
  'tea powder': 'Tea Powder',
  'coffee thool': 'Coffee Powder',
  'coffee podi': 'Coffee Powder',
  'kaapi thool': 'Coffee Powder',
  'coffee powder': 'Coffee Powder',
  'boost': 'Boost Health Drink',
  'horlicks': 'Horlicks Health Drink',
  'bournvita': 'Bournvita Health Drink',

  // ── Vegetables & Fresh Produce ──
  'vengayam': 'Onion',
  'onion': 'Onion',
  'chinna vengayam': 'Small Shallots (Sambar Onion)',
  'small onion': 'Small Shallots (Sambar Onion)',
  'shallots': 'Small Shallots',
  'periya vengayam': 'Big Onion',
  'big onion': 'Big Onion',
  'thakkali': 'Tomato',
  'tomato': 'Tomato',
  'urulaikilangu': 'Potato',
  'urulai kilangu': 'Potato',
  'potato': 'Potato',
  'kathirikkai': 'Brinjal (Eggplant)',
  'brinjal': 'Brinjal (Eggplant)',
  'vendaikkai': 'Ladies Finger (Okra)',
  'vendakkai': 'Ladies Finger (Okra)',
  'ladies finger': 'Ladies Finger (Okra)',
  'okra': 'Ladies Finger (Okra)',
  'karuveppilai': 'Fresh Curry Leaves',
  'kariveppilai': 'Fresh Curry Leaves',
  'curry leaves': 'Fresh Curry Leaves',
  'kothamalli': 'Fresh Coriander Leaves',
  'kothamalli thazhai': 'Fresh Coriander Leaves',
  'coriander leaves': 'Fresh Coriander Leaves',
  'pudina': 'Fresh Mint Leaves',
  'pudina thazhai': 'Fresh Mint Leaves',
  'mint leaves': 'Fresh Mint Leaves',
  'mullangi': 'Radish',
  'radish': 'Radish',
  'carrot': 'Carrot',
  'beans': 'Beans',
  'muttaikose': 'Cabbage',
  'cabbage': 'Cabbage',
  'cauliflower': 'Cauliflower',
  'murungakkai': 'Drumstick',
  'drumstick': 'Drumstick',
  'surakkai': 'Bottle Gourd',
  'bottle gourd': 'Bottle Gourd',
  'peerkangai': 'Ridge Gourd',
  'ridge gourd': 'Ridge Gourd',
  'pudalangai': 'Snake Gourd',
  'snake gourd': 'Snake Gourd',
  'pavakkai': 'Bitter Gourd',
  'bitter gourd': 'Bitter Gourd',
  'vazhaikkai': 'Raw Banana (Plantain)',
  'raw banana': 'Raw Banana (Plantain)',
  'vazhaipoo': 'Banana Flower',
  'vazhaithandu': 'Banana Stem',
  'thengai': 'Fresh Coconut',
  'coconut': 'Fresh Coconut',
  'thengai mudi': 'Fresh Coconut Half',
  'elumichai': 'Lemon',
  'lemon': 'Lemon',
  'elumichampazham': 'Lemon',
  'keerai': 'Fresh Spinach / Greens',
  'spinach': 'Fresh Spinach',
  'palak': 'Palak Spinach',
  'pasalai keerai': 'Spinach',
  'murungai keerai': 'Moringa / Drumstick Leaves',
  'manathakkali keerai': 'Black Nightshade Greens',
  'sirukeerai': 'Amaranth Greens',
  'arakeerai': 'Arakeerai Greens',
  'ponnanganni keerai': 'Ponnanganni Greens',

  // ── Fruits ──
  'vazhaipazham': 'Banana',
  'banana': 'Banana',
  'sevvaazhai': 'Red Banana',
  'poovan pazham': 'Poovan Banana',
  'aapil': 'Apple',
  'apple': 'Apple',
  'koyyaka': 'Guava',
  'koyyapazham': 'Guava',
  'guava': 'Guava',
  'maambazham': 'Mango',
  'mango': 'Mango',
  'manga': 'Raw Mango',
  'raw mango': 'Raw Mango',
  'aaranja': 'Orange',
  'orange': 'Orange',
  'dharpoosani': 'Watermelon',
  'watermelon': 'Watermelon',
  'sapota': 'Sapota (Chiku)',
  'annasi': 'Pineapple',
  'pineapple': 'Pineapple',
  'papali': 'Papaya',
  'papaya': 'Papaya',
  'palaapazham': 'Jackfruit',
  'jackfruit': 'Jackfruit',
  'mathulai': 'Pomegranate',
  'pomegranate': 'Pomegranate',
  'drakshai': 'Fresh Grapes',
  'grapes': 'Fresh Grapes',

  // ── Household & Cleaning ──
  'thuni soappu': 'Laundry Detergent Soap',
  'washing soap': 'Laundry Detergent Soap',
  'surf powder': 'Detergent Washing Powder',
  'washing powder': 'Detergent Washing Powder',
  'detergent powder': 'Detergent Washing Powder',
  'kuliyal soappu': 'Bathing Soap',
  'soap': 'Bathing Soap',
  'bathing soap': 'Bathing Soap',
  'shampoo': 'Shampoo',
  'vilakku thiri': 'Cotton Wicks (Pooja Thiri)',
  'pooja thiri': 'Cotton Wicks (Pooja Thiri)',
  'agarbatti': 'Incense Sticks (Agarbatti)',
  'oothabathi': 'Incense Sticks (Agarbatti)',
  'karpooram': 'Camphor (Karpooram)',
  'theepetti': 'Matchbox',
  'matchbox': 'Matchbox',
  'biscuit': 'Biscuits',
  'biscuits': 'Biscuits',
  'bread': 'Bread',
  'muttai': 'Fresh Eggs',
  'mutta': 'Fresh Eggs',
  'eggs': 'Fresh Eggs',
  'nattu kozhi muttai': 'Country Chicken Eggs',
  'vim bar': 'Dishwash Bar Soap',
  'dishwash liquid': 'Dishwash Liquid Cleaner',
  'toilet cleaner': 'Toilet Cleaner Liquid',
  'floor cleaner': 'Floor Cleaner Liquid',
  'toothpaste': 'Toothpaste',
  'toothbrush': 'Toothbrush',
};

// ── Smart Quantity Extraction Helper ──
const QUANTITY_REGEX = /^(\d+(?:\.\d+)?\s*(?:kg|kilo|g|gram|grams|gm|l|litre|litres|liter|ltr|ml|packet|packets|pkt|pkts|bundle|bundles|piece|pieces|pcs|dozen|nos)?)\s+(.+)$/i;
const TRAILING_QUANTITY_REGEX = /^(.+?)\s+(\d+(?:\.\d+)?\s*(?:kg|kilo|g|gram|grams|gm|l|litre|litres|liter|ltr|ml|packet|packets|pkt|pkts|bundle|bundles|piece|pieces|pcs|dozen|nos)?)$/i;

function cleanString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fast offline dictionary lookup.
 * Automatically handles prefixes/suffixes, common misspellings, and quantity notation.
 */
export function lookupTanglishDictionary(input: string): { englishName: string; matched: boolean; quantity?: string } {
  if (!input || !input.trim()) {
    return { englishName: '', matched: false };
  }

  const raw = input.trim();
  let normalized = cleanString(raw);
  let extractedQty: string | undefined;

  // 1. Direct match
  if (TANGLISH_GROCERY_MAP[normalized]) {
    return { englishName: TANGLISH_GROCERY_MAP[normalized], matched: true };
  }

  // 2. Check for leading quantity: "1kg arisi" -> qty: "1kg", term: "arisi"
  const leadingMatch = raw.match(QUANTITY_REGEX);
  if (leadingMatch) {
    const qty = leadingMatch[1].trim();
    const term = cleanString(leadingMatch[2]);
    if (TANGLISH_GROCERY_MAP[term]) {
      return { englishName: TANGLISH_GROCERY_MAP[term], matched: true, quantity: qty };
    }
  }

  // 3. Check for trailing quantity: "arisi 2kg" -> term: "arisi", qty: "2kg"
  const trailingMatch = raw.match(TRAILING_QUANTITY_REGEX);
  if (trailingMatch) {
    const term = cleanString(trailingMatch[1]);
    const qty = trailingMatch[2].trim();
    if (TANGLISH_GROCERY_MAP[term]) {
      return { englishName: TANGLISH_GROCERY_MAP[term], matched: true, quantity: qty };
    }
  }

  // 4. Plural / Suffix handling ("arisigal" -> "arisi", "vengayams" -> "vengayam")
  if (normalized.endsWith('s') && TANGLISH_GROCERY_MAP[normalized.slice(0, -1)]) {
    return { englishName: TANGLISH_GROCERY_MAP[normalized.slice(0, -1)], matched: true };
  }
  if (normalized.endsWith('gal') && TANGLISH_GROCERY_MAP[normalized.slice(0, -3)]) {
    return { englishName: TANGLISH_GROCERY_MAP[normalized.slice(0, -3)], matched: true };
  }

  // 5. Common variation swaps
  const variation = normalized
    .replace(/\byennai\b/g, 'ennai')
    .replace(/\byelakkai\b/g, 'elakkai')
    .replace(/\bpodi\b/g, 'thool')
    .replace(/\bpowder\b/g, 'thool')
    .replace(/\bdal\b/g, 'paruppu')
    .replace(/\bdhal\b/g, 'paruppu')
    .replace(/\bsakkarai\b/g, 'sarkarai')
    .replace(/\bjeeragam\b/g, 'seeragam');

  if (TANGLISH_GROCERY_MAP[variation]) {
    return { englishName: TANGLISH_GROCERY_MAP[variation], matched: true };
  }

  return { englishName: raw, matched: false };
}
