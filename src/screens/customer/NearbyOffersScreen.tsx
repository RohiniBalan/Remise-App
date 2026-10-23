import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  MapPin,
  Clock,
  ShoppingBag,
  Bell,
  X,
  Truck,
  Store,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  ChevronRight,
  Check,
  Star,
  Banknote,
  FileText,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { offersApi } from '../../api/offersApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { productApi } from '../../api/productApi';
import { creditApi } from '../../api/creditApi';
import { GATEWAY_URL } from '../../api/endpoints';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../../components/common/BrandHeader';
import { useTheme } from '../../context/ThemeContext';
import {
  LocationSelectField,
  lookupPincode,
} from '../../components/common/LocationSelectField';
import { indianStates, getCities, translateState, translateCity } from '../../utils/indiaLocation';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import { useTranslation, translateProductName } from '../../i18n';

export interface Offer {
  _id: string;
  title: string;
  description: string;
  image: string;
  storeName: string;
  storeId: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent: number;
  validUntil: string;
  distanceKm?: number;
}

interface OrderModalProps {
  offer: Offer;
  onClose: () => void;
}

const RADIUS_OPTIONS = [2, 5, 10, 20];

const NEARBY_I18N: Record<string, Record<string, string>> = {
  en: {
    orderNow: 'Order Now',
    nearbyDeal: 'Nearby Deal',
    details: 'Details',
    delivery: 'Delivery',
    payment: 'Payment',
    offerPrice: 'Offer Price',
    off: 'OFF',
    contactAndAddress: '1. Contact & Address Details',
    firstName: 'First Name *',
    lastName: 'Last Name',
    phone: 'Phone *',
    email: 'Email (optional)',
    streetAddress: 'Street Address *',
    state: 'State *',
    selectState: 'Select State',
    city: 'City *',
    selectCity: 'Select City',
    selectStateFirst: 'Select State First',
    pinCode: 'Pin Code *',
    quantity: 'Quantity:',
    totalAmount: 'Total Amount:',
    nextDelivery: 'Continue',
    deliveryMethod: '2. Delivery Method',
    receiveFrom: 'How would you like to receive your offer order from',
    selfPickup: 'Self Pickup',
    selfPickupDesc: 'Visit {store} and collect your order yourself.',
    homeDelivery: 'Home Delivery',
    homeDeliveryDesc: '{store} will deliver to:',
    back: 'Back',
    nextPayment: 'Continue',
    paymentMethod: '3. Payment Method',
    paySecurelyFor: 'Pay securely for',
    onlinePayment: 'Online Payment (Razorpay)',
    instantSecure: 'INSTANT · SECURE',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, Net Banking & Wallets.',
    cards: 'Cards',
    netBanking: 'NetBanking',
    wallets: 'Wallets',
    payVia: 'Pay ₹{amount}',
    backToDelivery: 'Back to Delivery',
    placingOrder: 'Placing your order…',
    orderConfirmed: 'Order & Payment Confirmed!',
    orderPlacedVia: 'Your order from {store} has been placed via Online Payment (Razorpay - Verified)',
    verifiedOrder: 'VERIFIED OFFER ORDER',
    confirmed: '● CONFIRMED',
    customer: 'Customer:',
    item: 'Item:',
    paymentMode: 'Payment Mode:',
    deliveryMode: 'Delivery Mode:',
    backToOffers: 'Back to Offers',
    notifyTitle: 'Get notified about new nearby offers',
    notifySubtitle: "We'll alert you when stores near you post deals.",
    radius: 'Radius:',
    errFirstName: 'Please enter your first name.',
    errPhone: 'Please enter your phone number.',
    errAddress: 'Please enter your address.',
    errState: 'Please select your state.',
    errCity: 'Please select your city.',
    errPinCode: 'Please enter your pin code.',
    errDelivery: 'Please select a delivery method.',
    codTitle: 'Cash on Delivery (COD)',
    codBadge: 'Pay in Cash',
    codDesc: 'Pay with physical cash upon order delivery or pickup.',
    storeCreditTitle: 'Store Credit (Kadan)',
    approvedBadge: 'APPROVED',
    creditTotal: 'Total Credit',
    creditRemaining: 'Remaining',
    creditUsed: 'used',
    creditNextDue: 'Next Due',
    creditAsAgreed: 'As agreed',
    creditExceeded: 'Total exceeds available credit limit.',
    placeOrderCredit: 'Place Order on Credit (₹{amount})',
    placeOrderCod: 'Place Cash on Delivery Order (₹{amount})',
  },
  ta: {
    orderNow: 'ஆர்டர் செய்',
    nearbyDeal: 'அருகிலுள்ள சலுகை',
    details: 'விவரங்கள்',
    delivery: 'டெலிவரி',
    payment: 'கட்டணம்',
    offerPrice: 'சலுகை விலை',
    off: 'தள்ளுபடி',
    contactAndAddress: '1. தொடர்பு மற்றும் முகவரி விவரங்கள்',
    firstName: 'முதல் பெயர் *',
    lastName: 'கடைசி பெயர்',
    phone: 'தொலைபேசி எண் *',
    email: 'மின்னஞ்சல் (விருப்பமானது)',
    streetAddress: 'தெரு முகவரி *',
    state: 'மாநிலம் *',
    selectState: 'மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
    city: 'நகரம் *',
    selectCity: 'நகரத்தைத் தேர்ந்தெடுக்கவும்',
    selectStateFirst: 'முதலில் மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
    pinCode: 'அஞ்சல் குறியீடு (PIN) *',
    quantity: 'அளவு:',
    totalAmount: 'மொத்த தொகை:',
    nextDelivery: 'தொடரவும்',
    deliveryMethod: '2. டெலிவரி முறை',
    receiveFrom: 'இதிலிருந்து ஆர்டரை எவ்வாறு பெற விரும்புகிறீர்கள்:',
    selfPickup: 'நேரில் பெறுதல்',
    selfPickupDesc: '{store} கடைக்கு நேரில் சென்று ஆர்டரைப் பெற்றுக் கொள்ளுங்கள்.',
    homeDelivery: 'வீட்டு டெலிவரி',
    homeDeliveryDesc: '{store} டெலிவரி செய்யும் முகவரி:',
    back: 'பின்செல்',
    nextPayment: 'தொடரவும்',
    paymentMethod: '3. பணம் செலுத்தும் முறை',
    paySecurelyFor: 'பாதுகாப்பாக பணம் செலுத்துங்கள்:',
    onlinePayment: 'ஆன்லைன் கட்டணம் (Razorpay)',
    instantSecure: 'உடனடி · பாதுகாப்பானது',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), கார்டுகள், நெட் பேங்கிங் & வாலெட்டுகள்.',
    cards: 'கார்டுகள்',
    netBanking: 'நெட் பேங்கிங்',
    wallets: 'வாலெட்டுகள்',
    payVia: 'செலுத்துங்கள் ₹{amount}',
    backToDelivery: 'டெலிவரிக்குத் திரும்பு',
    placingOrder: 'உங்கள் ஆர்டர் பதிவு செய்யப்படுகிறது…',
    orderConfirmed: 'ஆர்டர் & கட்டணம் உறுதிசெய்யப்பட்டது!',
    orderPlacedVia: '{store} கடையிலிருந்து உங்கள் ஆர்டர் Razorpay மூலம் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
    verifiedOrder: 'சரிபார்க்கப்பட்ட சலுகை ஆர்டர்',
    confirmed: '● உறுதிசெய்யப்பட்டது',
    customer: 'வாடிக்கையாளர்:',
    item: 'பொருள்:',
    paymentMode: 'கட்டண முறை:',
    deliveryMode: 'டெலிவரி முறை:',
    backToOffers: 'சலுகைகளுக்குத் திரும்பு',
    notifyTitle: 'புதிய அருகிலுள்ள சலுகைகள் பற்றிய அறிவிப்பைப் பெறுங்கள்',
    notifySubtitle: 'அருகிலுள்ள கடைகள் சலுகைகளைப் பகிரும்போது உங்களுக்கு அறிவிப்போம்.',
    radius: 'சுற்றளவு:',
    errFirstName: 'தயவுசெய்து உங்கள் முதல் பெயரை உள்ளிடவும்.',
    errPhone: 'தயவுசெய்து உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்.',
    errAddress: 'தயவுசெய்து உங்கள் முகவரியை உள்ளிடவும்.',
    errState: 'தயவுசெய்து மாநிலத்தைத் தேர்ந்தெடுக்கவும்.',
    errCity: 'தயவுசெய்து நகரத்தைத் தேர்ந்தெடுக்கவும்.',
    errPinCode: 'தயவுசெய்து அஞ்சல் குறியீட்டை உள்ளிடவும்.',
    errDelivery: 'தயவுசெய்து டெலிவரி முறையைத் தேர்ந்தெடுக்கவும்.',
    codTitle: 'பொருளைப் பெற்று பணம் செலுத்துதல் (COD)',
    codBadge: 'ரொக்கமாக செலுத்துங்கள்',
    codDesc: 'ஆர்டர் டெலிவரி அல்லது கடைக்குச் செல்லும்போது ரொக்கமாக செலுத்தவும்.',
    storeCreditTitle: 'கடை கடன் (Store Credit)',
    approvedBadge: 'அங்கீகரிக்கப்பட்டது',
    creditTotal: 'மொத்த கடன்',
    creditRemaining: 'மீதமுள்ள கடன்',
    creditUsed: 'பயன்படுத்தப்பட்டது',
    creditNextDue: 'அடுத்த தவணைத் தேதி',
    creditAsAgreed: 'ஒப்புக்கொண்டபடி',
    creditExceeded: 'மொத்தத் தொகை வரம்பை விட அதிகமாக உள்ளது.',
    placeOrderCredit: 'கடனில் ஆர்டர் செய் (₹{amount})',
    placeOrderCod: 'பொருளைப் பெற்று பணம் செலுத்து ஆர்டர் (₹{amount})',
  },
  te: {
    orderNow: 'ఆర్డర్ చేయండి',
    nearbyDeal: 'సమీప డీల్',
    details: 'వివరాలు',
    delivery: 'డెలివరీ',
    payment: 'చెల్లింపు',
    offerPrice: 'ఆఫర్ ధర',
    off: 'తగ్గింపు',
    contactAndAddress: '1. సంప్రదింపు & చిరునామా వివరాలు',
    firstName: 'మొదటి పేరు *',
    lastName: 'చివరి పేరు',
    phone: 'ఫోన్ నంబర్ *',
    email: 'ఇమెయిల్ (ఐచ్ఛికం)',
    streetAddress: 'చిరునామా *',
    state: 'రాష్ట్రం *',
    selectState: 'రాష్ట్రాన్ని ఎంచుకోండి',
    city: 'నగరం *',
    selectCity: 'నగరాన్ని ఎంచుకోండి',
    selectStateFirst: 'ముందుగా రాష్ట్రాన్ని ఎంచుకోండి',
    pinCode: 'పిన్ కోడ్ *',
    quantity: 'పరిమాణం:',
    totalAmount: 'మొత్తం మొత్తం:',
    nextDelivery: 'కొనసాగించండి',
    deliveryMethod: '2. డెలివరీ పద్ధతి',
    receiveFrom: 'మీరు మీ ఆర్డర్‌ను ఎలా స్వీకరించాలనుకుంటున్నారు:',
    selfPickup: 'స్వయంగా తీసుకోవడం',
    selfPickupDesc: '{store} సందర్శించి మీ ఆర్డర్‌ను మీరే తీసుకోండి.',
    homeDelivery: 'హోమ్ డెలివరీ',
    homeDeliveryDesc: '{store} డెలివరీ చేసే చిరునామా:',
    back: 'వెనుకకు',
    nextPayment: 'కొనసాగించండి',
    paymentMethod: '3. చెల్లింపు పద్ధతి',
    paySecurelyFor: 'సురక్షితంగా చెల్లించండి:',
    onlinePayment: 'ఆన్‌లైన్ చెల్లింపు (Razorpay)',
    instantSecure: 'తక్షణం · సురక్షితం',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), కార్డులు, నెట్ బ్యాంకింగ్ & వాలెట్లు.',
    cards: 'కార్డులు',
    netBanking: 'నెట్ బ్యాంకింగ్',
    wallets: 'వాలెట్లు',
    payVia: '₹{amount} చెల్లించండి',
    backToDelivery: 'డెలివరీకి తిరిగి వెళ్లండి',
    placingOrder: 'మీ ఆర్డర్ ఉంచబడుతోంది…',
    orderConfirmed: 'ఆర్డర్ & చెల్లింపు నిర్ధారించబడింది!',
    orderPlacedVia: '{store} నుండి మీ ఆర్డర్ Razorpay ద్వారా విజయవంతంగా ఉంచబడింది',
    verifiedOrder: 'ధృవీకరించబడిన ఆఫర్ ఆర్డర్',
    confirmed: '● నిర్ధారించబడింది',
    customer: 'వినియోగదారు:',
    item: 'వస్తువు:',
    paymentMode: 'చెల్లింపు విధానం:',
    deliveryMode: 'డెలివరీ విధానం:',
    backToOffers: 'ఆఫర్‌లకు తిరిగి వెళ్ళండి',
    notifyTitle: 'సమీపంలోని కొత్త ఆఫర్ల గురించి నోటిఫికేషన్ పొందండి',
    notifySubtitle: 'సమీప దుకాణాలు డీల్స్ పోస్ట్ చేసినప్పుడు మేము మిమ్మల్ని హెచ్చరిస్తాము.',
    radius: 'వ్యాసార్థం:',
    errFirstName: 'దయచేసి మీ మొదటి పేరును నమోదు చేయండి.',
    errPhone: 'దయచేసి మీ ఫోన్ నంబర్‌ను నమోదు చేయండి.',
    errAddress: 'దయచేసి మీ చిరునామాను నమోదు చేయండి.',
    errState: 'దయచేసి మీ రాష్ట్రాన్ని ఎంచుకోండి.',
    errCity: 'దయచేసి మీ నగరాన్ని ఎంచుకోండి.',
    errPinCode: 'దయచేసి మీ పిన్ కోడ్‌ను నమోదు చేయండి.',
    errDelivery: 'దయచేసి డెలివరీ పద్ధతిని ఎంచుకోండి.',
    codTitle: 'క్యాష్ ఆన్ డెలివరీ (COD)',
    codBadge: 'నగదు రూపంలో చెల్లించండి',
    codDesc: 'ఆర్డర్ డెలివరీ లేదా పికప్ సమయంలో భౌతిక నగదుతో చెల్లించండి.',
    storeCreditTitle: 'స్టోర్ క్రెడిట్ (Kadan)',
    approvedBadge: 'ఆమోదించబడింది',
    creditTotal: 'మొత్తం క్రెడిట్',
    creditRemaining: 'మిగిలినది',
    creditUsed: 'ఉపయోగించబడింది',
    creditNextDue: 'తదుపరి గడువు',
    creditAsAgreed: 'అంగీకరించిన విధంగా',
    creditExceeded: 'మొత్తం అందుబాటులో ఉన్న క్రెడిట్ పరిమితిని మించిపోయింది.',
    placeOrderCredit: 'క్రెడిట్‌పై ఆర్డర్ చేయండి (₹{amount})',
    placeOrderCod: 'క్యాష్ ఆన్ డెలివరీ ఆర్డర్ చేయండి (₹{amount})',
  },
  kn: {
    orderNow: 'ಆರ್ಡರ್ ಮಾಡಿ',
    nearbyDeal: 'ಸಮೀಪದ ಡೀಲ್',
    details: 'ವಿವರಗಳು',
    delivery: 'ವಿತರಣೆ',
    payment: 'ಪಾವತಿ',
    offerPrice: 'ಆಫರ್ ಬೆಲೆ',
    off: 'ರಿಯಾಯಿತಿ',
    contactAndAddress: '1. ಸಂಪರ್ಕ ಮತ್ತು ವಿಳಾಸ ವಿವರಗಳು',
    firstName: 'ಮೊದಲ ಹೆಸರು *',
    lastName: 'ಕೊನೆಯ ಹೆಸರು',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ *',
    email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
    streetAddress: 'ರಸ್ತೆ ವಿಳಾಸ *',
    state: 'ರಾಜ್ಯ *',
    selectState: 'ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    city: 'ನಗರ *',
    selectCity: 'ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    selectStateFirst: 'ಮೊದಲು ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    pinCode: 'ಪಿನ್ ಕೋಡ್ *',
    quantity: 'ಪ್ರಮಾಣ:',
    totalAmount: 'ಒಟ್ಟು ಮೊತ್ತ:',
    nextDelivery: 'ಮುಂದುವರಿಸಿ',
    deliveryMethod: '2. ವಿತರಣಾ ವಿಧಾನ',
    receiveFrom: 'ಆದೇಶವನ್ನು ಹೇಗೆ ಪಡೆಯಲು ಬಯಸುತ್ತೀರಿ:',
    selfPickup: 'ಸ್ವತಃ ಪಡೆಯುವುದು',
    selfPickupDesc: '{store} ಗೆ ಭೇಟಿ ನೀಡಿ ಮತ್ತು ನಿಮ್ಮ ಆದೇಶವನ್ನು ನೀವೇ ಪಡೆದುಕೊಳ್ಳಿ.',
    homeDelivery: 'ಮನೆ ಬಾಗಿಲಿಗೆ ವಿತರಣೆ',
    homeDeliveryDesc: '{store} ವಿತರಿಸುವ ವಿಳಾಸ:',
    back: 'ಹಿಂದೆ',
    nextPayment: 'ಮುಂದುವರಿಸಿ',
    paymentMethod: '3. ಪಾವತಿ ವಿಧಾನ',
    paySecurelyFor: 'ಸುರಕ್ಷಿತವಾಗಿ ಪಾವತಿಸಿ:',
    onlinePayment: 'ಆನ್‌ಲೈನ್ ಪಾವತಿ (Razorpay)',
    instantSecure: 'ತ್ವರಿತ · ಸುರಕ್ಷಿತ',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), ಕಾರ್ಡ್‌ಗಳು, ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ & ವಾಲೆಟ್‌ಗಳು.',
    cards: 'ಕಾರ್ಡ್‌ಗಳು',
    netBanking: 'ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್',
    wallets: 'ವಾಲೆಟ್‌ಗಳು',
    payVia: '₹{amount} ಪಾವತಿಸಿ',
    backToDelivery: 'ವಿತರಣೆಗೆ ಹಿಂತಿರುಗಿ',
    placingOrder: 'ನಿಮ್ಮ ಆದೇಶವನ್ನು ಇರಿಸಲಾಗುತ್ತಿದೆ…',
    orderConfirmed: 'ಆದೇಶ ಮತ್ತು ಪಾವತಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!',
    orderPlacedVia: '{store} ನಿಂದ ನಿಮ್ಮ ಆದೇಶವನ್ನು Razorpay ಮೂಲಕ ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ',
    verifiedOrder: 'ಪರಿಶೀಲಿಸಿದ ಆಫರ್ ಆದೇಶ',
    confirmed: '● ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    customer: 'ಗ್ರಾಹಕರು:',
    item: 'ವಸ್ತು:',
    paymentMode: 'ಪಾವತಿ ವಿಧಾನ:',
    deliveryMode: 'ವಿತರಣಾ ವಿಧಾನ:',
    backToOffers: 'ಆಫರ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
    notifyTitle: 'ಹೊಸ ಸಮೀಪದ ಆಫರ್‌ಗಳ ಕುರಿತು ಸೂಚನೆ ಪಡೆಯಿರಿ',
    notifySubtitle: 'ಸಮೀಪದ ಅಂಗಡಿಗಳು ಡೀಲ್‌ಗಳನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿದಾಗ ನಾವು ನಿಮಗೆ ಎಚ್ಚರಿಸುತ್ತೇವೆ.',
    radius: 'ತ್ರಿಜ್ಯ:',
    errFirstName: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊದಲ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
    errPhone: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    errAddress: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.',
    errState: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    errCity: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    errPinCode: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಿನ್ ಕೋಡ್ ನಮೂದಿಸಿ.',
    errDelivery: 'ದಯವಿಟ್ಟು ವಿತರಣಾ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    codTitle: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ (COD)',
    codBadge: 'ನಗದು ರೂಪದಲ್ಲಿ ಪಾವತಿಸಿ',
    codDesc: 'ಆರ್ಡರ್ ವಿತರಣೆ ಅಥವಾ ಪಿಕಪ್ ಸಮಯದಲ್ಲಿ ಭೌತಿಕ ನಗದು ಮೂಲಕ ಪಾವತಿಸಿ.',
    storeCreditTitle: 'ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ (ಖದನ್)',
    approvedBadge: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    creditTotal: 'ಒಟ್ಟು ಕ್ರೆಡಿಟ್',
    creditRemaining: 'ಉಳಿದಿರುವುದು',
    creditUsed: 'ಬಳಸಲಾಗಿದೆ',
    creditNextDue: 'ಮುಂದಿನ ಬಾಕಿ ದಿನಾಂಕ',
    creditAsAgreed: 'ಒಪ್ಪಿಕೊಂಡಂತೆ',
    creditExceeded: 'ಒಟ್ಟು ಲಭ್ಯವಿರುವ ಕ್ರೆಡಿಟ್ ಮಿತಿಯನ್ನು ಮೀರಿದೆ.',
    placeOrderCredit: 'ಕ್ರೆಡಿಟ್‌ನಲ್ಲಿ ಆದೇಶ ನೀಡಿ (₹{amount})',
    placeOrderCod: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ ಆದೇಶ ನೀಡಿ (₹{amount})',
  },
  ml: {
    orderNow: 'ഓർഡർ ചെയ്യുക',
    nearbyDeal: 'സമീപ ഡീൽ',
    details: 'വിവരങ്ങൾ',
    delivery: 'ഡെലിവറി',
    payment: 'പേയ്‌മെന്റ്',
    offerPrice: 'ഓഫർ വില',
    off: 'കിഴിവ്',
    contactAndAddress: '1. കോൺടാക്റ്റ് & വിലാസ വിവരങ്ങൾ',
    firstName: 'ആദ്യ പേര് *',
    lastName: 'അവസാന പേര്',
    phone: 'ഫോൺ നമ്പർ *',
    email: 'ഇമെയിൽ (ഓപ്ഷണൽ)',
    streetAddress: 'വിലാസം *',
    state: 'സംസ്ഥാനം *',
    selectState: 'സംസ്ഥാനം തിരഞ്ഞെടുക്കുക',
    city: 'നഗരം *',
    selectCity: 'നഗരം തിരഞ്ഞെടുക്കുക',
    selectStateFirst: 'ആദ്യം സംസ്ഥാനം തിരഞ്ഞെടുക്കുക',
    pinCode: 'പിൻകോഡ് *',
    quantity: 'അളവ്:',
    totalAmount: 'ആകെ തുക:',
    nextDelivery: 'തുടരുക',
    deliveryMethod: '2. ഡെലിവറി രീതി',
    receiveFrom: 'ഓർഡർ എങ്ങനെ ലഭിക്കാൻ ആഗ്രഹിക്കുന്നു:',
    selfPickup: 'നേരിട്ട് കൈപ്പറ്റൽ',
    selfPickupDesc: '{store} സന്ദർശിച്ച് ഓർഡർ നേരിട്ട് വാങ്ങുക.',
    homeDelivery: 'ഹോം ഡെലിവറി',
    homeDeliveryDesc: '{store} ഡെലിവറി ചെയ്യുന്ന വിലാസം:',
    back: 'തിരികെ',
    nextPayment: 'തുടരുക',
    paymentMethod: '3. പേയ്‌മെന്റ് രീതി',
    paySecurelyFor: 'സുരക്ഷിതമായി പണമടയ്ക്കുക:',
    onlinePayment: 'ഓൺലൈൻ പേയ്‌മെന്റ് (Razorpay)',
    instantSecure: 'തൽക്ഷണം · സുരക്ഷിതം',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), കാർഡുകൾ, നെറ്റ് ബാങ്കിംഗ് & വാലറ്റുകൾ.',
    cards: 'കാർഡുകൾ',
    netBanking: 'നെറ്റ് ബാങ്കിംഗ്',
    wallets: 'വാലറ്റുകൾ',
    payVia: '₹{amount} അടയ്ക്കുക',
    backToDelivery: 'ഡെലിവറിയിലേക്ക് മടങ്ങുക',
    placingOrder: 'നിങ്ങളുടെ ഓർഡർ നൽകുന്നു…',
    orderConfirmed: 'ഓർഡറും പേയ്‌മെന്റും സ്ഥിരീകരിച്ചു!',
    orderPlacedVia: '{store}-ൽ നിന്നുള്ള നിങ്ങളുടെ ഓർഡർ Razorpay വഴി വിജയകരമായി നൽകി',
    verifiedOrder: 'സ്ഥിരീകരിച്ച ഓഫർ ഓർഡർ',
    confirmed: '● സ്ഥിരീകരിച്ചു',
    customer: 'ഉപഭോക്താവ്:',
    item: 'ഇനം:',
    paymentMode: 'പേയ്‌മെന്റ് രീതി:',
    deliveryMode: 'ഡെലിവറി രീതി:',
    backToOffers: 'ഓഫറുകളിലേക്ക് മടങ്ങുക',
    notifyTitle: 'പുതിയ സമീപ ഓഫറുകളെക്കുറിച്ച് അറിയിപ്പ് നേടുക',
    notifySubtitle: 'സമീപത്തുള്ള സ്റ്റോറുകൾ ഡീലുകൾ പോസ്റ്റ് ചെയ്യുമ്പോൾ ഞങ്ങൾ നിങ്ങളെ അറിയിക്കും.',
    radius: 'ആരം:',
    errFirstName: 'ദയവായി നിങ്ങളുടെ ആദ്യ പേര് നൽകുക.',
    errPhone: 'ദയവായി നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക.',
    errAddress: 'ദയവായി നിങ്ങളുടെ വിലാസം നൽകുക.',
    errState: 'ദയവായി നിങ്ങളുടെ സംസ്ഥാനം തിരഞ്ഞെടുക്കുക.',
    errCity: 'ദയവായി നിങ്ങളുടെ നഗരം തിരഞ്ഞെടുക്കുക.',
    errPinCode: 'ദയവായി നിങ്ങളുടെ പിൻ കോഡ് നൽകുക.',
    errDelivery: 'ദയവായി ഡെലിവറി രീതി തിരഞ്ഞെടുക്കുക.',
    codTitle: 'ക്യാഷ് ഓൺ ഡെലിവറി (COD)',
    codBadge: 'പണമായി നൽകുക',
    codDesc: 'ഓർഡർ ഡെലിവറി അല്ലെങ്കിൽ പിക്കപ്പ് ചെയ്യുമ്പോൾ പണമായി നൽകുക.',
    storeCreditTitle: 'സ്റ്റോർ ക്രെഡിറ്റ് (കടം)',
    approvedBadge: 'അംഗീകരിച്ചു',
    creditTotal: 'ആകെ ക്രെഡിറ്റ്',
    creditRemaining: 'ബാക്കി',
    creditUsed: 'ഉപയോഗിച്ചു',
    creditNextDue: 'അടുത്ത അടവ് തീയതി',
    creditAsAgreed: 'സമ്മതിച്ചതുപോലെ',
    creditExceeded: 'ആകെ തുക ലഭ്യമായ ക്രെഡിറ്റ് പരിധി കവിഞ്ഞു.',
    placeOrderCredit: 'ക്രെഡിറ്റിൽ ഓർഡർ നൽകുക (₹{amount})',
    placeOrderCod: 'ക്യാഷ് ഓൺ ഡെലിവറി ഓർഡർ നൽകുക (₹{amount})',
  },
  hi: {
    orderNow: 'ऑर्डर करें',
    nearbyDeal: 'नजदीकी डील',
    details: 'विवरण',
    delivery: 'डिलीवरी',
    payment: 'भुगतान',
    offerPrice: 'ऑफ़र मूल्य',
    off: 'छूट',
    contactAndAddress: '1. संपर्क एवं पता विवरण',
    firstName: 'पहला नाम *',
    lastName: 'अंतिम नाम',
    phone: 'फ़ोन नंबर *',
    email: 'ईमेल (वैकल्पिक)',
    streetAddress: 'सड़क का पता *',
    state: 'राज्य *',
    selectState: 'राज्य चुनें',
    city: 'शहर *',
    selectCity: 'शहर चुनें',
    selectStateFirst: 'पहले राज्य चुनें',
    pinCode: 'पिन कोड *',
    quantity: 'मात्रा:',
    totalAmount: 'कुल राशि:',
    nextDelivery: 'आगे बढ़ें',
    deliveryMethod: '2. डिलीवरी विधि',
    receiveFrom: 'अपना ऑर्डर कैसे प्राप्त करना चाहते हैं:',
    selfPickup: 'स्वयं प्राप्त करें',
    selfPickupDesc: '{store} पर जाएँ और अपना ऑर्डर स्वयं लें।',
    homeDelivery: 'होम डिलीवरी',
    homeDeliveryDesc: '{store} इस पते पर डिलीवरी करेगा:',
    back: 'वापस',
    nextPayment: 'आगे बढ़ें',
    paymentMethod: '3. भुगतान विधि',
    paySecurelyFor: 'सुरक्षित भुगतान करें:',
    onlinePayment: 'ऑनलाइन भुगतान (Razorpay)',
    instantSecure: 'तत्काल · सुरक्षित',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), कार्ड, नेट बैंकिंग और वॉलेट।',
    cards: 'कार्ड',
    netBanking: 'नेट बैंकिंग',
    wallets: 'वॉलेट',
    payVia: '₹{amount} भुगतान करें',
    backToDelivery: 'डिलीवरी पर वापस जाएँ',
    placingOrder: 'आपका ऑर्डर दिया जा रहा है…',
    orderConfirmed: 'ऑर्डर और भुगतान की पुष्टि हो गई!',
    orderPlacedVia: '{store} से आपका ऑर्डर Razorpay द्वारा सफलतापूर्वक दिया गया है',
    verifiedOrder: 'सत्यापित ऑफ़र ऑर्डर',
    confirmed: '● पुष्टि की गई',
    customer: 'ग्राहक:',
    item: 'आइटम:',
    paymentMode: 'भुगतान विधि:',
    deliveryMode: 'डिलीवरी विधि:',
    backToOffers: 'ऑफ़र पर वापस जाएँ',
    notifyTitle: 'नए नजदीकी ऑफ़र के बारे में सूचना प्राप्त करें',
    notifySubtitle: 'जब नजदीकी स्टोर सौदे पोस्ट करेंगे तो हम आपको सचेत करेंगे।',
    radius: 'त्रिज्या:',
    errFirstName: 'कृपया अपना पहला नाम दर्ज करें।',
    errPhone: 'कृपया अपना फ़ोन नंबर दर्ज करें।',
    errAddress: 'कृपया अपना पता दर्ज करें।',
    errState: 'कृपया अपना राज्य चुनें।',
    errCity: 'कृपया अपना शहर चुनें।',
    errPinCode: 'कृपया अपना पिन कोड दर्ज करें।',
    errDelivery: 'कृपया डिलीवरी विधि चुनें।',
    codTitle: 'कैश ऑन डिलीवरी (COD)',
    codBadge: 'नकद भुगतान करें',
    codDesc: 'ऑर्डर डिलीवरी या पिकअप के समय नकद भुगतान करें।',
    storeCreditTitle: 'स्टोर क्रेडिट (उधार)',
    approvedBadge: 'स्वीकृत',
    creditTotal: 'कुल क्रेडिट',
    creditRemaining: 'शेष',
    creditUsed: 'इस्तेमाल हुआ',
    creditNextDue: 'अगली देय तिथि',
    creditAsAgreed: 'सहमति अनुसार',
    creditExceeded: 'कुल राशि उपलब्ध क्रेडिट सीमा से अधिक है।',
    placeOrderCredit: 'क्रेडिट पर ऑर्डर करें (₹{amount})',
    placeOrderCod: 'कैश ऑन डिलीवरी ऑर्डर करें (₹{amount})',
  },
};

