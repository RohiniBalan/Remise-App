import { LanguageCode } from './types';

export interface SitemapLinkLabels {
  home: string;
  allProducts: string;
  categories: string;
  newArrivals: string;
  bestSellers: string;
  offers: string;
  searchProducts: string;
  bulkPurchase: string;
  storeOwner: string;
  wholesaler: string;
  homeBusiness: string;
  businessRegistration: string;
  businessLogin: string;
  storeDashboard: string;
  becomeSeller: string;
  storeManagement: string;
  aboutUs: string;
  careers: string;
  blogsNews: string;
  press: string;
  contactUs: string;
  helpCenter: string;
  faq: string;
  returnsRefunds: string;
  orderSupport: string;
  paymentSupport: string;
  contactSupport: string;
  login: string;
  register: string;
  myProfile: string;
  myAccount: string;
  myOrders: string;
  savedAddresses: string;
  wishlist: string;
  cart: string;
  savedCart: string;
  privacyPolicy: string;
  termsOfService: string;
  returnsPolicy: string;
}

export interface SitemapData {
  eyebrow: string;
  heroTitle: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  shopTitle: string;
  shopDesc: string;
  businessTitle: string;
  businessDesc: string;
  companyTitle: string;
  companyDesc: string;
  aboutTitle: string;
  aboutDesc: string;
  supportTitle: string;
  supportDesc: string;
  helpTitle: string;
  helpDesc: string;
  accountTitle: string;
  accountDesc: string;
  legalTitle: string;
  legalDesc: string;
  quickNavTitle: string;
  quickNavSubtitle: string;
  quickNavGroups: {
    main: string;
    discover: string;
    business: string;
    help: string;
  };
  linkLabels: SitemapLinkLabels;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaVisitHelp: string;
  ctaContactUs: string;
}

