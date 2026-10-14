import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Share, Alert, ActivityIndicator, Modal, Keyboard, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Plus, Trash2, Check, Share2, Store, ListChecks, ScanLine, Mic, MicOff, HelpCircle, AlertCircle, Camera, Image as ImageIcon, X, Lock } from 'lucide-react-native';
import { scanBulkList, parseVoiceList, translateGroceryTerm } from '../../api/geminiScanApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useVoiceInput, VOICE_LANGUAGES, VoiceLanguageOption } from '../../hooks/useVoiceInput';
import { requestCameraPermission } from '../../utils/permissions';
import BrandHeader from '../../components/common/BrandHeader';
import { lookupTanglishDictionary } from '../../utils/tanglishTranslator';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';

let idCounter = 0;
const uid = () => `item-${++idCounter}-${Date.now()}`;

const BULK_I18N: Record<string, Record<string, string>> = {
  en: {
    heroTitle: 'Monthly / Bulk Purchase',
    heroSubtitle: 'Build a shopping list, then compare nearby stores and place a smart order.',
    scanPaperList: 'Scan Paper List',
    scanning: 'Scanning…',
    speakYourList: 'Speak your list',
    stop: 'Stop',
    understanding: 'Understanding…',
    listening: 'Listening',
    noItemsYet: 'No items yet',
    addItemsManually: 'Add items manually to get started',
    addItem: 'Add Item',
    item: 'item',
    items: 'items',
    itemNamePlaceholder: 'Item name (English or Tanglish)',
    brandPlaceholder: 'Brand (optional)',
    qtyPlaceholder: 'Qty',
    findCheapestStore: 'Find Cheapest Store & Order',
    scanListTitle: 'Scan Purchase List',
    scanListSub: 'Take a clear photo of your paper list or upload an existing photo.',
    takePhoto: 'Take Photo with Camera',
    or: 'or',
    chooseGallery: 'Choose from Gallery',
    loginRequired: 'Login Required',
    loginToManage: 'Login to Manage Purchase List',
    loginToManageSub: 'Please sign in or register to add items manually, speak your list, or scan paper lists and compare nearby store prices.',
    loginRegister: 'Log In / Register',
    cancel: 'Cancel',
  },
  ta: {
    heroTitle: 'மாதாந்திர / மொத்த கொள்முதல்',
    heroSubtitle: 'ஷாப்பிங் பட்டியலை உருவாக்கி, அருகிலுள்ள கடைகளை ஒப்பிட்டு ஆர்டர் செய்யுங்கள்.',
    scanPaperList: 'காகிதப் பட்டியலை ஸ்கேன் செய்',
    scanning: 'ஸ்கேன் செய்யப்படுகிறது…',
    speakYourList: 'பட்டியலைப் பேசுங்கள்',
    stop: 'நிறுத்து',
    understanding: 'புரிந்துகொள்ளப்படுகிறது…',
    listening: 'கேட்கிறது',
    noItemsYet: 'பொருட்கள் எதுவும் இல்லை',
    addItemsManually: 'தொடங்க பொருட்களைச் சேர்க்கவும்',
    addItem: 'பொருளைச் சேர்',
    item: 'பொருள்',
    items: 'பொருட்கள்',
    itemNamePlaceholder: 'பொருளின் பெயர் (தமிழ் / ஆங்கிலம்)',
    brandPlaceholder: 'பிராண்ட் (விருப்பமானது)',
    qtyPlaceholder: 'அளவு',
    findCheapestStore: 'குறைந்த விலைக் கடையில் ஆர்டர் செய்',
    scanListTitle: 'பட்டியலை ஸ்கேன் செய்க',
    scanListSub: 'உங்கள் காகிதப் பட்டியலை புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்.',
    takePhoto: 'கேமரா மூலம் புகைப்படம் எடு',
    or: 'அல்லது',
    chooseGallery: 'கேலரியில் இருந்து தேர்ந்தெடு',
    loginRequired: 'உள்நுழைவு தேவை',
    loginToManage: 'பட்டியலை நிர்வகிக்க உள்நுழையவும்',
    loginToManageSub: 'பொருட்களைச் சேர்க்க, பேச அல்லது கடைகளை ஒப்பிட உள்நுழையவும்.',
    loginRegister: 'உள்நுழைக / பதிவு செய்க',
    cancel: 'ரத்து செய்',
  },
  te: {
    heroTitle: 'నెలవారీ / బల్క్ కొనుగోలు',
    heroSubtitle: 'షాపింగ్ జాబితాను రూపొందించండి, సమీప దుకాణాలను సరిపోల్చండి మరియు ఆర్డర్ చేయండి.',
    scanPaperList: 'కాగితపు జాబితాను స్కాన్ చేయండి',
    scanning: 'స్కాన్ చేస్తోంది…',
    speakYourList: 'మీ జాబితాను మాట్లాడండి',
    stop: 'ఆపు',
    understanding: 'అర్థం చేసుకుంటోంది…',
    listening: 'వింటోంది',
    noItemsYet: 'ఇంకా వస్తువులు లేవు',
    addItemsManually: 'ప్రారంభించడానికి వస్తువులను జోడించండి',
    addItem: 'వస్తువును జోడించండి',
    item: 'వస్తువు',
    items: 'వస్తువులు',
    itemNamePlaceholder: 'వస్తువు పేరు',
    brandPlaceholder: 'బ్రాండ్ (ఐచ్ఛికం)',
    qtyPlaceholder: 'పరిమాణం',
    findCheapestStore: 'చౌకైన దుకాణంలో ఆర్డర్ చేయండి',
    scanListTitle: 'జాబితాను స్కాన్ చేయండి',
    scanListSub: 'మీ కాగితపు జాబితా ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి.',
    takePhoto: 'కెమెరాతో ఫోటో తీయండి',
    or: 'లేదా',
    chooseGallery: 'గ్యాలరీ నుండి ఎంచుకోండి',
    loginRequired: 'లాగిన్ అవసరం',
    loginToManage: 'జాబితాను నిర్వహించడానికి లాగిన్ చేయండి',
    loginToManageSub: 'వస్తువులను జోడించడానికి మరియు ధరలను సరిపోల్చడానికి లాగిన్ అవ్వండి.',
    loginRegister: 'లాగిన్ / రిజిస్టర్',
    cancel: 'రద్దు చేయి',
  },
  kn: {
    heroTitle: 'ಮಾಸಿಕ / ಬಲ್ಕ್ ಖರೀದಿ',
    heroSubtitle: 'ಶಾಪಿಂಗ್ ಪಟ್ಟಿಯನ್ನು ರಚಿಸಿ, ಸಮೀಪದ ಅಂಗಡಿಗಳನ್ನು ಹೋಲಿಸಿ ಮತ್ತು ಆರ್ಡರ್ ಮಾಡಿ.',
    scanPaperList: 'ಕಾಗದದ ಪಟ್ಟಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    scanning: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ…',
    speakYourList: 'ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ಮಾತನಾಡಿ',
    stop: 'ನಿಲ್ಲಿಸು',
    understanding: 'ಗ್ರಹಿಸಲಾಗುತ್ತಿದೆ…',
    listening: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ',
    noItemsYet: 'ಇನ್ನೂ ಯಾವುದೇ ವಸ್ತುಗಳಿಲ್ಲ',
    addItemsManually: 'ಪ್ರಾರಂಭಿಸಲು ವಸ್ತುಗಳನ್ನು ಸೇರಿಸಿ',
    addItem: 'ವಸ್ತುವನ್ನು ಸೇರಿಸಿ',
    item: 'ವಸ್ತು',
    items: 'ವಸ್ತುಗಳು',
    itemNamePlaceholder: 'ವಸ್ತುವಿನ ಹೆಸರು',
    brandPlaceholder: 'ಬ್ರಾಂಡ್ (ಐಚ್ಛಿಕ)',
    qtyPlaceholder: 'ಪ್ರಮಾಣ',
    findCheapestStore: 'ಅಗ್ಗದ ಅಂಗಡಿಯಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ',
    scanListTitle: 'ಪಟ್ಟಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    scanListSub: 'ನಿಮ್ಮ ಕಾಗದದ ಪಟ್ಟಿಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಅಪ್ಲೋಡ್ ಮಾಡಿ.',
    takePhoto: 'ಕ್ಯಾಮೆರಾದೊಂದಿಗೆ ಫೋಟೋ ತೆಗೆಯಿರಿ',
    or: 'ಅಥವಾ',
    chooseGallery: 'ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ',
    loginRequired: 'ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ',
    loginToManage: 'ಪಟ್ಟಿಯನ್ನು ನಿರ್ವಹಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ',
    loginToManageSub: 'ವಸ್ತುಗಳನ್ನು ಸೇರಿಸಲು ಮತ್ತು ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ.',
    loginRegister: 'ಲಾಗಿನ್ / ನೋಂದಾಯಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
  },
  ml: {
    heroTitle: 'പ്രതിമാസ / ബൾക്ക് വാങ്ങൽ',
    heroSubtitle: 'ഷോപ്പിംഗ് ലിസ്റ്റ് തയ്യാറാക്കുക, അടുത്തുള്ള സ്റ്റോറുകൾ താരതമ്യം ചെയ്ത് ഓർഡർ ചെയ്യുക.',
    scanPaperList: 'പേപ്പർ ലിസ്റ്റ് സ്കാൻ ചെയ്യുക',
    scanning: 'സ്കാൻ ചെയ്യുന്നു…',
    speakYourList: 'ലിസ്റ്റ് സംസാരിക്കുക',
    stop: 'നിർത്തുക',
    understanding: 'മനസ്സിലാക്കുന്നു…',
    listening: 'ശ്രദ്ധിക്കുന്നു',
    noItemsYet: 'ഇതുവരെ ഇനങ്ങളൊന്നുമില്ല',
    addItemsManually: 'ആരംഭിക്കാൻ ഇനങ്ങൾ ചേർക്കുക',
    addItem: 'ഇനം ചേർക്കുക',
    item: 'ഇനം',
    items: 'ഇനങ്ങൾ',
    itemNamePlaceholder: 'ഇനത്തിന്റെ പേര്',
    brandPlaceholder: 'ബ്രാൻഡ് (ഓപ്ഷണൽ)',
    qtyPlaceholder: 'അളവ്',
    findCheapestStore: 'വിലകുറഞ്ഞ സ്റ്റോറിൽ ഓർഡർ ചെയ്യുക',
    scanListTitle: 'ലിസ്റ്റ് സ്കാൻ ചെയ്യുക',
    scanListSub: 'നിങ്ങളുടെ പേപ്പർ ലിസ്റ്റിന്റെ ഫോട്ടോ എടുക്കുക അല്ലെങ്കിൽ അപ്‌ലോഡ് ചെയ്യുക.',
    takePhoto: 'ക്യാമറ ഉപയോഗിച്ച് ഫോട്ടോ എടുക്കുക',
    or: 'അല്ലെങ്കിൽ',
    chooseGallery: 'ഗാലറിയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക',
    loginRequired: 'ലോഗിൻ ആവശ്യമാണ്',
    loginToManage: 'ലിസ്റ്റ് നിയന്ത്രിക്കാൻ ലോഗിൻ ചെയ്യുക',
    loginToManageSub: 'ഇനങ്ങൾ ചേർക്കാനും വിലകൾ താരതമ്യം ചെയ്യാനും ലോഗിൻ ചെയ്യുക.',
    loginRegister: 'ലോഗിൻ / രജിസ്റ്റർ',
    cancel: 'റദ്ദാക്കുക',
  },
  hi: {
    heroTitle: 'मासिक / थोक खरीद',
    heroSubtitle: 'खरीदारी सूची बनाएं, नजदीकी दुकानों की तुलना करें और स्मार्ट ऑर्डर दें।',
    scanPaperList: 'कागजी सूची स्कैन करें',
    scanning: 'स्कैन हो रहा है…',
    speakYourList: 'अपनी सूची बोलें',
    stop: 'रोकें',
    understanding: 'समझा जा रहा है…',
    listening: 'सुन रहा है',
    noItemsYet: 'अभी कोई सामान नहीं है',
    addItemsManually: 'शुरू करने के लिए सामान जोड़ें',
    addItem: 'सामान जोड़ें',
    item: 'सामान',
    items: 'सामान',
    itemNamePlaceholder: 'सामान का नाम',
    brandPlaceholder: 'ब्रांड (वैकल्पिक)',
    qtyPlaceholder: 'मात्रा',
    findCheapestStore: 'सबसे सस्ती दुकान पर ऑर्डर करें',
    scanListTitle: 'सूची स्कैन करें',
    scanListSub: 'अपनी कागजी सूची की फोटो लें या अपलोड करें।',
    takePhoto: 'कैमरे से फोटो लें',
    or: 'या',
    chooseGallery: 'गैलरी से चुनें',
    loginRequired: 'लॉगिन आवश्यक है',
    loginToManage: 'सूची प्रबंधित करने के लिए लॉगिन करें',
    loginToManageSub: 'सामान जोड़ने और कीमतों की तुलना करने के लिए कृपया लॉगिन करें।',
    loginRegister: 'लॉगिन / रजिस्टर',
    cancel: 'रद्द करें',
  },
};

