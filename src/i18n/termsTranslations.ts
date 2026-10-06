import { LanguageCode } from './types';

export interface ArticleBlock {
  type: 'p' | 'ul';
  text?: string;
  items?: string[];
}

export interface ArticleItem {
  n: number;
  title: string;
  summary: string;
  blocks: ArticleBlock[];
}

export interface HighlightItem {
  title: string;
  desc: string;
}

export interface TermsData {
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  heroTitle: string;
  heroSubtitle: string;
  highlightsTitle: string;
  highlightsSubtitle: string;
  highlights: HighlightItem[];
  articles: ArticleItem[];
  contactTag: string;
  contactTitle: string;
  contactSubtitle: string;
  contactButton: string;
}

export const TERMS_DATA: Record<LanguageCode, TermsData> = {
  en: {
    lastUpdatedLabel: "Last updated",
    lastUpdatedDate: "20 August 2026",
    heroTitle: "Terms of Service",
    heroSubtitle: "These Terms govern your use of the Remise website, mobile application, and related services.",
    highlightsTitle: "Key Points at a Glance",
    highlightsSubtitle: "A quick summary before you read the full terms.",
    highlights: [
      { title: "One account, your responsibility", desc: "Keep your login and OTP private — every action on your account is yours." },
      { title: "Sellers vouch for listings", desc: "Store Owners, Wholesalers, and Home Businesses must keep prices, stock, and product info accurate." },
      { title: "Pricing can vary by account", desc: "You may see a different price than a Store Owner or bulk buyer for the same item." },
      { title: "Pickup or delivery, your choice", desc: "Availability, fees, and timing can vary by store and location." },
      { title: "India-governed", desc: "These Terms are governed by Indian law, with disputes subject to the appropriate courts." },
    ],
    articles: [
      {
        n: 1,
        title: "About Remise",
        summary: "What Remise connects customers and sellers to do.",
        blocks: [
          { type: "p", text: "Remise is an e-commerce and local commerce platform that facilitates interactions between customers and sellers, including Store Owners, Wholesalers, and Home Businesses." },
          { type: "p", text: "Depending on the service, Remise may facilitate: Product discovery, store comparison, product ordering, payment processing, pickup, delivery, and seller-customer communication." },
        ],
      },
      {
        n: 2,
        title: "User Accounts",
        summary: "Keep your details accurate and your login secure.",
        blocks: [
          { type: "p", text: "You must provide accurate information when creating an account. You are responsible for maintaining confidentiality, keeping credentials secure, and all activities under your account." },
          { type: "p", text: "Do not share your password or OTP with others." },
        ],
      },
      {
        n: 3,
        title: "Customer Responsibilities",
        summary: "Accurate details, correct orders, and required payment.",
        blocks: [
          { type: "ul", items: ["Provide accurate delivery information.", "Select the correct store and products.", "Verify order details before confirmation.", "Make required payments.", "Follow applicable store policies."] },
        ],
      },
      {
        n: 4,
        title: "Seller Responsibilities",
        summary: "Accurate listings, lawful products, and honoring orders.",
        blocks: [
          { type: "ul", items: ["Providing accurate product information.", "Maintaining correct prices.", "Maintaining accurate stock information.", "Fulfilling accepted orders.", "Providing genuine and lawful products.", "Following applicable laws and regulations.", "Honoring applicable return/refund policies."] },
        ],
      },
      {
        n: 5,
        title: "Ordering & Acceptance",
        summary: "Orders are offers subject to seller acceptance.",
        blocks: [
          { type: "p", text: "Orders placed on Remise are offers to purchase products from sellers. Orders are subject to seller acceptance, product availability, and confirmation of pricing and delivery terms." },
        ],
      },
      {
        n: 6,
        title: "Pricing & Availability",
        summary: "Prices set by sellers, subject to change before confirmation.",
        blocks: [
          { type: "p", text: "Product prices and availability are managed by sellers and are subject to change. Prices may vary depending on customer type, bulk quantities, or promotional offers." },
        ],
      },
      {
        n: 7,
        title: "Bulk & Wholesale Orders",
        summary: "Special terms for high-volume transactions.",
        blocks: [
          { type: "p", text: "Bulk and wholesale orders may be subject to minimum order quantities, custom pricing, and specific delivery schedules agreed upon between the buyer and seller." },
        ],
      },
      {
        n: 8,
        title: "Fulfillment & Delivery",
        summary: "Delivery timelines, pickup options, and shipping terms.",
        blocks: [
          { type: "p", text: "Fulfillment options include store pickup and home delivery where supported. Delivery timelines and charges are determined based on store location and fulfillment method." },
        ],
      },
      {
        n: 9,
        title: "Payment Terms",
        summary: "Authorized gateways, pre-paid and COD terms.",
        blocks: [
          { type: "p", text: "Payments are processed through secure payment gateways. Remise supports accepted payment methods including UPI, cards, and net banking. Cash on delivery is subject to seller policy." },
        ],
      },
      {
        n: 10,
        title: "Returns & Refunds",
        summary: "Return eligibility, inspection, and refund processing.",
        blocks: [
          { type: "p", text: "Returns and refunds are governed by the platform Return Policy and individual seller terms. Eligible returns must meet condition requirements within the return window." },
        ],
      },
      {
        n: 11,
        title: "Prohibited Activities",
        summary: "Misuse, fraudulent orders, and scraping restrictions.",
        blocks: [
          { type: "ul", items: ["Providing false information.", "Creating fraudulent accounts.", "Using the platform for illegal activities.", "Uploading malicious or unlawful content.", "Manipulating prices or orders fraudulently.", "Attempting unauthorized access.", "Interfering with platform operations.", "Abusing payment or refund systems."] },
        ],
      },
      {
        n: 12,
        title: "Intellectual Property",
        summary: "Trademarks, content rights, and brand assets.",
        blocks: [
          { type: "p", text: "The Remise name, logo, software, design, content, and other platform materials are protected by applicable intellectual-property laws. Users may not copy or commercially exploit Remise materials without written permission." },
        ],
      },
      {
        n: 13,
        title: "Third-Party Services",
        summary: "Gateways, maps, and logistics integrations.",
        blocks: [
          { type: "p", text: "Remise may use third-party services for payment processing, authentication, maps, hosting, and analytics. Third-party services have their own terms and privacy policies." },
        ],
      },
      {
        n: 14,
        title: "Termination & Suspension",
        summary: "Account suspension and termination grounds.",
        blocks: [
          { type: "p", text: "Remise reserves the right to suspend or terminate accounts for fraudulent activity, violation of these Terms, illegal conduct, or security risks." },
        ],
      },
      {
        n: 15,
        title: "Limitation of Liability",
        summary: "Platform intermediary liability scope.",
        blocks: [
          { type: "p", text: "To the extent permitted by law, Remise operates as an intermediary marketplace and is not liable for seller product defects, third-party delivery delays, or network failures." },
        ],
      },
      {
        n: 16,
        title: "Platform Modifications",
        summary: "Features and service updates.",
        blocks: [
          { type: "p", text: "We may modify, suspend, or improve platform features at any time to enhance the user experience." },
        ],
      },
      {
        n: 17,
        title: "Changes to Terms",
        summary: "Notice and acceptance of updated Terms.",
        blocks: [
          { type: "p", text: "We may update these Terms periodically. Continued use of Remise following updates constitutes acceptance of the modified Terms." },
        ],
      },
      {
        n: 18,
        title: "Governing Law & Disputes",
        summary: "Applicable jurisdiction and dispute resolution.",
        blocks: [
          { type: "p", text: "These Terms are governed by the laws of India. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in India." },
        ],
      },
      {
        n: 19,
        title: "Contact Information",
        summary: "How to reach our legal and support teams.",
        blocks: [
          { type: "p", text: "For questions regarding these Terms, contact us via the official Help Center or at support@remise.in." },
        ],
      },
    ],
    contactTag: "Questions about our terms?",
    contactTitle: "Reach our support and legal team.",
    contactSubtitle: "Get in touch with Remise directly through our support channel.",
    contactButton: "Contact Support",
  },
  ta: {
    lastUpdatedLabel: "கடைசியாகப் புதுப்பிக்கப்பட்டது",
    lastUpdatedDate: "20 ஆகஸ்ட் 2026",
    heroTitle: "பயன்பாட்டு விதிமுறைகள்",
    heroSubtitle: "இந்த விதிமுறைகள் ரெமிஸ் தளம், செயலி மற்றும் தொடர்புடைய சேவைகளைப் பயன்படுத்துவதை நிர்வகிக்கின்றன.",
    highlightsTitle: "முக்கிய குறிப்புகள்",
    highlightsSubtitle: "முழு விதிமுறைகளையும் படிப்பதற்கு முன் ஒரு விரைவான சுருக்கம்.",
    highlights: [
      { title: "ஒரு கணக்கு, உங்கள் பொறுப்பு", desc: "உங்கள் உள்நுழைவு மற்றும் OTP-ஐப் பாதுகாப்பாக வைத்திருங்கள் — உங்கள் கணக்கின் செயல்களுக்கு நீங்களே பொறுப்பு." },
      { title: "விற்பனையாளர்களின் பட்டியல் பொறுப்பு", desc: "கடை உரிமையாளர்கள் மற்றும் மொத்த விற்பனையாளர்கள் விலை, இருப்பு மற்றும் தயாரிப்பு விவரங்களைத் துல்லியமாக பராமரிக்க வேண்டும்." },
      { title: "கணக்கு வகைக்கு ஏற்ப மாறுபடும் விலைகள்", desc: "ஒரே பொருளுக்கு சில்லறை வாடிக்கையாளர் மற்றும் மொத்த வாங்குபவருக்கு விலைகள் மாறுபடலாம்." },
      { title: "பிக்அப் அல்லது டெலிவரி, உங்கள் விருப்பம்", desc: "கிடைக்கும் தன்மை, கட்டணம் மற்றும் நேரம் கடை மற்றும் இருப்பிடத்தைப் பொறுத்தது." },
      { title: "இந்திய சட்டத்திற்கு உட்பட்டது", desc: "இந்த விதிமுறைகள் இந்திய சட்டங்களால் நிர்வகிக்கப்படுகின்றன, பிணக்குகள் இந்திய நீதிமன்றங்களுக்கு உட்பட்டவை." },
    ],
    articles: [
      {
        n: 1,
        title: "ரெமிஸ் பற்றி",
        summary: "ரெமிஸ் வாடிக்கையாளர்களையும் விற்பனையாளர்களையும் இணைக்கும் விதம்.",
        blocks: [
          { type: "p", text: "ரெமிஸ் என்பது வாடிக்கையாளர்கள், கடை உரிமையாளர்கள், மொத்த விற்பனையாளர்கள் மற்றும் வீட்டு வணிகங்களுக்கு இடையேயான தொடர்புகளை எளிதாக்கும் ஒரு வணிகத் தளமாகும்." },
          { type: "p", text: "தயாரிப்பு தேடல், கடைகளை ஒப்பிடுதல், ஆர்டர் செய்தல், கட்டணம் செலுத்துதல், பிக்அப் மற்றும் டெலிவரி ஆகியவற்றிற்கு ரெமிஸ் உதவுகிறது." },
        ],
      },
      {
        n: 2,
        title: "பயனர் கணக்குகள்",
        summary: "உங்கள் விவரங்களைத் துல்லியமாகவும் உள்நுழைவைப் பாதுகாப்பாகவும் வைத்திருங்கள்.",
        blocks: [
          { type: "p", text: "கணக்கை உருவாக்கும் போது துல்லியமான தகவல்களை வழங்க வேண்டும். உங்கள் கணக்கின் இரகசியத்தன்மையை பாதுகாப்பது உங்கள் பொறுப்பாகும்." },
          { type: "p", text: "கடவுச்சொல் அல்லது OTP-ஐ பிறருடன் பகிர வேண்டாம்." },
        ],
      },
      {
        n: 3,
        title: "வாடிக்கையாளர் பொறுப்புகள்",
        summary: "துல்லியமான விவரங்கள், சரியான ஆர்டர்கள் மற்றும் கட்டணம்.",
        blocks: [
          { type: "ul", items: ["துல்லியமான டெலிவரி தகவலை வழங்குதல்.", "சரியான கடை மற்றும் தயாரிப்புகளைத் தேர்ந்தெடுத்தல்.", "உறுதிப்படுத்துவதற்கு முன் ஆர்டர் விவரங்களைச் சரிபார்த்தல்.", "தேவையான கட்டணங்களைச் செலுத்துதல்.", "கடை விதிகளுக்கு இணங்குதல்."] },
        ],
      },
      {
        n: 4,
        title: "விற்பனையாளர் பொறுப்புகள்",
        summary: "துல்லியமான பட்டியல், சட்டப்பூர்வ பொருட்கள் மற்றும் ஆர்டர்களை நிறைவேற்றுதல்.",
        blocks: [
          { type: "ul", items: ["துல்லியமான தயாரிப்பு தகவல்களை வழங்குதல்.", "சரியான விலைகளைப் பராமரித்தல்.", "இருப்புத் தகவலைப் புதுப்பித்த நிலையில் வைத்திருத்தல்.", "ஏற்றுக்கொள்ளப்பட்ட ஆர்டர்களை நிறைவேற்றுதல்.", "அங்கீகரிக்கப்பட்ட பொருட்களை வழங்குதல்.", "சட்ட விதிமுறைகளைப் பின்பற்றுதல்."] },
        ],
      },
      {
        n: 5,
        title: "ஆர்டர் மற்றும் ஏற்றுக்கொள்ளுதல்",
        summary: "ஆர்டர்கள் விற்பனையாளரின் உறுதிப்படுத்தலுக்கு உட்பட்டவை.",
        blocks: [
          { type: "p", text: "ரெமிஸில் செய்யப்படும் ஆர்டர்கள் விற்பனையாளரின் ஏற்பு, தயாரிப்பு இருப்பு மற்றும் டெலிவரி விதிமுறைகளுக்கு உட்பட்டவை." },
        ],
      },
      {
        n: 6,
        title: "விலை மற்றும் இருப்பு",
        summary: "விற்பனையாளர்களால் நிர்ணயிக்கப்படும் விலைகள் மாற்றத்திற்கு உட்பட்டவை.",
        blocks: [
          { type: "p", text: "தயாரிப்பு விலைகள் மற்றும் இருப்பு விற்பனையாளர்களால் நிர்வகிக்கப்படுகிறது, மேலும் சலுகைகளுக்கு ஏற்ப மாறுபடலாம்." },
        ],
      },
      {
        n: 7,
        title: "மொத்த கொள்முதல் ஆர்டர்கள்",
        summary: "பெரிய அளவிலான பரிவர்த்தனைகளுக்கான சிறப்பு விதிமுறைகள்.",
        blocks: [
          { type: "p", text: "மொத்த ஆர்டர்கள் குறைந்தபட்ச அளவு, பிரத்யேக விலை மற்றும் இருதரப்பு ஒப்பந்த விதிகளுக்கு உட்பட்டவை." },
        ],
      },
      {
        n: 8,
        title: "டெலிவரி மற்றும் பிக்அப்",
        summary: "டெலிவரி காலக்கெடு மற்றும் ஷிப்பிங் விதிமுறைகள்.",
        blocks: [
          { type: "p", text: "கடை பிக்அப் மற்றும் ஹோம் டெலிவரி வசதிகள் இருப்பிடத்திற்கு ஏற்ப கிடைக்கின்றன." },
        ],
      },
      {
        n: 9,
        title: "கட்டண விதிமுறைகள்",
        summary: "பாதுகாப்பான கட்டண வழிகள், முன்கூட்டிய மற்றும் சிஓடி விதிமுறைகள்.",
        blocks: [
          { type: "p", text: "UPI, கார்டுகள் மற்றும் நெட் பேங்கிங் உள்ளிட்ட பாதுகாப்பான நுழைவாயில்கள் மூலம் கட்டணங்கள் செயலாக்கப்படுகின்றன." },
        ],
      },
      {
        n: 10,
        title: "திரும்புதல் மற்றும் பணத்தைத் திரும்பப் பெறுதல்",
        summary: "தகுதி மற்றும் பணத்தைத் திரும்பப் பெறும் முறை.",
        blocks: [
          { type: "p", text: "திரும்புதல்கள் தளத்தின் ரிட்டர்ன் கொள்கை மற்றும் விற்பனையாளர் விதிமுறைகளுக்கு உட்பட்டவை." },
        ],
      },
      {
        n: 11,
        title: "தடைசெய்யப்பட்ட நடவடிக்கைகள்",
        summary: "தளத்தைத் தவறாகப் பயன்படுத்துதல் மீதான கட்டுப்பாடுகள்.",
        blocks: [
          { type: "ul", items: ["தவறான தகவல்களை வழங்குதல்.", "மோசடி கணக்குகளை உருவாக்குதல்.", "சட்டவிரோத செயல்களுக்கு தளத்தைப் பயன்படுத்துதல்.", "தீங்கிழைக்கும் உள்ளடக்கத்தை பதிவேற்றுதல்.", "விலைகளைத் தவறாக மாற்றுதல்."] },
        ],
      },
      {
        n: 12,
        title: "அறிவுசார் சொத்துரிமை",
        summary: "ரெமிஸின் வர்த்தக முத்திரைகள் மற்றும் பிராண்ட் சொத்துக்கள்.",
        blocks: [
          { type: "p", text: "ரெமிஸின் பெயர், சின்னம் மற்றும் மென்பொருள் அறிவுசார் சொத்துரிமைச் சட்டங்களால் பாதுகாக்கப்படுகின்றன." },
        ],
      },
      {
        n: 13,
        title: "மூன்றாம் தரப்பு சேவைகள்",
        summary: "கட்டணம், வரைபடம் மற்றும் தொழில்நுட்ப இணைப்புகள்.",
        blocks: [
          { type: "p", text: "வரைபடங்கள் மற்றும் கட்டணங்களுக்காக மூன்றாம் தரப்பு சேவைகள் பயன்படுத்தப்படலாம், அவை அவற்றின் சொந்த விதிகளுக்கு உட்பட்டவை." },
        ],
      },
      {
        n: 14,
        title: "கணக்கு இடைநிறுத்தம்",
        summary: "கணக்கை முடக்குவதற்கான காரணங்கள்.",
        blocks: [
          { type: "p", text: "விதிமீறல் அல்லது மோசடி நடவடிக்கைகளில் ஈடுபடும் கணக்குகளை இடைநிறுத்த ரெமிஸுக்கு உரிமை உண்டு." },
        ],
      },
      {
        n: 15,
        title: "பொறுப்பு வரம்பு",
        summary: "தள இடைத்தரகர் பொறுப்பின் வரம்பு.",
        blocks: [
          { type: "p", text: "ரெமிஸ் ஒரு சந்தை இடைத்தரகராக செயல்படுகிறது மற்றும் விற்பனையாளர்களின் தயாரிப்புக் குறைபாடுகளுக்கு நேரடியாக பொறுப்பல்ல." },
        ],
      },
      {
        n: 16,
        title: "சேவை மாற்றங்கள்",
        summary: "தள அம்சங்கள் மற்றும் சேவை மேம்பாடுகள்.",
        blocks: [
          { type: "p", text: "சேவைகளை மேம்படுத்த எந்த நேரத்திலும் தள அம்சங்களை மாற்ற அல்லது புதுப்பிக்க எங்களுக்கு உரிமை உண்டு." },
        ],
      },
      {
        n: 17,
        title: "விதிமுறைகளில் மாற்றங்கள்",
        summary: "புதுப்பிக்கப்பட்ட விதிமுறைகளின் அறிவிப்பு.",
        blocks: [
          { type: "p", text: "விதிமுறைகள் அவ்வப்போது புதுப்பிக்கப்படலாம். தொடர்ச்சியான பயன்பாடு புதிய விதிமுறைகளை ஏற்றுக்கொண்டதாகக் கருதப்படும்." },
        ],
      },
      {
        n: 18,
        title: "சட்டம் மற்றும் பிணக்கு தீர்வு",
        summary: "பொருந்தக்கூடிய அதிகார வரம்பு.",
        blocks: [
          { type: "p", text: "இந்த விதிமுறைகள் இந்திய சட்டங்களுக்கு உட்பட்டவை மற்றும் இந்திய நீதிமன்றங்களின் பிரத்யேக அதிகார வரம்பிற்கு உட்பட்டவை." },
        ],
      },
      {
        n: 19,
        title: "தொடர்பு தகவல்",
        summary: "ஆதரவு மற்றும் சட்டக் குழுவை அணுகும் விதம்.",
        blocks: [
          { type: "p", text: "விதிமுறைகள் குறித்த கேள்விகளுக்கு உதவி மையம் வழியாக அல்லது support@remise.in முகவரியில் தொடர்பு கொள்ளவும்." },
        ],
      },
    ],
    contactTag: "விதிமுறைகள் பற்றிய கேள்விகள்?",
    contactTitle: "எங்கள் ஆதரவுக் குழுவைத் தொடர்பு கொள்ளவும்.",
    contactSubtitle: "பயன்பாட்டின் உள்ளே உள்ள அதிகாரப்பூர்வ உதவி மையம் வழியாக ரெமிஸை அணுகவும்.",
    contactButton: "தொடர்பு கொள்ள",
  },
  te: {
    lastUpdatedLabel: "చివరిగా నవీకరించబడింది",
    lastUpdatedDate: "20 ఆగస్టు 2026",
    heroTitle: "సేవా నిబంధనలు",
    heroSubtitle: "ఈ నిబంధనలు రెమిస్ వెబ్‌సైట్, మొబైల్ అప్లికేషన్ మరియు సంబంధిత సేవల వినియోగాన్ని నియంత్రిస్తాయి.",
    highlightsTitle: "ముఖ్యమైన అంశాలు",
    highlightsSubtitle: "పూర్తి నిబంధనలను చదవడానికి ముందు సంక్షిప్త సారాంశం.",
    highlights: [
      { title: "ఒక ఖాతా, మీ బాధ్యత", desc: "మీ లాగిన్ మరియు OTP ని గోప్యంగా ఉంచండి — మీ ఖాతాలోని ప్రతి చర్యకు మీరే బాధ్యులు." },
      { title: "జాబితాలకు విక్రేతదే పూచీ", desc: "స్టోర్ యజమానులు మరియు టోకు వ్యాపారులు ధరలు, స్టాక్ మరియు వివరాలను ఖచ్చితంగా ఉంచాలి." },
      { title: "ఖాతా రకాన్ని బట్టి ధరలు మారవచ్చు", desc: "ఒకే వస్తువుకు రిటైల్ కస్టమర్ మరియు బల్క్ కొనుగోలుదారుకు ధరలు మారవచ్చు." },
      { title: "పికప్ లేదా డెలివరీ, మీ ఎంపిక", desc: "లభ్యత, రుసుములు మరియు సమయం స్టోర్ మరియు స్థానాన్ని బట్టి మారుతుంటాయి." },
      { title: "భారత చట్టాలకు లోబడి ఉంటుంది", desc: "ఈ నిబంధనలు భారతీయ చట్టాల ద్వారా నిర్వహించబడతాయి." },
    ],
    articles: [
      {
        n: 1,
        title: "రెమిస్ గురించి",
        summary: "కస్టమర్లు మరియు విక్రేతలను రెమిస్ ఎలా కలుపుతుంది.",
        blocks: [
          { type: "p", text: "రెమిస్ అనేది కస్టమర్లు, స్టోర్ యజమానులు, టోకు వ్యాపారులు మరియు గృహ వ్యాపారాల మధ్య లావాదేవీలను సులభతరం చేసే ఇ-కామర్స్ ప్లాట్‌ఫారమ్." },
          { type: "p", text: "ఉత్పత్తుల శోధన, స్టోర్ల పోలిక, ఆర్డరింగ్, చెల్లింపులు, పికప్ మరియు డెలివరీ సేవలను రెమిస్ సులభతరం చేస్తుంది." },
        ],
      },
      {
        n: 2,
        title: "వినియోగదారు ఖాతాలు",
        summary: "మీ వివరాలను ఖచ్చితంగా మరియు లాగిన్‌ను సురక్షితంగా ఉంచండి.",
        blocks: [
          { type: "p", text: "ఖాతా సృష్టించేటప్పుడు ఖచ్చితమైన సమాచారాన్ని అందించాలి. మీ లాగిన్ వివరాల భద్రత మీ బాధ్యత." },
          { type: "p", text: "పాస్‌వర్డ్ లేదా OTP ని ఇతరులతో పంచుకోవద్దు." },
        ],
      },
      {
        n: 3,
        title: "కస్టమర్ బాధ్యతలు",
        summary: "ఖచ్చితమైన వివరాలు, సరైన ఆర్డర్లు మరియు చెల్లింపు.",
        blocks: [
          { type: "ul", items: ["ఖచ్చితమైన డెలివరీ సమాచారాన్ని అందించడం.", "సరైన స్టోర్ మరియు ఉత్పత్తులను ఎంచుకోవడం.", "ఆర్డర్ వివరాలను ధృవీకరించడం.", "సకాలంలో చెల్లింపులు చేయడం."] },
        ],
      },
      {
        n: 4,
        title: "విక్రేత బాధ్యతలు",
        summary: "ఖచ్చితమైన లిస్టింగ్‌లు, నిజమైన ఉత్పత్తులు మరియు ఆర్డర్ నెరవేర్పు.",
        blocks: [
          { type: "ul", items: ["ఖచ్చితమైన ఉత్పత్తి సమాచారాన్ని అందించడం.", "సరైన ధరలను నిర్వహించడం.", "స్టాక్ సమాచారాన్ని ఖచ్చితంగా ఉంచడం.", "ఆమోదించిన ఆర్డర్లను పంపడం.", "చట్టపరమైన నిబంధనలను పాటించడం."] },
        ],
      },
      {
        n: 5,
        title: "ఆర్డరింగ్ మరియు అంగీకారం",
        summary: "ఆర్డర్లు విక్రేత ఆమోదానికి లోబడి ఉంటాయి.",
        blocks: [
          { type: "p", text: "రెమిస్‌లో చేసే ఆర్డర్‌లు విక్రేత ఆమోదం, స్టాక్ లభ్యత మరియు డెలివరీ నిబంధనలకు లోబడి ఉంటాయి." },
        ],
      },
      {
        n: 6,
        title: "ధరలు మరియు లభ్యత",
        summary: "విక్రేతలచే నిర్ణయించబడే ధరలు మార్పుకు లోబడి ఉంటాయి.",
        blocks: [
          { type: "p", text: "ధరలు మరియు లభ్యత విక్రేతలచే నిర్వహించబడతాయి మరియు ప్రమోషన్ల ఆధారంగా మారవచ్చు." },
        ],
      },
      {
        n: 7,
        title: "హోల్‌సేల్ & బల్క్ ఆర్డర్లు",
        summary: "పెద్ద పరిమాణ లావాదేవీలకు ప్రత్యేక నిబంధనలు.",
        blocks: [
          { type: "p", text: "బల్క్ ఆర్డర్‌లు కనీస పరిమాణం, ప్రత్యేక ధర మరియు పరస్పర ఒప్పందానికి లోబడి ఉంటాయి." },
        ],
      },
      {
        n: 8,
        title: "డెలివరీ మరియు పికప్",
        summary: "డెలివరీ సమయాలు మరియు షిప్పింగ్ నిబంధనలు.",
        blocks: [
          { type: "p", text: "స్టోర్ పికప్ మరియు హోమ్ డెలివరీ ఎంపికలు స్థానాన్ని బట్టి అందుబాటులో ఉంటాయి." },
        ],
      },
      {
        n: 9,
        title: "చెల్లింపు నిబంధనలు",
        summary: "సురక్షిత గేట్‌వేలు మరియు చెల్లింపు విధానాలు.",
        blocks: [
          { type: "p", text: "UPI, కార్డులు మరియు నెట్ బ్యాంకింగ్ ద్వారా చెల్లింపులు సురక్షితంగా ప్రాసెస్ చేయబడతాయి." },
        ],
      },
      {
        n: 10,
        title: "రిటర్న్స్ మరియు రీఫండ్‌లు",
        summary: "రిటర్న్ అర్హత మరియు రీఫండ్ విధానం.",
        blocks: [
          { type: "p", text: "రిటర్న్స్ ప్లాట్‌ఫారమ్ రిటర్న్ పాలసీ మరియు విక్రేత నిబంధనలకు లోబడి ఉంటాయి." },
        ],
      },
      {
        n: 11,
        title: "నిషేధిత కార్యకలాపాలు",
        summary: "ప్లాట్‌ఫారమ్‌ను దుర్వినియోగం చేయడంపై ఆంక్షలు.",
        blocks: [
          { type: "ul", items: ["తప్పుడు సమాచారం అందించడం.", "మోసపూరిత ఖాతాలు సృష్టించడం.", "చట్టవిరుద్ధ పనులకు వాడటం.", "హానికరమైన కంటెంట్‌ను అప్‌లోడ్ చేయడం."] },
        ],
      },
      {
        n: 12,
        title: "మేధో సంపత్తి",
        summary: "రెమిస్ బ్రాండ్ ఆస్తులు మరియు హక్కులు.",
        blocks: [
          { type: "p", text: "రెమిస్ పేరు, లోగో మరియు సాఫ్ట్‌వేర్ మేధో సంపత్తి చట్టాల ద్వారా రక్షించబడ్డాయి." },
        ],
      },
      {
        n: 13,
        title: "మూడవ పక్ష సేవలు",
        summary: "చెల్లింపులు మరియు మ్యాప్స్ అనుసంధానం.",
        blocks: [
          { type: "p", text: "మ్యాప్‌లు మరియు గేట్‌వేల కోసం థర్డ్-పార్టీ సేవలు ఉపయోగించబడతాయి, అవి వాటి స్వంత నిబంధనలను కలిగి ఉంటాయి." },
        ],
      },
      {
        n: 14,
        title: "ఖాతా నిలిపివేత",
        summary: "ఖాతాను రద్దు చేసే పరిస్థితులు.",
        blocks: [
          { type: "p", text: "మోసపూరిత కార్యకలాపాలు లేదా ఉల్లంఘనల కోసం ఖాతాలను నిలిపివేసే హక్కు రెమిస్‌కు ఉంది." },
        ],
      },
      {
        n: 15,
        title: "బాధ్యత పరిమితి",
        summary: "ప్లాట్‌ఫారమ్ మధ్యవర్తి బాధ్యత పరిధి.",
        blocks: [
          { type: "p", text: "రెమిస్ మార్కెట్‌ప్లేస్ మధ్యవర్తిగా పనిచేస్తుంది మరియు విక్రేత ఉత్పత్తుల లోపాలకు నేరుగా బాధ్యత వహించదు." },
        ],
      },
      {
        n: 16,
        title: "సేవలో మార్పులు",
        summary: "ఫీచర్ల నవీకరణ మరియు మెరుగుదలలు.",
        blocks: [
          { type: "p", text: "సేవలను మెరుగుపరచడానికి ఎప్పుడైనా ఫీచర్లను మార్చే హక్కు మాకు ఉంది." },
        ],
      },
      {
        n: 17,
        title: "నిబంధనలలో మార్పులు",
        summary: "నవీకరించబడిన నిబంధనల నోటీసు.",
        blocks: [
          { type: "p", text: "నిబంధనలు కాలానుగుణంగా నవీకరించబడతాయి. నిరంతర వినియోగం కొత్త నిబంధనలను అంగీకరించినట్లుగా పరిగణించబడుతుంది." },
        ],
      },
      {
        n: 18,
        title: "చట్టం మరియు వివాదాల పరిష్కారం",
        summary: "వర్తించే అధికార పరిధి.",
        blocks: [
          { type: "p", text: "ఈ నిబంధనలు భారతీయ చట్టాలకు లోబడి ఉంటాయి మరియు భారత న్యాయస్థానాల పరిధిలో పరిష్కరించబడతాయి." },
        ],
      },
      {
        n: 19,
        title: "సంప్రదింపు సమాచారం",
        summary: "సహాయక బృందాన్ని ఎలా సంప్రదించాలి.",
        blocks: [
          { type: "p", text: "ప్రశ్నల కోసం సహాయ కేంద్రాన్ని లేదా support@remise.in ను సంప్రదించండి." },
        ],
      },
    ],
    contactTag: "నిబంధనల గురించి సందేహాలున్నాయా?",
    contactTitle: "మా సహాయక బృందాన్ని సంప్రదించండి.",
    contactSubtitle: "యాప్‌లోని అధికారిక హెల్ప్ సెంటర్ ద్వారా నేరుగా సంప్రదించండి.",
    contactButton: "సంప్రదించండి",
  },
  ml: {
    lastUpdatedLabel: "അവസാനം അപ്ഡേറ്റ് ചെയ്തത്",
    lastUpdatedDate: "20 ഓഗസ്റ്റ് 2026",
    heroTitle: "സേവന നിബന്ധനകൾ",
    heroSubtitle: "റെമിസ് വെബ്‌സൈറ്റും മൊബൈൽ ആപ്ലിക്കേഷനും ഉപയോഗിക്കുന്നത് ഈ നിബന്ധനകൾക്ക് വിധേയമാണ്.",
    highlightsTitle: "പ്രധാന വിവരങ്ങൾ ചുരുക്കത്തിൽ",
    highlightsSubtitle: "പൂർണ്ണ വിവരങ്ങൾ വായിക്കുന്നതിന് മുമ്പ് ലഘുവായ ഒരു അവലോകനം.",
    highlights: [
      { title: "ഒരു അക്കൗണ്ട്, നിങ്ങളുടെ ഉത്തരവാദിത്തം", desc: "ലോഗിൻ വിവരങ്ങളും ഒടിപിയും സ്വകാര്യമായി സൂക്ഷിക്കുക — നിങ്ങളുടെ അക്കൗണ്ടിലെ പ്രവർത്തനങ്ങൾക്ക് നിങ്ങൾ തന്നെയാണ് ഉത്തരവാദി." },
      { title: "ലിസ്റ്റിംഗുകൾക്ക് വ്യാപാരിക്ക് ഉത്തരവാദിത്തം", desc: "വിലയും സ്റ്റോക്കും ഉൽപ്പന്ന വിവരങ്ങളും വ്യാപാരികൾ കൃത്യമായി നൽകേണ്ടതുണ്ട്." },
      { title: "അക്കൗണ്ട് അനുസരിച്ച് വില വ്യത്യാസപ്പെടാം", desc: "റീട്ടെയിൽ ഉപഭോക്താക്കൾക്കും മൊത്തക്കച്ചവടക്കാർക്കും വിലയിൽ വ്യത്യാസമുണ്ടാകാം." },
      { title: "പിക്കപ്പ് അല്ലെങ്കിൽ ഡെലിവറി, നിങ്ങളുടെ ഇഷ്ടം", desc: "ലഭ്യതയും ഫീസും സമയവും സ്റ്റോറിനെയും ലൊക്കേഷനെയും ആശ്രയിച്ചിരിക്കുന്നു." },
      { title: "ഇന്ത്യൻ നിയമങ്ങൾക്ക് വിധേയം", desc: "ഈ നിബന്ധനകൾ ഇന്ത്യൻ നിയമങ്ങൾക്ക് വിധേയമാണ്." },
    ],
    articles: [
      {
        n: 1,
        title: "റെമിസിനെക്കുറിച്ച്",
        summary: "റെമിസ് ഉപഭോക്താക്കളെയും വ്യാപാരികളെയും ബന്ധിപ്പിക്കുന്നത് എങ്ങനെ.",
        blocks: [
          { type: "p", text: "ഉപഭോക്താക്കൾ, കടയുടമകൾ, മൊത്തക്കച്ചവടക്കാർ, ചെറുകിട സംരംഭകർ എന്നിവർ തമ്മിലുള്ള ഇടപാടുകൾ സുഗമമാക്കുന്ന പ്ലാറ്റ്‌ഫോമാണ് റെമിസ്." },
          { type: "p", text: "ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താനും, വില താരതമ്യം ചെയ്യാനും, ഓർഡർ നൽകാനും, പണമടയ്ക്കാനും റെമിസ് സഹായിക്കുന്നു." },
        ],
      },
      {
        n: 2,
        title: "ഉപയോക്തൃ അക്കൗണ്ടുകൾ",
        summary: "വിവരങ്ങൾ കൃത്യമായി നൽകുക, ലോഗിൻ സുരക്ഷിതമായി സൂക്ഷിക്കുക.",
        blocks: [
          { type: "p", text: "അക്കൗണ്ട് സൃഷ്ടിക്കുമ്പോൾ കൃത്യമായ വിവരങ്ങൾ നൽകണം. ലോഗിൻ വിവരങ്ങൾ സുരക്ഷിതമായി സൂക്ഷിക്കേണ്ടത് നിങ്ങളുടെ ഉത്തരവാദിത്തമാണ്." },
          { type: "p", text: "പാസ്‌വേഡോ ഒടിപിയോ മറ്റുള്ളവരുമായി പങ്കിടരുത്." },
        ],
      },
      {
        n: 3,
        title: "ഉപഭോക്തൃ ഉത്തരവാദിത്തങ്ങൾ",
        summary: "കൃത്യമായ വിവരങ്ങൾ, ശരിയായ ഓർഡറുകൾ, പണമടയ്ക്കൽ.",
        blocks: [
          { type: "ul", items: ["കൃത്യമായ ഡെലിവറി വിലാസം നൽകുക.", "ശരിയായ ഉൽപ്പന്നങ്ങൾ തിരഞ്ഞെടുക്കുക.", "ഓർഡർ വിശദാംശങ്ങൾ പരിശോധിക്കുക.", "ആവശ്യമായ പണമടയ്ക്കൽ നടത്തുക."] },
        ],
      },
      {
        n: 4,
        title: "വ്യാപാരികളുടെ ഉത്തരവാദിത്തങ്ങൾ",
        summary: "കൃത്യമായ ലിസ്റ്റിംഗുകൾ, യഥാർത്ഥ ഉൽപ്പന്നങ്ങൾ, ഓർഡർ പൂർത്തീകരണം.",
        blocks: [
          { type: "ul", items: ["കൃത്യമായ ഉൽപ്പന്ന വിവരങ്ങൾ നൽകുക.", "ശരിയായ വില രേഖപ്പെടുത്തുക.", "സ്റ്റോക്ക് വിവരങ്ങൾ കൃത്യമായി സൂക്ഷിക്കുക.", "സ്വീകരിച്ച ഓർഡറുകൾ എത്തിക്കുക."] },
        ],
      },
      {
        n: 5,
        title: "ഓർഡറും സ്വീകരണവും",
        summary: "ഓർഡറുകൾ വ്യാപാരിയുടെ അംഗീകാരത്തിന് വിധേയമാണ്.",
        blocks: [
          { type: "p", text: "റെമിസിലെ ഓർഡറുകൾ ഉൽപ്പന്ന ലഭ്യതയ്ക്കും വ്യാപാരിയുടെ അംഗീകാരത്തിനും വിധേയമാണ്." },
        ],
      },
      {
        n: 6,
        title: "വിലയും ലഭ്യതയും",
        summary: "വ്യാപാരികൾ നിശ്ചയിക്കുന്ന വിലകളിൽ മാറ്റമുണ്ടാകാം.",
        blocks: [
          { type: "p", text: "വിലകളും ലഭ്യതയും വ്യാപാരികളാണ് നിയന്ത്രിക്കുന്നത്, ഓഫറുകൾക്കനുസരിച്ച് വ്യത്യാസപ്പെടാം." },
        ],
      },
      {
        n: 7,
        title: "മൊത്തവ്യാപാര ഓർഡറുകൾ",
        summary: "വൻതോതിലുള്ള ഇടപാടുകൾക്കുള്ള പ്രത്യേക നിബന്ധനകൾ.",
        blocks: [
          { type: "p", text: "മൊത്തവ്യാപാര ഓർഡറുകൾക്ക് പ്രത്യേക വിലയും നിബന്ധനകളും ബാധകമായിരിക്കും." },
        ],
      },
      {
        n: 8,
        title: "ഡെലിവറിയും പിക്കപ്പും",
        summary: "ഷിപ്പിംഗ് നിബന്ധനകളും സമയക്രമവും.",
        blocks: [
          { type: "p", text: "സ്റ്റോർ പിക്കപ്പ്, ഹോം ഡെലിവറി സൗകര്യങ്ങൾ ലഭ്യതയ്ക്കനുസരിച്ച് തിരഞ്ഞെടുക്കാം." },
        ],
      },
      {
        n: 9,
        title: "പേയ്‌മെന്റ് നിബന്ധനകൾ",
        summary: "സുരക്ഷിത പേയ്‌മെന്റ് ഗേറ്റ്‌വേകൾ.",
        blocks: [
          { type: "p", text: "UPI, കാർഡുകൾ, നെറ്റ് ബാങ്കിംഗ് വഴിയുള്ള പേയ്‌മെന്റുകൾ സുരക്ഷിതമായി പ്രോസസ്സ് ചെയ്യുന്നു." },
        ],
      },
      {
        n: 10,
        title: "റിട്ടേണും റീഫണ്ടും",
        summary: "റിട്ടേൺ യോഗ്യതയും പണം തിരികെ ലഭിക്കുന്ന രീതിയും.",
        blocks: [
          { type: "p", text: "റിട്ടേണുകൾ പ്ലാറ്റ്‌ഫോം റിട്ടേൺ പോളിസിക്കും വ്യാപാരിയുടെ നിബന്ധനകൾക്കും വിധേയമാണ്." },
        ],
      },
      {
        n: 11,
        title: "നിരോധിത പ്രവർത്തനങ്ങൾ",
        summary: "പ്ലാറ്റ്‌ഫോം ദുരുപയോഗം ചെയ്യുന്നതിനുള്ള നിയന്ത്രണങ്ങൾ.",
        blocks: [
          { type: "ul", items: ["തെറ്റായ വിവരങ്ങൾ നൽകൽ.", "വ്യാജ അക്കൗണ്ടുകൾ ഉണ്ടാക്കൽ.", "നിയമവിരുദ്ധ പ്രവർത്തനങ്ങൾക്ക് ഉപയോഗിക്കൽ."] },
        ],
      },
      {
        n: 12,
        title: "ബൗദ്ധിക സ്വത്തവകാശം",
        summary: "റെമിസിന്റെ ബ്രാൻഡ് അവകാശങ്ങൾ.",
        blocks: [
          { type: "p", text: "റെമിസിന്റെ ലോഗോയും സോഫ്റ്റ്‌വെയറും ബൗദ്ധിക സ്വത്തവകാശ നിയമങ്ങളാൽ സംരക്ഷിക്കപ്പെട്ടിരിക്കുന്നു." },
        ],
      },
      {
        n: 13,
        title: "മൂന്നാം കക്ഷി സേവനങ്ങൾ",
        summary: "പേയ്‌മെന്റുകളും മാപ്പുകളും.",
        blocks: [
          { type: "p", text: "മാപ്പുകൾക്കും പേയ്‌മെന്റുകൾക്കുമായി മൂന്നാം കക്ഷി സേവനങ്ങൾ ഉപയോഗിക്കുന്നു." },
        ],
      },
      {
        n: 14,
        title: "അക്കൗണ്ട് റദ്ദാക്കൽ",
        summary: "അക്കൗണ്ട് സസ്പെൻഡ് ചെയ്യുന്നതിനുള്ള കാരണങ്ങൾ.",
        blocks: [
          { type: "p", text: "തട്ടിപ്പുകൾ നടത്തുന്ന അക്കൗണ്ടുകൾ റദ്ദാക്കാൻ റെമിസിന് അവകാശമുണ്ട്." },
        ],
      },
      {
        n: 15,
        title: "ബാധ്യതാ പരിമിതി",
        summary: "പ്ലാറ്റ്‌ഫോം ബാധ്യതയുടെ പരിധി.",
        blocks: [
          { type: "p", text: "റെമിസ് ഒരു ഓൺലൈൻ വിപണി മാത്രമാണ്, ഉൽപ്പന്ന തകരാറുകൾക്ക് നേരിട്ട് ഉത്തരവാദിയല്ല." },
        ],
      },
      {
        n: 16,
        title: "സേവന മാറ്റങ്ങൾ",
        summary: "സവിശേഷതകളുടെ അപ്ഡേറ്റുകൾ.",
        blocks: [
          { type: "p", text: "സേവനങ്ങൾ മെച്ചപ്പെടുത്താൻ ഏത് സമയത്തും മാറ്റങ്ങൾ വരുത്താൻ ഞങ്ങൾക്ക് അവകാശമുണ്ട്." },
        ],
      },
      {
        n: 17,
        title: "നിബന്ധനകളിലെ മാറ്റങ്ങൾ",
        summary: "പുതുക്കിയ നിബന്ധനകളുടെ അറിയിപ്പ്.",
        blocks: [
          { type: "p", text: "നിബന്ധനകൾ കാലാനുസൃതമായി പുതുക്കപ്പെടും. തുടർ ഉപയോഗം മാറ്റങ്ങൾ അംഗീകരിച്ചതായി കണക്കാക്കും." },
        ],
      },
      {
        n: 18,
        title: "നിയമവും തർക്കപരിഹാരവും",
        summary: "ബാധകമായ അധികാരപരിധി.",
        blocks: [
          { type: "p", text: "ഈ നിബന്ധനകൾ ഇന്ത്യൻ നിയമങ്ങൾക്ക് വിധേയമാണ്, തർക്കങ്ങൾ ഇന്ത്യൻ കോടതികൾ തീർപ്പാക്കും." },
        ],
      },
      {
        n: 19,
        title: "ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ",
        summary: "സഹായ കേന്ദ്രവുമായി ബന്ധപ്പെടുക.",
        blocks: [
          { type: "p", text: "സംശയങ്ങൾക്ക് ഹെൽപ്പ് സെന്റർ വഴിയോ support@remise.in വഴിയോ ബന്ധപ്പെടുക." },
        ],
      },
    ],
    contactTag: "നിബന്ധനകളെക്കുറിച്ച് സംശയങ്ങളുണ്ടോ?",
    contactTitle: "ഞങ്ങളുടെ സഹായ സംഘവുമായി ബന്ധപ്പെടുക.",
    contactSubtitle: "ആപ്പിലെ ഒഫീഷ്യൽ ഹെൽപ്പ് സെന്റർ വഴി ഞങ്ങളെ സമീപിക്കുക.",
    contactButton: "ബന്ധപ്പെടുക",
  },
  kn: {
    lastUpdatedLabel: "ಕೊನೆಯದಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ",
    lastUpdatedDate: "20 ಆಗಸ್ಟ್ 2026",
    heroTitle: "ಸೇವಾ ನಿಯಮಗಳು",
    heroSubtitle: "ಈ ನಿಯಮಗಳು ರೆಮಿಸ್ ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್ ಬಳಕೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತವೆ.",
    highlightsTitle: "ಪ್ರಮುಖ ಅಂಶಗಳು",
    highlightsSubtitle: "ಸಂಪೂರ್ಣ ನಿಯಮಗಳನ್ನು ಓದುವ ಮೊದಲು ತ್ವರಿತ ಸಾರಾಂಶ.",
    highlights: [
      { title: "ಒಂದು ಖಾತೆ, ನಿಮ್ಮ ಜವಾಬ್ದಾರಿ", desc: "ನಿಮ್ಮ ಲಾಗಿನ್ ಮತ್ತು OTP ರಹಸ್ಯವಾಗಿಡಿ — ನಿಮ್ಮ ಖಾತೆಯ ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳಿಗೆ ನೀವೇ ಜವಾಬ್ದಾರರು." },
      { title: "ಪಟ್ಟಿಗಳಿಗೆ ಮಾರಾಟಗಾರರ ಹೊಣೆ", desc: "ಅಂಗಡಿ ಮಾಲೀಕರು ಮತ್ತು ಸಗಟು ವ್ಯಾಪಾರಿಗಳು ಬೆಲೆ, ಸ್ಟಾಕ್ ಮಾಹಿತಿಯನ್ನು ನಿಖರವಾಗಿ ನಿರ್ವಹಿಸಬೇಕು." },
      { title: "ಖಾತೆ ಪ್ರಕಾರ ಬೆಲೆಗಳು ಬದಲಾಗಬಹುದು", desc: "ಚಿಲ್ಲರೆ ಗ್ರಾಹಕರು ಮತ್ತು ಸಗಟು ಖರೀದಿದಾರರಿಗೆ ಬೆಲೆಗಳು ಬದಲಾಗಬಹುದು." },
      { title: "ಪಿಕಪ್ ಅಥವಾ ಡೆಲಿವರಿ, ನಿಮ್ಮ ಆಯ್ಕೆ", desc: "ಲಭ್ಯತೆ, ಶುಲ್ಕ ಮತ್ತು ಸಮಯ ಅಂಗಡಿ ಮತ್ತು ಸ್ಥಳವನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ." },
      { title: "ಭಾರತೀಯ ಕಾನೂನುಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ", desc: "ಈ ನಿಯಮಗಳು ಭಾರತೀಯ ಕಾನೂನುಗಳ ಅಡಿಯಲ್ಲಿ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತವೆ." },
    ],
    articles: [
      {
        n: 1,
        title: "ರೆಮಿಸ್ ಬಗ್ಗೆ",
        summary: "ಗ್ರಾಹಕರು ಮತ್ತು ಮಾರಾಟಗಾರರನ್ನು ರೆಮಿಸ್ ಹೇಗೆ ಜೋಡಿಸುತ್ತದೆ.",
        blocks: [
          { type: "p", text: "ರೆಮಿಸ್ ಗ್ರಾಹಕರು, ಅಂಗಡಿ ಮಾಲೀಕರು, ಸಗಟು ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ಮನೆ ವ್ಯಾಪಾರಗಳ ನಡುವೆ ವಹಿವಾಟುಗಳನ್ನು ಸುಲಭಗೊಳಿಸುವ ಇ-ಕಾಮರ್ಸ್ ವೇದಿಕೆಯಾಗಿದೆ." },
          { type: "p", text: "ಉತ್ಪನ್ನಗಳ ಹುಡುಕಾಟ, ಅಂಗಡಿಗಳ ಹೋಲಿಕೆ, ಆರ್ಡರ್ ಮಾಡುವುದು, ಪಾವತಿ ಮತ್ತು ಡೆಲಿವರಿ ಸೇವೆಗಳನ್ನು ರೆಮಿಸ್ ಒದಗಿಸುತ್ತದೆ." },
        ],
      },
      {
        n: 2,
        title: "ಬಳಕೆದಾರ ಖಾತೆಗಳು",
        summary: "ನಿಖರ ಮಾಹಿತಿ ನೀಡಿ, ಲಾಗಿನ್ ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.",
        blocks: [
          { type: "p", text: "ಖಾತೆ ರಚಿಸುವಾಗ ನಿಖರ ಮಾಹಿತಿ ನೀಡಬೇಕು. ಲಾಗಿನ್ ಮಾಹಿತಿಯ ಗೌಪ್ಯತೆಯನ್ನು ಕಾಪಾಡುವುದು ನಿಮ್ಮ ಜವಾಬ್ದಾರಿ." },
          { type: "p", text: "ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ OTP ಅನ್ನು ಇತರರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ." },
        ],
      },
      {
        n: 3,
        title: "ಗ್ರಾಹಕರ ಜವಾಬ್ದಾರಿಗಳು",
        summary: "ನಿಖರ ವಿವರಗಳು, ಸರಿಯಾದ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಪಾವತಿ.",
        blocks: [
          { type: "ul", items: ["ನಿಖರವಾದ ಡೆಲಿವರಿ ವಿಳಾಸ ನೀಡುವುದು.", "ಸರಿಯಾದ ಉತ್ಪನ್ನಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡುವುದು.", "ಆರ್ಡರ್ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸುವುದು.", "ಅಗತ್ಯವಿರುವ ಪಾವತಿ ಮಾಡುವುದು."] },
        ],
      },
      {
        n: 4,
        title: "ಮಾರಾಟಗಾರರ ಜವಾಬ್ದಾರಿಗಳು",
        summary: "ನಿಖರ ಪಟ್ಟಿಗಳು, ನಿಜವಾದ ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಆರ್ಡರ್ ಪೂರೈಕೆ.",
        blocks: [
          { type: "ul", items: ["ನಿಖರವಾದ ಉತ್ಪನ್ನ ಮಾಹಿತಿ ನೀಡುವುದು.", "ಸರಿಯಾದ ಬೆಲೆಗಳನ್ನು ನಿರ್ವಹಿಸುವುದು.", "ಸ್ಟಾಕ್ ಮಾಹಿತಿಯನ್ನು ನಿಖರವಾಗಿಡುವುದು.", "ಆರ್ಡರ್‌ಗಳನ್ನು ಪೂರೈಸುವುದು."] },
        ],
      },
      {
        n: 5,
        title: "ಆರ್ಡರ್ ಮತ್ತು ಸ್ವೀಕಾರ",
        summary: "ಆರ್ಡರ್‌ಗಳು ಮಾರಾಟಗಾರರ ಅನುಮೋದನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ.",
        blocks: [
          { type: "p", text: "ರೆಮಿಸ್‌ನಲ್ಲಿ ಮಾಡುವ ಆರ್ಡರ್‌ಗಳು ಸ್ಟಾಕ್ ಲಭ್ಯತೆ ಮತ್ತು ಮಾರಾಟಗಾರರ ಅನುಮೋದನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ." },
        ],
      },
      {
        n: 6,
        title: "ಬೆಲೆ ಮತ್ತು ಲಭ್ಯತೆ",
        summary: "ಮಾರಾಟಗಾರರು ನಿಗದಿಪಡಿಸಿದ ಬೆಲೆಗಳು ಬದಲಾವಣೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ.",
        blocks: [
          { type: "p", text: "ಉತ್ಪನ್ನಗಳ ಬೆಲೆ ಮತ್ತು ಲಭ್ಯತೆಯನ್ನು ಮಾರಾಟಗಾರರು ನಿರ್ವಹಿಸುತ್ತಾರೆ ಮತ್ತು ಕೊಡುಗೆಗಳ ಆಧಾರದ ಮೇಲೆ ಬದಲಾಗಬಹುದು." },
        ],
      },
      {
        n: 7,
        title: "ಸಗಟು ಮತ್ತು ಬಲ್ಕ್ ಆರ್ಡರ್‌ಗಳು",
        summary: "ದೊಡ್ಡ ಪ್ರಮಾಣದ ವಹಿವಾಟುಗಳಿಗೆ ವಿಶೇಷ ನಿಯಮಗಳು.",
        blocks: [
          { type: "p", text: "ಬಲ್ಕ್ ಆರ್ಡರ್‌ಗಳು ಕನಿಷ್ಠ ಪ್ರಮಾಣ, ವಿಶೇಷ ಬೆಲೆ ಮತ್ತು ಒಪ್ಪಂದದ ನಿಯಮಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ." },
        ],
      },
      {
        n: 8,
        title: "ಡೆಲಿವರಿ ಮತ್ತು ಪಿಕಪ್",
        summary: "ಡೆಲಿವರಿ ಸಮಯ ಮತ್ತು ನಿಯಮಗಳು.",
        blocks: [
          { type: "p", text: "ಅಂಗಡಿಯಿಂದ ಪಿಕಪ್ ಮತ್ತು ಹೋಮ್ ಡೆಲಿವರಿ ಆಯ್ಕೆಗಳು ಲಭ್ಯತೆಗೆ ಅನುಗುಣವಾಗಿರುತ್ತವೆ." },
        ],
      },
      {
        n: 9,
        title: "ಪಾವತಿ ನಿಯಮಗಳು",
        summary: "ಸುರಕ್ಷಿತ ಪಾವತಿ ಗೇಟ್‌ವೇಗಳು.",
        blocks: [
          { type: "p", text: "UPI, ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ ಮೂಲಕ ಪಾವತಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ." },
        ],
      },
      {
        n: 10,
        title: "ಹಿಂತಿರುಗಿಸುವಿಕೆ ಮತ್ತು ಮರುಪಾವತಿ",
        summary: "ರಿಟರ್ನ್ ಅರ್ಹತೆ ಮತ್ತು ಮರುಪಾವತಿ ವಿಧಾನ.",
        blocks: [
          { type: "p", text: "ರಿಟರ್ನ್‌ಗಳು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನೀತಿ ಮತ್ತು ಮಾರಾಟಗಾರರ ನಿಯಮಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ." },
        ],
      },
      {
        n: 11,
        title: "ನಿಷೇಧಿತ ಚಟುವಟಿಕೆಗಳು",
        summary: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ದುರುಪಯೋಗದ ಮೇಲಿನ ನಿರ್ಬಂಧಗಳು.",
        blocks: [
          { type: "ul", items: ["ಸುಳ್ಳು ಮಾಹಿತಿ ನೀಡುವುದು.", "ವಂಚನೆಯ ಖಾತೆಗಳನ್ನು ಸೃಷ್ಟಿಸುವುದು.", "ಕಾನೂನುಬಾಹಿರ ಚಟುವಟಿಕೆಗಳಿಗೆ ಬಳಸುವುದು."] },
        ],
      },
      {
        n: 12,
        title: "ಬೌದ್ಧಿಕ ಆಸ್ತಿ",
        summary: "ರೆಮಿಸ್ ಬ್ರಾಂಡ್ ಹಕ್ಕುಗಳು.",
        blocks: [
          { type: "p", text: "ರೆಮಿಸ್ ಹೆಸರು, ಲೋಗೋ ಮತ್ತು ಸಾಫ್ಟ್‌ವೇರ್ ಬೌದ್ಧಿಕ ಆಸ್ತಿ ಕಾನೂನುಗಳಿಂದ ರಕ್ಷಿಸಲ್ಪಟ್ಟಿವೆ." },
        ],
      },
      {
        n: 13,
        title: "ತೃತೀಯ ಪಕ್ಷದ ಸೇವೆಗಳು",
        summary: "ಪಾವತಿಗಳು ಮತ್ತು ನಕ್ಷೆಗಳ ಸಂಯೋಜನೆ.",
        blocks: [
          { type: "p", text: "ನಕ್ಷೆಗಳು ಮತ್ತು ಪಾವತಿಗಳಿಗಾಗಿ ತೃತೀಯ ಪಕ್ಷದ ಸೇವೆಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ." },
        ],
      },
      {
        n: 14,
        title: "ಖಾತೆ ಅಮಾನತು",
        summary: "ಖಾತೆ ರದ್ದುಪಡಿಸುವ ಸನ್ನಿವೇಶಗಳು.",
        blocks: [
          { type: "p", text: "ವಂಚನೆ ಅಥವಾ ನಿಯಮ ಉಲ್ಲಂಘಿಸುವ ಖಾತೆಗಳನ್ನು ಅಮಾನತುಗೊಳಿಸುವ ಹಕ್ಕು ರೆಮಿಸ್‌ಗೆ ಇದೆ." },
        ],
      },
      {
        n: 15,
        title: "ಹೊಣೆಗಾರಿಕೆಯ ಮಿತಿ",
        summary: "ಮಧ್ಯವರ್ತಿ ಹೊಣೆಗಾರಿಕೆಯ ವ್ಯಾಪ್ತಿ.",
        blocks: [
          { type: "p", text: "ರೆಮಿಸ್ ಕೇವಲ ಮಾರುಕಟ್ಟೆ ಮಧ್ಯವರ್ತಿಯಾಗಿದೆ ಮತ್ತು ಉತ್ಪನ್ನದ ದೋಷಗಳಿಗೆ ನೇರವಾಗಿ ಜವಾಬ್ದಾರರಾಗಿರುವುದಿಲ್ಲ." },
        ],
      },
      {
        n: 16,
        title: "ಸೇವೆಯಲ್ಲಿ ಬದಲಾವಣೆಗಳು",
        summary: "ವೈಶಿಷ್ಟ್ಯಗಳ ನವೀಕರಣಗಳು.",
        blocks: [
          { type: "p", text: "ಸೇವೆಗಳನ್ನು ಸುಧಾರಿಸಲು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ನವೀಕರಿಸುವ ಹಕ್ಕು ನಮಗಿದೆ." },
        ],
      },
      {
        n: 17,
        title: "ನಿಯಮಗಳಲ್ಲಿ ಬದಲಾವಣೆಗಳು",
        summary: "ನವೀಕರಿಸಿದ ನಿಯಮಗಳ ಅಧಿಸೂಚನೆ.",
        blocks: [
          { type: "p", text: "ನಿಯಮಗಳನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ. ಮುಂದುವರಿದ ಬಳಕೆಯು ಹೊಸ ನಿಯಮಗಳನ್ನು ಸ್ವೀಕರಿಸಿದ್ದನ್ನು ಸೂಚಿಸುತ್ತದೆ." },
        ],
      },
      {
        n: 18,
        title: "ಕಾನೂನು ಮತ್ತು ವಿವಾದ ಪರಿಹಾರ",
        summary: "ಅನ್ವಯವಾಗುವ ನ್ಯಾಯವ್ಯಾಪ್ತಿ.",
        blocks: [
          { type: "p", text: "ಈ ನಿಯಮಗಳು ಭಾರತೀಯ ಕಾನೂನುಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ ಮತ್ತು ಭಾರತೀಯ ನ್ಯಾಯಾಲಯಗಳ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುತ್ತವೆ." },
        ],
      },
      {
        n: 19,
        title: "ಸಂಪರ್ಕ ಮಾಹಿತಿ",
        summary: "ಸಹಾಯ ತಂಡವನ್ನು ಹೇಗೆ ತಲುಪುವುದು.",
        blocks: [
          { type: "p", text: "ಪ್ರಶ್ನೆಗಳಿಗಾಗಿ ಸಹಾಯ ಕೇಂದ್ರ ಅಥವಾ support@remise.in ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ." },
        ],
      },
    ],
    contactTag: "ನಿಯಮಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?",
    contactTitle: "ನಮ್ಮ ಸಹಾಯ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    contactSubtitle: "ಆ್ಯಪ್‌ನಲ್ಲಿರುವ ಅಧಿಕೃತ ಸಹಾಯ ಕೇಂದ್ರದ ಮೂಲಕ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    contactButton: "ಸಂಪರ್ಕಿಸಿ",
  },
  hi: {
    lastUpdatedLabel: "अंतिम अपडेट",
    lastUpdatedDate: "20 अगस्त 2026",
    heroTitle: "सेवा की शर्तें",
    heroSubtitle: "ये शर्तें रेमिस वेबसाइट, मोबाइल एप्लिकेशन और संबंधित सेवाओं के आपके उपयोग को नियंत्रित करती हैं।",
    highlightsTitle: "मुख्य बिंदु एक नज़र में",
    highlightsSubtitle: "पूरी शर्तें पढ़ने से पहले एक संक्षिप्त सारांश।",
    highlights: [
      { title: "एक खाता, आपकी ज़िम्मेदारी", desc: "अपना लॉगिन और OTP गोपनीय रखें — आपके खाते की सभी गतिविधियों के लिए आप ज़िम्मेदार हैं।" },
      { title: "लिस्टिंग के लिए विक्रेता ज़िम्मेदार", desc: "दुकानदारों और थोक विक्रेताओं को कीमतें, स्टॉक और उत्पाद विवरण सटीक रखना होगा।" },
      { title: "खाते के प्रकार से बदल सकती हैं कीमतें", desc: "खुदरा ग्राहक और थोक खरीदार के लिए समान वस्तु की कीमतें भिन्न हो सकती हैं।" },
      { title: "पिकअप या डिलीवरी, आपकी पसंद", desc: "उपलब्धता, शुल्क और समय दुकान और स्थान के आधार पर भिन्न हो सकते हैं।" },
      { title: "भारतीय कानून के अधीन", desc: "ये शर्तें भारतीय कानूनों द्वारा शासित होती हैं।" },
    ],
    articles: [
      {
        n: 1,
        title: "रेमिस के बारे में",
        summary: "रेमिस ग्राहकों और विक्रेताओं को कैसे जोड़ता है।",
        blocks: [
          { type: "p", text: "रेमिस एक ई-कॉमर्स और स्थानीय वाणिज्य मंच है जो ग्राहकों, दुकानदारों, थोक विक्रेताओं और घरेलू व्यवसायों के बीच बातचीत की सुविधा प्रदान करता है।" },
          { type: "p", text: "उत्पाद खोज, दुकानों की तुलना, ऑर्डरिंग, भुगतान और डिलीवरी में रेमिस सहायता करता है।" },
        ],
      },
      {
        n: 2,
        title: "उपयोगकर्ता खाते",
        summary: "सटीक जानकारी दें, लॉगिन सुरक्षित रखें।",
        blocks: [
          { type: "p", text: "खाता बनाते समय सटीक जानकारी दें। अपने लॉगिन क्रेडेंशियल्स की गोपनीयता बनाए रखना आपकी ज़िम्मेदारी है।" },
          { type: "p", text: "पासवर्ड या OTP किसी के साथ साझा न करें।" },
        ],
      },
      {
        n: 3,
        title: "ग्राहक की ज़िम्मेदारियां",
        summary: "सटीक विवरण, सही ऑर्डर और आवश्यक भुगतान।",
        blocks: [
          { type: "ul", items: ["सटीक डिलीवरी जानकारी प्रदान करना।", "सही दुकान और उत्पाद चुनना।", "ऑर्डर विवरण सत्यापित करना।", "आवश्यक भुगतान करना।"] },
        ],
      },
      {
        n: 4,
        title: "विक्रेता की ज़िम्मेदारियां",
        summary: "सटीक लिस्टिंग, वास्तविक उत्पाद और ऑर्डर पूरा करना।",
        blocks: [
          { type: "ul", items: ["सटीक उत्पाद जानकारी प्रदान करना।", "सही कीमतें बनाए रखना।", "स्टॉक जानकारी सटीक रखना।", "स्वीकृत ऑर्डर पूरे करना।"] },
        ],
      },
      {
        n: 5,
        title: "ऑर्डर और स्वीकृति",
        summary: "ऑर्डर विक्रेता की स्वीकृति के अधीन हैं।",
        blocks: [
          { type: "p", text: "रेमिस पर दिए गए ऑर्डर उत्पाद उपलब्धता और विक्रेता की स्वीकृति के अधीन हैं।" },
        ],
      },
      {
        n: 6,
        title: "मूल्य निर्धारण और उपलब्धता",
        summary: "विक्रेताओं द्वारा निर्धारित कीमतें बदलाव के अधीन हैं।",
        blocks: [
          { type: "p", text: "उत्पाद की कीमतें और उपलब्धता विक्रेताओं द्वारा प्रबंधित की जाती हैं और बदल सकती हैं।" },
        ],
      },
      {
        n: 7,
        title: "थोक और बल्क ऑर्डर",
        summary: "बड़े पैमाने पर लेनदेन के लिए विशेष शर्तें।",
        blocks: [
          { type: "p", text: "थोक ऑर्डर न्यूनतम मात्रा, कस्टम मूल्य निर्धारण और डिलीवरी शेड्यूल के अधीन हो सकते हैं।" },
        ],
      },
      {
        n: 8,
        title: "डिलीवरी और पिकअप",
        summary: "डिलीवरी समय-सीमा और शिपिंग शर्तें।",
        blocks: [
          { type: "p", text: "स्टور पिकअप और होम डिलीवरी विकल्प उपलब्धता के आधार पर प्रदान किए जाते हैं।" },
        ],
      },
      {
        n: 9,
        title: "भुगतान शर्तें",
        summary: "सुरक्षित भुगतान गेटवे और तरीके।",
        blocks: [
          { type: "p", text: "UPI, कार्ड और नेट बैंकिंग के माध्यम से भुगतान सुरक्षित रूप से संसाधित होते हैं।" },
        ],
      },
      {
        n: 10,
        title: "वापसी और रिफंड",
        summary: "वापसी पात्रता और रिफंड प्रक्रिया।",
        blocks: [
          { type: "p", text: "रिटर्न प्लेटफ़ॉर्म रिटर्न पॉलिसी और विक्रेता की शर्तों के अधीन हैं।" },
        ],
      },
      {
        n: 11,
        title: "प्रतिबंधित गतिविधियां",
        summary: "प्लेटफ़ॉर्म के दुरुपयोग पर प्रतिबंध।",
        blocks: [
          { type: "ul", items: ["गलत जानकारी प्रदान करना।", "धोखाधड़ी वाले खाते बनाना।", "अवैध गतिविधियों के लिए उपयोग करना।"] },
        ],
      },
      {
        n: 12,
        title: "बौद्धिक संपदा",
        summary: "रेमिस के ब्रांड अधिकार और संपत्ति।",
        blocks: [
          { type: "p", text: "रेमिस का नाम, लोगो और सॉफ्टवेयर बौद्धिक संपदा कानूनों द्वारा सुरक्षित हैं।" },
        ],
      },
      {
        n: 13,
        title: "तृतीय-पक्ष सेवाएं",
        summary: "गेटवे, मैप्स और लॉजिस्टिक्स इंटीग्रेशन।",
        blocks: [
          { type: "p", text: "मैप्स और भुगतान के लिए तृतीय-पक्ष सेवाओं का उपयोग किया जा सकता है।" },
        ],
      },
      {
        n: 14,
        title: "खाता निलंबन",
        summary: "खाता बंद करने के आधार।",
        blocks: [
          { type: "p", text: "धोखाधड़ी या नियमों के उल्लंघन पर खातों को निलंबित करने का अधिकार रेमिस के पास है।" },
        ],
      },
      {
        n: 15,
        title: "देयता की सीमा",
        summary: "प्लेटफ़ॉर्म मध्यस्थ देयता का दायरा।",
        blocks: [
          { type: "p", text: "रेमिस एक बाज़ार मध्यस्थ के रूप में कार्य करता है और उत्पाद दोषों के लिए सीधे उत्तरदायी नहीं है।" },
        ],
      },
      {
        n: 16,
        title: "सेवा में परिवर्तन",
        summary: "सुविधाओं के अपडेट।",
        blocks: [
          { type: "p", text: "सेवाओं को बेहतर बनाने के लिए हम किसी भी समय सुविधाओं को बदल सकते हैं।" },
        ],
      },
      {
        n: 17,
        title: "शर्तों में परिवर्तन",
        summary: "अपडेट की गई शर्तों की सूचना।",
        blocks: [
          { type: "p", text: "शर्तें समय-समय पर अपडेट हो सकती हैं। निरंतर उपयोग नई शर्तों की स्वीकृति माना जाएगा।" },
        ],
      },
      {
        n: 18,
        title: "लागू कानून और विवाद समाधान",
        summary: "लागू अधिकार क्षेत्र।",
        blocks: [
          { type: "p", text: "ये शर्तें भारतीय कानूनों के अधीन हैं और विवाद भारतीय अदालतों के अधिकार क्षेत्र में होंगे।" },
        ],
      },
      {
        n: 19,
        title: "संपर्क जानकारी",
        summary: "सहायता टीम से कैसे संपर्क करें।",
        blocks: [
          { type: "p", text: "सवालों के लिए हेल्प सेंटर या support@remise.in पर संपर्क करें।" },
        ],
      },
    ],
    contactTag: "शर्तों के बारे में प्रश्न?",
    contactTitle: "हमारी सहायता टीम से संपर्क करें।",
    contactSubtitle: "ऐप के अंदर आधिकारिक सहायता केंद्र के माध्यम से संपर्क करें।",
    contactButton: "संपर्क करें",
  },
};

export function getTermsData(lang: LanguageCode): TermsData {
  return TERMS_DATA[lang] || TERMS_DATA.en;
}