async function requestLocationPermission(): Promise<
  'granted' | 'denied' | 'blocked'
> {
  if (Platform.OS !== 'android') return 'granted';
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Remise needs your location to show nearby offers.',
        buttonPositive: 'OK',
        buttonNegative: 'Deny',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
    return 'denied';
  } catch {
    return 'denied';
  }
}

const resolveImage = (img?: string) => {
  return resolveImageUrl(img) || 'https://via.placeholder.com/300x200?text=Offer';
};

export default function NearbyOffersScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const { language, t } = useTranslation();
  const txt = NEARBY_I18N[language] || NEARBY_I18N.en;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(10);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState('');
  const [permBlocked, setPermBlocked] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadOffers = useCallback(async (loc?: { lat: number; lng: number } | null, r = radius) => {
    if (!loc) {
      setOffers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await offersApi.getNearby(loc.lat, loc.lng, r);
      const data = res.data?.data || [];
      // Strictly set offers returned within radius — never fall back to global active offers
      setOffers(data);
    } catch (err) {
      console.warn('loadOffers error:', err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [radius]);

  const requestLocation = useCallback(async () => {
    setLocError('');
    setLocLoading(true);
    const result = await requestLocationPermission();
    if (result !== 'granted') {
      setPermBlocked(result === 'blocked');
      setLocError(
        'Location access is required to discover offers near your current location.',
      );
      setLocLoading(false);
      setOffers([]);
      return;
    }
    setPermBlocked(false);
    Geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocLoading(false);
        loadOffers(loc, radius);
      },
      err => {
        console.warn('Geolocation failed:', err);
        setLocError(
          'Could not detect your current GPS location. Please check device location settings and try again.',
        );
        setLocLoading(false);
        setOffers([]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [loadOffers, radius]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Refresh on app returning to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        requestLocation();
      }
    });
    return () => sub.remove();
  }, [requestLocation]);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      requestLocation();
    });
    return unsubscribe;
  }, [navigation, requestLocation]);

  const handleEnableLocation = () => {
    if (permBlocked) {
      Linking.openSettings();
      return;
    }
    requestLocation();
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    loadOffers(location, newRadius);
  };

  const handleEnableAlerts = () => {
    Alert.alert(
      'Nearby Offer Alerts',
      "Push notifications for nearby offers aren't available in the mobile app yet — check back here for new deals in the meantime.",
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
      <BrandHeader />
      {/* Location warning banner if location is not granted */}
      {!location && !locLoading && (
        <View style={[styles.locationBanner, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.locationBannerTitle, isDark && { color: '#FFFFFF' }]}>
              {language === 'ta' ? 'இருப்பிடம் இயக்கப்படவில்லை' : language === 'te' ? 'లొకేషన్ ప్రారంభించబడలేదు' : language === 'kn' ? 'ಸ್ಥಳವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿಲ್ಲ' : language === 'ml' ? 'ലൊക്കേഷൻ പ്രവർത്തനക്ഷമമാക്കിയിട്ടില്ല' : language === 'hi' ? 'स्थान सक्षम नहीं है' : 'Location not enabled'}
            </Text>
            <Text style={[styles.locationBannerSubtitle, isDark && { color: '#9CA3AF' }]}>
              {language === 'ta' ? 'அருகிலுள்ள சலுகைகளைக் கண்டறிய இருப்பிடத்தை இயக்கவும்.' : language === 'te' ? 'సమీపంలోని ఆఫర్లను చూడటానికి లొకేషన్‌ను ప్రారంభించండి.' : language === 'kn' ? 'ಹತ್ತಿರದ ಆಫರ್‌ಗಳನ್ನು ಹುಡುಕಲು ಸ್ಥಳವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.' : language === 'ml' ? 'സമീപ ഓഫറുകൾ കണ്ടെത്താൻ ലൊക്കേഷൻ പ്രവർത്തനക്ഷമമാക്കുക.' : language === 'hi' ? 'नजदीकी ऑफ़र खोजने के लिए स्थान सक्षम करें।' : 'Enable location to sort and discover offers closest to you.'}
            </Text>
          </View>
          <TouchableOpacity style={styles.locationBannerBtn} onPress={handleEnableLocation}>
            <MapPin size={12} color="#fff" />
            <Text style={styles.locationBannerBtnText}>{t.offers?.enableLocationBtn || (language === 'ta' ? 'இயக்கு' : language === 'te' ? 'ప్రారంభించు' : language === 'kn' ? 'ಸಕ್ರಿಯಗೊಳಿಸಿ' : language === 'ml' ? 'പ്രവർത്തനക്ഷമമാക്കുക' : language === 'hi' ? 'सक्षम करें' : 'Enable')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {token && (
        <TouchableOpacity
          style={[styles.alertBanner, isDark && { backgroundColor: '#111827', borderColor: '#1F2937' }]}
          onPress={handleEnableAlerts}
        >
          <Bell size={16} color={CustomerColors.teal600} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.alertTitle, isDark && { color: '#FFFFFF' }]}>
              {txt.notifyTitle}
            </Text>
            <Text style={[styles.alertSubtitle, isDark && { color: '#9CA3AF' }]}>
              {txt.notifySubtitle}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Radius selector */}
      <View style={styles.radiusRow}>
        <Text style={[styles.radiusLabel, isDark && { color: '#9CA3AF' }]}>{txt.radius}</Text>
        {RADIUS_OPTIONS.map(r => (
          <TouchableOpacity
            key={r}
            style={[
              styles.radiusChip,
              {
                backgroundColor: isDark ? '#111827' : CustomerColors.white,
                borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
              },
              radius === r && styles.radiusChipActive,
            ]}
            onPress={() => handleRadiusChange(r)}
          >
            <Text
              style={[
                styles.radiusChipText,
                { color: isDark ? '#D1D5DB' : CustomerColors.textSecondary },
                radius === r && styles.radiusChipTextActive,
              ]}
            >
              {r} km
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={[styles.center, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
          <ActivityIndicator size="large" color={CustomerColors.teal600} />
          <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>Loading offers…</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={o => o._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>
                No offers found right now
              </Text>
              <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>
                Try increasing the radius or check back later.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const hoursLeft = Math.max(
              0,
              Math.floor(
                (new Date(item.validUntil).getTime() - Date.now()) /
                  3_600_000,
              ),
            );
            return (
              <View style={[styles.card, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderColor: isDark ? '#1F2937' : CustomerColors.border }]}>
                <View style={[styles.imageWrap, isDark && { backgroundColor: '#1F2937' }]}>
                  <Image
                    source={{ uri: resolveImage(item.image) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {item.discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        {item.discountPercent}% OFF
                      </Text>
                    </View>
                  )}
                  {item.distanceKm !== undefined && item.distanceKm !== null ? (
                    <View style={styles.distanceBadge}>
                      <MapPin size={9} color="#fff" />
                      <Text style={styles.distanceBadgeText}>
                        {item.distanceKm} km
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.cardBody}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Text style={[styles.storeName, isDark && { color: '#5EEAD4' }]}>{item.storeName}</Text>
                    {((item as any).storeRating || (item as any).rating) ? (
                      <View style={styles.storeRatingTag}>
                        <Star size={9} color="#D97706" fill="#D97706" />
                        <Text style={styles.storeRatingTagText}>
                          {Number((item as any).storeRating || (item as any).rating).toFixed(1)}
                          {(item as any).reviewCount ? ` (${(item as any).reviewCount})` : ''}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.offerTitle, isDark && { color: '#F9FAFB' }]} numberOfLines={1}>
                    {translateProductName(item.title, language)}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.offerPrice, isDark && { color: '#FFFFFF' }]}>
                      ₹{item.offerPrice}
                    </Text>
                    {item.originalPrice !== item.offerPrice && (
                      <Text style={[styles.originalPrice, isDark && { color: '#9CA3AF' }]}>
                        ₹{item.originalPrice}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.timeBadge,
                      isDark && { backgroundColor: '#1F2937' },
                      hoursLeft < 24 && (isDark ? { backgroundColor: 'rgba(220, 38, 38, 0.2)' } : styles.timeBadgeUrgent),
                    ]}
                  >
                    <Clock
                      size={9}
                      color={
                        hoursLeft < 24
                          ? CustomerColors.primary
                          : isDark ? '#9CA3AF' : CustomerColors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.timeBadgeText,
                        isDark && { color: '#9CA3AF' },
                        hoursLeft < 24 && styles.timeBadgeTextUrgent,
                      ]}
                    >
                      {hoursLeft < 1
                        ? (language === 'ta' ? '< 1 மணிநேரம்' : language === 'te' ? '< 1 గంట' : language === 'kn' ? '< 1 ಗಂಟೆ' : language === 'ml' ? '< 1 മണിക്കൂർ' : language === 'hi' ? '< 1 घंटा' : '< 1h left')
                        : hoursLeft < 24
                        ? (language === 'ta' ? `${hoursLeft} மணிநேரம்` : language === 'te' ? `${hoursLeft} గంటలు` : language === 'kn' ? `${hoursLeft} ಗಂಟೆ` : language === 'ml' ? `${hoursLeft} മണിക്കൂർ` : language === 'hi' ? `${hoursLeft} घंटे` : `${hoursLeft}h left`)
                        : (language === 'ta' ? `${Math.floor(hoursLeft / 24)} நாட்கள்` : language === 'te' ? `${Math.floor(hoursLeft / 24)} రోజులు` : language === 'kn' ? `${Math.floor(hoursLeft / 24)} ದಿನಗಳು` : language === 'ml' ? `${Math.floor(hoursLeft / 24)} ദിവസം` : language === 'hi' ? `${Math.floor(hoursLeft / 24)} दिन` : `${Math.floor(hoursLeft / 24)}d left`)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.orderBtn}
                    onPress={() => {
                      if (!token || !user) {
                        setShowAuthModal(true);
                        return;
                      }
                      setSelectedOffer(item);
                    }}
                  >
                    <ShoppingBag size={13} color="#fff" />
                    <Text style={styles.orderBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {t.offers?.orderNowBtn || txt.orderNow}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListFooterComponent={<View style={{ height: Spacing.xl }} />}
        />
      )}

      <Modal
        visible={Boolean(selectedOffer)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOffer(null)}
      >
        {selectedOffer && (
          <OrderModal
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
          />
        )}
      </Modal>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={t('checkout.loginToPlaceOrder') || 'Login to Place Order'}
        subtitle={t('checkout.loginToPlaceOrderSubtitle') || 'Please sign in or register to place your order.'}
        onLogin={() => navigation.navigate('LoginRegister')}
      />
    </View>
  );
}

type Step = 'details' | 'delivery' | 'payment' | 'placing' | 'success';

function OrderModal({
  offer,
  onClose,
}: {
  offer: Offer;
  onClose: () => void;
}) {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const { language, t } = useTranslation();
  const txt = (NEARBY_I18N as any)[language] || NEARBY_I18N.en;

  const [step, setStep] = useState<Step>('details');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'credit'>('razorpay');

  const isHomeBusinessOffer = useMemo(() => {
    return (
      (offer as any)?.ownerRole === 'home_business' ||
      (offer as any)?.storeType === 'home_business'
    );
  }, [offer]);

  useEffect(() => {
    if (isHomeBusinessOffer) {
      setDeliveryMethod('delivery');
      if (paymentMethod !== 'razorpay') {
        setPaymentMethod('razorpay');
      }
    }
  }, [isHomeBusinessOffer, paymentMethod]);
  const [creditEligibility, setCreditEligibility] = useState<any>(null);
  const [selectedSubMethod, setSelectedSubMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [orderId, setOrderId] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const [form, setForm] = useState({
    firstName: user?.fullname?.split(' ')[0] || user?.name || '',
    lastName: user?.fullname?.split(' ').slice(1).join(' ') || '',
    phone: user?.mobilenumber || '',
    contactEmail: user?.email || '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    quantity: '1',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Cities for selected state
  const cities = useMemo(() => {
    if (!selectedStateCode) return [];
    return getCities(selectedStateCode) || [];
  }, [selectedStateCode]);

  const total = (offer.offerPrice * (parseInt(form.quantity, 10) || 1)).toFixed(0);

  useEffect(() => {
    if (!token) {
      setCreditEligibility(null);
      return;
    }
    const storeId = offer?.storeId || '';
    creditApi
      .getMyCreditAccounts()
      .then(res => {
        const accounts = res.data?.data || [];
        const approved =
          accounts.find(
            (a: any) =>
              a.status === 'APPROVED' &&
              (!storeId ||
                String(a.storeId) === String(storeId) ||
                a.storeName?.toLowerCase() === offer?.storeName?.toLowerCase())
          ) || accounts.find((a: any) => a.status === 'APPROVED');
        if (approved) {
          setCreditEligibility({
            hasAccount: true,
            status: approved.status,
            storeId: approved.storeId,
            storeName: approved.storeName,
            creditLimit: approved.creditLimit || 0,
            availableCredit:
              approved.availableCredit ??
              (approved.creditLimit - (approved.reservedCreditAmount || 0)),
            outstandingBalance: approved.outstandingBalance || 0,
            nextDueDate: approved.nextDueDate,
          });
        } else {
          setCreditEligibility(null);
        }
      })
      .catch(() => setCreditEligibility(null));
  }, [offer, token]);

  const handleNextToDelivery = () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }

    if (!form.firstName.trim()) {
      setError(txt.errFirstName);
      return;
    }
    if (!form.phone.trim()) {
      setError(txt.errPhone);
      return;
    }
    if (!form.address.trim()) {
      setError(txt.errAddress);
      return;
    }
    if (!form.state.trim()) {
      setError(txt.errState);
      return;
    }
    if (!form.city.trim()) {
      setError(txt.errCity);
      return;
    }
    if (!form.pinCode.trim()) {
      setError(txt.errPinCode);
      return;
    }

    setError('');
    setStep('delivery');
  };

  const handleNextToPayment = () => {
    if (!deliveryMethod) {
      setError(txt.errDelivery);
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }

    if (!deliveryMethod) return;

    setStep('placing');
    setError('');
    try {
      const qty = parseInt(form.quantity, 10) || 1;
      const totalAmount = Number(total);

      // Pre-resolve store product ID by matching title if possible (matching web parity)
      let resolvedProductId = offer._id;
      try {
        if (offer.storeId) {
          const storeProdsRes = await productApi.getByStore(offer.storeId);
          const storeProducts = storeProdsRes.data?.data || storeProdsRes.data || [];
          const matched = storeProducts.find(
            (p: any) => p.title?.trim().toLowerCase() === offer.title?.trim().toLowerCase()
          );
          if (matched?._id || matched?.id) {
            resolvedProductId = matched._id || matched.id;
          }
        }
      } catch (lookupErr) {
        // Fallback to offer._id
      }

      const cartItems = [
        {
          id: resolvedProductId,
          productId: resolvedProductId,
          title: offer.title,
          price: offer.offerPrice,
          offerPrice: offer.offerPrice,
          isOffer: true,
          quantity: qty,
          storeId: offer.storeId,
          storeName: offer.storeName,
          ownerRole: (offer as any)?.ownerRole,
          storeType: (offer as any)?.storeType,
          image: offer.image?.startsWith('http')
            ? offer.image
            : offer.image
            ? `${GATEWAY_URL}${offer.image}`
            : undefined,
        },
      ];

      const emailToUse =
        form.contactEmail?.trim() ||
        user?.email?.trim() ||
        `${(form.phone || 'customer').replace(/\D/g, '') || 'customer'}@remise.digital`;

      const effectiveDeliveryMethod = isHomeBusinessOffer ? 'delivery' : deliveryMethod;
      const effectivePaymentMethod = isHomeBusinessOffer ? 'razorpay' : paymentMethod;

      const res = await smartOrderApi.placeOrder({
        amount: totalAmount,
        cartItems,
        contactEmail: emailToUse,
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
        },
        userId: user?._id || null,
        storeId: offer.storeId,
        storeName: offer.storeName,
        deliveryMethod: effectiveDeliveryMethod,
        paymentMethod: effectivePaymentMethod,
      });

      // Also sync offers-service order
      offersApi
        .placeOrder(offer._id, {
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          customerPhone: form.phone,
          customerEmail: form.contactEmail || user?.email || '',
          deliveryAddress: form.address,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
          deliveryMethod: effectiveDeliveryMethod,
          paymentMethod: effectivePaymentMethod,
          paymentStatus: effectivePaymentMethod === 'cod' ? 'Pending' : 'Pending',
          quantity: qty,
        })
        .catch(() => {});

      if (!res.data.success) {
        throw new Error(res.data.message || 'Order failed.');
      }

      if (paymentMethod === 'cod' || paymentMethod === 'credit') {
        const targetOrderId = res.data?.orderId || res.data?.order?._id || '';
        setOrderId(targetOrderId);
        setStep('success');
        return;
      }

      const data = res.data;
      if (!data.razorpayOrderId && !data.keyId) {
        throw new Error('Failed to initialize Razorpay payment session.');
      }

      const options = {
        provider: 'razorpay',
        order_id: data.razorpayOrderId || data.orderId,
        key: data.keyId || data.key,
        amount: data.amountPaise || Math.round(totalAmount * 100),
        currency: data.currency || 'INR',
        name: data.name || offer.storeName || 'Remise Marketplace',
        description: data.description || `Nearby Offer: ${offer.title}`,
        customer: {
          name: `${form.firstName} ${form.lastName}`.trim() || user?.fullname || user?.name || 'Customer',
          email: form.contactEmail || user?.email || '',
          contact: form.phone || user?.mobilenumber || '',
        },
      };

      setStep('payment');
      onClose();
      navigation.navigate('RazorpayWebView', {
        options,
        orderId: data.orderId,
        returnScreen: 'NearbyOffers',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Order failed. Please try again.');
      setStep('payment');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[
          styles.modalSheet,
          { maxHeight: '94%' },
          isDark && {
            backgroundColor: '#111827',
            borderTopColor: '#1F2937',
            borderTopWidth: 1,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={{ flex: 1, paddingRight: Spacing.sm }}>
            <View style={[styles.offerBadgePill, isDark && { backgroundColor: 'rgba(13, 148, 136, 0.2)' }]}>
              <Text style={[styles.offerBadgePillText, isDark && { color: '#2DD4BF' }]}>{txt.nearbyDeal}</Text>
            </View>
            <Text style={[styles.modalTitle, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>{translateProductName(offer.title, language)}</Text>
            <Text style={[styles.modalSubtitle, isDark && { color: '#9CA3AF' }]} numberOfLines={1}>{offer.storeName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        {step !== 'placing' && step !== 'success' && (
          <View style={[styles.stepTrack, isDark && { backgroundColor: '#1F2937' }]}>
            <View style={[styles.stepItem, (step === 'details' || step === 'delivery' || step === 'payment') && styles.stepItemActive]}>
              <View style={[styles.stepDot, isDark && { backgroundColor: '#374151' }, styles.stepDotActive]}>
                <Text style={[styles.stepDotText, isDark && { color: '#9CA3AF' }, styles.stepDotTextActive]}>
                  {step === 'delivery' || step === 'payment' ? '✓' : '1'}
                </Text>
              </View>
              <Text style={[styles.stepLabel, isDark && { color: '#9CA3AF' }, styles.stepLabelActive, isDark && { color: '#2DD4BF' }]}>{txt.details}</Text>
            </View>
            <View style={[styles.stepLine, isDark && { backgroundColor: '#374151' }, (step === 'delivery' || step === 'payment') && styles.stepLineActive]} />
            <View style={[styles.stepItem, (step === 'delivery' || step === 'payment') && styles.stepItemActive]}>
              <View style={[styles.stepDot, isDark && { backgroundColor: '#374151' }, (step === 'delivery' || step === 'payment') && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, isDark && { color: '#9CA3AF' }, (step === 'delivery' || step === 'payment') && styles.stepDotTextActive]}>
                  {step === 'payment' ? '✓' : '2'}
                </Text>
              </View>
              <Text style={[styles.stepLabel, isDark && { color: '#9CA3AF' }, (step === 'delivery' || step === 'payment') && [styles.stepLabelActive, isDark && { color: '#2DD4BF' }]]}>{txt.delivery}</Text>
            </View>
            <View style={[styles.stepLine, isDark && { backgroundColor: '#374151' }, step === 'payment' && styles.stepLineActive]} />
            <View style={[styles.stepItem, step === 'payment' && styles.stepItemActive]}>
              <View style={[styles.stepDot, isDark && { backgroundColor: '#374151' }, step === 'payment' && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, isDark && { color: '#9CA3AF' }, step === 'payment' && styles.stepDotTextActive]}>3</Text>
              </View>
              <Text style={[styles.stepLabel, isDark && { color: '#9CA3AF' }, step === 'payment' && [styles.stepLabelActive, isDark && { color: '#2DD4BF' }]]}>{txt.payment}</Text>
            </View>
          </View>
        )}

        {/* Price Strip */}
        <View style={[styles.priceStrip, isDark && { backgroundColor: '#1F2937' }]}>
          <Text style={[styles.priceStripLabel, isDark && { color: '#9CA3AF' }]}>{txt.offerPrice}</Text>
          <View style={styles.priceStripRight}>
            <Text style={[styles.priceStripValue, isDark && { color: '#2DD4BF' }]}>₹{offer.offerPrice}</Text>
            {offer.originalPrice !== offer.offerPrice && (
              <Text style={[styles.priceStripOriginal, isDark && { color: '#6B7280' }]}>₹{offer.originalPrice}</Text>
            )}
            <View style={styles.modalDiscountBadge}>
              <Text style={styles.modalDiscountBadgeText}>{offer.discountPercent}% {txt.off}</Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
          {/* ══════════════ STEP 1: CONTACT DETAILS & ADDRESS ══════════════ */}
          {step === 'details' && (
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.fieldSectionLabel, isDark && { color: '#FFFFFF' }]}>{txt.contactAndAddress}</Text>

              <View style={styles.row2}>
                <TextInput
                  style={[styles.input, styles.half, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }]}
                  placeholder={txt.firstName}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  value={form.firstName}
                  onChangeText={v => set('firstName', v)}
                />
                <TextInput
                  style={[styles.input, styles.half, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }]}
                  placeholder={txt.lastName}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  value={form.lastName}
                  onChangeText={v => set('lastName', v)}
                />
              </View>

              <View style={styles.row2}>
                <TextInput
                  style={[styles.input, styles.half, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }]}
                  placeholder={txt.phone}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={v => set('phone', v)}
                />
                <TextInput
                  style={[styles.input, styles.half, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }]}
                  placeholder={txt.email}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="email-address"
                  value={form.contactEmail}
                  onChangeText={v => set('contactEmail', v)}
                />
              </View>

              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }]}
                placeholder={txt.streetAddress}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                value={form.address}
                onChangeText={v => set('address', v)}
              />

              {/* State Dropdown */}
              <LocationSelectField
                label={txt.state}
                value={form.state}
                placeholder={txt.selectState}
                options={indianStates.map(s => ({
                  key: s.isoCode,
                  canonicalName: s.name,
                  label: translateState(s.name, language),
                }))}
                onSelect={(stateCode: string, _stateName: string) => {
                  const s = indianStates.find(item => item.isoCode === stateCode);
                  const canonicalName = s ? s.name : stateCode;
                  setSelectedStateCode(stateCode);
                  set('state', canonicalName);
                  set('city', '');
                  set('pinCode', '');
                }}
              />

              {/* City Dropdown */}
              <LocationSelectField
                label={txt.city}
                value={form.city}
                placeholder={selectedStateCode ? txt.selectCity : txt.selectStateFirst}
                disabled={!selectedStateCode}
                options={cities.map(c => ({
                  key: c.name,
                  canonicalName: c.name,
                  label: translateCity(c.name, language),
                }))}
                onSelect={async (cityName: string) => {
                  set('city', cityName);
                  const pin = await lookupPincode(cityName);
                  if (pin) {
                    set('pinCode', pin);
                  }
                }}
              />

              {/* Pin Code Input (Auto-entered with manual override) */}
              <View>
                <Text style={[styles.inputLabel, isDark && { color: '#9CA3AF' }]}>{txt.pinCode}</Text>
                <TextInput
                  style={[styles.input, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }]}
                  placeholder={txt.pinCode}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="number-pad"
                  value={form.pinCode}
                  onChangeText={v => set('pinCode', v)}
                />
              </View>

              {/* Quantity Selector & Total */}
              <View style={[styles.qtyTotalRow, isDark && { backgroundColor: '#1F2937' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>{txt.quantity}</Text>
                  <View style={[styles.qtyControl, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const current = parseInt(form.quantity, 10) || 1;
                        if (current > 1) set('quantity', String(current - 1));
                      }}
                    >
                      <Text style={[styles.qtyBtnText, isDark && { color: '#2DD4BF' }]}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.qtyInput, isDark && { color: '#FFFFFF' }]}
                      placeholderTextColor={CustomerColors.textSecondary}
                      keyboardType="number-pad"
                      value={form.quantity}
                      onChangeText={v => set('quantity', v)}
                    />
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const current = parseInt(form.quantity, 10) || 1;
                        set('quantity', String(current + 1));
                      }}
                    >
                      <Text style={[styles.qtyBtnText, isDark && { color: '#2DD4BF' }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.totalText, isDark && { color: '#9CA3AF' }]}>
                  {txt.totalAmount}{' '}
                  <Text style={{ fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontSize: FontSizes.base }}>
                    ₹{total}
                  </Text>
                </Text>
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleNextToDelivery}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{txt.nextDelivery}</Text>
                <ChevronRight size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════ STEP 2: DELIVERY METHOD ══════════════ */}
          {step === 'delivery' && (
            <View style={{ gap: Spacing.md }}>
              <View>
                <Text style={[styles.fieldSectionLabel, isDark && { color: '#FFFFFF' }]}>{txt.deliveryMethod}</Text>
                <Text style={[styles.stepSubtitle, isDark && { color: '#9CA3AF' }]}>
                  {txt.receiveFrom}{' '}
                  <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black }}>{offer.storeName}</Text>?
                </Text>
              </View>

              <View style={{ gap: Spacing.sm }}>
                {/* Self Pickup */}
                {!isHomeBusinessOffer && (
                  <TouchableOpacity
                    style={[
                      styles.methodCardLarge,
                      isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                      deliveryMethod === 'pickup' && [styles.methodCardLargeActive, isDark && { backgroundColor: '#0f2f2c', borderColor: CustomerColors.teal600 }],
                    ]}
                    onPress={() => {
                      setDeliveryMethod('pickup');
                      setError('');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.methodIconLargeWrap, isDark && { backgroundColor: '#111827' }, deliveryMethod === 'pickup' && styles.methodIconLargeWrapActive]}>
                      <Store size={22} color={deliveryMethod === 'pickup' ? '#fff' : (isDark ? '#2DD4BF' : CustomerColors.teal700)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.methodLargeTitle, isDark && { color: '#FFFFFF' }, deliveryMethod === 'pickup' && [styles.methodLargeTitleActive, isDark && { color: '#2DD4BF' }]]}>
                        {txt.selfPickup}
                      </Text>
                      <Text style={[styles.methodLargeSubtitle, isDark && { color: '#9CA3AF' }]}>
                        {txt.selfPickupDesc.replace('{store}', offer.storeName)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Home Delivery */}
                <TouchableOpacity
                  style={[
                    styles.methodCardLarge,
                    isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                    deliveryMethod === 'delivery' && [styles.methodCardLargeActive, isDark && { backgroundColor: '#0f2f2c', borderColor: CustomerColors.teal600 }],
                  ]}
                  onPress={() => {
                    setDeliveryMethod('delivery');
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.methodIconLargeWrap, isDark && { backgroundColor: '#111827' }, deliveryMethod === 'delivery' && styles.methodIconLargeWrapActive]}>
                    <Truck size={22} color={deliveryMethod === 'delivery' ? '#fff' : (isDark ? '#2DD4BF' : CustomerColors.teal700)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodLargeTitle, isDark && { color: '#FFFFFF' }, deliveryMethod === 'delivery' && [styles.methodLargeTitleActive, isDark && { color: '#2DD4BF' }]]}>
                      {txt.homeDelivery}
                    </Text>
                    <Text style={[styles.methodLargeSubtitle, isDark && { color: '#9CA3AF' }]}>
                      {txt.homeDeliveryDesc.replace('{store}', offer.storeName)} {form.address}, {form.city}, {form.state} - {form.pinCode}
                    </Text>
                  </View>
                </TouchableOpacity>

                {isHomeBusinessOffer && (
                  <View style={{ backgroundColor: isDark ? 'rgba(15, 118, 110, 0.2)' : '#F0FDFA', borderColor: isDark ? '#115E59' : '#99F6E4', borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.sm, marginTop: Spacing.xs }}>
                    <Text style={{ fontSize: 12, color: isDark ? '#2DD4BF' : '#0F766E', fontWeight: '600' }}>
                      ℹ️ Home Business Policy: Only Home Delivery is available for this offer.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}
                  onPress={() => setStep('details')}
                >
                  <Text style={[styles.secondaryBtnText, isDark && { color: '#D1D5DB' }]} numberOfLines={1}>← {txt.back}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]}
                  onPress={handleNextToPayment}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{txt.nextPayment}</Text>
                  <ChevronRight size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══════════════ STEP 3: PAYMENT METHOD ══════════════ */}
          {step === 'payment' && (
            <View style={{ gap: Spacing.md }}>
              <View>
                <Text style={[styles.fieldSectionLabel, isDark && { color: '#FFFFFF' }]}>{txt.paymentMethod}</Text>
                <Text style={[styles.stepSubtitle, isDark && { color: '#9CA3AF' }]}>
                  {txt.paySecurelyFor} <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black }}>{offer.storeName}</Text>:
                </Text>
              </View>

              {/* Razorpay Online Payment Card */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  paymentMethod === 'razorpay' ? styles.razorpayOptionCard : {},
                  isDark && paymentMethod === 'razorpay' && { backgroundColor: '#0f2f2c', borderColor: '#0D9488' },
                  paymentMethod !== 'razorpay' && { opacity: 0.75, borderColor: isDark ? '#374151' : '#E5E7EB' },
                ]}
                onPress={() => setPaymentMethod('razorpay')}
              >
                <View style={styles.razorpayIconBox}>
                  <CreditCard size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
                    <Text style={[styles.optionTitle, isDark && { color: '#FFFFFF' }]}>{txt.onlinePayment}</Text>
                    <View style={styles.instantBadge}>
                      <Text style={styles.instantBadgeText}>{txt.instantSecure}</Text>
                    </View>
                  </View>
                  <Text style={[styles.optionDesc, isDark && { color: '#9CA3AF' }]}>
                    {txt.paymentDesc}
                  </Text>
                  <View style={styles.pillRow}>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>⚡ UPI</Text></View>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>💳 {txt.cards}</Text></View>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>🏦 {txt.netBanking}</Text></View>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>👛 {txt.wallets}</Text></View>
                  </View>
                </View>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: paymentMethod === 'razorpay' ? '#0D9488' : '#9CA3AF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 4,
                  }}
                >
                  {paymentMethod === 'razorpay' && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#0D9488' }} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Cash on Delivery (COD) Card */}
              {!isHomeBusinessOffer && (
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#F0FDFA',
                      borderColor: paymentMethod === 'cod' ? '#059669' : (isDark ? '#374151' : '#E2E8F0'),
                      borderWidth: paymentMethod === 'cod' ? 2 : 1.5,
                    },
                  ]}
                  onPress={() => setPaymentMethod('cod')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.razorpayIconBox, { backgroundColor: '#059669' }]}>
                    <Banknote size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
                      <Text style={[styles.optionTitle, isDark && { color: '#FFFFFF' }]}>
                        {txt.codTitle || 'Cash on Delivery (COD)'}
                      </Text>
                      <View style={[styles.instantBadge, { backgroundColor: '#059669' }]}>
                        <Text style={styles.instantBadgeText}>{txt.codBadge || 'Pay in Cash'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.optionDesc, isDark && { color: '#9CA3AF' }]}>
                      {txt.codDesc || 'Pay with physical cash upon order delivery or pickup.'}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: paymentMethod === 'cod' ? '#059669' : '#9CA3AF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4,
                    }}
                  >
                    {paymentMethod === 'cod' && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' }} />
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {/* Store Credit (Kadan) Option */}
              {!isHomeBusinessOffer && creditEligibility && creditEligibility.status === 'APPROVED' && (
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#F0FDFA',
                      borderColor: paymentMethod === 'credit' ? '#7C3AED' : (isDark ? '#374151' : '#E2E8F0'),
                      borderWidth: paymentMethod === 'credit' ? 2 : 1.5,
                    },
                    (creditEligibility.availableCredit || 0) < Number(total) && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    if ((creditEligibility.availableCredit || 0) >= Number(total)) {
                      setPaymentMethod('credit');
                    }
                  }}
                  disabled={(creditEligibility.availableCredit || 0) < Number(total)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.razorpayIconBox, { backgroundColor: '#7C3AED' }]}>
                    <FileText size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
                      <Text style={[styles.optionTitle, isDark && { color: '#FFFFFF' }]}>
                        {txt.storeCreditTitle || 'Store Credit (Kadan)'}
                      </Text>
                      <View style={[styles.instantBadge, { backgroundColor: '#7C3AED' }]}>
                        <Text style={styles.instantBadgeText}>{txt.approvedBadge || 'APPROVED'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.optionDesc, isDark && { color: '#9CA3AF' }]}>
                      {txt.creditTotal || 'Total Credit'}: ₹{(creditEligibility.creditLimit || 0).toLocaleString()} · {txt.creditRemaining || 'Remaining'}: ₹{(creditEligibility.availableCredit || 0).toLocaleString()} (₹{Math.max(0, (creditEligibility.creditLimit || 0) - (creditEligibility.availableCredit || 0)).toLocaleString()} {txt.creditUsed || 'used'}) · {txt.creditNextDue || 'Next Due'}:{' '}
                      {creditEligibility.nextDueDate
                        ? new Date(creditEligibility.nextDueDate).toLocaleDateString()
                        : (txt.creditAsAgreed || 'As agreed')}
                    </Text>
                    {(creditEligibility.availableCredit || 0) < Number(total) && (
                      <Text style={{ color: '#EF4444', fontSize: FontSizes.xs, marginTop: 2, fontWeight: '700' }}>
                        {txt.creditExceeded || 'Total exceeds available credit limit.'}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: paymentMethod === 'credit' ? '#7C3AED' : '#9CA3AF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4,
                    }}
                  >
                    {paymentMethod === 'credit' && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED' }} />
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {isHomeBusinessOffer && (
                <View style={{ backgroundColor: isDark ? 'rgba(15, 118, 110, 0.2)' : '#F0FDFA', borderColor: isDark ? '#115E59' : '#99F6E4', borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.sm, marginTop: Spacing.xs }}>
                  <Text style={{ fontSize: 12, color: isDark ? '#2DD4BF' : '#0F766E', fontWeight: '600' }}>
                    ℹ️ Home Business Policy: Only Online Payment is supported for this offer. Cash on Delivery is unavailable.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: Spacing.xs },
                  paymentMethod === 'credit' && { backgroundColor: '#7C3AED' },
                  paymentMethod === 'cod' && { backgroundColor: '#059669' },
                ]}
                onPress={() => handlePlaceOrder()}
                activeOpacity={0.85}
              >
                {paymentMethod === 'credit' ? (
                  <>
                    <FileText size={16} color="#fff" />
                    <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {(txt.placeOrderCredit || 'Place Order on Credit (₹{amount})').replace('{amount}', total)}
                    </Text>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Banknote size={16} color="#fff" />
                    <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {(txt.placeOrderCod || 'Place Cash on Delivery Order (₹{amount})').replace('{amount}', total)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Lock size={16} color="#fff" />
                    <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {txt.payVia.replace('{amount}', total)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('delivery')} style={{ alignSelf: 'flex-start', marginTop: Spacing.xs }}>
                <Text style={[styles.linkText, isDark && { color: '#2DD4BF' }]}>← {txt.backToDelivery}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════ PLACING STATE ══════════════ */}
          {step === 'placing' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
              <Text style={[styles.stepSubtitle, isDark && { color: '#9CA3AF' }]}>{txt.placingOrder}</Text>
            </View>
          )}

          {/* ══════════════ SUCCESS STATE ══════════════ */}
          {step === 'success' && (
            <View style={[styles.center, { gap: Spacing.md, paddingVertical: Spacing.lg }]}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={40} color={CustomerColors.success} />
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.successTitle, isDark && { color: '#FFFFFF' }]}>{txt.orderConfirmed}</Text>
                <Text style={[styles.successSubtitle, isDark && { color: '#9CA3AF' }]}>
                  {txt.orderPlacedVia.replace('{store}', offer.storeName)} ({deliveryMethod === 'pickup' ? txt.selfPickup : txt.homeDelivery}).
                </Text>
              </View>

              {/* Verified Bill Card */}
              <View style={[styles.billCard, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                <View style={[styles.billHeader, isDark && { borderBottomColor: '#374151' }]}>
                  <View>
                    <Text style={styles.billBadge}>{txt.verifiedOrder}</Text>
                    <Text style={[styles.billStoreName, isDark && { color: '#FFFFFF' }]}>{offer.storeName}</Text>
                  </View>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>{txt.confirmed}</Text>
                    {orderId ? <Text style={styles.billOrderId}>#{orderId.slice(-8)}</Text> : null}
                  </View>
                </View>

                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.customer}</Text>
                  <Text style={[styles.billValue, isDark && { color: '#FFFFFF' }]}>
                    {[form.firstName, form.lastName].filter(Boolean).join(' ') || 'Customer'}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.item}</Text>
                  <Text style={[styles.billValue, isDark && { color: '#FFFFFF' }]}>{translateProductName(offer.title, language)} × {form.quantity}</Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.paymentMode}</Text>
                  <Text style={[styles.billValue, { color: isDark ? '#2DD4BF' : CustomerColors.teal700 }]}>
                    {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : txt.onlinePayment}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.deliveryMode}</Text>
                  <Text style={[styles.billValue, isDark && { color: '#FFFFFF' }]}>
                    {deliveryMethod === 'pickup' ? txt.selfPickup : txt.homeDelivery}
                  </Text>
                </View>

                <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: isDark ? '#374151' : CustomerColors.steelBorder, paddingTop: 6, marginTop: 4 }]}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.totalAmount.replace(':', '')}</Text>
                  <Text style={[styles.billTotal, isDark && { color: '#2DD4BF' }]}>₹{total}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={onClose}
              >
                <Text style={styles.doneBtnText}>{txt.backToOffers}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Place Offer Order"
        subtitle="Please sign in or register to place this offer order."
        onLogin={() => {
          onClose();
          navigation.navigate('LoginRegister');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    flex: 1,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    marginBottom: Spacing.xs,
    padding: Spacing.md,
  },
  locationBannerTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: '#92400E' },
  locationBannerSubtitle: { fontSize: 11, color: '#B45309', marginTop: 1 },
  locationBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  locationBannerBtnText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  alertBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    padding: Spacing.md,
  },
  alertTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#374151' },
  alertSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  radiusLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginRight: 4,
  },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  radiusChipActive: {
    backgroundColor: CustomerColors.mint,
    borderColor: CustomerColors.teal600,
  },
  radiusChipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextActive: { color: CustomerColors.teal700 },
  list: { padding: Spacing.sm, paddingBottom: Spacing.xl },
  row: { gap: Spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imageWrap: { width: '100%', height: 120, backgroundColor: '#F5F5F5', overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  distanceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceBadgeText: { color: '#fff', fontSize: 9 },
  cardBody: { padding: Spacing.sm },
  storeName: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal600 },
  storeRatingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  storeRatingTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  offerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  offerPrice: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  originalPrice: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: CustomerColors.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: 6,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  timeBadgeUrgent: {
    backgroundColor: CustomerColors.dangerBg,
    borderColor: '#FECACA',
  },
  timeBadgeText: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  timeBadgeTextUrgent: { color: CustomerColors.primary },
  orderBtn: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  orderBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    flexShrink: 1,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  modalSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  offerBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: CustomerColors.mint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  offerBadgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  stepTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    marginVertical: 2,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    opacity: 0.5,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: CustomerColors.teal600,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepLabelActive: {
    color: CustomerColors.teal700,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: CustomerColors.teal600,
  },
  priceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CustomerColors.bg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  priceStripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceStripLabel: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
  },
  priceStripValue: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  priceStripOriginal: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  modalDiscountBadge: {
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalDiscountBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  errorText: { color: '#B91C1C', fontSize: FontSizes.xs, fontWeight: '600' },
  fieldSectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    textTransform: 'uppercase',
  },
  row2: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  qtyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  qtyInput: {
    width: 36,
    textAlign: 'center',
    fontWeight: '800',
    color: CustomerColors.black,
    paddingVertical: 2,
    fontSize: FontSizes.sm,
  },
  totalText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  primaryBtn: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
    flexShrink: 1,
    textAlign: 'center',
  },
  secondaryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    overflow: 'hidden',
  },
  secondaryBtnText: {
    color: CustomerColors.textSecondary,
    fontWeight: '700',
    fontSize: FontSizes.sm,
    flexShrink: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    width: '100%',
  },
  methodCardLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  methodCardLargeActive: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  methodIconLargeWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconLargeWrapActive: {
    backgroundColor: CustomerColors.teal600,
  },
  methodLargeTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  methodLargeTitleActive: {
    color: CustomerColors.teal700,
  },
  methodLargeSubtitle: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  razorpayOptionCard: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  razorpayIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantBadge: {
    backgroundColor: '#0D9488',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  instantBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  optionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  optionDesc: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  pill: {
    backgroundColor: '#E0F2FE',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
  },
  linkText: {
    color: CustomerColors.teal700,
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  subMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  subMethodCardActive: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  subMethodIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subMethodIconActive: {
    backgroundColor: '#CCFBF1',
  },
  subMethodTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  subMethodDesc: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  feeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bankTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6D28D9',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  walletTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  trustBannerText: {
    fontSize: 10,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  qrBox: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrImage: {
    width: 170,
    height: 170,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  qrCaption: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  warningBoxText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  upiCopyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  upiCopyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  upiCopyValue: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  copyBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  screenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  screenshotBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  infoBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoBoxText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
    lineHeight: 18,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CustomerColors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.md,
    lineHeight: 16,
  },
  billCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    gap: 6,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
    marginBottom: 2,
  },
  billBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
    textTransform: 'uppercase',
  },
  billStoreName: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  paidBadge: {
    alignItems: 'flex-end',
  },
  paidBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  billOrderId: {
    fontSize: 9,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },
  billValue: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  billTotal: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSizes.sm,
  },
});