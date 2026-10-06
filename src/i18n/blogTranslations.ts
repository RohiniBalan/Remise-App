import { LanguageCode } from './types';

export interface BlogData {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  categories: Record<string, string>;
  featuredBadge: string;
  readStoryBtn: string;
  readFullArticleBtn: string;
  readBtn: string;
  latestStoriesTitle: string;
  moreStoriesTitle: string;
  noArticlesFound: string;
  loadMoreBtn: string;
  remiseUpdatesTitle: string;
  viewAllNewsBtn: string;
  smartShoppingTitle: string;
  forBusinessesTitle: string;
  businessInsightsTitle: string;
  businessInsightsSubtitle: string;
  stayUpdatedTitle: string;
  newsletterSubtitle: string;
  emailPlaceholder: string;
  subscribeBtn: string;
  alreadySubscribed: string;
  thankYouSubscribing: string;
  backToBlog: string;
  share: string;
  relatedArticles: string;
  byAuthor: string;
}

export const BLOG_DATA: Record<LanguageCode, BlogData> = {
  en: {
    eyebrow: 'Blogs & News',
    heroTitle: 'Stories from Remise',
    heroSubtitle: 'Shopping tips, product updates, and news from the local businesses building on Remise.',
    searchPlaceholder: 'Search articles...',
    categories: {
      'All': 'All',
      'Shopping Tips': 'Shopping Tips',
      'Business': 'Business',
      'Technology': 'Technology',
      'Remise News': 'Remise News',
      'Offers': 'Offers',
      'General': 'General',
    },
    featuredBadge: 'Featured',
    readStoryBtn: 'Read Story',
    readFullArticleBtn: 'Read Full Article',
    readBtn: 'Read',
    latestStoriesTitle: 'Latest from Remise',
    moreStoriesTitle: 'More Stories',
    noArticlesFound: 'No articles match that search yet.',
    loadMoreBtn: 'Load More Articles',
    remiseUpdatesTitle: 'Remise Updates',
    viewAllNewsBtn: 'View All News',
    smartShoppingTitle: 'Smart Shopping Tips',
    forBusinessesTitle: 'For Local Businesses',
    businessInsightsTitle: 'Business Insights',
    businessInsightsSubtitle: 'Practical ideas for store owners, wholesalers, and home businesses building on Remise.',
    stayUpdatedTitle: 'Stay Updated',
    newsletterSubtitle: 'Get the latest Remise news, shopping tips, and business insights — sent occasionally, never spammed.',
    emailPlaceholder: 'Enter your email address',
    subscribeBtn: 'Subscribe',
    alreadySubscribed: "You're already subscribed to our newsletter!",
    thankYouSubscribing: 'Thank you for subscribing! Please check your inbox.',
    backToBlog: 'Back to Blogs & News',
    share: 'Share',
    relatedArticles: 'Related Articles',
    byAuthor: 'By',
  },
  ta: {
    eyebrow: 'வலைப்பதிவு மற்றும் செய்திகள்',
    heroTitle: 'ரெமிஸின் கதைகள் மற்றும் பதிவுகள்',
    heroSubtitle: 'ஷாப்பிங் குறிப்புகள், தயாரிப்பு புதுப்பிப்புகள் மற்றும் உள்ளூர் வணிகங்களின் செய்திகள்.',
    searchPlaceholder: 'கட்டுரைகளைத் தேடுங்கள்...',
    categories: {
      'All': 'அனைத்தும்',
      'Shopping Tips': 'ஷாப்பிங் குறிப்புகள்',
      'Business': 'வணிகம்',
      'Technology': 'தொழில்நுட்பம்',
      'Remise News': 'ரெமிஸ் செய்திகள்',
      'Offers': 'சலுகைகள்',
      'General': 'பொதுவானவை',
    },
    featuredBadge: 'முக்கிய கட்டுரை',
    readStoryBtn: 'கதையைப் படியுங்கள்',
    readFullArticleBtn: 'முழு கட்டுரையைப் படியுங்கள்',
    readBtn: 'படியுங்கள்',
    latestStoriesTitle: 'ரெமிஸின் சமீபத்திய பதிவுகள்',
    moreStoriesTitle: 'மேலும் பதிவுகள்',
    noArticlesFound: 'தேடலுக்குரிய கட்டுரைகள் எதுவும் கிடைக்கவில்லை.',
    loadMoreBtn: 'மேலும் கட்டுரைகளை ஏற்றவும்',
    remiseUpdatesTitle: 'ரெமிஸ் புதுப்பிப்புகள்',
    viewAllNewsBtn: 'அனைத்து செய்திகளையும் காண்க',
    smartShoppingTitle: 'சிறந்த ஷாப்பிங் குறிப்புகள்',
    forBusinessesTitle: 'உள்ளூர் வணிகங்களுக்காக',
    businessInsightsTitle: 'வணிக நுண்ணறிவுகள்',
    businessInsightsSubtitle: 'ரெமிஸில் வளரும் கடை உரிமையாளர்கள், மொத்த விற்பனையாளர்கள் மற்றும் இல்ல வணிகர்களுக்கான நடைமுறை யோசனைகள்.',
    stayUpdatedTitle: 'தொடர்ந்து இணைந்திருங்கள்',
    newsletterSubtitle: 'சமீபத்திய ரெமிஸ் செய்திகள், ஷாப்பிங் குறிப்புகள் மற்றும் வணிக நுண்ணறிவுகளைப் பெறுங்கள் — எப்போதாவது அனுப்பப்படும், ஸ்பேம் செய்யப்படாது.',
    emailPlaceholder: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
    subscribeBtn: 'இணையுங்கள்',
    alreadySubscribed: 'நீங்கள் ஏற்கனவே எங்கள் செய்திமடலில் இணைந்துள்ளீர்கள்!',
    thankYouSubscribing: 'இணைந்ததற்கு நன்றி! உங்கள் மின்னஞ்சல் இன்பாக்ஸைச் சரிபார்க்கவும்.',
    backToBlog: 'வலைப்பதிவு மற்றும் செய்திகளுக்கு திரும்பு',
    share: 'பகிர்',
    relatedArticles: 'தொடர்புடைய கட்டுரைகள்',
    byAuthor: 'எழுதியவர்',
  },
  te: {
    eyebrow: 'బ్లాగులు & వార్తలు',
    heroTitle: 'రెమిస్ కథనాలు మరియు విశేషాలు',
    heroSubtitle: 'షాపింగ్ చిట్కాలు, ఉత్పత్తి నవీకరణలు మరియు స్థానిక వ్యాపారాల వార్తలు.',
    searchPlaceholder: 'కథనాలను శోధించండి...',
    categories: {
      'All': 'అన్నీ',
      'Shopping Tips': 'షాపింగ్ చిట్కాలు',
      'Business': 'వ్యాపారం',
      'Technology': 'సాంకేతికత',
      'Remise News': 'రెమిస్ వార్తలు',
      'Offers': 'ఆఫర్లు',
      'General': 'సాధారణం',
    },
    featuredBadge: 'ప్రత్యేక కథనం',
    readStoryBtn: 'కథనం చదవండి',
    readFullArticleBtn: 'పూర్తి కథనం చదవండి',
    readBtn: 'చదవండి',
    latestStoriesTitle: 'రెమిస్ తాజా విశేషాలు',
    moreStoriesTitle: 'మరిన్ని కథనాలు',
    noArticlesFound: 'శోధనకు సరిపోయే కథనాలు ఏవీ కనుగొనబడలేదు.',
    loadMoreBtn: 'మరిన్ని కథనాలను లోడ్ చేయండి',
    remiseUpdatesTitle: 'రెమిస్ అప్‌డేట్స్',
    viewAllNewsBtn: 'అన్ని వార్తలను చూడండి',
    smartShoppingTitle: 'స్మార్ట్ షాపింగ్ చిట్కాలు',
    forBusinessesTitle: 'స్థానిక వ్యాపారాల కోసం',
    businessInsightsTitle: 'వ్యాపార అంతర్దృష్టులు',
    businessInsightsSubtitle: 'రెమిస్‌లో నిర్మించే స్టోర్ యజమానులు, టోకు వ్యాపారులు మరియు గృహ వ్యాపారాల కోసం ఆచరణాత్మక ఆలోచనలు.',
    stayUpdatedTitle: 'అప్‌డేట్‌గా ఉండండి',
    newsletterSubtitle: 'తాజా రెమిస్ వార్తలు, షాపింగ్ చిట్కాలు మరియు వ్యాపార ఆలోచనలను పొందండి.',
    emailPlaceholder: 'మీ ఇమెయిల్ చిరునామాను నమోదు చేయండి',
    subscribeBtn: 'సబ్‌స్క్రైబ్',
    alreadySubscribed: 'మీరు ఇప్పటికే మా న్యూస్‌లెటర్‌కు సబ్‌స్క్రైబ్ చేసుకున్నారు!',
    thankYouSubscribing: 'సబ్‌స్క్రైబ్ చేసుకున్నందుకు ధన్యవాదాలు! దయచేసి మీ ఇన్‌బాక్స్‌ని తనిఖీ చేయండి.',
    backToBlog: 'బ్లాగులు & వార్తలకు తిరిగి వెళ్లండి',
    share: 'భాగస్వామ్యం',
    relatedArticles: 'సంబంధిత కథనాలు',
    byAuthor: 'రచన',
  },
  ml: {
    eyebrow: 'ബ്ലോഗുകളും വാർത്തകളും',
    heroTitle: 'റെമിസിൽ നിന്നുള്ള വാർത്തകളും ലേഖനങ്ങളും',
    heroSubtitle: 'ഷോപ്പിംഗ് നുറുങ്ങുകൾ, ഉൽപ്പന്ന അപ്‌ഡേറ്റുകൾ, പ്രാദേശിക ബിസിനസ്സ് വാർത്തകൾ.',
    searchPlaceholder: 'ലേഖനങ്ങൾ തിരയുക...',
    categories: {
      'All': 'എല്ലാം',
      'Shopping Tips': 'ഷോപ്പിംഗ് നുറുങ്ങുകൾ',
      'Business': 'ബിസിനസ്സ്',
      'Technology': 'സാങ്കേതികവിദ്യ',
      'Remise News': 'റെമിസ് വാർത്തകൾ',
      'Offers': 'ഓഫറുകൾ',
      'General': 'പൊതുവായത്',
    },
    featuredBadge: 'പ്രത്യേകം',
    readStoryBtn: 'ലേഖനം വായിക്കുക',
    readFullArticleBtn: 'പൂർണ്ണമായ ലേഖനം വായിക്കുക',
    readBtn: 'വായിക്കുക',
    latestStoriesTitle: 'ഏറ്റവും പുതിയവ',
    moreStoriesTitle: 'കൂടുതൽ ലേഖനങ്ങൾ',
    noArticlesFound: 'ലേഖനങ്ങളൊന്നും കണ്ടെത്താനായില്ല.',
    loadMoreBtn: 'കൂടുതൽ ലേഖനങ്ങൾ കാണുക',
    remiseUpdatesTitle: 'റെമിസ് അപ്‌ഡേറ്റുകൾ',
    viewAllNewsBtn: 'എല്ലാ വാർത്തകളും കാണുക',
    smartShoppingTitle: 'സ്മാർട്ട് ഷോപ്പിംഗ് നുറുങ്ങുകൾ',
    forBusinessesTitle: 'പ്രാദേശിക ബിസിനസ്സുകൾക്കായി',
    businessInsightsTitle: 'ബിസിനസ്സ് ആശയങ്ങൾ',
    businessInsightsSubtitle: 'റെമിസ് ഉപയോഗിക്കുന്ന സ്റ്റോർ ഉടമകൾക്കും മൊത്തക്കച്ചവടക്കാർക്കും ഹോം ബിസിനസ്സുകൾക്കുമുള്ള പ്രായോഗിക ആശയങ്ങൾ.',
    stayUpdatedTitle: 'വിവരങ്ങൾ അറിയൂ',
    newsletterSubtitle: 'ഏറ്റവും പുതിയ വിവരങ്ങൾ, ഷോപ്പിംഗ് നുറുങ്ങുകൾ എന്നിവ ലഭിക്കാൻ സബ്‌സ്‌ക്രൈബ് ചെയ്യുക.',
    emailPlaceholder: 'നിങ്ങളുടെ ഇമെയിൽ നൽകുക',
    subscribeBtn: 'സബ്‌സ്‌ക്രൈബ്',
    alreadySubscribed: 'നിങ്ങൾ ഇതിനകം ന്യൂസ്‌ലെറ്ററിലേക്ക് സബ്‌സ്‌ക്രൈബ് ചെയ്തിട്ടുണ്ട്!',
    thankYouSubscribing: 'സബ്‌സ്‌ക്രൈബ് ചെയ്തതിന് നന്ദി! ദയവായി നിങ്ങളുടെ ഇൻബോക്സ് പരിശോധിക്കുക.',
    backToBlog: 'ബ്ലോഗുകളിലേക്കും വാർത്തകളിലേക്കും മടങ്ങുക',
    share: 'പങ്കിടുക',
    relatedArticles: 'ബന്ധപ്പെട്ട ലേഖനങ്ങൾ',
    byAuthor: 'എഴുതിയത്',
  },
  kn: {
    eyebrow: 'ಬ್ಲಾಗ್‌ಗಳು ಮತ್ತು ಸುದ್ದಿ',
    heroTitle: 'ರೆಮಿಸ್‌ನಿಂದ ಸುದ್ದಿಗಳು ಮತ್ತು ಕಥನಗಳು',
    heroSubtitle: 'ಶಾಪಿಂಗ್ ಸಲಹೆಗಳು, ಉತ್ಪನ್ನ ನವೀಕರಣಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ವ್ಯವಹಾರಗಳ ಸುದ್ದಿ.',
    searchPlaceholder: 'ಲೇಖನಗಳನ್ನು ಹುಡುಕಿ...',
    categories: {
      'All': 'ಎಲ್ಲವೂ',
      'Shopping Tips': 'ಶಾಪಿಂಗ್ ಸಲಹೆಗಳು',
      'Business': 'ವ್ಯವಹಾರ',
      'Technology': 'ತಂತ್ರಜ್ಞಾನ',
      'Remise News': 'ರೆಮಿಸ್ ಸುದ್ದಿ',
      'Offers': 'ಆಫರ್‌ಗಳು',
      'General': 'ಸಾಮಾನ್ಯ',
    },
    featuredBadge: 'ವಿಶೇಷ ಲೇಖನ',
    readStoryBtn: 'ಕಥನ ಓದಿ',
    readFullArticleBtn: 'ಪೂರ್ಣ ಲೇಖನ ಓದಿ',
    readBtn: 'ಓದಿ',
    latestStoriesTitle: 'ರೆಮಿಸ್‌ನ ಇತ್ತೀಚಿನ ಲೇಖನಗಳು',
    moreStoriesTitle: 'ಇನ್ನಷ್ಟು ಲೇಖನಗಳು',
    noArticlesFound: 'ಯಾವುದೇ ಲೇಖನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    loadMoreBtn: 'ಇನ್ನಷ್ಟು ಲೇಖನಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ',
    remiseUpdatesTitle: 'ರೆಮಿಸ್ ಅಪ್ಡೇಟ್ಸ್',
    viewAllNewsBtn: 'ಎಲ್ಲಾ ಸುದ್ದಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    smartShoppingTitle: 'ಸ್ಮಾರ್ಟ್ ಶಾಪಿಂಗ್ ಸಲಹೆಗಳು',
    forBusinessesTitle: 'ಸ್ಥಳೀಯ ವ್ಯವಹಾರಗಳಿಗಾಗಿ',
    businessInsightsTitle: 'ವ್ಯವಹಾರ ಒಳನೋಟಗಳು',
    businessInsightsSubtitle: 'ರೆಮಿಸ್‌ನಲ್ಲಿ ಬೆಳೆಯುತ್ತಿರುವ ಅಂಗಡಿ ಮಾಲೀಕರು, ಸಗಟು ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಗೃಹ ವ್ಯವಹಾರಗಳಿಗಾಗಿ ಪ್ರಾಯೋಗಿಕ ವಿಚಾರಗಳು.',
    stayUpdatedTitle: 'ಅಪ್ಡೇಟ್ ಆಗಿರಿ',
    newsletterSubtitle: 'ಇತ್ತೀಚಿನ ಲೇಖನಗಳು, ಶಾಪಿಂಗ್ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಲು ನಮ್ಮ ನ್ಯೂಸ್‌ಲೆಟರ್‌ಗೆ ಚಂದಾದಾರರಾಗಿ.',
    emailPlaceholder: 'ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ',
    subscribeBtn: 'ಚಂದಾದಾರರಾಗಿ',
    alreadySubscribed: 'ನೀವು ಈಗಾಗಲೇ ನಮ್ಮ ನ್ಯೂಸ್‌ಲೆಟರ್‌ಗೆ ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ!',
    thankYouSubscribing: 'ಚಂದಾದಾರರಾಗಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇನ್‌ಬಾಕ್ಸ್ ಪರಿಶೀಲಿಸಿ.',
    backToBlog: 'ಬ್ಲಾಗ್‌ಗಳು ಮತ್ತು ಸುದ್ದಿಗೆ ಹಿಂತಿರುಗಿ',
    share: 'ಹಂಚಿಕೊಳ್ಳಿ',
    relatedArticles: 'ಸಂಬಂಧಿತ ಲೇಖನಗಳು',
    byAuthor: 'ಬರೆದವರು',
  },
  hi: {
    eyebrow: 'ब्लॉग और समाचार',
    heroTitle: 'रेमिस से कहानियां और अपडेट',
    heroSubtitle: 'खरीदारी के टिप्स, उत्पाद अपडेट और स्थानीय व्यवसायों से समाचार।',
    searchPlaceholder: 'लेख खोजें...',
    categories: {
      'All': 'सभी',
      'Shopping Tips': 'खरीदारी टिप्स',
      'Business': 'व्यापार',
      'Technology': 'तकनीक',
      'Remise News': 'रेमिस समाचार',
      'Offers': 'ऑफ़र',
      'General': 'सामान्य',
    },
    featuredBadge: 'विशेष लेख',
    readStoryBtn: 'कहानी पढ़ें',
    readFullArticleBtn: 'पूरा लेख पढ़ें',
    readBtn: 'पढ़ें',
    latestStoriesTitle: 'रेमिस से नवीनतम',
    moreStoriesTitle: 'अधिक कहानियां',
    noArticlesFound: 'कोई लेख नहीं मिला।',
    loadMoreBtn: 'और लेख लोड करें',
    remiseUpdatesTitle: 'रेमिस अपडेट्स',
    viewAllNewsBtn: 'सभी समाचार देखें',
    smartShoppingTitle: 'स्मार्ट शॉपिंग टिप्स',
    forBusinessesTitle: 'स्थानीय व्यवसायों के लिए',
    businessInsightsTitle: 'व्यापार अंतर्दृष्टि',
    businessInsightsSubtitle: 'रेमिस पर स्टोर मालिकों, थोक विक्रेताओं और घरेलू व्यवसायों के लिए व्यावहारिक विचार।',
    stayUpdatedTitle: 'अपडेट रहें',
    newsletterSubtitle: 'नवीनतम कहानियों, खरीदारी सुझावों और अपडेट के लिए हमारे न्यूज़लेटर की सदस्यता लें।',
    emailPlaceholder: 'अपना ईमेल पता दर्ज करें',
    subscribeBtn: 'सब्सक्राइब करें',
    alreadySubscribed: 'आप पहले से ही हमारे न्यूज़लेटर के सदस्य हैं!',
    thankYouSubscribing: 'सब्सक्राइब करने के लिए धन्यवाद! कृपया अपना इनबॉक्स जांचें।',
    backToBlog: 'ब्लॉग और समाचार पर वापस जाएं',
    share: 'शेयर करें',
    relatedArticles: 'संबंधित लेख',
    byAuthor: 'द्वारा',
  },
};

export function getBlogData(lang: LanguageCode): BlogData {
  return BLOG_DATA[lang] || BLOG_DATA.en;
}

export function formatReadTime(readTime: string, lang: string): string {
  if (!readTime) return '';
  const numMatch = readTime.match(/\d+/);
  const minutes = numMatch ? numMatch[0] : '3';
  switch (lang) {
    case 'ta':
      return `${minutes} நிமிட வாசிப்பு`;
    case 'te':
      return `${minutes} నిమిషాల పఠనం`;
    case 'ml':
      return `${minutes} മിനിറ്റ് വായന`;
    case 'kn':
      return `${minutes} ನಿಮಿಷದ ಓದು`;
    case 'hi':
      return `${minutes} मिनट का पठन`;
    default:
      return `${minutes} min read`;
  }
}