export const SITEMAP_DATA: Record<LanguageCode, SitemapData> = {
  en: {
    eyebrow: "Sitemap",
    heroTitle: "Sitemap",
    heroTitleLead: "Everything on Remise, ",
    heroTitleAccent: "all in one place",
    heroSubtitle: "Explore the main sections, shopping features, business services, support resources, and company information available on Remise.",
    shopTitle: "Shop",
    shopDesc: "Discover and shop products on Remise.",
    businessTitle: "For Businesses",
    businessDesc: "Grow your business with Remise.",
    companyTitle: "Company",
    companyDesc: "Learn more about Remise and our journey.",
    aboutTitle: "About Remise",
    aboutDesc: "Learn about our mission and journey.",
    supportTitle: "Support",
    supportDesc: "Need help? Find answers and useful resources.",
    helpTitle: "Help & Support",
    helpDesc: "We're here to help you anytime.",
    accountTitle: "Account",
    accountDesc: "Manage your profile and orders.",
    legalTitle: "Legal & Policies",
    legalDesc: "Review our policies and legal terms.",
    quickNavTitle: "Looking for something specific?",
    quickNavSubtitle: "A quick shortcut to the most-used pages.",
    quickNavGroups: {
      main: "Shop",
      discover: "Discover",
      business: "Business",
      help: "Help",
    },
    linkLabels: {
      home: "Home",
      allProducts: "All Products",
      categories: "Categories",
      newArrivals: "New Arrivals",
      bestSellers: "Best Sellers",
      offers: "Offers",
      searchProducts: "Search Products",
      bulkPurchase: "Bulk Purchase",
      storeOwner: "Store Owner",
      wholesaler: "Wholesaler",
      homeBusiness: "Home Business",
      businessRegistration: "Business Registration",
      businessLogin: "Business Login",
      storeDashboard: "Store Dashboard",
      becomeSeller: "Become a Seller",
      storeManagement: "Store Management",
      aboutUs: "About Us",
      careers: "Careers",
      blogsNews: "Blogs & News",
      press: "Press",
      contactUs: "Contact Us",
      helpCenter: "Help Center",
      faq: "Frequently Asked Questions",
      returnsRefunds: "Returns & Refunds",
      orderSupport: "Order Support",
      paymentSupport: "Payment Support",
      contactSupport: "Contact Support",
      login: "Login",
      register: "Register",
      myProfile: "My Profile",
      myAccount: "My Account",
      myOrders: "My Orders",
      savedAddresses: "Saved Addresses",
      wishlist: "Wishlist",
      cart: "Cart",
      savedCart: "Saved Cart",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      returnsPolicy: "Returns & Refund Policy",
    },
    ctaTitle: "Can't find what you're looking for?",
    ctaSubtitle: "Our Help Center has answers to common questions about shopping, orders, payments, returns, and using Remise.",
    ctaVisitHelp: "Visit Help Center",
    ctaContactUs: "Contact Us",
  },

  ta: {
    eyebrow: "தள வரைபடம்",
    heroTitle: "தள வரைபடம்",
    heroTitleLead: "ரெமிஸில் உள்ள அனைத்தும், ",
    heroTitleAccent: "ஒரே இடத்தில்",
    heroSubtitle: "ரெமிஸில் கிடைக்கும் முக்கிய பகுதிகள், ஷாப்பிங் அம்சங்கள், வணிக சேவைகள், ஆதரவு வளங்கள் மற்றும் நிறுவனத் தகவல்களை ஆராயுங்கள்.",
    shopTitle: "ஷாப்பிங்",
    shopDesc: "ரெமிஸில் தயாரிப்புகளைக் கண்டறிந்து வாங்குங்கள்.",
    businessTitle: "வணிகங்களுக்கு",
    businessDesc: "ரெமிஸ் மூலம் உங்கள் வணிகத்தை வளர்த்துக் கொள்ளுங்கள்.",
    companyTitle: "நிறுவனம்",
    companyDesc: "ரெமிஸ் மற்றும் எங்கள் பயணத்தைப் பற்றி அறியுங்கள்.",
    aboutTitle: "ரெமிஸ் பற்றி",
    aboutDesc: "எங்கள் நோக்கம் மற்றும் பயணத்தைப் பற்றி அறியுங்கள்.",
    supportTitle: "ஆதரவு & உதவி",
    supportDesc: "உதவி தேவையா? பதில்கள் மற்றும் பயனுள்ள தகவல்களைக் கண்டறியுங்கள்.",
    helpTitle: "உதவி & ஆதரவு",
    helpDesc: "எந்த நேரத்திலும் உங்களுக்கு உதவ நாங்கள் தயாராக இருக்கிறோம்.",
    accountTitle: "உங்கள் கணக்கு",
    accountDesc: "உங்கள் சுயவிவரம் மற்றும் ஆர்டர்களை நிர்வகியுங்கள்.",
    legalTitle: "சட்ட விதிகளும் கொள்கைகளும்",
    legalDesc: "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கைகளை மதிப்பாய்வு செய்யவும்.",
    quickNavTitle: "குறிப்பிட்ட எதையாவது தேடுகிறீர்களா?",
    quickNavSubtitle: "அடிக்கடி பயன்படுத்தப்படும் பக்கங்களுக்கான விரைவான வழி.",
    quickNavGroups: {
      main: "ஷாப்பிங்",
      discover: "கண்டறியுங்கள்",
      business: "வணிகம்",
      help: "உதவி",
    },
    linkLabels: {
      home: "முகப்பு",
      allProducts: "அனைத்து தயாரிப்புகள்",
      categories: "வகைகள்",
      newArrivals: "புதிய வருகைகள்",
      bestSellers: "அதிக விற்பனையானவை",
      offers: "சலுகைகள்",
      searchProducts: "தயாரிப்புகளைத் தேடுங்கள்",
      bulkPurchase: "மொத்த கொள்முதல்",
      storeOwner: "கடை உரிமையாளர்",
      wholesaler: "மொத்த விற்பனையாளர்",
      homeBusiness: "வீட்டு வணிகம்",
      businessRegistration: "வணிகப் பதிவு",
      businessLogin: "வணிக உள்நுழைவு",
      storeDashboard: "கடை டாஷ்போர்டு",
      becomeSeller: "விற்பனையாளராகுங்கள்",
      storeManagement: "கடை நிர்வாகம்",
      aboutUs: "எங்களைப் பற்றி",
      careers: "வேலைவாய்ப்புகள்",
      blogsNews: "வலைப்பதிவுகள் & செய்திகள்",
      press: "செய்தி வெளியீடுகள்",
      contactUs: "எங்களைத் தொடர்பு கொள்ள",
      helpCenter: "உதவி மையம்",
      faq: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      returnsRefunds: "திருப்புதல் & பணத்தைத் திரும்பப் பெறுதல்",
      orderSupport: "ஆர்டர் ஆதரவு",
      paymentSupport: "கட்டண ஆதரவு",
      contactSupport: "ஆதரவைத் தொடர்பு கொள்ள",
      login: "உள்நுழைவு",
      register: "பதிவு செய்க",
      myProfile: "என் சுயவிவரம்",
      myAccount: "என் கணக்கு",
      myOrders: "என் ஆர்டர்கள்",
      savedAddresses: "சேமித்த முகவரிகள்",
      wishlist: "விருப்பப்பட்டியல்",
      cart: "கூடை",
      savedCart: "சேமித்த கூடை",
      privacyPolicy: "தனியுரிமைக் கொள்கை",
      termsOfService: "பயன்பாட்டு விதிமுறைகள்",
      returnsPolicy: "திருப்புதல் மற்றும் பணத்தைத் திரும்பப் பெறுதல் கொள்கை",
    },
    ctaTitle: "தேடுவதைக் கண்டுபிடிக்க முடியவில்லையா?",
    ctaSubtitle: "ஷாப்பிங், ஆர்டர்கள், கட்டணங்கள், ரிட்டர்ன்கள் மற்றும் ரெமிஸைப் பயன்படுத்துவது பற்றிய பொதுவான கேள்விகளுக்கான பதில்கள் எங்கள் உதவி மையத்தில் உள்ளன.",
    ctaVisitHelp: "உதவி மையத்தைப் பார்வையிடவும்",
    ctaContactUs: "தொடர்பு கொள்ள",
  },

  te: {
    eyebrow: "సైట్‌మ్యాప్",
    heroTitle: "సైట్‌మ్యాప్",
    heroTitleLead: "రెమిస్‌లోని ప్రతిదీ, ",
    heroTitleAccent: "అంతా ఒకే చోట",
    heroSubtitle: "రెమిస్‌లో అందుబాటులో ఉన్న ప్రధాన విభాగాలు, షాపింగ్ ఫీచర్లు, వ్యాపార సేవలు మరియు మద్దతు వనరులను అన్వేషించండి.",
    shopTitle: "షాప్",
    shopDesc: "రెమిస్‌లో ఉత్పత్తులను కనుగొనండి మరియు షాపింగ్ చేయండి.",
    businessTitle: "వ్యాపారాల కోసం",
    businessDesc: "రెమిస్‌తో మీ వ్యాపారాన్ని అభివృద్ధి చేసుకోండి.",
    companyTitle: "సంస్థ",
    companyDesc: "రెమిస్ మరియు మా ప్రయాణం గురించి మరింత తెలుసుకోండి.",
    aboutTitle: "రెమిస్ గురించి",
    aboutDesc: "మా లక్ష్యం మరియు ప్రయాణం గురించి తెలుసుకోండి.",
    supportTitle: "మద్దతు & సహాయం",
    supportDesc: "సహాయం కావాలా? సమాధానాలు మరియు ఉపయోగకరమైన వనరులను కనుగొనండి.",
    helpTitle: "సహాయం & మద్దతు",
    helpDesc: "మీకు ఎప్పుడైనా సహాయం చేయడానికి మేము ఇక్కడ ఉన్నాము.",
    accountTitle: "మీ ఖాతా",
    accountDesc: "మీ ప్రొఫైల్ మరియు ఆర్డర్‌లను నిర్వహించండి.",
    legalTitle: "చట్టపరమైన & నిబంధనలు",
    legalDesc: "నిబంధనలు మరియు గోప్యతా విధానాలను సమీక్షించండి.",
    quickNavTitle: "నిర్దిష్టమైన దేని కోసమైనా చూస్తున్నారా?",
    quickNavSubtitle: "ఎక్కువగా ఉపయోగించే పేజీలకు శీఘ్ర సత్వరమార్గం.",
    quickNavGroups: {
      main: "షాప్",
      discover: "కనుగొనండి",
      business: "వ్యాపారం",
      help: "సహాయం",
    },
    linkLabels: {
      home: "హోమ్",
      allProducts: "అన్ని ఉత్పత్తులు",
      categories: "వర్గాలు",
      newArrivals: "కొత్త రాకలు",
      bestSellers: "అత్యధికంగా అమ్ముడైనవి",
      offers: "ఆఫర్లు",
      searchProducts: "ఉత్పత్తులను వెతకండి",
      bulkPurchase: "బల్క్ కొనుగోలు",
      storeOwner: "స్టోర్ యజమాని",
      wholesaler: "హోల్‌సేలర్",
      homeBusiness: "హోమ్ వ్యాపారం",
      businessRegistration: "వ్యాపార నమోదు",
      businessLogin: "వ్యాపార లాగిన్",
      storeDashboard: "స్టోర్ డాష్‌బోర్డ్",
      becomeSeller: "విక్రేతగా మారండి",
      storeManagement: "స్టోర్ నిర్వహణ",
      aboutUs: "మా గురించి",
      careers: "కెరీర్లు",
      blogsNews: "బ్లాగులు & వార్తలు",
      press: "ప్రెస్",
      contactUs: "సంప్రదించండి",
      helpCenter: "సహాయ కేంద్రం",
      faq: "తరచుగా అడిగే ప్రశ్నలు",
      returnsRefunds: "రిటర్న్స్ & రీఫండ్లు",
      orderSupport: "ఆర్డర్ మద్దతు",
      paymentSupport: "చెల్లింపు మద్దతు",
      contactSupport: "మద్దతును సంప్రదించండి",
      login: "లాగిన్",
      register: "నమోదు చేసుకోండి",
      myProfile: "నా ప్రొఫైల్",
      myAccount: "నా ఖాతా",
      myOrders: "నా ఆర్డర్లు",
      savedAddresses: "సేవ్ చేసిన చిరునామాలు",
      wishlist: "విష్‌లిస్ట్",
      cart: "కార్ట్",
      savedCart: "సేవ్ చేసిన కార్ట్",
      privacyPolicy: "గోప్యతా విధానం",
      termsOfService: "సేవా నిబంధనలు",
      returnsPolicy: "రిటర్న్ & రీఫండ్ విధానం",
    },
    ctaTitle: "మీరు వెతుకుతున్నది దొరకలేదా?",
    ctaSubtitle: "షాపింగ్, ఆర్డర్‌లు, చెల్లింపులు మరియు వాపసుల గురించి సాధారణ ప్రశ్నలకు మా సహాయ కేంద్రంలో సమాధానాలు ఉన్నాయి.",
    ctaVisitHelp: "సహాయ కేంద్రాన్ని సందర్శించండి",
    ctaContactUs: "మమ్మల్ని సంప్రదించండి",
  },

  ml: {
    eyebrow: "സൈറ്റ്മാപ്പ്",
    heroTitle: "സൈറ്റ്മാപ്പ്",
    heroTitleLead: "റെമിസിലുള്ള എല്ലാം, ",
    heroTitleAccent: "ഒരിടത്ത്",
    heroSubtitle: "പ്രധാന വിഭാഗങ്ങൾ, ഷോപ്പിംഗ് ഫീച്ചറുകൾ, ബിസിനസ്സ് സേവനങ്ങൾ, പിന്തുണ എന്നിവ എളുപ്പത്തിൽ കണ്ടെത്തുക.",
    shopTitle: "ഷോപ്പ്",
    shopDesc: "റെമിസിൽ ഉൽപ്പന്നങ്ങൾ കണ്ടെത്തുകയും വാങ്ങുകയും ചെയ്യുക.",
    businessTitle: "ബിസിനസ്സുകൾക്കായി",
    businessDesc: "റെമിസ് വഴി നിങ്ങളുടെ ബിസിനസ്സ് വളർത്തുക.",
    companyTitle: "കമ്പനി",
    companyDesc: "ഞങ്ങളുടെ ലക്ഷ്യത്തെയും യാത്രയെയും കുറിച്ച് അറിയുക.",
    aboutTitle: "റെമിസിനെക്കുറിച്ച്",
    aboutDesc: "ഞങ്ങളുടെ ലക്ഷ്യത്തെയും യാത്രയെയും കുറിച്ച് അറിയുക.",
    supportTitle: "സഹായവും പിന്തുണയും",
    supportDesc: "നിങ്ങളെ സഹായിക്കാൻ ഞങ്ങൾ എപ്പോഴും തയ്യാറാണ്.",
    helpTitle: "സഹായവും പിന്തുണയും",
    helpDesc: "നിങ്ങളെ സഹായിക്കാൻ ഞങ്ങൾ എപ്പോഴും തയ്യാറാണ്.",
    accountTitle: "നിങ്ങളുടെ അക്കൗണ്ട്",
    accountDesc: "പ്രൊഫൈലും ഓർഡറുകളും കൈകാര്യം ചെയ്യുക.",
    legalTitle: "നിയമപരമായ വിവരങ്ങൾ",
    legalDesc: "നിബന്ധനകളും സ്വകാര്യതാ നയങ്ങളും പരിശോധിക്കുക.",
    quickNavTitle: "പ്രത്യേകമായി എന്തെങ്കിലും തിരയുകയാണോ?",
    quickNavSubtitle: "കൂടുതൽ ഉപയോഗിക്കുന്ന പേജുകളിലേക്കുള്ള കുറുക്കുവഴി.",
    quickNavGroups: {
      main: "ഷോപ്പ്",
      discover: "കണ്ടെത്തുക",
      business: "ബിസിനസ്സ്",
      help: "സഹായം",
    },
    linkLabels: {
      home: "ഹോം",
      allProducts: "എല്ലാ ഉൽപ്പന്നങ്ങളും",
      categories: "വിഭാഗങ്ങൾ",
      newArrivals: "പുതിയ വരവുകൾ",
      bestSellers: "ബെസ്റ്റ് സെല്ലറുകൾ",
      offers: "ഓഫറുകൾ",
      searchProducts: "ഉൽപ്പന്നങ്ങൾ തിരയുക",
      bulkPurchase: "മൊത്ത വാങ്ങൽ",
      storeOwner: "സ്റ്റോർ ഉടമ",
      wholesaler: "മൊത്തവ്യാപാരി",
      homeBusiness: "ഹോം ബിസിനസ്സ്",
      businessRegistration: "ബിസിനസ്സ് രജിസ്ട്രേഷൻ",
      businessLogin: "ബിസിനസ്സ് ലോഗിൻ",
      storeDashboard: "സ്റ്റോർ ഡാഷ്‌ബോർഡ്",
      becomeSeller: "വിൽപ്പനക്കാരനാകുക",
      storeManagement: "സ്റ്റോർ മാനേജ്മെന്റ്",
      aboutUs: "ഞങ്ങളെക്കുറിച്ച്",
      careers: "കരിയർ",
      blogsNews: "ബ്ലോഗുകളും വാർത്തകളും",
      press: "പ്രസ്സ്",
      contactUs: "ബന്ധപ്പെടുക",
      helpCenter: "ഹെൽപ്പ് സെന്റർ",
      faq: "പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ",
      returnsRefunds: "റിട്ടേണുകളും റീഫണ്ടുകളും",
      orderSupport: "ഓർഡർ പിന്തുണ",
      paymentSupport: "പേയ്‌മെന്റ് പിന്തുണ",
      contactSupport: "പിന്തുണ ബന്ധപ്പെടുക",
      login: "ലോഗിൻ",
      register: "രജിസ്റ്റർ ചെയ്യുക",
      myProfile: "എന്റെ പ്രൊഫൈൽ",
      myAccount: "എന്റെ അക്കൗണ്ട്",
      myOrders: "എന്റെ ഓർഡറുകൾ",
      savedAddresses: "സേവ് ചെയ്ത വിലാസങ്ങൾ",
      wishlist: "വിഷ്‌ലിസ്റ്റ്",
      cart: "കാർട്ട്",
      savedCart: "സേവ് ചെയ്ത കാർട്ട്",
      privacyPolicy: "സ്വകാര്യതാ നയം",
      termsOfService: "സേവന നിബന്ധനകൾ",
      returnsPolicy: "റിട്ടേൺ & റീഫണ്ട് നയം",
    },
    ctaTitle: "നിങ്ങൾ തിരയുന്നത് കണ്ടെത്താനായില്ലേ?",
    ctaSubtitle: "ഷോപ്പിംഗ്, ഓർഡറുകൾ, പേയ്‌മെന്റുകൾ, റിട്ടേണുകൾ എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് ഞങ്ങളുടെ ഹെൽപ്പ് സെന്ററിൽ ഉത്തരമുണ്ട്.",
    ctaVisitHelp: "ഹെൽപ്പ് സെന്റർ സന്ദർശിക്കുക",
    ctaContactUs: "ഞങ്ങളെ ബന്ധപ്പെടുക",
  },

  kn: {
    eyebrow: "ಸೈಟ್‌ಮ್ಯಾಪ್",
    heroTitle: "ಸೈಟ್‌ಮ್ಯಾಪ್",
    heroTitleLead: "ರೆಮಿಸ್‌ನಲ್ಲಿರುವ ಎಲ್ಲವೂ, ",
    heroTitleAccent: "ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ",
    heroSubtitle: "ಪ್ರಮುಖ ವಿಭಾಗಗಳು, ಶಾಪಿಂಗ್ ವೈಶಿಷ್ಟ್ಯಗಳು, ವ್ಯವಹಾರ ಸೇವೆಗಳು ಮತ್ತು ಬೆಂಬಲ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    shopTitle: "ಶಾಪ್",
    shopDesc: "ರೆಮಿಸ್‌ನಲ್ಲಿ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಖರೀದಿಸಿ.",
    businessTitle: "ವ್ಯವಹಾರಗಳಿಗೆ",
    businessDesc: "ರೆಮಿಸ್‌ನೊಂದಿಗೆ ನಿಮ್ಮ ವ್ಯವಹಾರವನ್ನು ಬೆಳೆಸಿ.",
    companyTitle: "ಕಂಪನಿ",
    companyDesc: "ರೆಮಿಸ್ ಮತ್ತು ನಮ್ಮ ಪ್ರಯಾಣದ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.",
    aboutTitle: "ರೆಮಿಸ್ ಬಗ್ಗೆ",
    aboutDesc: "ನಮ್ಮ ಧ್ಯೇಯ ಮತ್ತು ಪ್ರಯಾಣದ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.",
    supportTitle: "ಬೆಂಬಲ ಮತ್ತು ನೆರವು",
    supportDesc: "ಸಹಾಯ ಬೇಕೇ? ಉತ್ತರಗಳು ಮತ್ತು ಉಪಯುಕ್ತ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹುಡುಕಿ.",
    helpTitle: "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
    helpDesc: "ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾವು ಯಾವಾಗಲೂ ಇಲ್ಲಿದ್ದೇವೆ.",
    accountTitle: "ನಿಮ್ಮ ಖಾತೆ",
    accountDesc: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
    legalTitle: "ಕಾನೂನು ಮತ್ತು ನೀತಿಗಳು",
    legalDesc: "ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತಾ ಪ್ರಕಟಣೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    quickNavTitle: "ನಿರ್ದಿಷ್ಟವಾದುದನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಾ?",
    quickNavSubtitle: "ಹೆಚ್ಚು ಬಳಸಿದ ಪುಟಗಳಿಗೆ ತ್ವರಿತ ಶಾರ್ಟ್‌ಕಟ್.",
    quickNavGroups: {
      main: "ಶಾಪ್",
      discover: "ಅನ್ವೇಷಿಸಿ",
      business: "ವ್ಯವಹಾರ",
      help: "ಸಹಾಯ",
    },
    linkLabels: {
      home: "ಮುಖಪುಟ",
      allProducts: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು",
      categories: "ವರ್ಗಗಳು",
      newArrivals: "ಹೊಸ ಆಗಮನಗಳು",
      bestSellers: "ಅತ್ಯುತ್ತಮ ಮಾರಾಟಗಾರರು",
      offers: "ಆಫರ್‌ಗಳು",
      searchProducts: "ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ",
      bulkPurchase: "ಸಗಟು ಖರೀದಿ",
      storeOwner: "ಅಂಗಡಿ ಮಾಲೀಕ",
      wholesaler: "ಸಗಟು ವ್ಯಾಪಾರಿ",
      homeBusiness: "ಮನೆ ವ್ಯವಹಾರ",
      businessRegistration: "ವ್ಯವಹಾರ ನೋಂದಣಿ",
      businessLogin: "ವ್ಯವಹಾರ ಲಾಗಿನ್",
      storeDashboard: "ಅಂಗಡಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      becomeSeller: "ಮಾರಾಟಗಾರರಾಗಿ",
      storeManagement: "ಅಂಗಡಿ ನಿರ್ವಹಣೆ",
      aboutUs: "ನಮ್ಮ ಬಗ್ಗೆ",
      careers: "ಉದ್ಯೋಗಗಳು",
      blogsNews: "ಬ್ಲಾಗ್‌ಗಳು ಮತ್ತು ಸುದ್ದಿ",
      press: "ಪತ್ರಿಕಾ ಪ್ರಕಟಣೆ",
      contactUs: "ಸಂಪರ್ಕಿಸಿ",
      helpCenter: "ಸಹಾಯ ಕೇಂದ್ರ",
      faq: "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
      returnsRefunds: "ರಿಟರ್ನ್ಸ್ ಮತ್ತು ಮರುಪಾವತಿ",
      orderSupport: "ಆರ್ಡರ್ ಬೆಂಬಲ",
      paymentSupport: "ಪಾವತಿ ಬೆಂಬಲ",
      contactSupport: "ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ",
      login: "ಲಾಗಿನ್",
      register: "ನೋಂದಣಿ",
      myProfile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      myAccount: "ನನ್ನ ಖಾತೆ",
      myOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
      savedAddresses: "ಉಳಿಸಿದ ವಿಳಾಸಗಳು",
      wishlist: "ವಿಶ್‌ಲಿಸ್ಟ್",
      cart: "ಕಾರ್ಟ್",
      savedCart: "ಉಳಿಸಿದ ಕಾರ್ಟ್",
      privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ",
      termsOfService: "ಸೇವಾ ನಿಯಮಗಳು",
      returnsPolicy: "ರಿಟರ್ನ್ & ಮರುಪಾವತಿ ನೀತಿ",
    },
    ctaTitle: "ನೀವು ಹುಡುಕುತ್ತಿರುವುದು ಸಿಗಲಿಲ್ಲವೇ?",
    ctaSubtitle: "ಶಾಪಿಂಗ್, ಆರ್ಡರ್‌ಗಳು, ಪಾವತಿಗಳು ಮತ್ತು ರಿಟರ್ನ್‌ಗಳ ಬಗೆಗಿನ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ನಮ್ಮ ಸಹಾಯ ಕೇಂದ್ರದಲ್ಲಿ ಉತ್ತರಗಳಿವೆ.",
    ctaVisitHelp: "ಸಹಾಯ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ",
    ctaContactUs: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
  },

  hi: {
    eyebrow: "साइटमैप",
    heroTitle: "साइटमैप",
    heroTitleLead: "रेमिस पर सब कुछ, ",
    heroTitleAccent: "एक ही स्थान पर",
    heroSubtitle: "रेमिस पर उपलब्ध मुख्य अनुभागों, खरीदारी सुविधाओं, व्यावसायिक सेवाओं और सहायता संसाधनों का अन्वेषण करें।",
    shopTitle: "शॉपिंग",
    shopDesc: "रेमिस पर उत्पाद खोजें और खरीदारी करें।",
    businessTitle: "व्यवसायों के लिए",
    businessDesc: "रेमिस के साथ अपना व्यवसाय बढ़ाएं।",
    companyTitle: "कंपनी",
    companyDesc: "रेमिस और हमारी यात्रा के बारे में जानें।",
    aboutTitle: "रेमिस के बारे में",
    aboutDesc: "हमारे मिशन और यात्रा के बारे में जानें।",
    supportTitle: "सहायता और समर्थन",
    supportDesc: "मदद चाहिए? उत्तर और उपयोगी संसाधन खोजें।",
    helpTitle: "सहायता और समर्थन",
    helpDesc: "हम किसी भी समय आपकी सहायता के लिए तैयार हैं।",
    accountTitle: "आपका खाता",
    accountDesc: "अपनी प्रोफ़ाइल और ऑर्डर प्रबंधित करें।",
    legalTitle: "कानूनी और नीतियां",
    legalDesc: "शर्तों और गोपनीयता प्रकटीकरण की समीक्षा करें।",
    quickNavTitle: "कुछ विशेष खोज रहे हैं?",
    quickNavSubtitle: "सर्वाधिक उपयोग किए जाने वाले पृष्ठों का त्वरित शॉर्टकट।",
    quickNavGroups: {
      main: "शॉपिंग",
      discover: "खोजें",
      business: "व्यवसाय",
      help: "सहायता",
    },
    linkLabels: {
      home: "होम",
      allProducts: "सभी उत्पाद",
      categories: "श्रेणियां",
      newArrivals: "नए आगमन",
      bestSellers: "सर्वाधिक बिकने वाले",
      offers: "ऑफ़र",
      searchProducts: "उत्पाद खोजें",
      bulkPurchase: "थोक खरीदारी",
      storeOwner: "स्टोर मालिक",
      wholesaler: "थोक विक्रेता",
      homeBusiness: "घरेलू व्यवसाय",
      businessRegistration: "व्यवसाय पंजीकरण",
      businessLogin: "व्यवसाय लॉगिन",
      storeDashboard: "स्टोर डैशबोर्ड",
      becomeSeller: "विक्रेता बनें",
      storeManagement: "स्टोर प्रबंधन",
      aboutUs: "हमारे बारे में",
      careers: "करियर",
      blogsNews: "ब्लॉग और समाचार",
      press: "प्रेस",
      contactUs: "संपर्क करें",
      helpCenter: "सहायता केंद्र",
      faq: "अक्सर पूछे जाने वाले प्रश्न",
      returnsRefunds: "रिटर्न और रिफंड",
      orderSupport: "ऑर्डर सहायता",
      paymentSupport: "भुगतान सहायता",
      contactSupport: "सहायता से संपर्क करें",
      login: "लॉगिन",
      register: "पंजीकरण करें",
      myProfile: "मेरी प्रोफ़ाइल",
      myAccount: "मेरा खाता",
      myOrders: "मेरे ऑर्डर",
      savedAddresses: "सहेजे गए पते",
      wishlist: "इच्छा-सूची",
      cart: "कार्ट",
      savedCart: "सहेजी गई कार्ट",
      privacyPolicy: "गोपनीयता नीति",
      termsOfService: "सेवा की शर्तें",
      returnsPolicy: "रिटर्न और रिफंड नीति",
    },
    ctaTitle: "जो आप खोज रहे हैं वह नहीं मिला?",
    ctaSubtitle: "हमारे सहायता केंद्र में खरीदारी, ऑर्डर, भुगतान और रिटर्न से जुड़े सामान्य प्रश्नों के उत्तर मौजूद हैं।",
    ctaVisitHelp: "सहायता केंद्र पर जाएं",
    ctaContactUs: "संपर्क करें",
  },
};

export function getSitemapData(lang: LanguageCode): SitemapData {
  return SITEMAP_DATA[lang] || SITEMAP_DATA.en;
}
