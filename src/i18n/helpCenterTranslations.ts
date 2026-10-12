import { LanguageCode } from './types';

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQSection {
  id: string;
  title: string;
  blurb: string;
  items: FAQItem[];
}

export interface DeliveryOption {
  title: string;
  desc: string;
}

export interface CategoryItem {
  id: string;
  label: string;
}

export interface AccountTypes {
  customer: string;
  storeOwner: string;
  wholesaler: string;
  homeBusiness: string;
}

export interface ProductSearchTips {
  voiceSearch: string;
  scanList: string;
}

export interface HelpCenterData {
  clearBtn: string;
  showingResultsFor: string;
  noResultsFor: string;
  noResultsHint: string;
  accountTypes: AccountTypes;
  productSearchTips: ProductSearchTips;
  orderStepsKicker: string;
  deliveryFootnote: string;
  importantNoteLabel: string;
  supportCtaBadge: string;
  supportCtaTitle: string;
  supportCtaSubtitle: string;
  getInTouchBtn: string;
  sellersSectionTitle: string;
  sellersSectionBlurb: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  categories: CategoryItem[];
  faqSections: FAQSection[];
  orderGuideTitle: string;
  orderGuideSubtitle: string;
  orderSteps: string[];
  deliveryTitle: string;
  deliverySubtitle: string;
  deliveryOptions: DeliveryOption[];
  paymentsTitle: string;
  paymentsSubtitle: string;
  paymentMethods: string[];
  paymentNote: string;
  sellersTitle: string;
  sellersSubtitle: string;
  sellerFeatures: string[];
  accountTitle: string;
  supportTitle: string;
  supportSubtitle: string;
  supportHoursLabel: string;
  supportHoursValue: string;
  emailSupportTitle: string;
  emailSupportDesc: string;
  phoneSupportTitle: string;
  phoneSupportDesc: string;
  liveChatTitle: string;
  liveChatDesc: string;
  noResultsTitle: string;
  noResultsDesc: string;
  clearSearchBtn: string;
}