interface BulkItem {
  id: string;
  name: string;
  brand: string;
  quantity: string;
  checked: boolean;
  needsClarification?: boolean;
}

interface BulkItemRowProps {
  item: BulkItem;
  isDark: boolean;
  txt: Record<string, string>;
  onUpdate: (id: string, field: 'name' | 'brand' | 'quantity', value: string) => void;
  onCommitName: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

const BulkItemRow = React.memo(function BulkItemRow({
  item,
  isDark,
  txt,
  onUpdate,
  onCommitName,
  onRemove,
}: BulkItemRowProps) {
  const [name, setName] = useState(item.name || '');
  const [brand, setBrand] = useState(item.brand || '');
  const [quantity, setQuantity] = useState(item.quantity || '');

  // Keep local state in sync when parent item updates externally (translation, voice, scan)
  useEffect(() => {
    setName(item.name || '');
  }, [item.name]);

  useEffect(() => {
    setBrand(item.brand || '');
  }, [item.brand]);

  useEffect(() => {
    setQuantity(item.quantity || '');
  }, [item.quantity]);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isDark ? '#111827' : CustomerColors.white,
          borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
        },
        item.needsClarification &&
          (isDark
            ? { backgroundColor: 'rgba(217, 119, 6, 0.15)', borderColor: '#D97706' }
            : styles.rowFlagged),
      ]}
    >
      {item.needsClarification && <HelpCircle size={13} color="#D97706" />}

      {/* Fields column */}
      <View style={styles.fieldsCol}>
        {/* Row 1: [Name + Brand column] + [Qty column] */}
        <View style={styles.nameQtyRow}>
          {/* Left: name on top, brand below */}
          <View style={styles.nameBrandCol}>
            <TextInput
              style={[styles.nameInput, isDark && { color: '#F9FAFB' }]}
              value={name}
              onChangeText={v => {
                setName(v);
                onUpdate(item.id, 'name', v);
              }}
              onBlur={() => {
                onCommitName(item.id, name);
              }}
              onSubmitEditing={() => {
                onCommitName(item.id, name);
              }}
              placeholder={txt.itemNamePlaceholder}
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.brandInput, isDark && { color: '#9CA3AF' }]}
              value={brand}
              onChangeText={v => {
                setBrand(v);
                onUpdate(item.id, 'brand', v);
              }}
              placeholder={txt.brandPlaceholder}
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              autoCorrect={false}
            />
          </View>
          {/* Right: Qty */}
          <TextInput
            style={[styles.qtyInput, isDark && { color: '#5EEAD4' }]}
            value={quantity}
            onChangeText={v => {
              setQuantity(v);
              onUpdate(item.id, 'quantity', v);
            }}
            placeholder={txt.qtyPlaceholder}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={15} color={isDark ? '#6B7280' : '#9CA3AF'} />
      </TouchableOpacity>
    </View>
  );
});

