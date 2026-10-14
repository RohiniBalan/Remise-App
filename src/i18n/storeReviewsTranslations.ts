import { LanguageCode } from './types';

export interface StoreReviewsCriteriaLabels {
  price: string;
  distance: string;
  deliveryTime: string;
  stockAvailability: string;
  shopRating: string;
  sellerReliability: string;
  serviceQuality: string;
  offers: string;
  repeatPreference: string;
  returnResolution: string;
}

export interface StoreReviewsTranslations {
  pageTitle: string;
  reviewsAndRatings: string;
  reviewsAndRatingsSubtitle: string;
  overallRating: string;
  basedOnReviews: string;
  review: string;
  reviews: string;
  starDistribution: string;
  customerTrust: string;
  trustDescription: string;
  refreshReviews: string;
  refreshing: string;
  loadingReviews: string;
  criteriaPerformanceTitle: string;
  tenCriteriaTitle: string;
  customerReviews: string;
  customerReviewsCount: string;
  verifiedFulfillmentSub: string;
  noReviewsYet: string;
  noReviewsDesc: string;
  verifiedCustomer: string;
  verifiedPurchase: string;
  otpVerified: string;
  orderNumber: string;
  viewCriteriaBreakdown: string;
  hideCriteriaBreakdown: string;
  failedToLoad: string;
  criteriaShort: StoreReviewsCriteriaLabels;
  criteriaDetailed: StoreReviewsCriteriaLabels;
}