export const HELP_CENTER_DATA: Record<LanguageCode, HelpCenterData> = {
  en: {
    clearBtn: "Clear",
    showingResultsFor: "Showing results for",
    noResultsFor: "No results for",
    noResultsHint: "Try a different word, or browse a topic below.",
    accountTypes: {
      "customer": "Customer",
      "storeOwner": "Store Owner",
      "wholesaler": "Wholesaler",
      "homeBusiness": "Home Business"
},
    productSearchTips: {
      "voiceSearch": "Tap the mic to search by voice",
      "scanList": "Scan or upload a product list"
},
    orderStepsKicker: "How do I place an order?",
    deliveryFootnote: "Delivery availability, charges, and estimated delivery time may vary by store and location.",
    importantNoteLabel: "Important:",
    supportCtaBadge: "Still need help?",
    supportCtaTitle: "Contact support with your order ID and we'll take it from there.",
    supportCtaSubtitle: "Reach us through the support channel inside the app — include your order ID or relevant details whenever possible.",
    getInTouchBtn: "Get in touch",
    sellersSectionTitle: "Store Owner / Seller Help",
    sellersSectionBlurb: "Everything store owners, wholesalers, and home businesses can do.",
    eyebrow: "WE'RE HERE TO HELP",
    heroTitle: "Help Center",
    heroSubtitle: "Answers on shopping, stores, products, orders, payments, delivery, and your account — all in one place.",
    searchPlaceholder: 'Search topics or questions...',
    categories: [
      { id: "getting-started", label: "Getting Started" },
      { id: "finding-products", label: "Finding Products" },
      { id: "comparing-stores", label: "Comparing Stores" },
      { id: "orders", label: "Orders" },
      { id: "delivery", label: "Delivery" },
      { id: "payments", label: "Payments" },
      { id: "sellers", label: "For Sellers" },
      { id: "account-security", label: "Account & Security" },
      { id: "support", label: "Contact Support" },
    ],
    faqSections: [
      {
        id: "getting-started",
        title: "Getting Started",
        blurb: "Create your account and find your way around.",
        items: [
          {
            q: "What is Remise?",
            a: "Remise is an e-commerce and local shopping platform that connects customers with nearby stores, wholesalers, and home businesses. Search for products, compare prices from nearby sellers, choose a store, select a delivery method, and place an order.",
          },
          {
            q: "How do I create an account?",
            a: "Select Sign Up, enter your required details, verify your email or mobile number if requested, and complete your profile.",
          },
          {
            q: "What types of accounts are available?",
            a: "Customer, Store Owner, Wholesaler, and Home Business. Each account type has different features and pricing options.",
          },
        ],
      },
      {
        id: "finding-products",
        title: "Finding Products",
        blurb: "Search, speak, or scan — however you shop.",
        items: [
          {
            q: "How can I find a product?",
            a: "You can search for products using the search bar or browse categories.",
          },
          {
            q: "Can I search using my voice?",
            a: "Yes. Where voice search is available, tap the microphone icon and speak the product name or your requirements.",
          },
          {
            q: "Can I scan a product list?",
            a: "Yes. The product scanning feature allows you to scan or upload a list containing multiple products. Remise identifies the products and helps you add them to your order.",
          },
        ],
      },
      {
        id: "comparing-stores",
        title: "Comparing Nearby Stores",
        blurb: "Let Remise find the best price close to you.",
        items: [
          {
            q: "How does store comparison work?",
            a: "You provide your required products and select the distance within which Remise should search for stores. Remise then compares available nearby stores based on product availability and total price. You can select the store that best suits your requirements.",
          },
          {
            q: "Can I choose how far Remise searches?",
            a: "Yes. You can select the preferred search distance in kilometres before comparing stores.",
          },
        ],
      },
      {
        id: "orders",
        title: "Orders",
        blurb: "From cart to confirmation.",
        items: [
          {
            q: "Can I cancel an order?",
            a: "Cancellation depends on the order status and the applicable store cancellation policy. If cancellation is available, the option will be displayed in your order details.",
          },
        ],
      },
      {
        id: "account-security",
        title: "Account & Security",
        blurb: "Keep your details up to date and protected.",
        items: [
          {
            q: "What can I manage in my account?",
            a: "Profile information, addresses, password, email or mobile information, and account settings.",
          },
          {
            q: "Is it safe to share my password or OTP?",
            a: "Never share your password, OTP, or authentication credentials with anyone.",
          },
        ],
      },
    ],
    orderGuideTitle: "How to Order on Remise",
    orderGuideSubtitle: "A quick step-by-step to going from search to doorstep.",
    orderSteps: [
      "Enter or scan your product list",
      "Select the search distance",
      "Compare nearby stores",
      "Select a store",
      "Select your delivery method",
      "Select your payment method",
      "Confirm your order",
    ],
    deliveryTitle: "Delivery Options",
    deliverySubtitle: "Choose how you want to receive your order.",
    deliveryOptions: [
      {
        title: "Self Pickup",
        desc: "Visit the selected store and collect your order.",
      },
      {
        title: "Home Delivery",
        desc: "The selected store prepares and delivers the order to your specified address.",
      },
    ],
    paymentsTitle: "Payments & Pricing",
    paymentsSubtitle: "Clear, upfront pricing with multiple ways to pay.",
    paymentMethods: [
      "UPI / QR payment",
      "Online payment gateway",
      "Cash",
    ],
    paymentNote:
      "Always verify the payment amount and recipient details before completing a payment. For QR payments, the applicable store's payment QR code may be displayed during checkout.",
    sellersTitle: "For Store Owners & Sellers",
    sellersSubtitle: "Everything you need to run your store on Remise.",
    sellerFeatures: [
      "Create and manage their store",
      "Add products manually",
      "Scan products",
      "Bulk scan product lists",
      "Manage stock",
      "Set product prices",
      "Manage customer / store-owner pricing where applicable",
      "Manage UPI / payment details",
      "Receive customer orders",
      "Manage order status",
    ],
    accountTitle: "Account & Security",
    supportTitle: "Still Need Help?",
    supportSubtitle: "Our support team is available to assist customers and merchants across India.",
    supportHoursLabel: "Support Hours",
    supportHoursValue: "Mon – Sat, 9:00 AM – 8:00 PM IST",
    emailSupportTitle: "Email Support",
    emailSupportDesc: "Response within 24 hours",
    phoneSupportTitle: "Phone Support",
    phoneSupportDesc: "Toll-free customer helpline",
    liveChatTitle: "Live Chat",
    liveChatDesc: "Chat with our support team",
    noResultsTitle: "No answers found",
    noResultsDesc: "We couldn't find anything matching your search. Try another keyword or browse the topics.",
    clearSearchBtn: "Clear search",
  },

  ta: {
    clearBtn: "அழி",
    showingResultsFor: "இதற்கான முடிவுகள் காண்பிக்கப்படுகின்றன",
    noResultsFor: "இதற்கான முடிவுகள் எதுவும் இல்லை",
    noResultsHint: "வேறு வார்த்தையை முயற்சிக்கவும் அல்லது கீழே உள்ள தலைப்பை உலாவவும்.",
    accountTypes: {
      "customer": "வாடிக்கையாளர்",
      "storeOwner": "கடை உரிமையாளர்",
      "wholesaler": "மொத்த விற்பனையாளர்",
      "homeBusiness": "வீட்டு வணிகம்"
},
    productSearchTips: {
      "voiceSearch": "குரல் மூலம் தேட மைக்கை அழுத்தவும்",
      "scanList": "தயாரிப்பு பட்டியலை ஸ்கேன் அல்லது பதிவேற்றவும்"
},
    orderStepsKicker: "ஆர்டரை எவ்வாறு வழங்குவது?",
    deliveryFootnote: "டெலிவரி கிடைக்கும் தன்மை, கட்டணங்கள் மற்றும் மதிப்பிடப்பட்ட டெலிவரி நேரம் கடை மற்றும் இருப்பிடத்தைப் பொறுத்து மாறுபடலாம்.",
    importantNoteLabel: "முக்கியமானது:",
    supportCtaBadge: "இன்னும் உதவி தேவையா?",
    supportCtaTitle: "உங்கள் ஆர்டர் ஐடியுடன் ஆதரவைத் தொடர்பு கொள்ளுங்கள், நாங்கள் அங்கிருந்து பார்த்துக்கொள்கிறோம்.",
    supportCtaSubtitle: "பயன்பாட்டிலுள்ள ஆதரவு சேனல் மூலம் எங்களை தொடர்பு கொள்ளுங்கள் — முடிந்தவரை உங்கள் ஆர்டர் ஐடி அல்லது தொடர்புடைய விவரங்களை சேர்க்கவும்.",
    getInTouchBtn: "தொடர்பு கொள்ள",
    sellersSectionTitle: "கடை உரிமையாளர் / விற்பனையாளர் உதவி",
    sellersSectionBlurb: "கடை உரிமையாளர்கள், மொத்த விற்பனையாளர்கள் மற்றும் வீட்டு வணிகங்கள் செய்யக்கூடிய அனைத்தும்.",
    eyebrow: "உங்களுக்கு உதவ நாங்கள் இருக்கிறோம்",
    heroTitle: "உதவி மையம்",
    heroSubtitle: "ஷாப்பிங், கடைகள், தயாரிப்புகள், ஆர்டர்கள், கட்டணங்கள், டெலிவரி மற்றும் உங்கள் கணக்கு பற்றிய பதில்கள் — அனைத்தும் ஒரே இடத்தில்.",
    searchPlaceholder: 'தலைப்பைத் தேடுங்கள்...',
    categories: [
      { id: "getting-started", label: "தொடங்குதல்" },
      { id: "finding-products", label: "பொருட்களைக் கண்டறிதல்" },
      { id: "comparing-stores", label: "கடைகளை ஒப்பிடுதல்" },
      { id: "orders", label: "ஆர்டர்கள்" },
      { id: "delivery", label: "டெலிவரி" },
      { id: "payments", label: "கட்டணங்கள்" },
      { id: "sellers", label: "விற்பனையாளர்களுக்கு" },
      { id: "account-security", label: "கணக்கு & பாதுகாப்பு" },
      { id: "support", label: "ஆதரவைத் தொடர்பு கொள்ள" },
    ],
    faqSections: [
      {
        id: "getting-started",
        title: "தொடங்குதல்",
        blurb: "உங்கள் கணக்கை உருவாக்கி எளிதாகப் பயன்படுத்துங்கள்.",
        items: [
          {
            q: "ரெமிஸ் என்றால் என்ன?",
            a: "ரெமிஸ் என்பது வாடிக்கையாளர்களை அருகிலுள்ள கடைகள், மொத்த விற்பனையாளர்கள் மற்றும் இல்ல வணிகர்களுடன் இணைக்கும் ஒரு உள்ளூர் இ-காமர்ஸ் தளமாகும். பொருட்களைத் தேடவும், அருகிலுள்ள விற்பனையாளர்களிடமிருந்து விலைகளை ஒப்பிடவும், கடையைத் தேர்ந்தெடுக்கவும், டெலிவரி முறையைத் தேர்வுசெய்து ஆர்டர் செய்யவும் உதவுகிறது.",
          },
          {
            q: "கணக்கை எவ்வாறு உருவாக்குவது?",
            a: "பதிவுசெய்க (Sign Up) என்பதைத் தேர்வுசெய்து, தேவையான விவரங்களை உள்ளிட்டு, உங்கள் மின்னஞ்சல் அல்லது மொபைல் எண்ணை சரிபார்த்து சுயவிவரத்தை முடிக்கவும்.",
          },
          {
            q: "எந்த வகையான கணக்குகள் கிடைக்கின்றன?",
            a: "வாடிக்கையாளர், கடை உரிமையாளர், மொத்த விற்பனையாளர் மற்றும் இல்ல வணிகர். ஒவ்வொரு கணக்கு வகையிலும் வெவ்வேறு வசதிகள் உள்ளன.",
          },
        ],
      },
      {
        id: "finding-products",
        title: "பொருட்களைக் கண்டறிதல்",
        blurb: "தேடுங்கள், பேசுங்கள் அல்லது ஸ்கேன் செய்யுங்கள்.",
        items: [
          {
            q: "தயாரிப்பை எவ்வாறு கண்டுபிடிப்பது?",
            a: "தேடல் பட்டியைப் பயன்படுத்தி தயாரிப்புகளைத் தேடலாம் அல்லது பிரிவுகளை உலாவலாம்.",
          },
          {
            q: "குரல் மூலம் தேட முடியுமா?",
            a: "ஆம். குரல் தேடல் கிடைக்கும் இடங்களில் மைக்ரோஃபோன் ஐகானைத் தட்டி தயாரிப்பு பெயரைப் பேசலாம்.",
          },
          {
            q: "தயாரிப்பு பட்டியலை ஸ்கேன் செய்ய முடியுமா?",
            a: "ஆம். பல தயாரிப்புகளைக் கொண்ட பட்டியலை ஸ்கேன் செய்து அல்லது பதிவேற்றி ரெமிஸ் மூலம் உங்கள் ஆர்டரில் சேர்க்கலாம்.",
          },
        ],
      },
      {
        id: "comparing-stores",
        title: "அருகிலுள்ள கடைகளை ஒப்பிடுதல்",
        blurb: "ரெமிஸ் உங்களுக்கு சிறந்த விலையைக் கண்டறிய உதவும்.",
        items: [
          {
            q: "கடைகள் ஒப்பீடு எவ்வாறு செயல்படுகிறது?",
            a: "உங்களுக்குத் தேவையான பொருட்களை வழங்கி தேடல் தூரத்தைத் தேர்வுசெய்யலாம். தயாரிப்பு இருப்பு மற்றும் மொத்த விலையின் அடிப்படையில் கடைகளை ரெமிஸ் ஒப்பிடுகிறது.",
          },
          {
            q: "தேடல் தூரத்தை நான் தேர்ந்தெடுக்க முடியுமா?",
            a: "ஆம். கடைகளை ஒப்பிடுவதற்கு முன் கிலோமீட்டரில் உங்களுக்கு விருப்பமான தூரத்தைத் தேர்ந்தெடுக்கலாம்.",
          },
        ],
      },
      {
        id: "orders",
        title: "ஆர்டர்கள்",
        blurb: "கூடையில் இருந்து உறுதிப்படுத்தல் வரை.",
        items: [
          {
            q: "ஆர்டரை ரத்து செய்ய முடியுமா?",
            a: "ரத்து செய்வது ஆர்டர் நிலை மற்றும் கடையின் ரத்துக் கொள்கையைப் பொறுத்தது. ரத்து செய்யும் வசதி இருந்தால் உங்கள் ஆர்டர் விவரங்களில் காண்பிக்கப்படும்.",
          },
        ],
      },
      {
        id: "account-security",
        title: "கணக்கு & பாதுகாப்பு",
        blurb: "உங்கள் விவரங்களைப் பாதுகாப்பாக வைத்திருங்கள்.",
        items: [
          {
            q: "எனது கணக்கில் எவற்றை நிர்வகிக்கலாம்?",
            a: "சுயவிவர தகவல், முகவரிகள், கடவுச்சொல், மின்னஞ்சல்/மொபைல் மற்றும் கணக்கு அமைப்புகள்.",
          },
          {
            q: "கடவுச்சொல் அல்லது OTP-யை பகிர்வது பாதுகாப்பானதா?",
            a: "உங்கள் கடவுச்சொல், OTP அல்லது அங்கீகார விவரங்களை யாரிடமும் ஒருபோதும் பகிர வேண்டாம்.",
          },
        ],
      },
    ],
    orderGuideTitle: "ரெமிஸில் எவ்வாறு ஆர்டர் செய்வது",
    orderGuideSubtitle: "தேடலில் இருந்து உங்கள் வாசல் வரை செல்வதற்கான எளிய வழிகாட்டி.",
    orderSteps: [
      "தயாரிப்பு பட்டியலை உள்ளிடவும் அல்லது ஸ்கேன் செய்யவும்",
      "தேடல் தூரத்தைத் தேர்ந்தெடுக்கவும்",
      "அருகிலுள்ள கடைகளை ஒப்பிடவும்",
      "ஒரு கடையைத் தேர்ந்தெடுக்கவும்",
      "டெலிவரி முறையைத் தேர்ந்தெடுக்கவும்",
      "கட்டண முறையைத் தேர்ந்தெடுக்கவும்",
      "உங்கள் ஆர்டரை உறுதிப்படுத்தவும்",
    ],
    deliveryTitle: "டெலிவரி விருப்பங்கள்",
    deliverySubtitle: "உங்கள் ஆர்டரை எவ்வாறு பெற விரும்புகிறீர்கள் என்பதைத் தேர்வுசெய்க.",
    deliveryOptions: [
      {
        title: "சுய பிக்கப்",
        desc: "தேர்ந்தெடுக்கப்பட்ட கடைக்குச் சென்று உங்கள் ஆர்டரைப் பெற்றுக் கொள்ளுங்கள்.",
      },
      {
        title: "ஹோம் டெலிவரி",
        desc: "தேர்ந்தெடுக்கப்பட்ட கடை உங்கள் ஆர்டரைத் தயாரித்து குறிப்பிட்ட முகவரிக்கு வழங்குகிறது.",
      },
    ],
    paymentsTitle: "கட்டணங்கள் மற்றும் விலை விவரங்கள்",
    paymentsSubtitle: "பல்வேறு வழிகளில் செலுத்துவதற்கான தெளிவான, வெளிப்படையான கட்டண முறை.",
    paymentMethods: [
      "யுபிஐ / க்யூஆர் கட்டணம்",
      "ஆன்லைன் கட்டண நுழைவாயில்",
      "ரொக்கம் (Cash)",
    ],
    paymentNote:
      "கட்டணத்தை முடிப்பதற்கு முன் எப்போதும் கட்டணத் தொகை மற்றும் பெறுநரின் விவரங்களைச் சரிபார்க்கவும். க்யூஆர் கட்டணங்களுக்கு, செக் அவுட்டின் போது கடையின் க்யூஆர் குறியீடு காட்டப்படலாம்.",
    sellersTitle: "கடை உரிமையாளர்கள் மற்றும் விற்பனையாளர்களுக்காக",
    sellersSubtitle: "ரெமிஸில் உங்கள் கடையை நடத்த தேவையான அனைத்தும்.",
    sellerFeatures: [
      "தங்கள் கடையை உருவாக்கி நிர்வகித்தல்",
      "தயாரிப்புகளை கைமுறையாக சேர்த்தல்",
      "தயாரிப்புகளை ஸ்கேன் செய்தல்",
      "தயாரிப்பு பட்டியல்களை மொத்தமாக ஸ்கேன் செய்தல்",
      "இருப்பை நிர்வகித்தல்",
      "தயாரிப்பு விலைகளை நிர்ணயித்தல்",
      "வாடிக்கையாளர் / கடை உரிமையாளர் விலைகளை நிர்வகித்தல்",
      "யுபிஐ / கட்டண விவரங்களை நிர்வகித்தல்",
      "வாடிக்கையாளர் ஆர்டர்களைப் பெறுதல்",
      "ஆர்டர் நிலையை நிர்வகித்தல்",
    ],
    accountTitle: "கணக்கு & பாதுகாப்பு",
    supportTitle: "இன்னும் உதவி தேவையா?",
    supportSubtitle: "இந்தியா முழுவதும் உள்ள வாடிக்கையாளர்கள் மற்றும் வணிகர்களுக்கு உதவ எங்கள் ஆதரவுக் குழு தயாராக உள்ளது.",
    supportHoursLabel: "ஆதரவு நேரம்",
    supportHoursValue: "திங்கள் – சனி, காலை 9:00 – இரவு 8:00 IST",
    emailSupportTitle: "மின்னஞ்சல் ஆதரவு",
    emailSupportDesc: "24 மணி நேரத்திற்குள் பதில்",
    phoneSupportTitle: "தொலைபேசி ஆதரவு",
    phoneSupportDesc: "கட்டணமில்லா வாடிக்கையாளர் உதவி எண்",
    liveChatTitle: "நேரலை அரட்டை",
    liveChatDesc: "எங்கள் ஆதரவுக் குழுவுடன் அரட்டையடிக்கவும்",
    noResultsTitle: "பதில்கள் எதுவும் கிடைக்கவில்லை",
    noResultsDesc: "உங்கள் தேடலுடன் பொருந்தக்கூடிய எதுவும் கிடைக்கவில்லை. மற்றொரு முக்கிய வார்த்தையை முயற்சிக்கவும்.",
    clearSearchBtn: "தேடலை அழிக்கவும்",
  },

  te: {
    clearBtn: "క్లియర్",
    showingResultsFor: "ఫలితాలు చూపబడుతున్నాయి",
    noResultsFor: "ఫలితాలు ఏవీ కనుగొనబడలేదు",
    noResultsHint: "మరొక పదాన్ని ప్రయత్నించండి లేదా క్రింది అంశాన్ని బ్రౌజ్ చేయండి.",
    accountTypes: {
      "customer": "కస్టమర్",
      "storeOwner": "స్టోర్ యజమాని",
      "wholesaler": "హోల్‌సేలర్",
      "homeBusiness": "హోమ్ వ్యాపారం"
},
    productSearchTips: {
      "voiceSearch": "వాయిస్ ద్వారా శోధించడానికి మైక్‌ను నొక్కండి",
      "scanList": "ఉత్పత్తి జాబితాను స్కాన్ లేదా అప్‌లోడ్ చేయండి"
},
    orderStepsKicker: "ఆర్డర్ ఎలా ఇవ్వాలి?",
    deliveryFootnote: "డెలివరీ లభ్యత, ఛార్జీలు మరియు అంచనా వేసిన డెలివరీ సమయం స్టోర్ మరియు స్థానాన్ని బట్టి మారవచ్చు.",
    importantNoteLabel: "ముఖ్యమైనది:",
    supportCtaBadge: "ఇంకా సహాయం కావాలా?",
    supportCtaTitle: "మీ ఆర్డర్ ఐడీతో సపోర్ట్‌ను సంప్రదించండి, మేము మిగిలినది చూసుకుంటాము.",
    supportCtaSubtitle: "యాప్‌లోని సపోర్ట్ ఛానల్ ద్వారా మమ్మల్ని సంప్రదించండి — వీలైనప్పుడల్లా మీ ఆర్డర్ ఐడీ లేదా సంబంధిత వివరాలను చేర్చండి.",
    getInTouchBtn: "సంప్రదించండి",
    sellersSectionTitle: "స్టోర్ యజమాని / విక్రేత సహాయం",
    sellersSectionBlurb: "స్టోర్ యజమానులు, హోల్‌సేలర్లు మరియు గృಹ వ్యాపారాలు చేయగల ప్రతిదీ.",
    eyebrow: "మీకు సహాయం చేయడానికి మేము ఇక్కడ ఉన్నాము",
    heroTitle: "సహాయ కేంద్రం",
    heroSubtitle: "షాపింగ్, దుకాణాలు, ఉత్పత్తులు, ఆర్డర్లు, చెల్లింపులు, డెలివరీ మరియు మీ ఖాతా గురించిన సమాధానాలు — అన్నీ ఒకే చోట.",
    searchPlaceholder: 'విషయాలు లేదా ప్రశ్నలను వెతకండి...',
    categories: [
      { id: "getting-started", label: "ప్రారంభించడం" },
      { id: "finding-products", label: "ఉత్పత్తులను కనుగొనడం" },
      { id: "comparing-stores", label: "దుకాణాలను పోల్చడం" },
      { id: "orders", label: "ఆర్డర్లు" },
      { id: "delivery", label: "డెలివరీ" },
      { id: "payments", label: "చెల్లింపులు" },
      { id: "sellers", label: "విక్రేతల కోసం" },
      { id: "account-security", label: "ఖాతా & భద్రత" },
      { id: "support", label: "మద్దతును సంప్రదించండి" },
    ],
    faqSections: [
      {
        id: "getting-started",
        title: "ప్రారంభించడం",
        blurb: "మీ ఖాతాను సృష్టించండి మరియు సులభంగా ఉపయోగించండి.",
        items: [
          {
            q: "రెమిస్ అంటే ఏమిటి?",
            a: "రెమిస్ అనేది కస్టమర్లను సమీపంలోని దుకాణాలు, హోల్‌సేలర్లు మరియు గృహ వ్యాపారాలతో అనుసంధానించే స్థానిక షాపింగ్ ప్లాట్‌ఫారమ్.",
          },
          {
            q: "ఖాతాను ఎలా సృష్టించాలి?",
            a: "సైన్ అప్ ఎంచుకోండి, అవసరమైన వివరాలను నమోదు చేసి, మీ ఇమెయిల్ లేదా మొబైల్ నంబర్‌ను ధృవీకరించండి.",
          },
          {
            q: "ఏ రకమైన ఖాతాలు అందుబాటులో ఉన్నాయి?",
            a: "కస్టమర్, స్టోర్ ఓనర్, హోల్‌సేలర్ మరియు హోమ్ బిజినెస్.",
          },
        ],
      },
      {
        id: "finding-products",
        title: "ఉత్పత్తులను కనుగొనడం",
        blurb: "శోధించండి, మాట్లాడండి లేదా స్కాన్ చేయండి.",
        items: [
          {
            q: "ఉత్పత్తిని ఎలా కనుగొనాలి?",
            a: "మీరు శోధన పట్టీని ఉపయోగించి ఉత్పత్తులను శోధించవచ్చు లేదా వర్గాలను బ్రౌజ్ చేయవచ్చు.",
          },
          {
            q: "వాయిస్ ద్వారా శోధించవచ్చా?",
            a: "అవును, మైక్రోఫోన్ చిహ్నాన్ని నొక్కడం ద్వారా వాయిస్ శోధన చేయవచ్చు.",
          },
          {
            q: "ఉత్పత్తి జాబితాను స్కాన్ చేయవచ్చా?",
            a: "అవును, ఉత్పత్తుల జాబితాను స్కాన్ చేసి నేరుగా ఆర్డర్ చేయవచ్చు.",
          },
        ],
      },
      {
        id: "comparing-stores",
        title: "సమీప దుకాణాలను పోల్చడం",
        blurb: "రెమిస్ ఉత్తమ ధరను కనుగొనడంలో సహాయపడుతుంది.",
        items: [
          {
            q: "స్టోర్ పోలిక ఎలా పనిచేస్తుంది?",
            a: "మీకు అవసరమైన ఉత్పత్తులను ఎంచుకుని, దూరాన్ని బట్టి లభ్యత మరియు ధరల ఆధారంగా దుకాణాలను పోల్చవచ్చు.",
          },
          {
            q: "శోధన దూరాన్ని నేను ఎంచుకోవచ్చా?",
            a: "అవును, కిలోమీటర్లలో శోధన దూరాన్ని ఎంచుకోవచ్చు.",
          },
        ],
      },
      {
        id: "orders",
        title: "ఆర్డర్లు",
        blurb: "కార్ట్ నుండి నిర్ధారణ వరకు.",
        items: [
          {
            q: "ఆర్డర్‌ను రద్దు చేయవచ్చా?",
            a: "రద్దు చేయడం ఆర్డర్ స్థితి మరియు దుకాణపు విధానంపై ఆధారపడి ఉంటుంది.",
          },
        ],
      },
      {
        id: "account-security",
        title: "ఖాతా & భద్రత",
        blurb: "మీ వివరాలను సురక్షితంగా ఉంచండి.",
        items: [
          {
            q: "ఖాతాలో వేటిని నిర్వహించవచ్చు?",
            a: "ప్రొఫైల్, చిరునామాలు, పాస్‌వర్డ్ మరియు సెట్టింగ్‌లు.",
          },
          {
            q: "పాస్‌వర్డ్ లేదా OTP ని పంచుకోవడం సురక్షితమేనా?",
            a: "మీ పాస్‌వర్డ్ లేదా OTP ని ఎవరితోనూ పంచుకోవద్దు.",
          },
        ],
      },
    ],
    orderGuideTitle: "రెమిస్‌లో ఎలా ఆర్డర్ చేయాలి",
    orderGuideSubtitle: "శోధన నుండి మీ ఇంటి వద్దకు చేరుకోవడానికి త్వరిత దశల మార్గదర్శి.",
    orderSteps: [
      "ఉత్పత్తి జాబితాను నమోదు చేయండి లేదా స్కాన్ చేయండి",
      "శోధన దూరాన్ని ఎంచుకోండి",
      "సమీప దుకాణాలను పోల్చండి",
      "దుకాణాన్ని ఎంచుకోండి",
      "డెలివరీ విధానాన్ని ఎంచుకోండి",
      "చెల్లింపు విధానాన్ని ఎంచుకోండి",
      "మీ ఆర్డర్‌ను నిర్ధారించండి",
    ],
    deliveryTitle: "డెలివరీ ఎంపికలు",
    deliverySubtitle: "మీ ఆర్డర్‌ను ఎలా స్వీకరించాలనుకుంటున్నారో ఎంచుకోండి.",
    deliveryOptions: [
      { title: "సెల్ఫ్ పికప్", desc: "ఎంచుకున్న దుకాణానికి వెళ్లి మీ ఆర్డర్‌ను తీసుకోండి." },
      { title: "హోమ్ డెలివరీ", desc: "దుకాణం మీ చిరునామాకు ఆర్డర్‌ను డెలివరీ చేస్తుంది." },
    ],
    paymentsTitle: "చెల్లింపులు & ధరల విధానం",
    paymentsSubtitle: "స్పష్టమైన, ముందస్తు ధరలతో బహుళ చెల్లింపు మార్గాలు.",
    paymentMethods: [
      "UPI / QR చెల్లింపు",
      "ఆన్‌లైన్ చెల్లింపు గేట్‌వే",
      "నగదు (Cash)",
    ],
    paymentNote:
      "చెల్లింపు పూర్తి చేసే ముందు ఎల్లప్పుడూ మొత్తం మరియు స్వీకర్త వివరాలను తనిఖీ చేయండి.",
    sellersTitle: "స్టోర్ యజమానులు & విక్రేతల కోసం",
    sellersSubtitle: "రెమిస్‌లో మీ దుకాణాన్ని నిర్వహించడానికి అవసరమైనవన్నీ.",
    sellerFeatures: [
      "స్టోర్‌ను సృష్టించడం మరియు నిర్వహించడం",
      "ఉత్పత్తులను జోడించడం",
      "ఉత్పత్తులను స్కాన్ చేయడం",
      "బల్క్ స్కానింగ్",
      "స్టాక్ నిర్వహణ",
      "ధరల నిర్ణయం",
      "కస్టమర్ ధరల నిర్వహణ",
      "UPI వివరాల నిర్వహణ",
      "ఆర్డర్‌లను స్వీకరించడం",
      "ఆర్డర్ స్థితిని నిర్వహించడం",
    ],
    accountTitle: "ఖాతా & భద్రత",
    supportTitle: "ఇంకా సహాయం కావాలా?",
    supportSubtitle: "భారతదేశం అంతటా కస్టమర్‌లు మరియు వ్యాపారులకు సహాయం చేయడానికి మా మద్దతు బృందం అందుబాటులో ఉంది.",
    supportHoursLabel: "మద్దతు వేళలు",
    supportHoursValue: "సోమ – శని, ఉదయం 9:00 – రాత్రి 8:00 IST",
    emailSupportTitle: "ఇమెయిల్ మద్దతు",
    emailSupportDesc: "24 గంటల్లో సమాధానం",
    phoneSupportTitle: "ఫోన్ మద్దతు",
    phoneSupportDesc: "టోల్-ఫ్రీ కస్టమర్ హెల్ప్‌లైన్",
    liveChatTitle: "లైవ్ చాట్",
    liveChatDesc: "మా మద్దతు బృందంతో చాట్ చేయండి",
    noResultsTitle: "ఫలితాలు ఏవీ కనుగొనబడలేదు",
    noResultsDesc: "మీ శోధనకు సరిపోయే ఏ సమాధానం దొరకలేదు.",
    clearSearchBtn: "శోధనను క్లియర్ చేయండి",
  },

  ml: {
    clearBtn: "മായ്ക്കുക",
    showingResultsFor: "ഫലങ്ങൾ കാണിക്കുന്നു",
    noResultsFor: "ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല",
    noResultsHint: "മറ്റൊരു വാക്ക് ശ്രമിക്കുക, അല്ലെങ്കിൽ താഴെയുള്ള വിഷയം ബ്രൗസ് ചെയ്യുക.",
    accountTypes: {
      "customer": "ഉപഭോക്താവ്",
      "storeOwner": "സ്റ്റോർ ഉടമ",
      "wholesaler": "മൊത്തവ്യാപാരി",
      "homeBusiness": "ഗാർഹിക ബിസിനസ്"
},
    productSearchTips: {
      "voiceSearch": "ശബ്ദത്തിലൂടെ തിരയാൻ മൈക്ക് അമർത്തുക",
      "scanList": "ഉൽപ്പന്ന ലിസ്റ്റ് സ്കാൻ ചെയ്യുക അല്ലെങ്കിൽ അപ്‌ലോഡ് ചെയ്യുക"
},
    orderStepsKicker: "ഒരു ഓർഡർ എങ്ങനെ നൽകാം?",
    deliveryFootnote: "ഡെലിവറി ലഭ്യത, നിരക്കുകൾ, കണക്കാക്കിയ ഡെലിവറി സമയം എന്നിവ സ്റ്റോറിനെയും ലൊക്കേഷനെയും ആശ്രയിച്ച് വ്യത്യാസപ്പെടാം.",
    importantNoteLabel: "പ്രധാനപ്പെട്ടത്:",
    supportCtaBadge: "ഇപ്പോഴും സഹായം ആവശ്യമുണ്ടോ?",
    supportCtaTitle: "നിങ്ങളുടെ ഓർഡർ ഐഡിയുമായി സപ്പോർട്ടുമായി ബന്ധപ്പെടുക, ബാക്കി ഞങ്ങൾ കൈകാര്യം ചെയ്യാം.",
    supportCtaSubtitle: "ആപ്പിലെ സപ്പോർട്ട് ചാനലിലൂടെ ഞങ്ങളെ ബന്ധപ്പെടുക — സാധ്യമാകുമ്പോഴെല്ലാം നിങ്ങളുടെ ഓർഡർ ഐഡിയോ പ്രസക്തമായ വിവരങ്ങളോ നൽകുക.",
    getInTouchBtn: "ബന്ധപ്പെടുക",
    sellersSectionTitle: "സ്റ്റോർ ഉടമ / വിൽപ്പനക്കാരൻ സഹായം",
    sellersSectionBlurb: "സ്റ്റോർ ഉടമകൾക്കും മൊത്തവ്യാപാരികൾക്കും ഗാർഹിക ബിസിനസുകൾക്കും ചെയ്യാൻ കഴിയുന്ന കാര്യങ്ങൾ.",
    eyebrow: "ഞങ്ങൾ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്",
    heroTitle: "സഹായ കേന്ദ്രം",
    heroSubtitle: "ഷോപ്പിംഗ്, സ്റ്റോറുകൾ, ഉൽപ്പന്നങ്ങൾ, ഓർഡറുകൾ, പേയ്‌മെന്റുകൾ, ഡെലിവറി, അക്കൗണ്ട് എന്നിവയെക്കുറിച്ചുള്ള വിവരങ്ങൾ — എല്ലാം ഒരിടത്ത്.",
    searchPlaceholder: 'വിഷയങ്ങൾ തിരയുക...',
    categories: [
      { id: "getting-started", label: "തുടങ്ങാം" },
      { id: "finding-products", label: "ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താം" },
      { id: "comparing-stores", label: "സ്റ്റോറുകൾ താരതമ്യം ചെയ്യാം" },
      { id: "orders", label: "ഓർഡറുകൾ" },
      { id: "delivery", label: "ഡെലിവറി" },
      { id: "payments", label: "പേയ്‌മെന്റുകൾ" },
      { id: "sellers", label: "വ്യാപാരികൾക്കായി" },
      { id: "account-security", label: "അക്കൗണ്ടും സുരക്ഷയും" },
      { id: "support", label: "സപ്പോർട്ട്" },
    ],
    faqSections: [
      {
        id: "getting-started",
        title: "തുടങ്ങാം",
        blurb: "അക്കൗണ്ട് ഉണ്ടാക്കി എളുപ്പത്തിൽ ഉപയോഗിക്കാം.",
        items: [
          {
            q: "എന്താണ് റെമിസ്?",
            a: "ഉപഭോക്താക്കളെ അടുത്തുള്ള സ്റ്റോറുകളുമായും വ്യാപാരികളുമായും ബന്ധിപ്പിക്കുന്ന പ്രാദേശിക ഇ-കൊമേഴ്‌സ് പ്ലാറ്റ്‌ഫോമാണ് റെമിസ്.",
          },
          {
            q: "എങ്ങനെ അക്കൗണ്ട് ഉണ്ടാക്കാം?",
            a: "സൈൻ അപ്പ് തിരഞ്ഞെടുത്ത് വിവരങ്ങൾ നൽകി അക്കൗണ്ട് പൂർത്തിയാക്കാം.",
          },
          {
            q: "ഏതൊക്കെ തരം അക്കൗണ്ടുകൾ ലഭ്യമാണ്?",
            a: "കസ്റ്റമർ, സ്റ്റോർ ഉടമ, മൊത്തക്കച്ചവടക്കാരൻ, ഹോം ബിസിനസ്സ്.",
          },
        ],
      },
      {
        id: "finding-products",
        title: "ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താം",
        blurb: "തിരയുക, സംസാരിക്കുക അല്ലെങ്കിൽ സ്കാൻ ചെയ്യുക.",
        items: [
          {
            q: "ഉൽപ്പന്നങ്ങൾ എങ്ങനെ കണ്ടെത്താം?",
            a: "സെർച്ച് ബാർ വഴിയോ കാറ്റഗറികൾ വഴിയോ സാധനങ്ങൾ കണ്ടെത്താം.",
          },
          {
            q: "വോയ്സ് വഴി തിരയാൻ സാധിക്കുമോ?",
            a: "അതെ, മൈക്രോഫോൺ ഐക്കൺ വഴി വോയ്സ് സെർച്ച് ചെയ്യാം.",
          },
          {
            q: "ലിസ്റ്റ് സ്കാൻ ചെയ്യാൻ സാധിക്കുമോ?",
            a: "അതെ, ഉൽപ്പന്ന ലിസ്റ്റ് സ്കാൻ ചെയ്ത് ഓർഡറിലേക്ക് ചേർക്കാം.",
          },
        ],
      },
      {
        id: "comparing-stores",
        title: "സ്റ്റോറുകൾ താരതമ്യം ചെയ്യാം",
        blurb: "മികച്ച വില കണ്ടെത്താൻ റെമിസ് സഹായിക്കുന്നു.",
        items: [
          {
            q: "സ്റ്റോർ താരതമ്യം എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
            a: "സാധനങ്ങൾ നൽകി ദൂരപരിധിക്കുള്ളിലെ സ്റ്റോറുകളിലെ ലഭ്യതയും ആകെ വിലയും താരതമ്യം ചെയ്യാം.",
          },
          {
            q: "തിരയൽ ദൂരം തിരഞ്ഞെടുക്കാൻ കഴിയുമോ?",
            a: "അതെ, കിലോമീറ്ററിൽ ദൂരം തിരഞ്ഞെടുക്കാം.",
          },
        ],
      },
      {
        id: "orders",
        title: "ഓർഡറുകൾ",
        blurb: "കാർട്ട് മുതൽ സ്ഥിരീകരണം വരെ.",
        items: [
          {
            q: "ഓർഡർ റദ്ദാക്കാൻ സാധിക്കുമോ?",
            a: "ഓർഡർ സ്റ്റാറ്റസിനെയും കടയുടെ പോളിസിയെയും ആശ്രയിച്ചിരിക്കും.",
          },
        ],
      },
      {
        id: "account-security",
        title: "അക്കൗണ്ടും സുരക്ഷയും",
        blurb: "വിവരങ്ങൾ സുരക്ഷിതമായി സൂക്ഷിക്കുക.",
        items: [
          {
            q: "അക്കൗണ്ടിൽ എന്തൊക്കെ കൈകാര്യം ചെയ്യാം?",
            a: "പ്രൊഫൈൽ, വിലാസങ്ങൾ, പാസ്‌വേഡ്, സെറ്റിംഗ്സ്.",
          },
          {
            q: "പാസ്‌വേഡോ OTP-യോ പങ്കിടാമോ?",
            a: "ഒരിക്കലും പാസ്‌വേഡോ OTP-യോ മറ്റാരുമായും പങ്കിടരുത്.",
          },
        ],
      },
    ],
    orderGuideTitle: "റെമിസിൽ എങ്ങനെ ഓർഡർ ചെയ്യാം",
    orderGuideSubtitle: "തിരയൽ മുതൽ ഡെലിവറി വരെയുള്ള ഘട്ടങ്ങൾ.",
    orderSteps: [
      "ഉൽപ്പന്ന ലിസ്റ്റ് നൽകുകയോ സ്കാൻ ചെയ്യുകയോ ചെയ്യുക",
      "തിരയൽ ദൂരം തിരഞ്ഞെടുക്കുക",
      "അടുത്തുള്ള സ്റ്റോറുകൾ താരതമ്യം ചെയ്യുക",
      "സ്റ്റോർ തിരഞ്ഞെടുക്കുക",
      "ഡെലിവറി രീതി തിരഞ്ഞെടുക്കുക",
      "പേയ്‌മെന്റ് രീതി തിരഞ്ഞെടുക്കുക",
      "ഓർഡർ സ്ഥിരീകരിക്കുക",
    ],
    deliveryTitle: "ഡെലിവറി ഓപ്ഷനുകൾ",
    deliverySubtitle: "ഓർഡർ എങ്ങനെ സ്വീകരിക്കണമെന്ന് തിരഞ്ഞെടുക്കുക.",
    deliveryOptions: [
      { title: "സ്വയം പിക്കപ്പ്", desc: "സ്റ്റോറിൽ നേരിട്ടെത്തി സാധനങ്ങൾ വാങ്ങുക." },
      { title: "ഹോം ഡെലിവറി", desc: "നിങ്ങളുടെ വിലാസത്തിലേക്ക് സാധനങ്ങൾ എത്തിക്കുന്നു." },
    ],
    paymentsTitle: "പേയ്‌മെന്റുകളും നിരക്കുകളും",
    paymentsSubtitle: "സുതാര്യമായ നിരക്കുകളും വിവിധ പേയ്‌മെന്റ് രീതികളും.",
    paymentMethods: [
      "UPI / QR പേയ്‌മെന്റ്",
      "ഓൺലൈൻ പേയ്‌മെന്റ് ഗേറ്റ്‌വേ",
      "ക്യാഷ് (Cash)",
    ],
    paymentNote:
      "പേയ്‌മെന്റ് പൂർത്തിയാക്കുന്നതിന് മുൻപ് തുകയും വിവരങ്ങളും പരിശോധിക്കുക.",
    sellersTitle: "വ്യാപാരികൾക്കായി",
    sellersSubtitle: "റെമിസിൽ നിങ്ങളുടെ സ്റ്റോർ വിജയകരമായി നടത്താൻ ആവശ്യമായതെല്ലാം.",
    sellerFeatures: [
      "സ്റ്റോർ സൃഷ്ടിക്കുകയും കൈകാര്യം ചെയ്യുകയും ചെയ്യുക",
      "ഉൽപ്പന്നങ്ങൾ ചേർക്കുക",
      "ഉൽപ്പന്നങ്ങൾ സ്കാൻ ചെയ്യുക",
      "ബൾക്ക് സ്കാനിംഗ്",
      "സ്റ്റോക്ക് നിയന്ത്രണം",
      "വില നിശ്ചയിക്കൽ",
      "ഉപഭോക്തൃ വില നിയന്ത്രണം",
      "UPI വിവരങ്ങൾ നൽകൽ",
      "ഓർഡറുകൾ സ്വീകരിക്കൽ",
      "ഓർഡർ സ്റ്റാറ്റസ് നിയന്ത്രണം",
    ],
    accountTitle: "അക്കൗണ്ടും സുരക്ഷയും",
    supportTitle: "കൂടുതൽ സഹായം ആവശ്യമുണ്ടോ?",
    supportSubtitle: "ഞങ്ങളുടെ സപ്പോർട്ട് ടീം നിങ്ങളെ സഹായിക്കാൻ തയ്യാറാണ്.",
    supportHoursLabel: "പ്രവർത്തന സമയം",
    supportHoursValue: "തിങ്കൾ – ശനി, രാവിലെ 9:00 – വൈകിട്ട് 8:00 IST",
    emailSupportTitle: "ഇമെയിൽ സപ്പോർട്ട്",
    emailSupportDesc: "24 മണിക്കൂറിനുള്ളിൽ മറുപടി",
    phoneSupportTitle: "ഫോൺ സപ്പോർട്ട്",
    phoneSupportDesc: "ടോൾ ഫ്രീ കസ്റ്റമർ ഹെൽപ്പ്‌ലൈൻ",
    liveChatTitle: "തത്സമയ ചാറ്റ്",
    liveChatDesc: "സപ്പോർട്ട് ടീമുമായി ചാറ്റ് ചെയ്യുക",
    noResultsTitle: "ഉത്തരങ്ങളൊന്നും കണ്ടെത്താനായില്ല",
    noResultsDesc: "നിങ്ങളുടെ തിരയലിന് അനുയോജ്യമായ ഫലങ്ങളൊന്നുമില്ല.",
    clearSearchBtn: "തിരയൽ മായ്‌ക്കുക",
  },

  kn: {
    clearBtn: "ತೆರವುಗೊಳಿಸಿ",
    showingResultsFor: "ಫಲಿತಾಂಶಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    noResultsFor: "ಯಾವುದೇ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ",
    noResultsHint: "ಬೇರೆ ಪದವನ್ನು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಕೆಳಗಿನ ವಿಷಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
    accountTypes: {
      "customer": "ಗ್ರಾಹಕ",
      "storeOwner": "ಅಂಗಡಿ ಮಾಲೀಕ",
      "wholesaler": "ಸಗಟು ವ್ಯಾಪಾರಿ",
      "homeBusiness": "ಮನೆ ವ್ಯಾಪಾರ"
},
    productSearchTips: {
      "voiceSearch": "ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಲು ಮೈಕ್ ಒತ್ತಿರಿ",
      "scanList": "ಉತ್ಪನ್ನ ಪಟ್ಟಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"
},
    orderStepsKicker: "ಆರ್ಡರ್ ಮಾಡುವುದು ಹೇಗೆ?",
    deliveryFootnote: "ಡೆಲಿವರಿ ಲಭ್ಯತೆ, ಶುಲ್ಕಗಳು ಮತ್ತು ಅಂದಾಜು ಡೆಲಿವರಿ ಸಮಯವು ಅಂಗಡಿ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಬದಲಾಗಬಹುದು.",
    importantNoteLabel: "ಮುಖ್ಯ ಸೂಚನೆ:",
    supportCtaBadge: "ಇನ್ನೂ ಸಹಾಯ ಬೇಕೇ?",
    supportCtaTitle: "ನಿಮ್ಮ ಆರ್ಡರ್ ಐಡಿಯೊಂದಿಗೆ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ, ಮುಂದಿನದನ್ನು ನಾವು ನಿರ್ವಹಿಸುತ್ತೇವೆ.",
    supportCtaSubtitle: "ಆ್ಯಪ್‌ನಲ್ಲಿರುವ ಬೆಂಬಲ ಚಾನಲ್ ಮೂಲಕ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ — ಸಾಧ್ಯವಾದಾಗಲೆಲ್ಲಾ ನಿಮ್ಮ ಆರ್ಡರ್ ಐಡಿ ಅಥವಾ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.",
    getInTouchBtn: "ಸಂಪರ್ಕಿಸಿ",
    sellersSectionTitle: "ಅಂಗಡಿ ಮಾಲೀಕ / ಮಾರಾಟಗಾರರ ಬೆಂಬಲ",
    sellersSectionBlurb: "ಅಂಗಡಿ ಮಾಲೀಕರು, ಸಗಟು ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಮನೆ ವ್ಯಾಪಾರಗಳು ಮಾಡಬಹುದಾದ ಎಲ್ಲವೂ.",
    eyebrow: "ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇವೆ",
    heroTitle: "ಸಹಾಯ ಕೇಂದ್ರ",
    heroSubtitle: "ಶಾಪಿಂಗ್, ಅಂಗಡಿಗಳು, ಉತ್ಪನ್ನಗಳು, ಆರ್ಡರ್‌ಗಳು, ಪಾವತಿಗಳು, ಡೆಲಿವರಿ ಮತ್ತು ನಿಮ್ಮ ಖಾತೆಯ ಕುರಿತಾದ ಉತ್ತರಗಳು — ಎಲ್ಲವೂ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ.",
    searchPlaceholder: 'ವಿಷಯಗಳನ್ನು ಹುಡುಕಿ...',
    categories: [
      { id: "getting-started", label: "ಪ್ರಾರಂಭಿಸುವುದು" },
      { id: "finding-products", label: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕುವುದು" },
      { id: "comparing-stores", label: "ಅಂಗಡಿಗಳನ್ನು ಹೋಲಿಸುವುದು" },
      { id: "orders", label: "ಆರ್ಡರ್‌ಗಳು" },
      { id: "delivery", label: "ಡೆಲಿವರಿ" },
      { id: "payments", label: "ಪಾವತಿಗಳು" },
      { id: "sellers", label: "ಮಾರಾಟಗಾರರಿಗಾಗಿ" },
      { id: "account-security", label: "ಖಾತೆ & ಭದ್ರತೆ" },
      { id: "support", label: "ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ" },
    ],
    faqSections: [
      {
        id: "getting-started",
        title: "ಪ್ರಾರಂಭಿಸುವುದು",
        blurb: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಬಳಸಿ.",
        items: [
          {
            q: "ರೆಮಿಸ್ ಎಂದರೇನು?",
            a: "ರೆಮಿಸ್ ಗ್ರಾಹಕರನ್ನು ಸಮೀಪದ ಅಂಗಡಿಗಳು, ಸಗಟು ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಗೃಹ ವ್ಯವಹಾರಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಸ್ಥಳೀಯ ಶಾಪಿಂಗ್ ವೇದಿಕೆಯಾಗಿದೆ.",
          },
          {
            q: "ಖಾತೆಯನ್ನು ರಚಿಸುವುದು ಹೇಗೆ?",
            a: "ಸೈನ್ ಅಪ್ ಆಯ್ಕೆಮಾಡಿ, ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ.",
          },
          {
            q: "ಯಾವ ರೀತಿಯ ಖಾತೆಗಳು ಲಭ್ಯವಿವೆ?",
            a: "ಗ್ರಾಹಕ, ಅಂಗಡಿ ಮಾಲೀಕ, ಸಗಟು ವ್ಯಾಪಾರಿ ಮತ್ತು ಗೃಹ ವ್ಯವಹಾರ.",
          },
        ],
      },
      {
        id: "finding-products",
        title: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕುವುದು",
        blurb: "ಹುಡುಕಿ, ಮಾತನಾಡಿ ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
        items: [
          {
            q: "ಉತ್ಪನ್ನವನ್ನು ಹೇಗೆ ಕಂಡುಹಿಡಿಯುವುದು?",
            a: "ಹುಡುಕಾಟ ಪಟ್ಟಿಯನ್ನು ಬಳಸಿ ಅಥವಾ ವರ್ಗಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.",
          },
          {
            q: "ಧ್ವನಿಯ ಮೂಲಕ ಹುಡುಕಬಹುದೇ?",
            a: "ಹೌದು, ಮೈಕ್ರೊಫೋನ್ ಐಕಾನ್ ಒತ್ತಿ ಧ್ವನಿ ಹುಡುಕಾಟ ಮಾಡಬಹುದು.",
          },
          {
            q: "ಉತ್ಪನ್ನ ಪಟ್ಟಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದೇ?",
            a: "ಹೌದು, ಪಟ್ಟಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಸುಲಭವಾಗಿ ಆರ್ಡರ್ ಮಾಡಬಹುದು.",
          },
        ],
      },
      {
        id: "comparing-stores",
        title: "ಅಂಗಡಿಗಳನ್ನು ಹೋಲಿಸುವುದು",
        blurb: "ಉತ್ತಮ ಬೆಲೆ ಹುಡುಕಲು ರೆಮಿಸ್ ನೆರವಾಗುತ್ತದೆ.",
        items: [
          {
            q: "ಅಂಗಡಿ ಹೋಲಿಕೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?",
            a: "ಉತ್ಪನ್ನಗಳು ಮತ್ತು ದೂರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಲಭ್ಯತೆ ಮತ್ತು ಬೆಲೆಯನ್ನು ಹೋಲಿಸಬಹುದು.",
          },
          {
            q: "ಹುಡುಕಾಟ ದೂರವನ್ನು ನಾನು ಆರಿಸಬಹುದೇ?",
            a: "ಹೌದು, ಕಿಲೋಮೀಟರ್‌ಗಳಲ್ಲಿ ದೂರವನ್ನು ಆರಿಸಬಹುದು.",
          },
        ],
      },
      {
        id: "orders",
        title: "ಆರ್ಡರ್‌ಗಳು",
        blurb: "ಕಾರ್ಟ್‌ನಿಂದ ದೃಢೀಕರಣದವರೆಗೆ.",
        items: [
          {
            q: "ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಬಹುದೇ?",
            a: "ರದ್ದತಿಯು ಆರ್ಡರ್ ಸ್ಥಿತಿ ಮತ್ತು ಅಂಗಡಿಯ ನೀತಿಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.",
          },
        ],
      },
      {
        id: "account-security",
        title: "ಖಾತೆ & ಭದ್ರತೆ",
        blurb: "ವಿವರಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.",
        items: [
          {
            q: "ಖಾತೆಯಲ್ಲಿ ಏನನ್ನು ನಿರ್ವಹಿಸಬಹುದು?",
            a: "ಪ್ರೊಫೈಲ್, ವಿಳಾಸಗಳು, ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು.",
          },
          {
            q: "ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳುವುದು ಸುರಕ್ಷಿತವೇ?",
            a: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ OTP ಯನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
          },
        ],
      },
    ],
    orderGuideTitle: "ರೆಮಿಸ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡುವುದು ಹೇಗೆ",
    orderGuideSubtitle: "ಹುಡುಕಾಟದಿಂದ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿನವರೆಗೆ ತ್ವರಿತ ಹಂತಗಳ ಮಾರ್ಗದರ್ಶಿ.",
    orderSteps: [
      "ಉತ್ಪನ್ನ ಪಟ್ಟಿಯನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      "ಹುಡುಕಾಟ ದೂರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "ಸಮೀಪದ ಅಂಗಡಿಗಳನ್ನು ಹೋಲಿಸಿ",
      "ಅಂಗಡಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "ಡೆಲಿವರಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ",
    ],
    deliveryTitle: "ಡೆಲಿವರಿ ಆಯ್ಕೆಗಳು",
    deliverySubtitle: "ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು ಹೇಗೆ ಸ್ವೀಕರಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ಆರಿಸಿ.",
    deliveryOptions: [
      { title: "ಸ್ವಯಂ ಪಿಕಪ್", desc: "ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ ನಿಮ್ಮ ಆರ್ಡರ್ ಪಡೆದುಕೊಳ್ಳಿ." },
      { title: "ಮನೆ ಡೆಲಿವರಿ", desc: "ಅಂಗಡಿಯು ನಿಮ್ಮ ವಿಳಾಸಕ್ಕೆ ಆರ್ಡರ್ ತಲುಪಿಸುತ್ತದೆ." },
    ],
    paymentsTitle: "ಪಾವತಿಗಳು ಮತ್ತು ಬೆಲೆ ವಿವರ",
    paymentsSubtitle: "ಸ್ಪಷ್ಟ ಮತ್ತು ಪಾರದರ್ಶಕ ಪಾವತಿ ವಿಧಾನಗಳು.",
    paymentMethods: [
      "UPI / QR ಪಾವತಿ",
      "ಆನ್‌ಲೈನ್ ಪಾವತಿ ಗೇಟ್‌ವೇ",
      "ನಗದು (Cash)",
    ],
    paymentNote:
      "ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸುವ ಮೊದಲು ಮೊತ್ತ ಮತ್ತು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    sellersTitle: "ಅಂಗಡಿ ಮಾಲೀಕರು ಮತ್ತು ಮಾರಾಟಗಾರರಿಗಾಗಿ",
    sellersSubtitle: "ರೆಮಿಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು ನಡೆಸಲು ಅಗತ್ಯವಿರುವ ಎಲ್ಲವೂ.",
    sellerFeatures: [
      "ಅಂಗಡಿ ರಚಿಸುವುದು ಮತ್ತು ನಿರ್ವಹಿಸುವುದು",
      "ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸುವುದು",
      "ಉತ್ಪನ್ನಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡುವುದು",
      "ಬಲ್ಕ್ ಸ್ಕ್ಯಾನಿಂಗ್",
      "ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ",
      "ಬೆಲೆ ನಿಗದಿಪಡಿಸುವುದು",
      "ಗ್ರಾಹಕ ಬೆಲೆ ನಿರ್ವಹಣೆ",
      "UPI ವಿವರಗಳ ನಿರ್ವಹಣೆ",
      "ಆರ್ಡರ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸುವುದು",
      "ಆರ್ಡರ್ ಸ್ಥಿತಿ ನಿರ್ವಹಣೆ",
    ],
    accountTitle: "ಖಾತೆ & ಭದ್ರತೆ",
    supportTitle: "ಇನ್ನಷ್ಟು ಸಹಾಯ ಬೇಕೇ?",
    supportSubtitle: "ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಮ್ಮ ಬೆಂಬಲ ತಂಡವು ಸದಾ ಸಿದ್ಧವಾಗಿದೆ.",
    supportHoursLabel: "ಬೆಂಬಲ ಸಮಯ",
    supportHoursValue: "ಸೋಮ – ಶನಿ, ಬೆಳಿಗ್ಗೆ 9:00 – ರಾತ್ರಿ 8:00 IST",
    emailSupportTitle: "ಇಮೇಲ್ ಬೆಂಬಲ",
    emailSupportDesc: "24 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯೆ",
    phoneSupportTitle: "ದೂರವಾಣಿ ಬೆಂಬಲ",
    phoneSupportDesc: "ಟೋಲ್-ಫ್ರೀ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ",
    liveChatTitle: "ಲೈವ್ ಚಾಟ್",
    liveChatDesc: "ನಮ್ಮ ಬೆಂಬಲ ತಂಡದೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
    noResultsTitle: "ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    noResultsDesc: "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಫಲಿತಾಂಶವಿಲ್ಲ.",
    clearSearchBtn: "ಹುಡುಕಾಟವನ್ನು ತೆರವುಗೊಳಿಸಿ",
  },

  hi: {
    clearBtn: "साफ़ करें",
    showingResultsFor: "परिणाम दिखाए जा रहे हैं",
    noResultsFor: "कोई परिणाम नहीं मिला",
    noResultsHint: "कोई अन्य शब्द आज़माएं, या नीचे दिए गए विषयों को देखें।",
    accountTypes: {
      "customer": "ग्राहक",
      "storeOwner": "दुकानदार / स्टोर मालिक",
      "wholesaler": "थोक व्यापारी",
      "homeBusiness": "गृह व्यवसाय"
},
    productSearchTips: {
      "voiceSearch": "आवाज से खोजने के लिए माइक दबाएं",
      "scanList": "उत्पाद सूची को स्कैन या अपलोड करें"
},
    orderStepsKicker: "ऑर्डर कैसे करें?",
    deliveryFootnote: "डिलीवरी की उपलब्धता, शुल्क और अनुमानित डिलीवरी समय स्टोर और स्थान के अनुसार भिन्न हो सकते हैं।",
    importantNoteLabel: "महत्वपूर्ण:",
    supportCtaBadge: "क्या अभी भी मदद चाहिए?",
    supportCtaTitle: "अपनी ऑर्डर आईडी के साथ सहायता टीम से संपर्क करें और हम बाकी संभाल लेंगे।",
    supportCtaSubtitle: "ऐप के भीतर सहायता चैनल के माध्यम से हमसे संपर्क करें — जब भी संभव हो अपनी ऑर्डर आईडी या प्रासंगिक विवरण शामिल करें।",
    getInTouchBtn: "संपर्क करें",
    sellersSectionTitle: "स्टोर मालिक / विक्रेता सहायता",
    sellersSectionBlurb: "स्टोर मालिकों, थोक व्यापारियों और गृह व्यवसायों के लिए सभी सुविधाएं।",
    eyebrow: "हम आपकी सहायता के लिए यहां हैं",
    heroTitle: "सहायता केंद्र",
    heroSubtitle: "खरीदारी, स्टोर, उत्पाद, ऑर्डर, भुगतान, डिलीवरी और आपके खाते से संबंधित सभी उत्तर — एक ही स्थान पर।",
    searchPlaceholder: 'विषय या प्रश्न खोजें...',
    categories: [
      { id: "getting-started", label: "शुरुआत करें" },
      { id: "finding-products", label: "उत्पाद खोजना" },
      { id: "comparing-stores", label: "स्टोर तुलना" },
      { id: "orders", label: "ऑर्डर" },
      { id: "delivery", label: "डिलीवरी" },
      { id: "payments", label: "भुगतान" },
      { id: "sellers", label: "विक्रेताओं के लिए" },
      { id: "account-security", label: "खाता और सुरक्षा" },
      { id: "support", label: "सहायता संपर्क" },
    ],
    faqSections: [
      {
        id: "getting-started",
        title: "शुरुआत करें",
        blurb: "अपना खाता बनाएं और आसानी से उपयोग करें।",
        items: [
          {
            q: "रेमिस क्या है?",
            a: "रेमिस एक स्थानीय ई-कॉमर्स प्लेटफॉर्म है जो ग्राहकों को नजदीकी दुकानों, थोक विक्रेताओं और घरेलू व्यवसायों से जोड़ता है।",
          },
          {
            q: "खाता कैसे बनाएं?",
            a: "साइन अप चुनें, विवरण दर्ज करें और अपनी प्रोफ़ाइल पूरी करें।",
          },
          {
            q: "किस प्रकार के खाते उपलब्ध हैं?",
            a: "ग्राहक, स्टोर मालिक, थोक विक्रेता और घरेलू व्यवसाय।",
          },
        ],
      },
      {
        id: "finding-products",
        title: "उत्पाद खोजना",
        blurb: "खोजें, बोलें या स्कैन करें।",
        items: [
          {
            q: "उत्पाद कैसे खोजें?",
            a: "सर्च बार या श्रेणियों के माध्यम से उत्पाद खोज सकते हैं।",
          },
          {
            q: "क्या वॉइस सर्च उपलब्ध है?",
            a: "हाँ, माइक्रोफ़ोन आइकन पर टैप करके बोलकर खोज सकते हैं।",
          },
          {
            q: "क्या उत्पाद सूची स्कैन कर सकते हैं?",
            a: "हाँ, पूरी सूची को स्कैन करके ऑर्डर में जोड़ सकते हैं।",
          },
        ],
      },
      {
        id: "comparing-stores",
        title: "स्टोर तुलना",
        blurb: "रेमिस आपको सर्वोत्तम मूल्य खोजने में मदद करता है।",
        items: [
          {
            q: "स्टोर तुलना कैसे काम करती है?",
            a: "सामान और दूरी चुनकर उपलब्धता और कुल कीमत की तुलना कर सकते हैं।",
          },
          {
            q: "क्या मैं खोज दूरी चुन सकता हूँ?",
            a: "हाँ, किलोमीटर में अपनी पसंद की दूरी चुन सकते हैं।",
          },
        ],
      },
      {
        id: "orders",
        title: "ऑर्डर",
        blurb: "कार्ट से पुष्टि तक।",
        items: [
          {
            q: "क्या ऑर्डर रद्द कर सकते हैं?",
            a: "रद्दीकरण ऑर्डर की स्थिति और स्टोर की नीति पर निर्भर करता है।",
          },
        ],
      },
      {
        id: "account-security",
        title: "खाता और सुरक्षा",
        blurb: "अपनी जानकारी सुरक्षित रखें।",
        items: [
          {
            q: "खाते में क्या प्रबंधित कर सकते हैं?",
            a: "प्रोफ़ाइल, पते, पासवर्ड और सेटिंग्स।",
          },
          {
            q: "पासवर्ड या OTP साझा करना सुरक्षित है?",
            a: "अपना पासवर्ड या OTP कभी किसी के साथ साझा न करें।",
          },
        ],
      },
    ],
    orderGuideTitle: "रेमिस पर ऑर्डर कैसे करें",
    orderGuideSubtitle: "खोज से लेकर डिलीवरी तक के त्वरित चरण।",
    orderSteps: [
      "उत्पाद सूची दर्ज करें या स्कैन करें",
      "खोज दूरी चुनें",
      "पास की दुकानों की तुलना करें",
      "एक स्टोर चुनें",
      "डिलीवरी का तरीका चुनें",
      "भुगतान का तरीका चुनें",
      "अपने ऑर्डर की पुष्टि करें",
    ],
    deliveryTitle: "डिलीवरी विकल्प",
    deliverySubtitle: "चुनें कि आप अपना ऑर्डर कैसे प्राप्त करना चाहते हैं।",
    deliveryOptions: [
      { title: "स्वयं पिकअप", desc: "स्टोर पर जाकर अपना ऑर्डर प्राप्त करें।" },
      { title: "होम डिलीवरी", desc: "स्टोर आपके पते पर ऑर्डर पहुंचाता है।" },
    ],
    paymentsTitle: "भुगतान और मूल्य निर्धारण",
    paymentsSubtitle: "भुगतान के कई आसान और पारदर्शी विकल्प।",
    paymentMethods: [
      "UPI / QR भुगतान",
      "ऑनलाइन भुगतान गेटवे",
      "नकद (Cash)",
    ],
    paymentNote:
      "भुगतान पूरा करने से पहले हमेशा राशि और विवरण की पुष्टि करें।",
    sellersTitle: "स्टोर मालिकों और विक्रेताओं के लिए",
    sellersSubtitle: "रेमिस पर अपना स्टोर चलाने के लिए आवश्यक सभी सुविधाएं।",
    sellerFeatures: [
      "स्टोर बनाना और प्रबंधित करना",
      "उत्पाद जोड़ना",
      "उत्पाद स्कैन करना",
      "थोक स्कैनिंग",
      "स्टॉक प्रबंधन",
      "मूल्य निर्धारण",
      "ग्राहक मूल्य निर्धारण",
      "UPI विवरण प्रबंधन",
      "ऑर्डर प्राप्त करना",
      "ऑर्डर स्थिति प्रबंधन",
    ],
    accountTitle: "खाता और सुरक्षा",
    supportTitle: "क्या अब भी सहायता चाहिए?",
    supportSubtitle: "हमारी सहायता टीम आपकी मदद के लिए सदैव उपलब्ध है।",
    supportHoursLabel: "सहायता समय",
    supportHoursValue: "सोमवार – शनिवार, सुबह 9:00 – रात 8:00 IST",
    emailSupportTitle: "ईमेल सहायता",
    emailSupportDesc: "24 घंटे के भीतर प्रतिक्रिया",
    phoneSupportTitle: "फ़ोन सहायता",
    phoneSupportDesc: "टोल-फ्री कस्टमर हेल्पलाइन",
    liveChatTitle: "लाइव चैट",
    liveChatDesc: "हमारी सहायता टीम से चैट करें",
    noResultsTitle: "कोई परिणाम नहीं मिला",
    noResultsDesc: "आपकी खोज से मेल खाता कोई उत्तर नहीं मिला।",
    clearSearchBtn: "खोज साफ़ करें",
  },
};

export function getHelpCenterData(lang: LanguageCode): HelpCenterData {
  return HELP_CENTER_DATA[lang] || HELP_CENTER_DATA.en;
}