export default function BulkPurchaseScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const [items, setItems] = useState<BulkItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguageOption>(() => {
    return VOICE_LANGUAGES.find(l => l.short === language) || VOICE_LANGUAGES[0];
  });
  const activeLang = voiceLang.short || language;
  const txt = (BULK_I18N as any)[activeLang] || (BULK_I18N as any)[language] || BULK_I18N.en;
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Sync selected voice language pill when the app language changes
  useEffect(() => {
    const matched = VOICE_LANGUAGES.find(l => l.short === language);
    if (matched) {
      setVoiceLang(matched);
    }
  }, [language]);

  const addBlank = () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    setItems(prev => [...prev, { id: uid(), name: '', brand: '', quantity: '', checked: false }]);
  };
  const update = useCallback((id: string, field: 'name' | 'brand' | 'quantity', value: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value, needsClarification: false } : i)));
  }, []);

  const commitName = useCallback(async (id: string, value: string) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return;

    // 1. Instant offline dictionary lookup (Tanglish + Indic Unicode for Tamil, Telugu, Kannada, Malayalam, Hindi)
    const res = lookupTanglishDictionary(trimmed);
    if (res.matched && res.englishName) {
      setItems(prev => prev.map(i => {
        if (i.id !== id) return i;
        return {
          ...i,
          name: res.englishName,
          quantity: (!i.quantity && res.quantity) ? res.quantity : i.quantity,
        };
      }));
      return;
    }

    // 2. If entered in a regional Indic language / script, use AI translation fallback
    const isNonAscii = /[^\x00-\x7F]/.test(trimmed);
    if (isNonAscii || activeLang !== 'en' || language !== 'en') {
      try {
        const aiRes = await translateGroceryTerm(trimmed);
        if (aiRes.englishName && aiRes.englishName.toLowerCase() !== trimmed.toLowerCase()) {
          setItems(prev => prev.map(i => {
            if (i.id !== id) return i;
            return {
              ...i,
              name: aiRes.englishName,
              quantity: (!i.quantity && aiRes.quantity) ? aiRes.quantity : i.quantity,
            };
          }));
        }
      } catch {
        // keep current value
      }
    }
  }, [activeLang, language]);

  const toggleCheck = (id: string) => setItems(prev => prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const remove = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), []);
  const clearAll = () => setItems([]);

  const handleShare = async () => {
    const text = items.map((it, i) => `${i + 1}. ${it.name}${it.brand ? ` (${it.brand})` : ''}${it.quantity ? ` — ${it.quantity}` : ''}`).join('\n');
    if (!text) return;
    try {
      await Share.share({ message: `Monthly / Bulk Purchase List\n\n${text}` });
    } catch {
      // user cancelled
    }
  };

  const handleOpenScan = () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    setShowScanModal(true);
  };

  const runScan = async (base64: string, mimeType: string) => {
    setScanning(true);
    try {
      const scanned = await scanBulkList(base64, mimeType);
      if (scanned.length === 0) {
        Alert.alert('No items found', "Couldn't read any list items from that photo. Try a clearer photo or add items manually.");
        return;
      }
      setItems(prev => [
        ...prev,
        ...scanned.map(it => {
          const dict = lookupTanglishDictionary(it.name);
          return {
            id: uid(),
            name: dict.matched && dict.englishName ? dict.englishName : it.name,
            brand: '',
            quantity: it.quantity || (dict.quantity || ''),
            checked: false,
          };
        }),
      ]);
    } catch (err: any) {
      Alert.alert('Scan failed', err?.message || 'Could not read the list from that photo. Try Add Item to enter it manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleVoiceResult = useCallback(async (text: string) => {
    setVoiceParsing(true);
    setVoiceError('');
    try {
      const parsed = await parseVoiceList(text, voiceLang.short);
      if (parsed.length === 0) {
        Alert.alert('No items found', "Couldn't make out any items in that — try again or add items manually.");
        return;
      }
      setItems(prev => [
        ...prev,
        ...parsed.map(it => {
          const dict = lookupTanglishDictionary(it.name);
          return {
            id: uid(),
            name: dict.matched && dict.englishName ? dict.englishName : it.name,
            brand: '',
            quantity: it.quantity || (dict.quantity || ''),
            checked: false,
            needsClarification: it.needsClarification,
          };
        }),
      ]);
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not understand that.');
    } finally {
      setVoiceParsing(false);
    }
  }, [voiceLang]);

  const voice = useVoiceInput(handleVoiceResult);

  const handleVoiceToggle = () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    if (voice.listening) {
      voice.stop();
    } else {
      voice.start(voiceLang);
    }
  };

  const handleCameraScan = async () => {
    setShowScanModal(false);
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    const granted = await requestCameraPermission();
    if (!granted) return;
    const res = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
      saveToPhotos: false,
    });
    const asset = res.assets?.[0];
    if (asset?.base64) runScan(asset.base64, asset.type || 'image/jpeg');
    else if (res.errorMessage) Alert.alert('Camera unavailable', res.errorMessage);
  };

  const handleGalleryScan = async () => {
    setShowScanModal(false);
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    const res = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
    });
    const asset = res.assets?.[0];
    if (asset?.base64) runScan(asset.base64, asset.type || 'image/jpeg');
  };

  const handleCompare = async () => {
    if (items.length === 0) return;
    const preparedItems = await Promise.all(
      items.map(async it => {
        const res = lookupTanglishDictionary(it.name);
        if (res.matched && res.englishName) {
          return {
            name: res.englishName,
            brand: it.brand,
            quantity: it.quantity || (res.quantity || ''),
          };
        }
        if (/[^\x00-\x7F]/.test(it.name)) {
          try {
            const aiRes = await translateGroceryTerm(it.name);
            return {
              name: aiRes.englishName || it.name,
              brand: it.brand,
              quantity: it.quantity || (aiRes.quantity || ''),
            };
          } catch {
            return { name: it.name, brand: it.brand, quantity: it.quantity };
          }
        }
        return {
          name: it.name,
          brand: it.brand,
          quantity: it.quantity,
        };
      })
    );
    navigation.navigate('CompareStores', {
      items: preparedItems,
      purchaseType: 'bulk',
      onSuccess: () => setItems([]),
    });
  };

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
      <BrandHeader />

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isKeyboardVisible ? 24 : 100 },
        ]}
        ListHeaderComponent={
          <View>
            <View style={[styles.hero, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderBottomColor: isDark ? '#1F2937' : CustomerColors.steelBorder }]}>
              <View style={[styles.heroIcon, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)' }]}><ListChecks size={24} color={isDark ? '#5EEAD4' : CustomerColors.teal600} /></View>
              <Text style={[styles.heroTitle, isDark && { color: '#FFFFFF' }]}>{txt.heroTitle}</Text>
              <Text style={[styles.heroSubtitle, isDark && { color: '#9CA3AF' }]}>{txt.heroSubtitle}</Text>
              <TouchableOpacity style={styles.scanBtn} onPress={handleOpenScan} disabled={scanning}>
                {scanning ? <ActivityIndicator size="small" color="#fff" style={{ flexShrink: 0 }} /> : <ScanLine size={15} color="#fff" style={{ flexShrink: 0 }} />}
                <Text style={styles.scanBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {scanning ? txt.scanning : txt.scanPaperList}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.voiceBox, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderBottomColor: isDark ? '#1F2937' : CustomerColors.steelBorder }]}>
              <View style={styles.voiceLangRow}>
                {VOICE_LANGUAGES.map(l => (
                  <TouchableOpacity key={l.code} onPress={() => setVoiceLang(l)} disabled={voice.listening || voiceParsing}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
                        borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                      },
                      voiceLang.code === l.code && styles.langChipActive,
                    ]}>
                    <Text style={[
                      styles.langChipText,
                      { color: isDark ? '#D1D5DB' : CustomerColors.textSecondary },
                      voiceLang.code === l.code && styles.langChipTextActive,
                    ]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.voiceBtn, voice.listening && styles.voiceBtnActive]}
                disabled={voiceParsing}
                onPress={handleVoiceToggle}
              >
                {voiceParsing
                  ? <ActivityIndicator size="small" color="#fff" style={{ flexShrink: 0 }} />
                  : voice.listening
                  ? <MicOff size={15} color="#fff" style={{ flexShrink: 0 }} />
                  : <Mic size={15} color="#fff" style={{ flexShrink: 0 }} />}
                <Text style={styles.voiceBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {voiceParsing ? txt.understanding : voice.listening ? txt.stop : txt.speakYourList}
                </Text>
              </TouchableOpacity>
              {voice.listening && (
                <Text style={[styles.voiceListening, isDark && { color: '#5EEAD4' }]} numberOfLines={2}>{txt.listening}… "{voice.partialTranscript || voice.transcript || '…'}"</Text>
              )}
              {(voice.error || voiceError) ? (
                <View style={styles.voiceErrorRow}>
                  <AlertCircle size={11} color={CustomerColors.primary} />
                  <Text style={styles.voiceErrorText}>{voice.error || voiceError}</Text>
                </View>
              ) : null}
            </View>

            {items.length > 0 && (
              <View style={styles.toolbar}>
                <Text style={[styles.toolbarText, isDark && { color: '#9CA3AF' }]}>
                  {items.length} {items.length !== 1 ? txt.items : txt.item}
                </Text>
                <View style={styles.toolbarActions}>
                  <TouchableOpacity style={[styles.iconAction, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]} onPress={addBlank}><Plus size={14} color={isDark ? '#D1D5DB' : CustomerColors.textSecondary} /></TouchableOpacity>
                  <TouchableOpacity style={[styles.iconAction, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]} onPress={handleShare}><Share2 size={14} color={isDark ? '#D1D5DB' : CustomerColors.textSecondary} /></TouchableOpacity>
                  <TouchableOpacity style={[styles.iconAction, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]} onPress={clearAll}><Trash2 size={14} color={CustomerColors.primary} /></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ListChecks size={44} color={isDark ? '#4B5563' : CustomerColors.steelBorder} />
            <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>{txt.noItemsYet}</Text>
            <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>{txt.addItemsManually}</Text>
            <TouchableOpacity style={[styles.addBtn, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)', borderColor: '#0f766e' }]} onPress={addBlank}>
              <Plus size={15} color={isDark ? '#5EEAD4' : CustomerColors.black} />
              <Text style={[styles.addBtnText, isDark && { color: '#5EEAD4' }]}>{txt.addItem}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <BulkItemRow
            item={item}
            isDark={isDark}
            txt={txt}
            onUpdate={update}
            onCommitName={commitName}
            onRemove={remove}
          />
        )}
      />

      {!isKeyboardVisible && items.length > 0 && (
        <View style={[styles.footer, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg, borderTopColor: isDark ? '#1F2937' : CustomerColors.steelBorder }]}>
          <TouchableOpacity style={styles.compareBtn} onPress={handleCompare} activeOpacity={0.8}>
            <View style={styles.compareBtnIconWrap}>
              <Store size={18} color="#fff" />
            </View>
            <Text
              style={styles.compareBtnText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {txt.findCheapestStore}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Camera & Scan Modal */}
      <Modal visible={showScanModal} transparent animationType="fade" onRequestClose={() => setShowScanModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && { backgroundColor: '#111827' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <ScanLine size={20} color={CustomerColors.teal600} />
                <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>{txt.scanListTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScanModal(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, isDark && { color: '#9CA3AF' }]}>
              {txt.scanListSub}
            </Text>

            <TouchableOpacity style={styles.cameraActionBtn} onPress={handleCameraScan}>
              <Camera size={18} color="#fff" />
              <Text style={styles.cameraActionBtnText}>{txt.takePhoto}</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={[styles.dividerLine, isDark && { backgroundColor: '#374151' }]} />
              <Text style={[styles.orText, isDark && { color: '#9CA3AF' }]}>{txt.or}</Text>
              <View style={[styles.dividerLine, isDark && { backgroundColor: '#374151' }]} />
            </View>

            <TouchableOpacity style={[styles.galleryActionBtn, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)', borderColor: '#0f766e' }]} onPress={handleGalleryScan}>
              <ImageIcon size={18} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
              <Text style={[styles.galleryActionBtnText, isDark && { color: '#5EEAD4' }]}>{txt.chooseGallery}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Login Required Modal */}
      <Modal visible={showAuthModal} transparent animationType="fade" onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && { backgroundColor: '#111827' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <Lock size={20} color={CustomerColors.teal600} />
                <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]}>{txt.loginRequired}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.authModalBody}>
              <View style={[styles.authIconCircle, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)' }]}>
                <ScanLine size={28} color={isDark ? '#5EEAD4' : CustomerColors.teal600} />
              </View>
              <Text style={[styles.authModalTitle, isDark && { color: '#FFFFFF' }]}>{txt.loginToManage}</Text>
              <Text style={[styles.authModalSub, isDark && { color: '#9CA3AF' }]}>
                {txt.loginToManageSub}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cameraActionBtn}
              onPress={() => {
                setShowAuthModal(false);
                navigation.navigate('LoginRegister');
              }}
            >
              <Text style={styles.cameraActionBtnText}>{txt.loginRegister}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]} onPress={() => setShowAuthModal(false)}>
              <Text style={[styles.cancelBtnText, isDark && { color: '#9CA3AF' }]}>{txt.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  hero: { backgroundColor: CustomerColors.white, borderBottomWidth: 1, borderBottomColor: CustomerColors.steelBorder, padding: Spacing.lg, alignItems: 'flex-start' },
  heroIcon: { width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: CustomerColors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  heroTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.black },
  heroSubtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.md },
  scanBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minHeight: 40,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.xs, flexShrink: 1 },
  voiceBox: { backgroundColor: CustomerColors.white, borderBottomWidth: 1, borderBottomColor: CustomerColors.steelBorder, padding: Spacing.md, gap: Spacing.sm },
  voiceLangRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  langChip: { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.pill, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  langChipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  langChipText: { fontSize: FontSizes.xs, fontWeight: '600', color: CustomerColors.textSecondary },
  langChipTextActive: { color: '#fff' },
  voiceBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 42,
  },
  voiceBtnActive: { backgroundColor: CustomerColors.primary },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm, flexShrink: 1, textAlign: 'center' },
  voiceListening: { fontSize: FontSizes.xs, color: CustomerColors.teal700 },
  voiceErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voiceErrorText: { fontSize: FontSizes.xs, color: CustomerColors.primary, flex: 1 },
  emptyState: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.xs },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151', marginTop: Spacing.sm },
  emptySubtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginBottom: Spacing.md },
  addBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  addBtnText: { fontWeight: '700', fontSize: FontSizes.xs, color: '#374151' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  toolbarText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  toolbarActions: { flexDirection: 'row', gap: Spacing.xs },
  iconAction: { width: 30, height: 30, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: CustomerColors.steelBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.white },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: CustomerColors.steelBorder, padding: Spacing.sm, marginBottom: Spacing.xs },
  rowChecked: { opacity: 0.5 },
  rowFlagged: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxChecked: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  fieldsCol: { flex: 1, gap: 4 },
  nameQtyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  nameBrandCol: { flex: 1, gap: 2 },
  nameInput: { fontSize: FontSizes.sm, color: '#1F2937', paddingVertical: 4, minHeight: 36, width: '100%' },
  qtyInput: { width: 64, fontSize: FontSizes.sm, color: CustomerColors.teal700, fontWeight: '600', textAlign: 'right', paddingVertical: 4, minHeight: 36 },
  brandInput: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, paddingVertical: 2, minHeight: 24, width: '100%' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.md, backgroundColor: CustomerColors.bg, borderTopWidth: 1, borderTopColor: CustomerColors.steelBorder },
  compareBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  compareBtnIconWrap: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
    flexShrink: 1,
    textAlign: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  cameraActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  cameraActionBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '700' },
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: CustomerColors.steelBorder },
  orText: { fontSize: 11, color: CustomerColors.textSecondary, fontWeight: '600' },
  galleryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  galleryActionBtnText: { color: CustomerColors.teal700, fontSize: FontSizes.sm, fontWeight: '700' },
  authModalBody: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  authIconCircle: { width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: CustomerColors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  authModalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black, textAlign: 'center' },
  authModalSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textAlign: 'center', lineHeight: 18 },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: CustomerColors.bg, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  cancelBtnText: { color: CustomerColors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
});