export const STORE_REVIEWS_TRANSLATIONS: Record<LanguageCode, StoreReviewsTranslations> = {
  en: {
    pageTitle: 'Store Reviews',
    reviewsAndRatings: 'Reviews & Ratings',
    reviewsAndRatingsSubtitle: 'Customer reviews & 10 criteria breakdown',
    overallRating: 'Overall Store Rating',
    basedOnReviews: 'Based on {{count}} customer {{reviewWord}}',
    review: 'review',
    reviews: 'reviews',
    starDistribution: 'Star Distribution',
    customerTrust: 'Customer Trust & Ratings',
    trustDescription: 'Reviews become available only after customers successfully complete their order via WhatsApp OTP verification.',
    refreshReviews: 'Refresh Reviews',
    refreshing: 'Refreshing...',
    loadingReviews: 'Loading store reviews...',
    criteriaPerformanceTitle: 'Criterion Performance Averages (1–5 Stars)',
    tenCriteriaTitle: '10 Criteria Performance Averages',
    customerReviews: 'Customer Reviews',
    customerReviewsCount: 'Customer Reviews ({{count}})',
    verifiedFulfillmentSub: 'Verified fulfillment & OTP confirmed',
    noReviewsYet: 'No reviews yet',
    noReviewsDesc: 'Customer reviews and ratings will show here once orders are picked up or delivered and OTP verified.',
    verifiedCustomer: 'Verified Customer',
    verifiedPurchase: 'Verified Purchase',
    otpVerified: 'OTP Verified',
    orderNumber: 'Order #{{id}}',
    viewCriteriaBreakdown: 'View 10 criteria breakdown',
    hideCriteriaBreakdown: 'Hide 10 criteria breakdown',
    failedToLoad: 'Failed to load store reviews.',
    criteriaShort: {
      price: 'Price',
      distance: 'Distance',
      deliveryTime: 'Delivery Time',
      stockAvailability: 'Stock Availability',
      shopRating: 'Shop Rating',
      sellerReliability: 'Seller Reliability',
      serviceQuality: 'Delivery / Service Quality',
      offers: 'Offers',
      repeatPreference: 'Repeat Preference',
      returnResolution: 'Problem Resolution',
    },
    criteriaDetailed: {
      price: 'Affordable / Fair Price',
      distance: 'Distance / Accessibility',
      deliveryTime: 'Speed / Delivery Time',
      stockAvailability: 'Stock / Item Availability',
      shopRating: 'Shop Ambiance / Cleanliness',
      sellerReliability: 'Seller Reliability',
      serviceQuality: 'Service Quality / Behavior',
      offers: 'Offers & Discounts',
      repeatPreference: 'Repeat Shopping Preference',
      returnResolution: 'Return & Issue Resolution',
    },
  },
  ta: {
    pageTitle: 'கடையின் மதிப்பாய்வுகள்',
    reviewsAndRatings: 'மதிப்பாய்வுகள் & மதிப்பீடுகள்',
    reviewsAndRatingsSubtitle: 'வாடிக்கையாளர் மதிப்பாய்வுகள் & 10 அளவுகோல் விவரங்கள்',
    overallRating: 'ஒட்டுமொத்த கடையின் மதிப்பீடு',
    basedOnReviews: '{{count}} வாடிக்கையாளர் {{reviewWord}} அடிப்படையில்',
    review: 'மதிப்பாய்வு',
    reviews: 'மதிப்பாய்வுகள்',
    starDistribution: 'நட்சத்திரப் பகிர்வு',
    customerTrust: 'வாடிக்கையாளர் நம்பிக்கை & மதிப்பீடுகள்',
    trustDescription: 'வாடிக்கையாளர்கள் WhatsApp OTP சரிபார்ப்பு மூலம் ஆர்டரை வெற்றிகரமாக முடித்த பிறகே மதிப்பாய்வுகள் கிடைக்கும்.',
    refreshReviews: 'மதிப்பாய்வுகளை புதுப்பிக்கவும்',
    refreshing: 'புதுப்பிக்கப்படுகிறது...',
    loadingReviews: 'மதிப்பாய்வுகள் ஏற்றப்படுகின்றன...',
    criteriaPerformanceTitle: 'அளவுகோல் செயல்திறன் சராசரிகள் (1–5 நட்சத்திரங்கள்)',
    tenCriteriaTitle: '10 அளவுகோல் செயல்திறன் சராசரிகள்',
    customerReviews: 'வாடிக்கையாளர் மதிப்பாய்வுகள்',
    customerReviewsCount: 'வாடிக்கையாளர் மதிப்பாய்வுகள் ({{count}})',
    verifiedFulfillmentSub: 'சரிபார்க்கப்பட்ட டெலிவரி & OTP உறுதிப்படுத்தப்பட்டது',
    noReviewsYet: 'இன்னும் மதிப்பாய்வுகள் இல்லை',
    noReviewsDesc: 'ஆர்டர்கள் பெறப்பட்டு OTP சரிபார்க்கப்பட்டதும் வாடிக்கையாளர் மதிப்பாய்வுகளும் மதிப்பீடுகளும் இங்கே தோன்றும்.',
    verifiedCustomer: 'சரிபார்க்கப்பட்ட வாடிக்கையாளர்',
    verifiedPurchase: 'சரிபார்க்கப்பட்ட கொள்முதல்',
    otpVerified: 'OTP சரிபார்க்கப்பட்டது',
    orderNumber: 'ஆர்டர் #{{id}}',
    viewCriteriaBreakdown: '10 அளவுகோல் விவரங்களைப் பார்க்கவும்',
    hideCriteriaBreakdown: '10 அளவுகோல் விவரங்களை மறைக்கவும்',
    failedToLoad: 'மதிப்பாய்வுகளை ஏற்றுவதில் தோல்வி.',
    criteriaShort: {
      price: 'விலை',
      distance: 'தூரம்',
      deliveryTime: 'டெலிவரி நேரம்',
      stockAvailability: 'பொருட்கள் இருப்பு',
      shopRating: 'கடை மதிப்பீடு',
      sellerReliability: 'விற்பனையாளர் நம்பகத்தன்மை',
      serviceQuality: 'சேவை தரம்',
      offers: 'சலுகைகள்',
      repeatPreference: 'மறு கொள்முதல் விருப்பம்',
      returnResolution: 'பிரச்சனை தீர்வு',
    },
    criteriaDetailed: {
      price: 'மலிவு / நியாயமான விலை',
      distance: 'தூரம் / அணுகல்தன்மை',
      deliveryTime: 'வேகம் / டெலிவரி நேரம்',
      stockAvailability: 'பொருட்கள் இருப்பு',
      shopRating: 'கடை சூழல் / தூய்மை',
      sellerReliability: 'விற்பனையாளர் நம்பகத்தன்மை',
      serviceQuality: 'சேவை தரம் / நடத்தை',
      offers: 'சலுகைகள் & தள்ளுபடிகள்',
      repeatPreference: 'மறு கொள்முதல் முன்னுரிமை',
      returnResolution: 'திரும்பப் பெறுதல் & பிரச்சனை தீர்வு',
    },
  },
  te: {
    pageTitle: 'స్టోర్ సమీక్షలు',
    reviewsAndRatings: 'సమీక్షలు & రేటింగ్‌లు',
    reviewsAndRatingsSubtitle: 'కస్టమర్ సమీక్షలు & 10 ప్రమాణాల విభజన',
    overallRating: 'మొత్తం స్టోర్ రేటింగ్',
    basedOnReviews: '{{count}} కస్టమర్ {{reviewWord}} ఆధారంగా',
    review: 'సమీక్ష',
    reviews: 'సమీక్షలు',
    starDistribution: 'స్టార్ పంపిణీ',
    customerTrust: 'కస్టమర్ నమ్మకం & రేటింగ్‌లు',
    trustDescription: 'కస్టమర్‌లు WhatsApp OTP ధృవీకరణ ద్వారా తమ ఆర్డర్‌ను విజయవంతంగా పూర్తి చేసిన తర్వాతే సమీక్షలు అందుబాటులోకి వస్తాయి.',
    refreshReviews: 'సమీక్షలను రిఫ్రెష్ చేయండి',
    refreshing: 'రిఫ్రెష్ అవుతోంది...',
    loadingReviews: 'సమీక్షలు లోడ్ అవుతున్నాయి...',
    criteriaPerformanceTitle: 'ప్రమాణాల పనితీరు సగటులు (1–5 నక్షత్రాలు)',
    tenCriteriaTitle: '10 ప్రమాణాల పనితీరు సగటులు',
    customerReviews: 'కస్టమర్ సమీక్షలు',
    customerReviewsCount: 'కస్టమర్ సమీక్షలు ({{count}})',
    verifiedFulfillmentSub: 'ధృవీకరించబడిన డెలివరీ & OTP నిర్ధారించబడింది',
    noReviewsYet: 'ఇంకా సమీక్షలు లేవు',
    noReviewsDesc: 'ఆర్డర్‌లు డెలివరీ చేయబడి మరియు OTP ధృవీకరించబడిన తర్వాత కస్టమర్ సమీక్షలు మరియు రేటింగ్‌లు ఇక్కడ కనిపిస్తాయి.',
    verifiedCustomer: 'ధృవీకరించబడిన కస్టమర్',
    verifiedPurchase: 'ధృవీకరించబడిన కొనుగోలు',
    otpVerified: 'OTP ధృవీకరించబడింది',
    orderNumber: 'ఆర్డర్ #{{id}}',
    viewCriteriaBreakdown: '10 ప్రమాణాల వివరాలను చూడండి',
    hideCriteriaBreakdown: '10 ప్రమాణాల వివరాలను దాచండి',
    failedToLoad: 'స్టోర్ సమీక్షలను లోడ్ చేయడంలో విఫలమైంది.',
    criteriaShort: {
      price: 'ధర',
      distance: 'దూరం',
      deliveryTime: 'డెలివరీ సమయం',
      stockAvailability: 'స్టాక్ లభ్యత',
      shopRating: 'షాప్ రేటింగ్',
      sellerReliability: 'విక్రేత విశ్వసనీయత',
      serviceQuality: 'సేవా నాణ్యత',
      offers: 'ఆఫర్లు',
      repeatPreference: 'పునరావృత ప్రాధాన్యత',
      returnResolution: 'సమస్య పరిష్కారం',
    },
    criteriaDetailed: {
      price: 'సరసమైన / తగిన ధర',
      distance: 'దూరం / చేరువ',
      deliveryTime: 'వేగం / డెలివరీ సమయం',
      stockAvailability: 'స్టాక్ లభ్యత',
      shopRating: 'షాప్ వాతావరణం / పరిశుభ్రత',
      sellerReliability: 'విక్రేత విశ్వసనీయత',
      serviceQuality: 'సేవా నాణ్యత / ప్రవర్తన',
      offers: 'ఆఫర్లు & తగ్గింపులు',
      repeatPreference: 'తిరిగి షాపింగ్ ప్రాధాన్యత',
      returnResolution: 'రిటర్న్ & సమస్య పరిష్కారం',
    },
  },
  ml: {
    pageTitle: 'സ്റ്റോർ അവലോകനങ്ങൾ',
    reviewsAndRatings: 'അവലോകനങ്ങളും റേറ്റിംഗുകളും',
    reviewsAndRatingsSubtitle: 'ഉപഭോക്തൃ അവലോകനങ്ങളും 10 മാനദണ്ഡങ്ങളുടെ വിവരങ്ങളും',
    overallRating: 'മൊത്തം സ്റ്റോർ റേറ്റിംഗ്',
    basedOnReviews: '{{count}} ഉപഭോക്തൃ {{reviewWord}} അടിസ്ഥാനത്തിൽ',
    review: 'അവലോകനം',
    reviews: 'അവലോകനങ്ങൾ',
    starDistribution: 'സ്റ്റാർ വിതരണം',
    customerTrust: 'ഉപഭോക്തൃ വിശ്വാസ്യതയും റേറ്റിംഗുകളും',
    trustDescription: 'വാട്‌സ്ആപ്പ് OTP സ്ഥിരീകരണം വഴി ഉപഭോക്താക്കൾ ഓർഡർ വിജയകരമായി പൂർത്തിയാക്കിയ ശേഷം മാത്രമേ അവലോകനങ്ങൾ ലഭ്യമാകൂ.',
    refreshReviews: 'അവലോകനങ്ങൾ പുതുക്കുക',
    refreshing: 'പുതുക്കുന്നു...',
    loadingReviews: 'അവലോകനങ്ങൾ ലോഡുചെയ്യുന്നു...',
    criteriaPerformanceTitle: 'മാനദണ്ഡ പ്രകടന ശരാശരികൾ (1–5 നക്ഷത്രങ്ങൾ)',
    tenCriteriaTitle: '10 മാനദണ്ഡ പ്രകടന ശരാശരികൾ',
    customerReviews: 'ഉപഭോക്തൃ അവലോകനങ്ങൾ',
    customerReviewsCount: 'ഉപഭോക്തൃ അവലോകനങ്ങൾ ({{count}})',
    verifiedFulfillmentSub: 'സ്ഥിരീകരിച്ച ഡെലിവറിയും OTP സ്ഥിരീകരണവും',
    noReviewsYet: 'ഇതുവരെ അവലോകനങ്ങളൊന്നുമില്ല',
    noReviewsDesc: 'ഓർഡറുകൾ ലഭിച്ച് OTP സ്ഥിരീകരിച്ചുകഴിഞ്ഞാൽ ഉപഭോക്തൃ അവലോകനങ്ങളും റേറ്റിംഗുകളും ഇവിടെ കാണിക്കും.',
    verifiedCustomer: 'സ്ഥിരീകരിച്ച ഉപഭോക്താവ്',
    verifiedPurchase: 'സ്ഥിരീകരിച്ച വാങ്ങൽ',
    otpVerified: 'OTP സ്ഥിരീകരിച്ചു',
    orderNumber: 'ഓർഡർ #{{id}}',
    viewCriteriaBreakdown: '10 മാനദണ്ഡ വിശദാംശങ്ങൾ കാണുക',
    hideCriteriaBreakdown: '10 മാനദണ്ഡ വിശദാംശങ്ങൾ മറയ്ക്കുക',
    failedToLoad: 'അവലോകനങ്ങൾ ലോഡുചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.',
    criteriaShort: {
      price: 'വില',
      distance: 'ദൂരം',
      deliveryTime: 'ഡെലിവറി സമയം',
      stockAvailability: 'സ്റ്റോക്ക് ലഭ്യത',
      shopRating: 'കടയുടെ റേറ്റിംഗ്',
      sellerReliability: 'വിൽപ്പനക്കാരന്റെ വിശ്വാസ്യത',
      serviceQuality: 'സേവന ഗുണനിലവാരം',
      offers: 'ഓഫറുകൾ',
      repeatPreference: 'വീണ്ടും വാങ്ങൽ മുൻഗണന',
      returnResolution: 'പ്രശ്ന പരിഹാരം',
    },
    criteriaDetailed: {
      price: 'ന്യായമായ വില',
      distance: 'ദൂരം / സമീപം',
      deliveryTime: 'വേഗത / ഡെലിവറി സമയം',
      stockAvailability: 'സ്റ്റോക്ക് ലഭ്യത',
      shopRating: 'കടയുടെ അന്തരീക്ഷം / ശുചിത്വം',
      sellerReliability: 'വിൽപ്പനക്കാരന്റെ വിശ്വാസ്യത',
      serviceQuality: 'സേവന ഗുണനിലവാരം / പെരുമാറ്റം',
      offers: 'ഓഫറുകളും കിഴിവുകളും',
      repeatPreference: 'വീണ്ടും വാങ്ങൽ മുൻഗണന',
      returnResolution: 'റിട്ടേൺ & പ്രശ്ന പരിഹാരം',
    },
  },
  kn: {
    pageTitle: 'ಅಂಗಡಿ ವಿಮರ್ಶೆಗಳು',
    reviewsAndRatings: 'ವಿಮರ್ಶೆಗಳು & ರೇಟಿಂಗ್‌ಗಳು',
    reviewsAndRatingsSubtitle: 'ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು & 10 ಮಾನದಂಡಗಳ ವಿವರ',
    overallRating: 'ಒಟ್ಟಾರೆ ಅಂಗಡಿ ರೇಟಿಂಗ್',
    basedOnReviews: '{{count}} ಗ್ರಾಹಕರ {{reviewWord}} ಆಧಾರದ ಮೇಲೆ',
    review: 'ವಿಮರ್ಶೆ',
    reviews: 'ವಿಮರ್ಶೆಗಳು',
    starDistribution: 'ಸ್ಟಾರ್ ವಿತರಣೆ',
    customerTrust: 'ಗ್ರಾಹಕರ ನಂಬಿಕೆ ಮತ್ತು ರೇಟಿಂಗ್‌ಗಳು',
    trustDescription: 'ಗ್ರಾಹಕರು WhatsApp OTP ಪರಿಶೀಲನೆಯ ಮೂಲಕ ಆರ್ಡರ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ ನಂತರವೇ ವಿಮರ್ಶೆಗಳು ಲಭ್ಯವಿರುತ್ತವೆ.',
    refreshReviews: 'ವಿಮರ್ಶೆಗಳನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ',
    refreshing: 'ರಿಫ್ರೆಶ್ ಆಗುತ್ತಿದೆ...',
    loadingReviews: 'ವಿಮರ್ಶೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    criteriaPerformanceTitle: 'ಮಾನದಂಡಗಳ ಕಾರ್ಯಕ್ಷಮತೆ ಸರಾಸರಿ (1–5 ನಕ್ಷತ್ರಗಳು)',
    tenCriteriaTitle: '10 ಮಾನದಂಡಗಳ ಕಾರ್ಯಕ್ಷಮತೆ ಸರಾಸರಿ',
    customerReviews: 'ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು',
    customerReviewsCount: 'ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು ({{count}})',
    verifiedFulfillmentSub: 'ಪರಿಶೀಲಿಸಿದ ಡೆಲಿವರಿ & OTP ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    noReviewsYet: 'ಇನ್ನೂ ಯಾವುದೇ ವಿಮರ್ಶೆಗಳಿಲ್ಲ',
    noReviewsDesc: 'ಆರ್ಡರ್‌ಗಳನ್ನು ತಲುಪಿಸಿ OTP ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು ಮತ್ತು ರೇಟಿಂಗ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    verifiedCustomer: 'ಪರಿಶೀಲಿಸಿದ ಗ್ರಾಹಕ',
    verifiedPurchase: 'ಪರಿಶೀಲಿಸಿದ ಖರೀದಿ',
    otpVerified: 'OTP ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    orderNumber: 'ಆರ್ಡರ್ #{{id}}',
    viewCriteriaBreakdown: '10 ಮಾನದಂಡಗಳ ವಿವರಗಳನ್ನು ನೋಡಿ',
    hideCriteriaBreakdown: '10 ಮಾನದಂಡಗಳ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ',
    failedToLoad: 'ವಿಮರ್ಶೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.',
    criteriaShort: {
      price: 'ಬೆಲೆ',
      distance: 'ದೂರ',
      deliveryTime: 'ಡೆಲಿವರಿ ಸಮಯ',
      stockAvailability: 'ಸ್ಟಾಕ್ ಲಭ್ಯತೆ',
      shopRating: 'ಅಂಗಡಿ ರೇಟಿಂಗ್',
      sellerReliability: 'ಮಾರಾಟಗಾರರ ವಿಶ್ವಾಸಾರ್ಹತೆ',
      serviceQuality: 'ಸೇವಾ ಗುಣಮಟ್ಟ',
      offers: 'ಆಫರ್‌ಗಳು',
      repeatPreference: 'ಮರು ಖರೀದಿ ಆದ್ಯತೆ',
      returnResolution: 'ಸಮಸ್ಯೆ ಪರಿಹಾರ',
    },
    criteriaDetailed: {
      price: 'ಕೈಗೆಟುಕುವ / ನ್ಯಾಯಯುತ ಬೆಲೆ',
      distance: 'ದೂರ / ಸುಲಭ ಪ್ರವೇಶ',
      deliveryTime: 'ವೇಗ / ಡೆಲಿವರಿ ಸಮಯ',
      stockAvailability: 'ಸ್ಟಾಕ್ ಲಭ್ಯತೆ',
      shopRating: 'ಅಂಗಡಿ ಪರಿಸರ / ಸ್ವಚ್ಛತೆ',
      sellerReliability: 'ಮಾರಾಟಗಾರರ ವಿಶ್ವಾಸಾರ್ಹತೆ',
      serviceQuality: 'ಸೇವಾ ಗುಣಮಟ್ಟ / ನಡವಳಿಕೆ',
      offers: 'ಆಫರ್‌ಗಳು & ರಿಯಾಯಿತಿಗಳು',
      repeatPreference: 'ಮರು ಖರೀದಿ ಆದ್ಯತೆ',
      returnResolution: 'ರಿಟರ್ನ್ & ಸಮಸ್ಯೆ ಪರಿಹಾರ',
    },
  },
  hi: {
    pageTitle: 'स्टोर समीक्षाएं',
    reviewsAndRatings: 'समीक्षाएं और रेटिंग',
    reviewsAndRatingsSubtitle: 'ग्राहक समीक्षाएं और 10 मानदंड विवरण',
    overallRating: 'समग्र स्टोर रेटिंग',
    basedOnReviews: '{{count}} ग्राहक {{reviewWord}} पर आधारित',
    review: 'समीक्षा',
    reviews: 'समीक्षाएँ',
    starDistribution: 'स्टार वितरण',
    customerTrust: 'ग्राहक विश्वास और रेटिंग',
    trustDescription: 'ग्राहक द्वारा WhatsApp OTP सत्यापन के माध्यम से ऑर्डर सफलतापूर्वक पूरा करने के बाद ही समीक्षाएं उपलब्ध होती हैं।',
    refreshReviews: 'समीक्षाएं रीफ्रेश करें',
    refreshing: 'रीफ्रेश हो रहा है...',
    loadingReviews: 'समीक्षाएं लोड हो रही हैं...',
    criteriaPerformanceTitle: 'मानदंड प्रदर्शन औसत (1–5 स्टार)',
    tenCriteriaTitle: '10 मानदंड प्रदर्शन औसत',
    customerReviews: 'ग्राहक समीक्षाएं',
    customerReviewsCount: 'ग्राहक समीक्षाएं ({{count}})',
    verifiedFulfillmentSub: 'सत्यापित डिलीवरी और OTP पुष्टीकृत',
    noReviewsYet: 'अभी तक कोई समीक्षा नहीं',
    noReviewsDesc: 'ऑर्डर डिलीवर होने और OTP सत्यापन पूरा होने के बाद ग्राहक समीक्षाएं और रेटिंग यहां दिखाई देंगी।',
    verifiedCustomer: 'सत्यापित ग्राहक',
    verifiedPurchase: 'सत्यापित खरीदारी',
    otpVerified: 'OTP सत्यापित',
    orderNumber: 'ऑर्डर #{{id}}',
    viewCriteriaBreakdown: '10 मानदंड विवरण देखें',
    hideCriteriaBreakdown: '10 मानदंड विवरण छुपाएं',
    failedToLoad: 'समीक्षाएं लोड करने में विफल।',
    criteriaShort: {
      price: 'मूल्य',
      distance: 'दूरी',
      deliveryTime: 'डिलीवरी समय',
      stockAvailability: 'स्टॉक उपलब्धता',
      shopRating: 'दुकान रेटिंग',
      sellerReliability: 'विक्रेता विश्वसनीयता',
      serviceQuality: 'सेवा गुणवत्ता',
      offers: 'ऑफ़र',
      repeatPreference: 'पुनः खरीदारी प्राथमिकता',
      returnResolution: 'समस्या समाधान',
    },
    criteriaDetailed: {
      price: 'किफायती / उचित मूल्य',
      distance: 'दूरी / पहुंच',
      deliveryTime: 'गति / डिलीवरी समय',
      stockAvailability: 'स्टॉक / वस्तु उपलब्धता',
      shopRating: 'दुकान का माहौल / स्वच्छता',
      sellerReliability: 'विक्रेता विश्वसनीयता',
      serviceQuality: 'सेवा गुणवत्ता / व्यवहार',
      offers: 'ऑफ़र और छूट',
      repeatPreference: 'पुनः खरीदारी प्राथमिकता',
      returnResolution: 'वापसी एवं समस्या समाधान',
    },
  },
};

export function getStoreReviewsTranslations(lang: LanguageCode): StoreReviewsTranslations {
  return STORE_REVIEWS_TRANSLATIONS[lang] || STORE_REVIEWS_TRANSLATIONS.en;
}

export type StoreReviewCriteriaKey =
  | 'price'
  | 'distance'
  | 'deliveryTime'
  | 'stockAvailability'
  | 'shopRating'
  | 'sellerReliability'
  | 'serviceQuality'
  | 'offers'
  | 'repeatPreference'
  | 'returnResolution';

export interface StoreReviewModalTranslations {
  verifiedBadge: string;
  verifyingEligibility: string;
  reviewSubmittedTitle: string;
  reviewSubmittedDesc: string;
  alreadyReviewedTitle: string;
  alreadyReviewedDesc: string;
  notEligibleTitle: string;
  closeBtn: string;
  yourSubmittedRating: string;
  overallScoreSuffix: string;
  allCriteriaRated: string;
  criteriaRatedCount: string;
  ratingCriteriaTitle: string;
  allRequired: string;
  reviewTextTitle: string;
  reviewPlaceholder: string;
  addPhotosTitle: string;
  addPhotoBtn: string;
  cancelBtn: string;
  submitBtn: string;
  tiers: {
    outstanding: string;
    veryGood: string;
    average: string;
    fair: string;
    pending: string;
  };
  ratingLabels: Record<number, string>;
  criteriaList: {
    key: StoreReviewCriteriaKey;
    label: string;
    description: string;
  }[];
  errors: {
    alreadyReviewed: string;
    notEligible: string;
    verifyFailed: string;
    allRequiredAlert: string;
    reviewFailedTitle: string;
    reviewFailedDesc: string;
  };
}

export const STORE_REVIEW_MODAL_TRANSLATIONS: Record<LanguageCode, StoreReviewModalTranslations> = {
  en: {
    verifiedBadge: 'Verified',
    verifyingEligibility: 'Verifying fulfillment & OTP confirmation...',
    reviewSubmittedTitle: 'Review Submitted!',
    reviewSubmittedDesc: 'Thank you for rating {{name}}. Your feedback helps our community and store partner.',
    alreadyReviewedTitle: 'Review Already Submitted',
    alreadyReviewedDesc: 'You have already submitted a review for this store. Each customer can review a store once.',
    notEligibleTitle: 'Not Eligible for Review',
    closeBtn: 'Close',
    yourSubmittedRating: 'Your Submitted Rating',
    overallScoreSuffix: '/ 5.0 Overall',
    allCriteriaRated: 'All 10 criteria rated ✓',
    criteriaRatedCount: '{{count}} of 10 criteria rated',
    ratingCriteriaTitle: 'Rating Criteria (1–5 Stars)',
    allRequired: 'All 10 required',
    reviewTextTitle: 'Customer Review / Description (Optional)',
    reviewPlaceholder: 'Share details about product quality, packaging, store service...',
    addPhotosTitle: 'Add Photos (Optional, Up to 5)',
    addPhotoBtn: 'Add Photo',
    cancelBtn: 'Cancel',
    submitBtn: 'Submit Store Review',
    tiers: {
      outstanding: 'Outstanding',
      veryGood: 'Very Good',
      average: 'Average',
      fair: 'Fair',
      pending: 'Pending',
    },
    ratingLabels: {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    },
    criteriaList: [
      { key: 'price', label: 'Price', description: 'Fair pricing, competitiveness & overall value for money' },
      { key: 'distance', label: 'Distance', description: 'Convenience, proximity & location accessibility' },
      { key: 'deliveryTime', label: 'Delivery Time', description: 'Speed, timeliness and promptness of fulfillment' },
      { key: 'stockAvailability', label: 'Stock Availability', description: 'In-stock items and accurate product availability' },
      { key: 'shopRating', label: 'Shop Rating', description: 'Overall satisfaction with store presentation & service' },
      { key: 'sellerReliability', label: 'Seller Reliability', description: 'Trustworthiness, order accuracy & clear communication' },
      { key: 'serviceQuality', label: 'Delivery / Service Quality', description: 'Careful packaging, item condition & polite service' },
      { key: 'offers', label: 'Offers', description: 'Attractive discounts, promotional deals & rewards' },
      { key: 'repeatPreference', label: 'Repeat Customer Preference', description: 'Likelihood to purchase from this store again' },
      { key: 'returnResolution', label: 'Exchange / Problem Resolution', description: 'Efficiency in handling issues, queries or returns' },
    ],
    errors: {
      alreadyReviewed: 'You have already submitted a review for this store.',
      notEligible: 'This order is not eligible for review at this time.',
      verifyFailed: 'Failed to verify review eligibility. Please ensure you are logged in.',
      allRequiredAlert: 'Please rate all 10 criteria before submitting.',
      reviewFailedTitle: 'Review Failed',
      reviewFailedDesc: 'Failed to submit review. Please try again.',
    },
  },
  ta: {
    verifiedBadge: 'சரிபார்க்கப்பட்டது',
    verifyingEligibility: 'ஆர்டர் உறுதிப்படுத்தல் & OTP சரிபார்க்கப்படுகிறது...',
    reviewSubmittedTitle: 'மதிப்பாய்வு சமர்ப்பிக்கப்பட்டது!',
    reviewSubmittedDesc: '{{name}} கடையை மதிப்பிட்டதற்கு நன்றி. உங்கள் கருத்து எங்கள் சமூகத்திற்கும் கடை கூட்டாளருக்கும் உதவுகிறது.',
    alreadyReviewedTitle: 'மதிப்பாய்வு ஏற்கனவே சமர்ப்பிக்கப்பட்டது',
    alreadyReviewedDesc: 'இந்தக் கடைக்கான மதிப்பாய்வை நீங்கள் ஏற்கனவே சமர்ப்பித்துவிட்டீர்கள். வாடிக்கையாளர் ஒரு கடைக்கு ஒரு முறை மட்டுமே மதிப்பாய்வு வழங்க முடியும்.',
    notEligibleTitle: 'மதிப்பாய்வு செய்ய தகுதியற்றது',
    closeBtn: 'மூடு',
    yourSubmittedRating: 'நீங்கள் வழங்கிய மதிப்பீடு',
    overallScoreSuffix: '/ 5.0 ஒட்டுமொத்த',
    allCriteriaRated: '10 அளவுகோல்களும் மதிப்பிடப்பட்டன ✓',
    criteriaRatedCount: '10-ல் {{count}} அளவுகோல்கள் மதிப்பிடப்பட்டன',
    ratingCriteriaTitle: 'மதிப்பீட்டு அளவுகோல்கள் (1–5 நட்சத்திரங்கள்)',
    allRequired: '10-ம் அவசியம்',
    reviewTextTitle: 'வாடிக்கையாளர் மதிப்பாய்வு / விளக்கம் (விருப்பத்தேர்வு)',
    reviewPlaceholder: 'பொருளின் தரம், பேக்கேஜிங், கடை சேவை பற்றிய விவரங்களைப் பகிரவும்...',
    addPhotosTitle: 'புகைப்படங்களைச் சேர்க்கவும் (விருப்பத்தேர்வு, 5 வரை)',
    addPhotoBtn: 'புகைப்படம் சேர்க்க',
    cancelBtn: 'ரத்து செய்',
    submitBtn: 'கடை மதிப்பாய்வைச் சமர்ப்பிக்கவும்',
    tiers: {
      outstanding: 'சிறப்பானது',
      veryGood: 'மிக நன்று',
      average: 'சராசரி',
      fair: 'பரவாயில்லை',
      pending: 'நிலுவையில்',
    },
    ratingLabels: {
      1: 'மோசம்',
      2: 'பரவாயில்லை',
      3: 'நன்று',
      4: 'மிக நன்று',
      5: 'அருமை',
    },
    criteriaList: [
      { key: 'price', label: 'விலை', description: 'நியாயமான விலை, போட்டித்தன்மை மற்றும் பணத்திற்கான மதிப்பு' },
      { key: 'distance', label: 'தூரம்', description: 'வசதி, அருகாமை மற்றும் இருப்பிட அணுகல்தன்மை' },
      { key: 'deliveryTime', label: 'டெலிவரி நேரம்', description: 'வேகம், சரியான நேரம் மற்றும் விரைவான விநியோகம்' },
      { key: 'stockAvailability', label: 'பொருட்கள் இருப்பு', description: 'பொருட்களின் இருப்பு மற்றும் துல்லியமான தயாரிப்பு கிடைக்கும் தன்மை' },
      { key: 'shopRating', label: 'கடை மதிப்பீடு', description: 'கடை தோற்றம் மற்றும் சேவை பற்றிய ஒட்டுமொத்த திருப்தி' },
      { key: 'sellerReliability', label: 'விற்பனையாளர் நம்பகத்தன்மை', description: 'நம்பகத்தன்மை, ஆர்டர் துல்லியம் மற்றும் தெளிவான தொடர்பு' },
      { key: 'serviceQuality', label: 'சேவை தரம்', description: 'கவனமான பேக்கேஜிங், பொருளின் நிலை மற்றும் கண்ணியமான சேவை' },
      { key: 'offers', label: 'சலுகைகள்', description: 'கவர்ச்சிகரமான தள்ளுபடிகள், விளம்பர சலுகைகள் மற்றும் வெகுமதிகள்' },
      { key: 'repeatPreference', label: 'மறு கொள்முதல் விருப்பம்', description: 'இந்த கடையில் மீண்டும் வாங்குவதற்கான வாய்ப்பு' },
      { key: 'returnResolution', label: 'பிரச்சனை தீர்வு', description: 'பிரச்சனைகள், கேள்விகள் அல்லது திரும்பப் பெறுதலைக் கையாள்வதில் செயல்திறன்' },
    ],
    errors: {
      alreadyReviewed: 'இந்தக் கடைக்கான மதிப்பாய்வை நீங்கள் ஏற்கனவே சமர்ப்பித்துவிட்டீர்கள். ஒரு கடைக்கு ஒரு முறை மட்டுமே மதிப்பாய்வு வழங்க முடியும்.',
      notEligible: 'இந்த ஆர்டர் தற்போது மதிப்பாய்வுக்குத் தகுதியற்றது.',
      verifyFailed: 'மதிப்பாய்வு தகுதியைச் சரிபார்க்க முடியவில்லை. நீங்கள் உள்நுழைந்துள்ளீர்கள் என்பதை உறுதிப்படுத்தவும்.',
      allRequiredAlert: 'சமர்ப்பிப்பதற்கு முன் 10 அளவுகோல்களையும் மதிப்பிடவும்.',
      reviewFailedTitle: 'மதிப்பாய்வு தோல்வியடைந்தது',
      reviewFailedDesc: 'மதிப்பாய்வைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    },
  },
  te: {
    verifiedBadge: 'ధృవీకరించబడింది',
    verifyingEligibility: 'ఆర్డర్ ధృవీకరణ & OTP తనిఖీ చేయబడుతోంది...',
    reviewSubmittedTitle: 'సమీక్ష సమర్పించబడింది!',
    reviewSubmittedDesc: '{{name}} ను రేట్ చేసినందుకు ధన్యవాదాలు. మీ అభిప్రాయం మా సంఘానికి మరియు స్టోర్ భాగస్వామికి సహాయపడుతుంది.',
    alreadyReviewedTitle: 'సమీక్ష ఇప్పటికే సమర్పించబడింది',
    alreadyReviewedDesc: 'ఈ దుకాణానికి మీరు ఇప్పటికే సమీక్షను సమర్పించారు. ఒక కస్టమర్ ఒక దుకాణానికి ఒకసారి మాత్రమే సమీక్ష ఇవ్వగలరు.',
    notEligibleTitle: 'సమీక్షకు అర్హత లేదు',
    closeBtn: 'మూసివేయి',
    yourSubmittedRating: 'మీరు సమర్పించిన రేటింగ్',
    overallScoreSuffix: '/ 5.0 మొత్తం',
    allCriteriaRated: 'అన్ని 10 ప్రమాణాలు రేట్ చేయబడ్డాయి ✓',
    criteriaRatedCount: '10 ప్రమాణాలలో {{count}} రేట్ చేయబడ్డాయి',
    ratingCriteriaTitle: 'రేటింగ్ ప్రమాణాలు (1–5 నక్షత్రాలు)',
    allRequired: 'అన్ని 10 అవసరం',
    reviewTextTitle: 'కస్టమర్ సమీక్ష / వివరణ (ఐచ్ఛికం)',
    reviewPlaceholder: 'ఉత్పత్తి నాణ్యత, ప్యాకేజింగ్, స్టోర్ సేవ గురించి వివరాలను పంచుకోండి...',
    addPhotosTitle: 'ఫోటోలను జోడించండి (ఐచ్ఛికం, 5 వరకు)',
    addPhotoBtn: 'ఫోటో జోడించు',
    cancelBtn: 'రద్దు చేయి',
    submitBtn: 'స్టోర్ సమీక్షను సమర్పించండి',
    tiers: {
      outstanding: 'అత్యద్భుతం',
      veryGood: 'చాలా బాగుంది',
      average: 'సగటు',
      fair: 'పర్వాలేదు',
      pending: 'పెండింగ్',
    },
    ratingLabels: {
      1: 'బాగాలేదు',
      2: 'పర్వాలేదు',
      3: 'బాగుంది',
      4: 'చాలా బాగుంది',
      5: 'అద్భుతం',
    },
    criteriaList: [
      { key: 'price', label: 'ధర', description: 'సరసమైన ధర, పోటీతత్వం మరియు డబ్బుకు తగిన విలువ' },
      { key: 'distance', label: 'దూరం', description: 'సౌలభ్యం, సమీపం మరియు ప్రదేశ ప్రాప్యత' },
      { key: 'deliveryTime', label: 'డెలివరీ సమయం', description: 'వేగం, సమయపాలన మరియు సత్వర నెరవేర్పు' },
      { key: 'stockAvailability', label: 'స్టాక్ లభ్యత', description: 'స్టాక్‌లో ఉన్న వస్తువులు మరియు ఖచ్చితమైన ఉత్పత్తి లభ్యత' },
      { key: 'shopRating', label: 'షాప్ రేటింగ్', description: 'స్టోర్ ప్రదర్శన మరియు సేవతో మొత్తం సంతృప్తి' },
      { key: 'sellerReliability', label: 'విక్రేత విశ్వసనీయత', description: 'విశ్వసనీయత, ఆర్డర్ ఖచ్చితత్వం మరియు స్పష్టమైన కమ్యూనికేషన్' },
      { key: 'serviceQuality', label: 'సేవా నాణ్యత', description: 'జాగ్రత్తగా ప్యాకేజింగ్, వస్తువు పరిస్థితి మరియు మర్యాదపూర్వక సేవ' },
      { key: 'offers', label: 'ఆఫర్లు', description: 'ఆకర్షణీయమైన తగ్గింపులు, ప్రచార ఒప్పందాలు మరియు రివార్డులు' },
      { key: 'repeatPreference', label: 'పునరావృత ప్రాధాన్యత', description: 'ఈ దుకాణం నుండి మళ్లీ కొనుగోలు చేసే అవకాశం' },
      { key: 'returnResolution', label: 'సమస్య పరిష్కారం', description: 'సమస్యలు, ప్రశ్నలు లేదా రిటర్న్‌లను పరిష్కరించడంలో సామర్థ్యం' },
    ],
    errors: {
      alreadyReviewed: 'ఈ దుకాణానికి మీరు ఇప్పటికే సమీక్షను సమర్పించారు. ఒక కస్టమర్ ఒక దుకాణానికి ఒకసారి మాత్రమే సమీక్ష ఇవ్వగలరు.',
      notEligible: 'ఈ ఆర్డర్ ప్రస్తుతం సమీక్షకు అర్హత పొందలేదు.',
      verifyFailed: 'సమీక్ష అర్హతను ధృవీకరించడంలో విఫలమైంది. దయచేసి మీరు లాగిన్ అయ్యారని నిర్ధారించుకోండి.',
      allRequiredAlert: 'సమర్పించే ముందు దయచేసి అన్ని 10 ప్రమాణాలను రేట్ చేయండి.',
      reviewFailedTitle: 'సమీక్ష విఫలమైంది',
      reviewFailedDesc: 'సమీక్షను సమర్పించడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    },
  },
  kn: {
    verifiedBadge: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    verifyingEligibility: 'ಆರ್ಡರ್ ದೃಢೀಕರಣ ಮತ್ತು OTP ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    reviewSubmittedTitle: 'ವಿಮರ್ಶೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ!',
    reviewSubmittedDesc: '{{name}} ಅನ್ನು ರೇಟ್ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯು ನಮ್ಮ ಸಮುದಾಯ ಮತ್ತು ಅಂಗಡಿ ಪಾಲುದಾರರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    alreadyReviewedTitle: 'ವಿಮರ್ಶೆಯನ್ನು ಈಗಾಗಲೇ ಸಲ್ಲಿಸಲಾಗಿದೆ',
    alreadyReviewedDesc: 'ಈ ಅಂಗಡಿಗೆ ನೀವು ಈಗಾಗಲೇ ವಿಮರ್ಶೆಯನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ಗ್ರಾಹಕರು ಒಂದು ಅಂಗಡಿಗೆ ಒಮ್ಮೆ ಮಾತ್ರ ವಿಮರ್ಶೆ ನೀಡಬಹುದು.',
    notEligibleTitle: 'ವಿಮರ್ಶೆಗೆ ಅರ್ಹವಾಗಿಲ್ಲ',
    closeBtn: 'ಮುಚ್ಚಿ',
    yourSubmittedRating: 'ನೀವು ಸಲ್ಲಿಸಿದ ರೇಟಿಂಗ್',
    overallScoreSuffix: '/ 5.0 ಒಟ್ಟಾರೆ',
    allCriteriaRated: 'ಎಲ್ಲಾ 10 ಮಾನದಂಡಗಳು ರೇಟ್ ಮಾಡಲಾಗಿದೆ ✓',
    criteriaRatedCount: '10 ಮಾನದಂಡಗಳಲ್ಲಿ {{count}} ರೇಟ್ ಮಾಡಲಾಗಿದೆ',
    ratingCriteriaTitle: 'ರೇಟಿಂಗ್ ಮಾನದಂಡಗಳು (1–5 ನಕ್ಷತ್ರಗಳು)',
    allRequired: 'ಎಲ್ಲಾ 10 ಅಗತ್ಯವಿದೆ',
    reviewTextTitle: 'ಗ್ರಾಹಕರ ವಿಮರ್ಶೆ / ವಿವರಣೆ (ಐಚ್ಛಿಕ)',
    reviewPlaceholder: 'ಉತ್ಪನ್ನದ ಗುಣಮಟ್ಟ, ಪ್ಯಾಕೇಜಿಂಗ್, ಅಂಗಡಿ ಸೇವೆಯ ಕುರಿತು ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...',
    addPhotosTitle: 'ಫೋಟೋಗಳನ್ನು ಸೇರಿಸಿ (ಐಚ್ಛಿಕ, 5 ರವರೆಗೆ)',
    addPhotoBtn: 'ಫೋಟೋ ಸೇರಿಸಿ',
    cancelBtn: 'ರದ್ದುಮಾಡಿ',
    submitBtn: 'ಅಂಗಡಿ ವಿಮರ್ಶೆಯನ್ನು ಸಲ್ಲಿಸಿ',
    tiers: {
      outstanding: 'ಅತ್ಯುತ್ತಮ',
      veryGood: 'ತುಂಬಾ ಒಳ್ಳೆಯದು',
      average: 'ಸಾಧಾರಣ',
      fair: 'ನ್ಯಾಯಯುತ',
      pending: 'ಬಾಕಿ ಇದೆ',
    },
    ratingLabels: {
      1: 'ಕಳಪೆ',
      2: 'ನ್ಯಾಯಯುತ',
      3: 'ಒಳ್ಳೆಯದು',
      4: 'ತುಂಬಾ ಒಳ್ಳೆಯದು',
      5: 'ಅತ್ಯುತ್ತಮ',
    },
    criteriaList: [
      { key: 'price', label: 'ಬೆಲೆ', description: 'ನ್ಯಾಯಯುತ ಬೆಲೆ, ಸ್ಪರ್ಧಾತ್ಮಕತೆ ಮತ್ತು ಹಣಕ್ಕೆ ತಕ್ಕ ಮೌಲ್ಯ' },
      { key: 'distance', label: 'ದೂರ', description: 'ಅನುಕೂಲತೆ, ಸಾಮೀಪ್ಯ ಮತ್ತು ಸ್ಥಳ ಪ್ರವೇಶಿಸುವಿಕೆ' },
      { key: 'deliveryTime', label: 'ವಿತರಣಾ ಸಮಯ', description: 'ವೇಗ, ಸಮಯಪಾಲನೆ ಮತ್ತು ತ್ವರಿತ ಪೂರೈಕೆ' },
      { key: 'stockAvailability', label: 'ದಾಸ್ತಾನು ಲಭ್ಯತೆ', description: 'ದಾಸ್ತಾನು ವಸ್ತುಗಳು ಮತ್ತು ನಿಖರ ಉತ್ಪನ್ನ ಲಭ್ಯತೆ' },
      { key: 'shopRating', label: 'ಅಂಗಡಿ ರೇಟಿಂಗ್', description: 'ಅಂಗಡಿ ಪ್ರಸ್ತುತಿ ಮತ್ತು ಸೇವೆಯೊಂದಿಗೆ ಒಟ್ಟಾರೆ ತೃಪ್ತಿ' },
      { key: 'sellerReliability', label: 'ಮಾರಾಟಗಾರರ ವಿಶ್ವಾಸಾರ್ಹತೆ', description: 'ವಿಶ್ವಾಸಾರ್ಹತೆ, ಆದೇಶದ ನಿಖರತೆ ಮತ್ತು ಸ್ಪಷ್ಟ ಸಂವಹನ' },
      { key: 'serviceQuality', label: 'ಸೇವಾ ಗುಣಮಟ್ಟ', description: 'ಜಾಗರೂಕ ಪ್ಯಾಕೇಜಿಂಗ್, ವಸ್ತುವಿನ ಸ್ಥಿತಿ ಮತ್ತು ವಿನಮ್ರ ಸೇವೆ' },
      { key: 'offers', label: 'ಆಫರ್‌ಗಳು', description: 'ಆಕರ್ಷಕ ರಿಯಾಯಿತಿಗಳು, ಪ್ರಚಾರ ಕೊಡುಗೆಗಳು ಮತ್ತು ಬಹುಮಾನಗಳು' },
      { key: 'repeatPreference', label: 'ಮರು ಖರೀದಿಯ ಆದ್ಯತೆ', description: 'ಈ ಅಂಗಡಿಯಿಂದ ಮತ್ತೆ ಖರೀದಿಸುವ ಸಾಧ್ಯತೆ' },
      { key: 'returnResolution', label: 'ಸಮಸ್ಯೆ ಪರಿಹಾರ', description: 'ಸಮಸ್ಯೆಗಳು, ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ರಿಟರ್ನ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸುವಲ್ಲಿ ದಕ್ಷತೆ' },
    ],
    errors: {
      alreadyReviewed: 'ಈ ಅಂಗಡಿಗೆ ನೀವು ಈಗಾಗಲೇ ವಿಮರ್ಶೆಯನ್ನು ಸಲ್ಲಿಸಿದ್ದೀರಿ. ಗ್ರಾಹಕರು ಒಂದು ಅಂಗಡಿಗೆ ಒಮ್ಮೆ ಮಾತ್ರ ವಿಮರ್ಶೆ ನೀಡಬಹುದು.',
      notEligible: 'ಈ ಆದೇಶವು ಪ್ರಸ್ತುತ ಪರಿಶೀಲನೆಗೆ ಅರ್ಹವಾಗಿಲ್ಲ.',
      verifyFailed: 'ವಿಮರ್ಶೆಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ವಿಫಲವಾಗಿದೆ. ನೀವು ಲಾಗಿನ್ ಆಗಿರುವಿರಾ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
      allRequiredAlert: 'ಸಲ್ಲಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಎಲ್ಲಾ 10 ಮಾನದಂಡಗಳನ್ನು ರೇಟ್ ಮಾಡಿ.',
      reviewFailedTitle: 'ವಿಮರ್ಶೆ ವಿಫಲವಾಗಿದೆ',
      reviewFailedDesc: 'ವಿಮರ್ಶೆಯನ್ನು ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    },
  },
  ml: {
    verifiedBadge: 'സ്ഥിരീകരിച്ചു',
    verifyingEligibility: 'ഓർഡർ സ്ഥിരീകരണവും OTP-യും പരിശോധിക്കുന്നു...',
    reviewSubmittedTitle: 'അവലോകനം സമർപ്പിച്ചു!',
    reviewSubmittedDesc: '{{name}} വിലയിരുത്തിയതിന് നന്ദി. നിങ്ങളുടെ അഭിപ്രായം ഞങ്ങളുടെ കമ്മ്യൂണിറ്റിക്കും സ്റ്റോർ പങ്കാളിക്കും സഹായകരമാണ്.',
    alreadyReviewedTitle: 'അവലോകനം ഇതിനകം സമർപ്പിച്ചു',
    alreadyReviewedDesc: 'ഈ സ്റ്റോറിനായി നിങ്ങൾ ഇതിനകം ഒരു അവലോകനം സമർപ്പിച്ചിട്ടുണ്ട്. ഒരു ഉപഭോക്താവിന് ഒരു സ്റ്റോറിന് ഒരു തവണ മാത്രമേ അവലോകനം നൽകാൻ കഴിയൂ.',
    notEligibleTitle: 'അവലോകനത്തിന് അർഹമല്ല',
    closeBtn: 'അടയ്ക്കുക',
    yourSubmittedRating: 'നിങ്ങൾ നൽകിയ റേറ്റിംഗ്',
    overallScoreSuffix: '/ 5.0 ആകെ',
    allCriteriaRated: '10 മാനദണ്ഡങ്ങളും വിലയിരുത്തി ✓',
    criteriaRatedCount: '10-ൽ {{count}} മാനദണ്ഡങ്ങൾ വിലയിരുത്തി',
    ratingCriteriaTitle: 'റേറ്റിംഗ് മാനദണ്ഡങ്ങൾ (1–5 നക്ഷത്രങ്ങൾ)',
    allRequired: '10-ഉം നിർബന്ധമാണ്',
    reviewTextTitle: 'ഉപഭോക്തൃ അവലോകനം / വിവരണം (ഓപ്ഷണൽ)',
    reviewPlaceholder: 'ഉൽപ്പന്ന ഗുണനിലവാരം, പാക്കേജിംഗ്, സ്റ്റോർ സേവനം എന്നിവയെക്കുറിച്ചുള്ള വിവരങ്ങൾ പങ്കിടുക...',
    addPhotosTitle: 'ഫോട്ടോകൾ ചേർക്കുക (ഓപ്ഷണൽ, 5 വരെ)',
    addPhotoBtn: 'ഫോട്ടോ ചേർക്കുക',
    cancelBtn: 'റദ്ദാക്കുക',
    submitBtn: 'സ്റ്റോർ അവലോകനം സമർപ്പിക്കുക',
    tiers: {
      outstanding: 'മികച്ചത്',
      veryGood: 'വളരെ നല്ലത്',
      average: 'ശരാശരി',
      fair: 'തൃപ്തികരം',
      pending: 'തീർച്ചപ്പെടുത്തിയിട്ടില്ല',
    },
    ratingLabels: {
      1: 'മോശം',
      2: 'തൃപ്തികരം',
      3: 'നല്ലത്',
      4: 'വളരെ നല്ലത്',
      5: 'മികച്ചത്',
    },
    criteriaList: [
      { key: 'price', label: 'വില', description: 'ന്യായമായ വിലയും മത്സരക്ഷമതയും മികച്ച മൂല്യവും' },
      { key: 'distance', label: 'ദൂരം', description: 'സൗകര്യം, സാമീപ്യം, സ്ഥല ലഭ്യത' },
      { key: 'deliveryTime', label: 'ഡെലിവറി സമയം', description: 'വേഗത, കൃത്യസമയത്തുള്ള പൂർത്തീകരണം' },
      { key: 'stockAvailability', label: 'സ്റ്റോക്ക് ലഭ്യത', description: 'ഇനങ്ങൾ സ്റ്റോക്കിലുള്ളതും കൃത്യമായ ലഭ്യതയും' },
      { key: 'shopRating', label: 'ഷോപ്പ് റേറ്റിംഗ്', description: 'സ്റ്റോർ അവതരണത്തിലും സേവനത്തിലുമുള്ള സംതൃപ്തി' },
      { key: 'sellerReliability', label: 'വിൽപ്പനക്കാരന്റെ വിശ്വാസ്യത', description: 'വിശ്വാസ്യത, ഓർഡർ കൃത്യത, ആശയവിനിമയം' },
      { key: 'serviceQuality', label: 'സേവന ഗുണനിലവാരം', description: 'ശ്രദ്ധാപൂർവ്വമായ പാക്കേജിംഗ്, മാന്യമായ സേവനം' },
      { key: 'offers', label: 'ഓഫറുകൾ', description: 'ആകർഷകമായ കിഴിവുകളും ഓഫറുകളും റിവാർഡുകളും' },
      { key: 'repeatPreference', label: 'വീണ്ടും വാങ്ങാനുള്ള മുൻഗണന', description: 'ഈ സ്റ്റോറിൽ നിന്ന് വീണ്ടും വാങ്ങാനുള്ള സാധ്യത' },
      { key: 'returnResolution', label: 'പ്രശ്ന പരിഹാരം', description: 'പരാതികളും റിട്ടേണുകളും കൈകാര്യം ചെയ്യുന്നതിലെ കാര്യക്ഷമത' },
    ],
    errors: {
      alreadyReviewed: 'ഈ സ്റ്റോറിനായി നിങ്ങൾ ഇതിനകം ഒരു അവലോകനം സമർപ്പിച്ചിട്ടുണ്ട്. ഒരു ഉപഭോക്താവിന് ഒരു സ്റ്റോറിന് ഒരു തവണ മാത്രമേ അവലോകനം നൽകാൻ കഴിയൂ.',
      notEligible: 'ഈ ഓർഡർ ഇപ്പോൾ അവലോകനത്തിന് അർഹമല്ല.',
      verifyFailed: 'അവലോകന യോഗ്യത പരിശോധിക്കുന്നതിൽ പരാജയപ്പെട്ടു. നിങ്ങൾ ലോഗിൻ ചെയ്തിട്ടുണ്ടെന്ന് ഉറപ്പാക്കുക.',
      allRequiredAlert: 'സമർപ്പിക്കുന്നതിന് മുമ്പ് ദയവായി 10 മാനദണ്ഡങ്ങളും വിലയിരുത്തുക.',
      reviewFailedTitle: 'അവലോകനം പരാജയപ്പെട്ടു',
      reviewFailedDesc: 'അവലോകനം സമർപ്പിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    },
  },
  hi: {
    verifiedBadge: 'सत्यापित',
    verifyingEligibility: 'ऑर्डर पूर्ति और OTP सत्यापन किया जा रहा है...',
    reviewSubmittedTitle: 'समीक्षा सबमिट हो गई!',
    reviewSubmittedDesc: '{{name}} को रेटिंग देने के लिए धन्यवाद। आपकी प्रतिक्रिया हमारे समुदाय और स्टोर पार्टनर की मदद करती है।',
    alreadyReviewedTitle: 'समीक्षा पहले ही सबमिट की जा चुकी है',
    alreadyReviewedDesc: 'आप पहले ही इस स्टोर के लिए समीक्षा सबमिट कर चुके हैं। प्रत्येक ग्राहक किसी स्टोर की एक बार ही समीक्षा कर सकता है।',
    notEligibleTitle: 'समीक्षा के लिए पात्र नहीं है',
    closeBtn: 'बंद करें',
    yourSubmittedRating: 'आपकी सबमिट की गई रेटिंग',
    overallScoreSuffix: '/ 5.0 कुल',
    allCriteriaRated: 'सभी 10 मानदंडों का मूल्यांकन किया गया ✓',
    criteriaRatedCount: '10 में से {{count}} मानदंडों का मूल्यांकन किया गया',
    ratingCriteriaTitle: 'रेटिंग मानदंड (1–5 सितारे)',
    allRequired: 'सभी 10 आवश्यक',
    reviewTextTitle: 'ग्राहक समीक्षा / विवरण (वैकल्पिक)',
    reviewPlaceholder: 'उत्पाद की गुणवत्ता, पैकेजिंग, स्टोर सेवा के बारे में विवरण साझा करें...',
    addPhotosTitle: 'तस्वीरें जोड़ें (वैकल्पिक, 5 तक)',
    addPhotoBtn: 'फ़ोटो जोड़ें',
    cancelBtn: 'रद्द करें',
    submitBtn: 'स्टोर समीक्षा सबमिट करें',
    tiers: {
      outstanding: 'उत्कृष्ट',
      veryGood: 'बहुत अच्छा',
      average: 'औसत',
      fair: 'संतोषजनक',
      pending: 'लंबित',
    },
    ratingLabels: {
      1: 'खराब',
      2: 'ठीक-ठाक',
      3: 'अच्छा',
      4: 'बहुत अच्छा',
      5: 'शानदार',
    },
    criteriaList: [
      { key: 'price', label: 'मूल्य', description: 'उचित मूल्य, प्रतिस्पर्धात्मकता और पैसे का सही मूल्य' },
      { key: 'distance', label: 'दूरी', description: 'सुविधा, निकटता और स्थान की पहुंच' },
      { key: 'deliveryTime', label: 'डिलीवरी का समय', description: 'गति, समयबद्धता और त्वरित पूर्ति' },
      { key: 'stockAvailability', label: 'स्टॉक उपलब्धता', description: 'स्टॉक में उपलब्ध वस्तुएं और सटीक उत्पाद उपलब्धता' },
      { key: 'shopRating', label: 'दुकान की रेटिंग', description: 'दुकान की प्रस्तुति और सेवा से समग्र संतुष्टि' },
      { key: 'sellerReliability', label: 'विक्रेता विश्वसनीयता', description: 'विश्वसनीयता, ऑर्डर सटीकता और स्पष्ट संवाद' },
      { key: 'serviceQuality', label: 'सेवा गुणवत्ता', description: 'सावधानीपूर्वक पैकेजिंग, वस्तु की स्थिति और विनम्र सेवा' },
      { key: 'offers', label: 'ऑफ़र', description: 'आकर्षक छूट, प्रचार सौदे और पुरस्कार' },
      { key: 'repeatPreference', label: 'पुनः खरीदारी प्राथमिकता', description: 'इस दुकान से दोबारा खरीदारी करने की संभावना' },
      { key: 'returnResolution', label: 'समस्या समाधान', description: 'मुद्दों, प्रश्नों या रिटर्न को संभालने में दक्षता' },
    ],
    errors: {
      alreadyReviewed: 'आप पहले ही इस स्टोर के लिए समीक्षा सबमिट कर चुके हैं। प्रत्येक ग्राहक किसी स्टोर की एक बार ही समीक्षा कर सकता है।',
      notEligible: 'यह ऑर्डर इस समय समीक्षा के लिए पात्र नहीं है।',
      verifyFailed: 'समीक्षा पात्रता सत्यापित करने में विफल। कृपया सुनिश्चित करें कि आप लॉग इन हैं।',
      allRequiredAlert: 'सबमिट करने से पहले कृपया सभी 10 मानदंडों का मूल्यांकन करें।',
      reviewFailedTitle: 'समीक्षा विफल रही',
      reviewFailedDesc: 'समीक्षा सबमिट करने में विफल। कृपया पुनः प्रयास करें।',
    },
  },
};

export function getStoreReviewModalTranslations(lang: LanguageCode): StoreReviewModalTranslations {
  return STORE_REVIEW_MODAL_TRANSLATIONS[lang] || STORE_REVIEW_MODAL_TRANSLATIONS.en;
}
