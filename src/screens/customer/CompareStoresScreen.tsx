import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  MapPin,
  Store,
  Truck,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  PackageX,
  X,
  FileText,
  Download,
  Star,
  Banknote,
} from 'lucide-react-native';
import {
  smartOrderApi,
  StoreResult,
  SmartOrderCartItem,
} from '../../api/smartOrderApi';
import { creditApi } from '../../api/creditApi';
import { useAuth } from '../../context/AuthContext';
import InvoiceModal from '../../components/common/InvoiceModal';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { navigateToAuthFlow } from '../../utils/authGuard';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import { indianStates, getCities, translateState, translateCity } from '../../utils/indiaLocation';
import { useTranslation } from '../../i18n';
import {
  LocationSelectField,
  normalizeLoc,
  lookupPincode,
} from '../../components/common/LocationSelectField';
import { lookupTanglishDictionary } from '../../utils/tanglishTranslator';
import { translateGroceryTerm } from '../../api/geminiScanApi';
import { usePlatformFee } from '../../utils/platformFee';
import { useDeliveryFee } from '../../utils/deliveryFee';


// Ported from client/app/(root)/bulk-purchase/CompareModal.tsx — same step
// machine (radius -> searching -> results -> confirming -> delivery ->
// payment -> placing -> success/error), same nearby-store matching call
// sequence, same delivery method (Self Pickup / Home Delivery), secure online
// payment via Razorpay.
const RADIUS_OPTIONS = [2, 5, 10, 15, 20];
type Step =
  | 'radius'
  | 'searching'
  | 'results'
  | 'confirming'
  | 'delivery'
  | 'payment'
  | 'placing'
  | 'success';

interface AddressForm {
  firstName: string;
  lastName: string;
  phone: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const COMPARE_I18N: Record<string, Record<string, string>> = {
  en: {
    findCheapestStore: 'Find Cheapest Store',
    itemsOnList: '{count} item{s} on your list',
    chooseRadius: 'Choose how far we should search for stores near you.',
    customKm: 'Custom km',
    searchWithin: 'Search within {radius} km',
    searchingNearby: 'Searching nearby stores…',
    noNearbyStores: 'No nearby stores carry all products on your list',
    tryExpanding: 'Try expanding your search radius or modifying items.',
    changeRadius: '← Change radius',
    searchDifferentRadius: '← Search a different radius',
    bestMatch: 'Best match',
    away: 'away',
    itemsAvailable: 'items available',
    notAvailable: 'Not available',
    selectStore: 'Select this store',
    items: 'items',
    firstName: 'First Name *',
    lastName: 'Last Name',
    phone: 'Phone *',
    email: 'Email (optional)',
    address: 'Address *',
    state: 'State',
    selectState: 'Select State *',
    city: 'City',
    selectCity: 'Select City *',
    selectStateFirst: 'Select a state first',
    pinCode: 'Pin Code *',
    back: 'Back',
    continueWithAmount: 'Continue — ₹{amount}',
    receiveOrderFrom: 'How would you like to receive your order from',
    selfPickup: 'Self Pickup',
    selfPickupDesc: 'Visit the shop and collect your order yourself.',
    homeDelivery: 'Home Delivery',
    homeDeliveryDesc: '{store} will deliver the order to your address.',
    completePayment: 'Complete payment to place your order:',
    onlinePayment: 'Online Payment (Razorpay)',
    instantSecure: 'INSTANT · SECURE',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, Net Banking & Wallets.',
    cards: 'Cards',
    netBanking: 'NetBanking',
    wallets: 'Wallets',
    payVia: 'Pay ₹{amount} via Razorpay',
    backToDeliveryChoice: 'Back to Delivery Choice',
    placingOrder: 'Placing your order…',
    orderConfirmed: 'Order & Payment Confirmed!',
    orderPlacedDesc: 'Your order from {store} has been placed via Online Payment (Razorpay - Verified) ({delivery}).',
    verifiedBill: 'VERIFIED BILL',
    paid: '● PAID',
    customer: 'Customer:',
    paymentMode: 'Payment Mode:',
    total: 'Total: ₹{amount}',
    viewInvoice: 'View Invoice',
    downloadBill: 'Download Bill',
    done: 'Done',
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
    productSubtotal: 'Product Subtotal',
    platformFee: 'Platform Fee',
    deliveryFee: 'Delivery Fee',
    free: 'FREE',
    totalPayable: 'Total Payable',
    placeOrderCredit: 'Place Order on Credit (₹{amount})',
    placeOrderCod: 'Place Cash on Delivery Order (₹{amount})',
  },
  ta: {
    findCheapestStore: 'குறைந்த விலைக் கடையைக் கண்டறி',
    itemsOnList: 'உங்கள் பட்டியலில் {count} பொருள்{s}',
    chooseRadius: 'அருகிலுள்ள கடைகளைத் தேட சுற்றளவைத் தேர்ந்தெடுக்கவும்.',
    customKm: 'சுற்றளவு (கி.மீ)',
    searchWithin: '{radius} கி.மீ-க்குள் தேடுங்கள்',
    searchingNearby: 'அருகிலுள்ள கடைகள் தேடப்படுகின்றன…',
    noNearbyStores: 'உங்கள் பட்டியலில் உள்ள அனைத்துப் பொருட்களும் அருகிலுள்ள கடைகளில் இல்லை',
    tryExpanding: 'தேடல் சுற்றளவை அதிகரிக்கவும் அல்லது பொருட்களை மாற்றவும்.',
    changeRadius: '← சுற்றளவை மாற்று',
    searchDifferentRadius: '← வேறு சுற்றளவில் தேடுங்கள்',
    bestMatch: 'சிறந்த தேர்வு',
    away: 'தொலைவில்',
    itemsAvailable: 'பொருட்கள் கிடைக்கின்றன',
    notAvailable: 'கிடைக்கவில்லை',
    selectStore: 'இந்தக் கடையைத் தேர்ந்தெடு',
    items: 'பொருட்கள்',
    firstName: 'முதல் பெயர் *',
    lastName: 'கடைசி பெயர்',
    phone: 'தொலைபேசி எண் *',
    email: 'மின்னஞ்சல் (விருப்பமானது)',
    address: 'முகவரி *',
    state: 'மாநிலம்',
    selectState: 'மாநிலத்தைத் தேர்ந்தெடுக்கவும் *',
    city: 'நகரம்',
    selectCity: 'நகரத்தைத் தேர்ந்தெடுக்கவும் *',
    selectStateFirst: 'முதலில் மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
    pinCode: 'அஞ்சல் குறியீடு (PIN) *',
    back: 'பின்செல்',
    continueWithAmount: 'தொடரவும் — ₹{amount}',
    receiveOrderFrom: 'இதிலிருந்து ஆர்டரை எவ்வாறு பெற விரும்புகிறீர்கள்:',
    selfPickup: 'நேரில் பெறுதல்',
    selfPickupDesc: 'கடைக்கு நேரில் சென்று ஆர்டரைப் பெற்றுக் கொள்ளுங்கள்.',
    homeDelivery: 'வீட்டு டெலிவரி',
    homeDeliveryDesc: '{store} உங்கள் முகவரிக்கு ஆர்டரை டெலிவரி செய்யும்.',
    completePayment: 'ஆர்டரை முடிக்க கட்டணம் செலுத்துங்கள்:',
    onlinePayment: 'ஆன்லைன் கட்டணம் (Razorpay)',
    instantSecure: 'உடனடி · பாதுகாப்பானது',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), கார்டுகள், நெட் பேங்கிங் & வாலெட்டுகள்.',
    cards: 'கார்டுகள்',
    netBanking: 'நெட் பேங்கிங்',
    wallets: 'வாலெட்டுகள்',
    payVia: 'செலுத்துங்கள் ₹{amount}',
    backToDeliveryChoice: 'டெலிவரி தேர்வுக்குத் திரும்பு',
    placingOrder: 'உங்கள் ஆர்டர் பதிவு செய்யப்படுகிறது…',
    orderConfirmed: 'ஆர்டர் & கட்டணம் உறுதிசெய்யப்பட்டது!',
    orderPlacedDesc: '{store} கடையிலிருந்து உங்கள் ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது ({delivery}).',
    verifiedBill: 'சரிபார்க்கப்பட்ட ரசீது',
    paid: '● செலுத்தப்பட்டது',
    customer: 'வாடிக்கையாளர்:',
    paymentMode: 'கட்டண முறை:',
    total: 'மொத்தம்: ₹{amount}',
    viewInvoice: 'ரசீதைப் பார்',
    downloadBill: 'ரசீதைப் பதிவிறக்கு',
    done: 'முடிந்தது',
    codTitle: 'பொருளைப் பெற்று பணம் செலுத்துதல் (COD)',
    codBadge: 'ரொக்கமாக செலுத்துங்கள்',
    codDesc: 'ஆர்டர் டெலிவரி அல்லது கடைக்குச் செல்லும்போது ரொக்கமாக செலுத்தவும்.',
    storeCreditTitle: 'கடை கடன் (Store Credit)',
    approvedBadge: 'அங்கீகரிக்கப்பட்டது',
    creditTotal: 'மொத்த கடன்',
    creditRemaining: 'மீதமுள்ள கடன்',
    creditUsed: 'பயன்படுத்தப்பட்டது',
    creditNextDue: 'அடுத்த தவணை',
    creditAsAgreed: 'ஒப்புக்கொண்டபடி',
    creditExceeded: 'தொகை கிடைக்கும் கடன் வரம்பை விட அதிகமாக உள்ளது.',
    productSubtotal: 'பொருட்களின் கூடுதல்',
    platformFee: 'தளக் கட்டணம்',
    deliveryFee: 'டெலிவரி கட்டணம்',
    free: 'இலவசம்',
    totalPayable: 'செலுத்த வேண்டிய மொத்தத் தொகை',
    placeOrderCredit: 'கடனில் ஆர்டர் செய் (₹{amount})',
    placeOrderCod: 'ரொக்க முறையில் ஆர்டர் செய் (₹{amount})',
  },
  te: {
    findCheapestStore: 'చౌకైన దుకాణాన్ని కనుగొనండి',
    itemsOnList: 'మీ జాబితాలో {count} వస్తువు{s}',
    chooseRadius: 'సమీపంలోని దుకాణాల కోసం వ్యాసార్థాన్ని ఎంచుకోండి.',
    customKm: 'అనుకూల కి.మీ',
    searchWithin: '{radius} కి.మీ లోపల శోధించండి',
    searchingNearby: 'సమీప దుకాణాల కోసం శోధిస్తోంది…',
    noNearbyStores: 'మీ జాబితాలోని అన్ని వస్తువులు సమీప దుకాణాల్లో అందుబాటులో లేవు',
    tryExpanding: 'శోధన వ్యాసార్థాన్ని పెంచండి లేదా వస్తువులను మార్చండి.',
    changeRadius: '← వ్యాసార్థాన్ని మార్చండి',
    searchDifferentRadius: '← వేరే వ్యాసార్థంలో శోధించండి',
    bestMatch: 'ఉత్తమ సరిపోలిక',
    away: 'దూరంలో',
    itemsAvailable: 'వస్తువులు అందుబాటులో ఉన్నాయి',
    notAvailable: 'అందుబాటులో లేదు',
    selectStore: 'ఈ దుకాణాన్ని ఎంచుకోండి',
    items: 'వస్తువులు',
    firstName: 'మొదటి పేరు *',
    lastName: 'చివరి పేరు',
    phone: 'ఫోన్ నంబర్ *',
    email: 'ఇమెయిల్ (ఐచ్ఛికం)',
    address: 'చిరునామా *',
    state: 'రాష్ట్రం',
    selectState: 'రాష్ట్రాన్ని ఎంచుకోండి *',
    city: 'నగరం',
    selectCity: 'నగరాన్ని ఎంచుకోండి *',
    selectStateFirst: 'ముందుగా రాష్ట్రాన్ని ఎంచుకోండి',
    pinCode: 'పిన్ కోడ్ *',
    back: 'వెనుకకు',
    continueWithAmount: 'కొనసాగించండి — ₹{amount}',
    receiveOrderFrom: 'మీరు ఆర్డర్‌ను ఎలా స్వీకరించాలనుకుంటున్నారు:',
    selfPickup: 'స్వయంగా తీసుకోవడం',
    selfPickupDesc: 'దుకాణాన్ని సందర్శించి మీ ఆర్డర్‌ను మీరే తీసుకోండి.',
    homeDelivery: 'హోమ్ డెలివరీ',
    homeDeliveryDesc: '{store} మీ చిరునామాకు ఆర్డర్‌ను డెలివరీ చేస్తుంది.',
    completePayment: 'ఆర్డర్ ఉంచడానికి చెల్లింపును పూర్తి చేయండి:',
    onlinePayment: 'ఆన్‌లైన్ చెల్లింపు (Razorpay)',
    instantSecure: 'తక్షణం · సురక్షితం',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), కార్డులు, నెట్ బ్యాంకింగ్ & వాలెట్లు.',
    cards: 'కార్డులు',
    netBanking: 'నెట్ బ్యాంకింగ్',
    wallets: 'వాలెట్లు',
    payVia: '₹{amount} చెల్లించండి',
    backToDeliveryChoice: 'డెలివరీ ఎంపికకు తిరిగి వెళ్లండి',
    placingOrder: 'మీ ఆర్డర్ ఉంచబడుతోంది…',
    orderConfirmed: 'ఆర్డర్ & చెల్లింపు నిర్ధారించబడింది!',
    orderPlacedDesc: '{store} నుండి మీ ఆర్డర్ విజయవంతంగా ఉంచబడింది ({delivery}).',
    verifiedBill: 'ధృవీకరించబడిన బిల్లు',
    paid: '● చెల్లించబడింది',
    customer: 'వినియోగదారు:',
    paymentMode: 'చెల్లింపు విధానం:',
    total: 'మొత్తం: ₹{amount}',
    viewInvoice: 'ఇన్‌వాయిస్ చూడండి',
    downloadBill: 'బిల్లు డౌన్‌లోడ్ చేయండి',
    done: 'పూర్తయింది',
    codTitle: 'క్యాష్ ఆన్ డెలివరీ (COD)',
    codBadge: 'డెలివరీలో నగదు చెల్లించండి',
    codDesc: 'ఆర్డర్ డెలివరీ లేదా షాపు వద్ద నగదు రూపంలో చెల్లించండి.',
    storeCreditTitle: 'స్టోర్ క్రెడిట్ (ఖతా)',
    approvedBadge: 'ఆమోదించబడింది',
    creditTotal: 'మొత్తం క్రెడిట్',
    creditRemaining: 'మిగిలిన క్రెడిట్',
    creditUsed: 'ఉపయోగించబడింది',
    creditNextDue: 'తదుపరి గడువు',
    creditAsAgreed: 'ఒప్పుకున్న ప్రకారం',
    creditExceeded: 'ఆర్డర్ మొత్తం అందుబాటులో ఉన్న క్రెడిట్ పరిమితిని మించిపోయింది.',
    productSubtotal: 'ఉత్పత్తుల మొత్తం',
    platformFee: 'ప్లాట్‌ఫారమ్ రుసుము',
    deliveryFee: 'డెಲివరీ రుసుము',
    free: 'ఉచితం',
    totalPayable: 'చెల్లించాల్సిన మొత్తం',
    placeOrderCredit: 'క్రెడిట్‌పై ఆర్డర్ చేయండి (₹{amount})',
    placeOrderCod: 'క్యాష్ ఆన్ డెలివరీ ఆర్డర్ చేయండి (₹{amount})',
  },
  kn: {
    findCheapestStore: 'ಅಗ್ಗದ ಅಂಗಡಿ ಹುಡುಕಿ',
    itemsOnList: 'ನಿಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿ {count} ವಸ್ತು{s}',
    chooseRadius: 'ಸಮೀಪದ ಅಂಗಡಿಗಳಿಗಾಗಿ ತ್ರಿಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    customKm: 'ಕಸ್ಟಮ್ ಕಿ.ಮೀ',
    searchWithin: '{radius} ಕಿ.ಮೀ ಒಳಗೆ ಹುಡುಕಿ',
    searchingNearby: 'ಸಮೀಪದ ಅಂಗಡಿಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ…',
    noNearbyStores: 'ನಿಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಎಲ್ಲಾ ವಸ್ತುಗಳು ಸಮೀಪದ ಅಂಗಡಿಗಳಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ',
    tryExpanding: 'ಹುಡುಕಾಟದ ತ್ರಿಜ್ಯವನ್ನು ವಿಸ್ತರಿಸಿ ಅಥವಾ ವಸ್ತುಗಳನ್ನು ಬದಲಾಯಿಸಿ.',
    changeRadius: '← ತ್ರಿಜ್ಯವನ್ನು ಬದಲಾಯಿಸಿ',
    searchDifferentRadius: '← ಬೇರೆ ತ್ರಿಜ್ಯದಲ್ಲಿ ಹುಡುಕಿ',
    bestMatch: 'ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ',
    away: 'ದೂರದಲ್ಲಿ',
    itemsAvailable: 'ವಸ್ತುಗಳು ಲಭ್ಯವಿದೆ',
    notAvailable: 'ಲಭ್ಯವಿಲ್ಲ',
    selectStore: 'ಈ ಅಂಗಡಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    items: 'ವಸ್ತುಗಳು',
    firstName: 'ಮೊದಲ ಹೆಸರು *',
    lastName: 'ಕೊನೆಯ ಹೆಸರು',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ *',
    email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
    address: 'ವಿಳಾಸ *',
    state: 'ರಾಜ್ಯ',
    selectState: 'ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ *',
    city: 'ನಗರ',
    selectCity: 'ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ *',
    selectStateFirst: 'ಮೊದಲು ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    pinCode: 'ಪಿನ್ ಕೋಡ್ *',
    back: 'ಹಿಂದೆ',
    continueWithAmount: 'ಮುಂದುವರಿಸಿ — ₹{amount}',
    receiveOrderFrom: 'ಆದೇಶವನ್ನು ಹೇಗೆ ಪಡೆಯಲು ಬಯಸುತ್ತೀರಿ:',
    selfPickup: 'ಸ್ವತಃ ಪಡೆಯುವುದು',
    selfPickupDesc: 'ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ ನಿಮ್ಮ ಆದೇಶವನ್ನು ನೀವೇ ಪಡೆದುಕೊಳ್ಳಿ.',
    homeDelivery: 'ಮನೆ ಬಾಗಿಲಿಗೆ ವಿತರಣೆ',
    homeDeliveryDesc: '{store} ನಿಮ್ಮ ವಿಳಾಸಕ್ಕೆ ಆದೇಶವನ್ನು ತಲುಪಿಸುತ್ತದೆ.',
    completePayment: 'ಆದೇಶ ನೀಡಲು ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ:',
    onlinePayment: 'ಆನ್‌ಲೈನ್ ಪಾವತಿ (Razorpay)',
    instantSecure: 'ತ್ವರಿತ · ಸುರಕ್ಷಿತ',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), ಕಾರ್ಡ್‌ಗಳು, ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ & ವಾಲೆಟ್‌ಗಳು.',
    cards: 'ಕಾರ್ಡ್‌ಗಳು',
    netBanking: 'ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್',
    wallets: 'ವಾಲೆಟ್‌ಗಳು',
    payVia: '₹{amount} ಪಾವತಿಸಿ',
    backToDeliveryChoice: 'ವಿತರಣಾ ಆಯ್ಕೆಗೆ ಹಿಂತಿರುಗಿ',
    placingOrder: 'ನಿಮ್ಮ ಆದೇಶವನ್ನು ಇರಿಸಲಾಗುತ್ತಿದೆ…',
    orderConfirmed: 'ಆದೇಶ ಮತ್ತು ಪಾವತಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!',
    orderPlacedDesc: '{store} ನಿಂದ ನಿಮ್ಮ ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ ({delivery}).',
    verifiedBill: 'ಪರಿಶೀಲಿಸಿದ ಬಿಲ್',
    paid: '● ಪಾವತಿಸಲಾಗಿದೆ',
    customer: 'ಗ್ರಾಹಕರು:',
    paymentMode: 'ಪಾವತಿ ವಿಧಾನ:',
    total: 'ಒಟ್ಟು: ₹{amount}',
    viewInvoice: 'ಇನ್‌ವಾಯ್ಸ್ ವೀಕ್ಷಿಸಿ',
    downloadBill: 'ಬಿಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    done: 'ಮುಗಿದಿದೆ',
    codTitle: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ (COD)',
    codBadge: 'ಡೆಲಿವರಿಯಲ್ಲಿ ನಗದು ಪಾವತಿಸಿ',
    codDesc: 'ಆರ್ಡರ್ ಡೆಲಿವರಿ ಅಥವಾ ಅಂಗಡಿಯಲ್ಲಿ ನಗದು ರೂಪದಲ್ಲಿ ಪಾವತಿಸಿ.',
    storeCreditTitle: 'ಅಂಗಡಿ ಸಾಲ (Store Credit)',
    approvedBadge: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    creditTotal: 'ಒಟ್ಟು ಸಾಲ',
    creditRemaining: 'ಉಳಿದಿರುವ ಸಾಲ',
    creditUsed: 'ಬಳಸಲಾಗಿದೆ',
    creditNextDue: 'ಮುಂದಿನ ಬಾಕಿ',
    creditAsAgreed: 'ಒಪ್ಪಿಕೊಂಡಂತೆ',
    creditExceeded: 'ಆರ್ಡರ್ ಮೊತ್ತವು ಲಭ್ಯವಿರುವ ಸಾಲದ ಮಿತಿಯನ್ನು ಮೀರಿದೆ.',
    productSubtotal: 'ಉತ್ಪನ್ನಗಳ ಒಟ್ಟು ಮೊತ್ತ',
    platformFee: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ',
    deliveryFee: 'ಡೆಲಿವರಿ ಶುಲ್ಕ',
    free: 'ಉಚಿತ',
    totalPayable: 'ಪಾವತಿಸಬೇಕಾದ ಒಟ್ಟು ಮೊತ್ತ',
    placeOrderCredit: 'ಸಾಲದ ಮೇಲೆ ಆರ್ಡರ್ ಮಾಡಿ (₹{amount})',
    placeOrderCod: 'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ ಆರ್ಡರ್ ಮಾಡಿ (₹{amount})',
  },
  ml: {
    findCheapestStore: 'വിലകുറഞ്ഞ സ്റ്റോർ കണ്ടെത്തുക',
    itemsOnList: 'ലിസ്റ്റിൽ {count} ഇനം{s}',
    chooseRadius: 'അടുത്തുള്ള സ്റ്റോറുകൾക്കായി ദൂരം തിരഞ്ഞെടുക്കുക.',
    customKm: 'ഇഷ്ടാനുസൃത കി.മീ',
    searchWithin: '{radius} കി.മീറ്ററിനുള്ളിൽ തിരയുക',
    searchingNearby: 'അടുത്തുള്ള സ്റ്റോറുകൾ തിരയുന്നു…',
    noNearbyStores: 'നിങ്ങളുടെ ലിസ്റ്റിലെ എല്ലാ സാധനങ്ങളും അടുത്തുള്ള സ്റ്റോറുകളിൽ ലഭ്യമല്ല',
    tryExpanding: 'തിരയൽ പരിധി വർദ്ധിപ്പിക്കുകയോ ഇനങ്ങൾ മാറ്റുകയോ ചെയ്യുക.',
    changeRadius: '← ദൂരം മാറ്റുക',
    searchDifferentRadius: '← മറ്റൊരു പരിധിയിൽ തിരയുക',
    bestMatch: 'മികച്ച പൊരുത്തം',
    away: 'അകലെ',
    itemsAvailable: 'ഇനങ്ങൾ ലഭ്യമാണ്',
    notAvailable: 'ലഭ്യമല്ല',
    selectStore: 'ഈ സ്റ്റോർ തിരഞ്ഞെടുക്കുക',
    items: 'ഇനങ്ങൾ',
    firstName: 'ആദ്യ പേര് *',
    lastName: 'അവസാന പേര്',
    phone: 'ഫോൺ നമ്പർ *',
    email: 'ഇമെയിൽ (ഓപ്ഷണൽ)',
    address: 'വിലാസം *',
    state: 'സംസ്ഥാനം',
    selectState: 'സംസ്ഥാനം തിരഞ്ഞെടുക്കുക *',
    city: 'നഗരം',
    selectCity: 'നഗരം തിരഞ്ഞെടുക്കുക *',
    selectStateFirst: 'ആദ്യം സംസ്ഥാനം തിരഞ്ഞെടുക്കുക',
    pinCode: 'പിൻകോഡ് *',
    back: 'തിരികെ',
    continueWithAmount: 'തുടരുക — ₹{amount}',
    receiveOrderFrom: 'ഓർഡർ എങ്ങനെ ലഭിക്കാൻ ആഗ്രഹിക്കുന്നു:',
    selfPickup: 'നേരിട്ട് കൈപ്പറ്റൽ',
    selfPickupDesc: 'ഷോപ്പ് സന്ദർശിച്ച് ഓർഡർ നേരിട്ട് വാങ്ങുക.',
    homeDelivery: 'ഹോം ഡെലിവറി',
    homeDeliveryDesc: '{store} നിങ്ങളുടെ വിലാസത്തിലേക്ക് ഓർഡർ എത്തിക്കും.',
    completePayment: 'ഓർഡർ നൽകാൻ പേയ്‌മെന്റ് പൂർത്തിയാക്കുക:',
    onlinePayment: 'ഓൺലൈൻ പേയ്‌മെന്റ് (Razorpay)',
    instantSecure: 'തൽക്ഷണം · സുരക്ഷിതം',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), കാർഡുകൾ, നെറ്റ് ബാങ്കിംഗ് & വാലറ്റുകൾ.',
    cards: 'കാർഡുകൾ',
    netBanking: 'നെറ്റ് ബാങ്കിംഗ്',
    wallets: 'വാലറ്റുകൾ',
    payVia: '₹{amount} അടയ്ക്കുക',
    backToDeliveryChoice: 'ഡെലിവറി തിരഞ്ഞെടുപ്പിലേക്ക് മടങ്ങുക',
    placingOrder: 'നിങ്ങളുടെ ഓർഡർ നൽകുന്നു…',
    orderConfirmed: 'ഓർഡറും പേയ്‌മെന്റും സ്ഥിരീകരിച്ചു!',
    orderPlacedDesc: '{store}-ൽ നിന്നുള്ള നിങ്ങളുടെ ഓർഡർ വിജയകരമായി നൽകി ({delivery}).',
    verifiedBill: 'സ്ഥിരീകരിച്ച ബിൽ',
    paid: '● അടച്ചു',
    customer: 'ഉപഭോക്താവ്:',
    paymentMode: 'പേയ്‌മെന്റ് രീതി:',
    total: 'ആകെ: ₹{amount}',
    viewInvoice: 'ഇൻവോയ്സ് കാണുക',
    downloadBill: 'ബിൽ ഡൗൺലോഡ് ചെയ്യുക',
    done: 'പൂർത്തിയായി',
    codTitle: 'ക്യാഷ് ഓൺ ഡെലിവറി (COD)',
    codBadge: 'ഡെലിവറിയിൽ പണം നൽകുക',
    codDesc: 'ഓർഡർ ഡെലിവറിയിലോ കടയിലോ പണമായി നൽകുക.',
    storeCreditTitle: 'സ്റ്റോർ ക്രെഡിറ്റ് (കടം)',
    approvedBadge: 'അംഗീകരിച്ചു',
    creditTotal: 'ആകെ ക്രെഡിറ്റ്',
    creditRemaining: 'ശേഷിക്കുന്നത്',
    creditUsed: 'ഉപയോഗിച്ചു',
    creditNextDue: 'അടുത്ത അടവ്',
    creditAsAgreed: 'സമ്മതിച്ചതുപോലെ',
    creditExceeded: 'ഓർഡർ തുക ലഭ്യമായ ക്രെഡിറ്റ് പരിധി കവിയുന്നു.',
    productSubtotal: 'ഉൽപ്പന്നങ്ങളുടെ ആകെത്തുക',
    platformFee: 'പ്ലാറ്റ്‌ഫോം ഫീസ്',
    deliveryFee: 'ഡെലിവറി ഫീസ്',
    free: 'സൗജന്യം',
    totalPayable: 'നൽകേണ്ട ആകെത്തുക',
    placeOrderCredit: 'ക്രെഡിറ്റിൽ ഓർഡർ ചെയ്യുക (₹{amount})',
    placeOrderCod: 'ക്യാഷ് ഓൺ ഡെലിവറി ഓർഡർ ചെയ്യുക (₹{amount})',
  },
  hi: {
    findCheapestStore: 'सबसे सस्ती दुकान खोजें',
    itemsOnList: 'आपकी सूची में {count} सामान',
    chooseRadius: 'नजदीकी दुकानों के लिए दूरी चुनें।',
    customKm: 'कस्टम किमी',
    searchWithin: '{radius} किमी के भीतर खोजें',
    searchingNearby: 'नजदीकी दुकानें खोजी जा रही हैं…',
    noNearbyStores: 'आपकी सूची के सभी उत्पाद नजदीकी दुकानों में उपलब्ध नहीं हैं',
    tryExpanding: 'खोज का दायरा बढ़ाएं या सामान बदलें।',
    changeRadius: '← दायरा बदलें',
    searchDifferentRadius: '← दूसरे दायरे में खोजें',
    bestMatch: 'सर्वश्रेष्ठ मिलान',
    away: 'दूर',
    itemsAvailable: 'सामान उपलब्ध हैं',
    notAvailable: 'उपलब्ध नहीं है',
    selectStore: 'यह दुकान चुनें',
    items: 'सामान',
    firstName: 'पहला नाम *',
    lastName: 'अंतिम नाम',
    phone: 'फ़ोन नंबर *',
    email: 'ईमेल (वैकल्पिक)',
    address: 'पता *',
    state: 'राज्य',
    selectState: 'राज्य चुनें *',
    city: 'शहर',
    selectCity: 'शहर चुनें *',
    selectStateFirst: 'पहले राज्य चुनें',
    pinCode: 'पिन कोड *',
    back: 'वापस',
    continueWithAmount: 'आगे बढ़ें — ₹{amount}',
    receiveOrderFrom: 'अपना ऑर्डर कैसे प्राप्त करना चाहते हैं:',
    selfPickup: 'स्वयं प्राप्त करें',
    selfPickupDesc: 'दुकान पर जाएँ और अपना ऑर्डर स्वयं लें।',
    homeDelivery: 'होम डिलीवरी',
    homeDeliveryDesc: '{store} आपके पते पर ऑर्डर डिलीवर करेगा।',
    completePayment: 'ऑर्डर देने के लिए भुगतान पूरा करें:',
    onlinePayment: 'ऑनलाइन भुगतान (Razorpay)',
    instantSecure: 'तत्काल · सुरक्षित',
    paymentDesc: 'UPI (GPay, PhonePe, Paytm), कार्ड, नेट बैंकिंग और वॉलेट।',
    cards: 'कार्ड',
    netBanking: 'नेट बैंकिंग',
    wallets: 'वॉलेट',
    payVia: '₹{amount} भुगतान करें',
    backToDeliveryChoice: 'डिलीवरी विकल्प पर वापस जाएँ',
    placingOrder: 'आपका ऑर्डर दिया जा रहा है…',
    orderConfirmed: 'ऑर्डर और भुगतान की पुष्टि हो गई!',
    orderPlacedDesc: '{store} से आपका ऑर्डर सफलतापूर्वक दिया गया ({delivery}).',
    verifiedBill: 'सत्यापित बिल',
    paid: '● भुगतान किया गया',
    customer: 'ग्राहक:',
    paymentMode: 'भुगतान विधि:',
    total: 'कुल: ₹{amount}',
    viewInvoice: 'चालान देखें',
    downloadBill: 'बिल डाउनलोड करें',
    done: 'पूर्ण',
    codTitle: 'कैश ऑन डिलीवरी (COD)',
    codBadge: 'डिलीवरी पर नकद भुगतान करें',
    codDesc: 'ऑर्डर डिलीवरी या दुकान पर नकद में भुगतान करें।',
    storeCreditTitle: 'स्टोर क्रेडिट (उधार)',
    approvedBadge: 'स्वीकृत',
    creditTotal: 'कुल क्रेडिट',
    creditRemaining: 'शेष क्रेडिट',
    creditUsed: 'उपयोग किया गया',
    creditNextDue: 'अगली देय तिथि',
    creditAsAgreed: 'सहमति के अनुसार',
    creditExceeded: 'ऑर्डर कुल उपलब्ध क्रेडिट सीमा से अधिक है।',
    productSubtotal: 'उत्पाद उप-योग',
    platformFee: 'प्लेटफ़ॉर्म शुल्क',
    deliveryFee: 'डिलीवरी शुल्क',
    free: 'मुफ़्त',
    totalPayable: 'कुल देय राशि',
    placeOrderCredit: 'क्रेडिट पर ऑर्डर करें (₹{amount})',
    placeOrderCod: 'कैश ऑन डिलीवरी ऑर्डर करें (₹{amount})',
  },
};

export default function CompareStoresScreen() {
  const { isDark } = useTheme();
  const { language } = useTranslation();
  const txt = (COMPARE_I18N as any)[language] || COMPARE_I18N.en;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const rawItems: SmartOrderCartItem[] = route.params?.items || [];
  const items: SmartOrderCartItem[] = useMemo(() => {
    return rawItems.map(it => {
      const res = lookupTanglishDictionary(it.name);
      return {
        ...it,
        name: res.matched && res.englishName ? res.englishName : it.name,
        quantity: it.quantity || (res.quantity || ''),
      };
    });
  }, [rawItems]);
  const purchaseType: 'bulk' | 'home_seller' | undefined = route.params?.purchaseType;
  const { user, token } = useAuth();

  const cardBg = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? '#1F2937' : CustomerColors.steelBorder;
  const textPri = isDark ? '#F9FAFB' : CustomerColors.black;
  const textSec = isDark ? '#9CA3AF' : CustomerColors.textSecondary;
  const bg = isDark ? '#0b0f19' : CustomerColors.bg;

  // Map purchaseType to the backend storeType filter.
  // 'bulk'        → 'store'         (Store Owner stores only)
  // 'home_seller' → 'home_business' (Home Business stores only)
  // default       → 'store'         (preserve existing behavior)
  const storeType = purchaseType === 'home_seller' ? 'home_business' : 'store';

  const [step, setStep] = useState<Step>('radius');
  const [radius, setRadius] = useState(5);
  const [customRadius, setCustomRadius] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState<StoreResult[]>([]);
  const [chosen, setChosen] = useState<StoreResult | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<
    'pickup' | 'delivery' | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'credit'>('razorpay');
  const [creditEligibility, setCreditEligibility] = useState<any>(null);
  const [selectedSubMethod, setSelectedSubMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [orderId, setOrderId] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setCreditEligibility(null);
      return;
    }
    const storeId = chosen?.storeId || '';
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
                a.storeName?.toLowerCase() === chosen?.storeName?.toLowerCase())
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
  }, [chosen, token]);

  const productSubtotal = chosen ? chosen.totalAmount : 0;
  const platformFee = usePlatformFee(productSubtotal);
  const { deliveryFee } = useDeliveryFee(productSubtotal, deliveryMethod);
  const totalPayable = productSubtotal + platformFee + deliveryFee;


  const [form, setForm] = useState<AddressForm>({
    firstName: user?.fullname?.split(' ')[0] || '',
    lastName: user?.fullname?.split(' ').slice(1).join(' ') || '',
    phone: user?.mobilenumber || '',
    contactEmail: user?.email || '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const setField = (k: keyof AddressForm, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  // ── State → City cascade + pincode auto-fill ──────────────────────────────
  const [cityOptions, setCityOptions] = useState<
    { key: string; label: string; canonicalName?: string }[]
  >([]);

  const stateOptions = useMemo(
    () =>
      indianStates.map(s => ({
        key: s.isoCode,
        canonicalName: s.name,
        label: translateState(s.name, language),
      })),
    [language],
  );

  const findState = useCallback((value: string) => {
    const v = normalizeLoc(value);
    if (!v) return undefined;
    return indianStates.find(
      s => normalizeLoc(s.name) === v || normalizeLoc(s.isoCode) === v,
    );
  }, []);

  useEffect(() => {
    if (!form.state) { setCityOptions([]); return; }
    const s = findState(form.state);
    setCityOptions(s ? getCities(s.isoCode).map((c: any) => ({
      key: c.name,
      canonicalName: c.name,
      label: translateCity(c.name, language),
    })) : []);
  }, [form.state, findState, language]);

  const handleStateSelect = (isoCode: string, _label: string) => {
    const s = indianStates.find(item => item.isoCode === isoCode);
    const canonicalName = s ? s.name : isoCode;
    setForm(f => ({ ...f, state: canonicalName, city: '', pinCode: '' }));
    const cities = getCities(isoCode);
    setCityOptions(cities.map((c: any) => ({
      key: c.name,
      canonicalName: c.name,
      label: translateCity(c.name, language),
    })));
  };

  const handleCitySelect = async (cityName: string) => {
    setField('city', cityName);
    if (!cityName) return;
    const pin = await lookupPincode(cityName);
    if (pin) setField('pinCode', pin);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const effectiveRadius = customRadius ? parseFloat(customRadius) : radius;

  const runSearch = async () => {
    if (!effectiveRadius || effectiveRadius <= 0) {
      setErrorMsg('Please choose a valid search radius.');
      return;
    }
    setStep('searching');
    setErrorMsg('');

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('[NearbySearch] location permission denied', {
        at: new Date().toISOString(),
        userId: user?._id,
      });
      setErrorMsg(
        'Location access denied. Enable location to compare nearby stores.',
      );
      setStep('radius');
      return;
    }

    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const requestMeta = {
          at: new Date().toISOString(),
          userId: user?._id ?? null,
          latitude,
          longitude,
          gpsAccuracyMeters: accuracy,
          gpsFixTimestamp: new Date(pos.timestamp).toISOString(),
          radiusKm: effectiveRadius,
        };
        console.log(
          '[NearbySearch] requesting /api/stores/nearby',
          requestMeta,
        );
        try {
          const storesRes = await smartOrderApi.getNearbyStores(
            latitude,
            longitude,
            effectiveRadius,
            storeType,
          );
          console.log('[NearbySearch] /api/stores/nearby response', {
            ...requestMeta,
            status: storesRes.status,
            rawResponse: storesRes.data,
          });
          const stores: any[] = storesRes.data.data || [];
          if (!stores.length) {
            console.log(
              '[NearbySearch] no stores in radius — stopping before matchCart',
              requestMeta,
            );
            setResults([]);
            setStep('results');
            return;
          }
          const storeIds = stores.map(s => s._id);
          const normalizedForMatch = await Promise.all(
            items.map(async it => {
              const res = lookupTanglishDictionary(it.name);
              if (res.matched && res.englishName) {
                return { ...it, name: res.englishName, quantity: it.quantity || res.quantity || '' };
              }
              if (/[^\x00-\x7F]/.test(it.name)) {
                try {
                  const aiRes = await translateGroceryTerm(it.name);
                  return { ...it, name: aiRes.englishName || it.name, quantity: it.quantity || aiRes.quantity || '' };
                } catch {
                  return it;
                }
              }
              return it;
            })
          );
          console.log('[NearbySearch] requesting matchCart', {
            ...requestMeta,
            storeIds,
            items: normalizedForMatch,
          });
          const matchRes = await smartOrderApi.matchCart(
            normalizedForMatch,
            storeIds,
            undefined,
            true,
          );
          console.log('[NearbySearch] matchCart response', {
            ...requestMeta,
            rawResponse: matchRes.data,
          });
          const ranked: any[] = matchRes.data.data || [];
          const byId: Record<string, any> = {};
          stores.forEach(s => (byId[s._id] = s));

          // Strictly only display stores that have ALL requested items in stock
          const fullMatchStores = ranked.filter(
            r =>
              r.matchedCount === items.length &&
              (!r.unmatched || r.unmatched.length === 0) &&
              (!r.insufficientStock || r.insufficientStock.length === 0),
          );

          let merged: StoreResult[] = [];
          if (fullMatchStores.length > 0) {
            merged = fullMatchStores.map(r => ({
              ...r,
              storeName: byId[r.storeId]?.name || 'Store',
              distanceKm: byId[r.storeId]?.distanceKm ?? 0,
              rating: byId[r.storeId]?.rating ?? 0,
              reviewCount: byId[r.storeId]?.reviewCount ?? 0,
            }));
          }
          console.log('[NearbySearch] final merged results shown to UI', {
            ...requestMeta,
            nearbyStoreIds: storeIds,
            nearbyStoreNames: stores.map(s => s.name),
            matchedStoreIds: fullMatchStores.map(r => r.storeId),
            droppedByMatchCart: storeIds.filter(
              id => !fullMatchStores.some(r => r.storeId === id),
            ),
          });
          setResults(merged);
          setStep('results');
        } catch (err: any) {
          console.log('[NearbySearch] request failed', {
            ...requestMeta,
            error: err?.response?.data || err?.message,
          });
          setErrorMsg(
            err.response?.data?.message ||
              'Could not compare nearby stores. Please try again.',
          );
          setStep('radius');
        }
      },
      err => {
        console.log('[NearbySearch] Geolocation.getCurrentPosition failed', {
          at: new Date().toISOString(),
          userId: user?._id,
          error: err,
        });
        setErrorMsg(
          'Location access denied. Enable location to compare nearby stores.',
        );
        setStep('radius');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleConfirmDetails = () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    if (
      !chosen ||
      !form.firstName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pinCode.trim()
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setStep('delivery');
  };

  const handlePlaceOrder = async () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    if (!chosen || !deliveryMethod) return;
    setStep('placing');
    setErrorMsg('');
    try {
      const cartItems = chosen.matched.map(m => ({
        id: m.product.id,
        title: m.product.title,
        price: m.product.price,
        quantity: 1,
        image: m.product.image,
      }));
      const res = await smartOrderApi.placeOrder({
        amount: totalPayable,
        platformFee,
        deliveryFee,
        cartItems,
        contactEmail: form.contactEmail,
        shippingAddress: form,
        userId: user?._id || null,
        storeId: chosen.storeId,
        storeName: chosen.storeName,
        deliveryMethod,
        paymentMethod,
      });

      if (!res.data.success)
        throw new Error(res.data.message || 'Order failed.');

      if (paymentMethod === 'cod' || paymentMethod === 'credit') {
        const targetOrderId = res.data?.orderId || res.data?.order?._id || '';
        setOrderId(targetOrderId);
        setStep('success');
        route.params?.onSuccess?.();
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
        amount: data.amountPaise || Math.round(totalPayable * 100),
        currency: data.currency || 'INR',
        name: data.name || chosen.storeName || 'Remise Marketplace',
        description: data.description || `Order #${data.orderId}`,
        customer: {
          name: `${form.firstName} ${form.lastName}`.trim() || data.customer?.name,
          email: form.contactEmail || data.customer?.email,
          contact: form.phone || data.customer?.contact,
        },
      };

      setStep('payment');
      navigation.navigate('RazorpayWebView', {
        options,
        orderId: data.orderId,
        returnScreen: 'BulkPurchase',
        onSuccess: route.params?.onSuccess,
      });
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          'Order failed. Please try again.',
      );
      setStep('payment');
    }
  };


  return (
    <View style={styles.overlay}>
      <View style={[styles.sheet, { backgroundColor: cardBg }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#1f2937' : CustomerColors.mint }]}>
          <View style={styles.headerTitleWrap}>
            <Text
              style={[styles.headerTitle, { color: textPri }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {txt.findCheapestStore}
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSec }]} numberOfLines={1}>
              {txt.itemsOnList.replace('{count}', String(items.length)).replace('{s}', items.length !== 1 ? 's' : '')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={textSec} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.body, { backgroundColor: cardBg }]}>
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={14} color={CustomerColors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {(step === 'radius' || step === 'searching') && (
            <View style={{ gap: Spacing.md }}>
              <Text style={[styles.stepText, { color: textSec }]}>
                {txt.chooseRadius}
              </Text>
              <View style={styles.radiusRow}>
                {RADIUS_OPTIONS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.radiusChip,
                      { backgroundColor: isDark ? '#1f2937' : CustomerColors.bg },
                      radius === r && !customRadius && styles.radiusChipActive,
                    ]}
                    onPress={() => {
                      setRadius(r);
                      setCustomRadius('');
                    }}
                  >
                    <Text
                      style={[
                        styles.radiusChipText,
                        { color: textSec },
                        radius === r &&
                          !customRadius &&
                          styles.radiusChipTextActive,
                      ]}
                    >
                      {r} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                    color: isDark ? '#F9FAFB' : CustomerColors.black,
                  },
                ]}
                placeholder={txt.customKm}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="numeric"
                value={customRadius}
                onChangeText={setCustomRadius}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={runSearch}
                disabled={step === 'searching'}
              >
                {step === 'searching' ? (
                  <ActivityIndicator size="small" color="#fff" style={{ flexShrink: 0 }} />
                ) : (
                  <MapPin size={16} color="#fff" style={{ flexShrink: 0 }} />
                )}
                <Text
                  style={styles.primaryBtnText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {step === 'searching'
                    ? txt.searchingNearby
                    : txt.searchWithin.replace('{radius}', String(customRadius || radius))}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'results' && (
            <View style={{ gap: Spacing.md }}>
              {results.length === 0 && (
                <View style={styles.center}>
                  <PackageX size={40} color={CustomerColors.steelBorder} />
                  <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>
                    {txt.noNearbyStores}
                  </Text>
                  <Text style={[styles.emptySubtitle, isDark && { color: '#9CA3AF' }]}>
                    {txt.tryExpanding}
                  </Text>
                  <TouchableOpacity onPress={() => setStep('radius')}>
                    <Text style={[styles.linkText, isDark && { color: '#2DD4BF' }]}>{txt.changeRadius}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {results.map((r, idx) => (
                <View
                  key={r.storeId}
                  style={[
                    styles.storeCard,
                    isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                    idx === 0 && [styles.storeCardBest, isDark && { backgroundColor: '#0f2f2c', borderColor: CustomerColors.teal600 }],
                  ]}
                >
                  <View style={styles.storeCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.storeNameRow}>
                        <Text style={[styles.storeName, isDark && { color: '#FFFFFF' }]}>{r.storeName}</Text>
                        <View style={[styles.storeRatingTag, isDark && { backgroundColor: '#451a03' }]}>
                          <Star size={10} color="#D97706" fill="#D97706" />
                          <Text style={[styles.storeRatingTagText, isDark && { color: '#FCD34D' }]}>
                            {Number(r.rating || 0).toFixed(1)}{r.reviewCount ? ` (${r.reviewCount})` : ''}
                          </Text>
                        </View>
                        {idx === 0 && (
                          <View style={[styles.bestBadge, isDark && { backgroundColor: '#115E59' }]}>
                            <Text style={[styles.bestBadgeText, isDark && { color: '#5EEAD4' }]}>{txt.bestMatch}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.storeMeta, isDark && { color: '#9CA3AF' }]}>
                        {r.distanceKm} km {txt.away} · {r.matchedCount}/
                        {r.totalRequested} {txt.itemsAvailable}
                      </Text>
                    </View>
                    <Text style={[styles.storeAmount, isDark && { color: '#2DD4BF' }]}>
                      ₹{r.totalAmount.toFixed(0)}
                    </Text>
                  </View>
                  {r.matched.length > 0 && (
                    <View style={{ marginTop: Spacing.xs }}>
                      {r.matched.map(m => (
                        <View key={m.requestedName} style={styles.matchedRow}>
                          <PackageCheck
                            size={11}
                            color={isDark ? '#2DD4BF' : CustomerColors.teal600}
                          />
                          <Text style={[styles.matchedText, isDark && { color: '#D1D5DB' }]}>
                            {m.product.title} — ₹{m.product.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {(r.insufficientStock.length > 0 ||
                    r.unmatched.length > 0) && (
                    <Text style={styles.unmatchedText}>
                      {txt.notAvailable}:{' '}
                      {[
                        ...r.insufficientStock.map(i => i.requestedName),
                        ...r.unmatched,
                      ].join(', ')}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => {
                      setChosen(r);
                      setStep('confirming');
                    }}
                  >
                    <Text
                      style={styles.selectBtnText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {txt.selectStore}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              {results.length > 0 && (
                <TouchableOpacity onPress={() => setStep('radius')}>
                  <Text style={[styles.linkText, isDark && { color: '#2DD4BF' }]}>
                    {txt.searchDifferentRadius}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 'confirming' && chosen && (
            <View style={{ gap: Spacing.md }}>
              <View style={[styles.chosenSummary, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.storeName, isDark && { color: '#FFFFFF' }]}>{chosen.storeName}</Text>
                    <View style={[styles.storeRatingTag, isDark && { backgroundColor: '#451a03' }]}>
                      <Star size={10} color="#D97706" fill="#D97706" />
                      <Text style={[styles.storeRatingTagText, isDark && { color: '#FCD34D' }]}>
                        {Number(chosen.rating || 0).toFixed(1)}{chosen.reviewCount ? ` (${chosen.reviewCount})` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.storeMeta, isDark && { color: '#9CA3AF' }]}>
                    {chosen.matchedCount}/{chosen.totalRequested} {txt.items} ·{' '}
                    {chosen.distanceKm} km {txt.away}
                  </Text>
                </View>
                <Text style={[styles.storeAmount, isDark && { color: '#2DD4BF' }]}>
                  ₹{chosen.totalAmount.toFixed(0)}
                </Text>
              </View>

              <View style={styles.row2}>
                <TextInput
                  style={[
                    styles.input,
                    styles.half,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                      color: isDark ? '#F9FAFB' : CustomerColors.black,
                    },
                  ]}
                  placeholder={txt.firstName}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  value={form.firstName}
                  onChangeText={v => setField('firstName', v)}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.half,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                      color: isDark ? '#F9FAFB' : CustomerColors.black,
                    },
                  ]}
                  placeholder={txt.lastName}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  value={form.lastName}
                  onChangeText={v => setField('lastName', v)}
                />
              </View>
              <View style={styles.row2}>
                <TextInput
                  style={[
                    styles.input,
                    styles.half,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                      color: isDark ? '#F9FAFB' : CustomerColors.black,
                    },
                  ]}
                  placeholder={txt.phone}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={v => setField('phone', v)}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.half,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                      color: isDark ? '#F9FAFB' : CustomerColors.black,
                    },
                  ]}
                  placeholder={txt.email}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="email-address"
                  value={form.contactEmail}
                  onChangeText={v => setField('contactEmail', v)}
                />
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    height: 70,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                    color: isDark ? '#F9FAFB' : CustomerColors.black,
                  },
                ]}
                placeholder={txt.address}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                value={form.address}
                onChangeText={v => setField('address', v)}
              />
              <LocationSelectField
                label={txt.state}
                value={form.state}
                placeholder={txt.selectState}
                options={stateOptions}
                onSelect={handleStateSelect}
              />
              <LocationSelectField
                label={txt.city}
                value={form.city}
                placeholder={form.state ? txt.selectCity : txt.selectStateFirst}
                options={cityOptions}
                disabled={!form.state}
                onSelect={handleCitySelect}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                    color: isDark ? '#F9FAFB' : CustomerColors.black,
                  },
                ]}
                placeholder={txt.pinCode}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="number-pad"
                value={form.pinCode}
                onChangeText={v => setField('pinCode', v)}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}
                  onPress={() => setStep('results')}
                >
                  <Text style={[styles.secondaryBtnText, isDark && { color: '#D1D5DB' }]}>{txt.back}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={handleConfirmDetails}
                >
                  <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                    {txt.continueWithAmount.replace('{amount}', chosen.totalAmount.toFixed(0))}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 'delivery' && chosen && (
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.stepText, isDark && { color: '#D1D5DB' }]}>
                {txt.receiveOrderFrom}{' '}
                <Text style={[{ fontWeight: '700' }, isDark && { color: '#FFFFFF' }]}>{chosen.storeName}</Text>?
              </Text>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                ]}
                onPress={() => {
                  setDeliveryMethod('pickup');
                  setStep('payment');
                }}
              >
                <Store size={20} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, isDark && { color: '#FFFFFF' }]}>{txt.selfPickup}</Text>
                  <Text style={[styles.optionDesc, isDark && { color: '#9CA3AF' }]}>
                    {txt.selfPickupDesc}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                ]}
                onPress={() => {
                  setDeliveryMethod('delivery');
                  setStep('payment');
                }}
              >
                <Truck size={20} color={isDark ? '#2DD4BF' : CustomerColors.teal600} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, isDark && { color: '#FFFFFF' }]}>{txt.homeDelivery}</Text>
                  <Text style={[styles.optionDesc, isDark && { color: '#9CA3AF' }]}>
                    {txt.homeDeliveryDesc.replace('{store}', chosen.storeName)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('confirming')}>
                <Text style={[styles.linkText, isDark && { color: '#2DD4BF' }]}>← {txt.back}</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'payment' && chosen && (
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.stepText, isDark && { color: '#D1D5DB' }]}>
                {txt.completePayment}
              </Text>

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
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>⚡ UPI</Text></View>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>💳 {txt.cards}</Text></View>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>🏦 {txt.netBanking}</Text></View>
                    <View style={[styles.pill, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}><Text style={[styles.pillText, isDark && { color: '#38BDF8' }]}>👛 {txt.wallets}</Text></View>
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
              {/* Cash on Delivery (COD) Card */}
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
                    <Text style={[styles.optionTitle, isDark && { color: '#FFFFFF' }]}>{txt.codTitle || 'Cash on Delivery (COD)'}</Text>
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

              {/* Store Credit (Kadan) Option */}
              {creditEligibility && creditEligibility.status === 'APPROVED' && (
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? 'rgba(13, 148, 136, 0.15)' : '#F0FDFA',
                      borderColor: paymentMethod === 'credit' ? '#7C3AED' : (isDark ? '#374151' : '#E2E8F0'),
                      borderWidth: paymentMethod === 'credit' ? 2 : 1.5,
                    },
                    (creditEligibility.availableCredit || 0) < totalPayable && { opacity: 0.5 },
                  ]}
                  onPress={() => {
                    if ((creditEligibility.availableCredit || 0) >= totalPayable) {
                      setPaymentMethod('credit');
                    }
                  }}
                  disabled={(creditEligibility.availableCredit || 0) < totalPayable}
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
                    {(creditEligibility.availableCredit || 0) < totalPayable && (
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

              {/* Price Breakdown Card */}
              <View
                style={[
                  styles.priceSummaryBox,
                  isDark && { backgroundColor: '#1F2937', borderColor: '#374151' },
                ]}
              >
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>
                    {txt.productSubtotal || 'Product Subtotal'}
                  </Text>
                  <Text style={[styles.priceValue, isDark && { color: '#FFFFFF' }]}>
                    ₹{productSubtotal.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>
                    {txt.platformFee || 'Platform Fee'}
                  </Text>
                  <Text style={[styles.priceValue, isDark && { color: '#FFFFFF' }]}>
                    {platformFee === 0 ? (txt.free || 'FREE') : `₹${platformFee.toLocaleString()}`}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>
                    {txt.deliveryFee || 'Delivery Fee'}
                  </Text>
                  <Text style={[styles.priceValue, deliveryFee === 0 ? { color: '#4ADE80' } : (isDark ? { color: '#FFFFFF' } : {})]}>
                    {deliveryFee === 0 ? (txt.free || 'FREE') : `₹${deliveryFee.toLocaleString()}`}
                  </Text>
                </View>
                <View style={[styles.priceRow, styles.totalPriceRow, isDark && { borderTopColor: '#374151' }]}>
                  <Text style={[styles.totalPriceLabel, isDark && { color: '#FFFFFF' }]}>
                    {txt.totalPayable || 'Total Payable'}
                  </Text>
                  <Text style={[styles.totalPriceValue, isDark && { color: '#2DD4BF' }]}>
                    ₹{totalPayable.toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: Spacing.xs },
                  paymentMethod === 'credit' && { backgroundColor: '#7C3AED' },
                  paymentMethod === 'cod' && { backgroundColor: '#059669' },
                ]}
                onPress={() => handlePlaceOrder()}
              >
                {paymentMethod === 'credit' ? (
                  <>
                    <FileText size={16} color="#fff" />
                    <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {(txt.placeOrderCredit || 'Place Order on Credit (₹{amount})').replace('{amount}', totalPayable.toFixed(0))}
                    </Text>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Banknote size={16} color="#fff" />
                    <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {(txt.placeOrderCod || 'Place Cash on Delivery Order (₹{amount})').replace('{amount}', totalPayable.toFixed(0))}
                    </Text>
                  </>
                ) : (
                  <>
                    <Lock size={16} color="#fff" />
                    <Text style={styles.primaryBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                      {txt.payVia.replace('{amount}', totalPayable.toFixed(0))}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('delivery')}>
                <Text style={[styles.linkText, isDark && { color: '#2DD4BF' }]}>← {txt.backToDeliveryChoice}</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'placing' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={CustomerColors.teal600} />
              <Text style={[styles.stepText, isDark && { color: '#9CA3AF' }]}>{txt.placingOrder}</Text>
            </View>
          )}

          {step === 'success' && chosen && (
            <View style={[styles.center, { gap: Spacing.md }]}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: CustomerColors.successBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BBF7D0' }}>
                <CheckCircle2 size={38} color={CustomerColors.success} />
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.successTitle, isDark && { color: '#FFFFFF' }]}>{txt.orderConfirmed}</Text>
                <Text style={[styles.successText, isDark && { color: '#9CA3AF' }]}>
                  {txt.orderPlacedDesc.replace('{store}', chosen.storeName).replace('{delivery}', deliveryMethod === 'pickup' ? txt.selfPickup : txt.homeDelivery)}
                </Text>
              </View>

              {/* Verified Bill Card */}
              <View style={[styles.billCard, isDark && { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                <View style={[styles.billHeader, isDark && { borderBottomColor: '#374151' }]}>
                  <View>
                    <Text style={styles.billBadge}>{txt.verifiedBill}</Text>
                    <Text style={[styles.billStoreName, isDark && { color: '#FFFFFF' }]}>{chosen.storeName}</Text>
                  </View>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>{txt.paid}</Text>
                    {orderId ? <Text style={[styles.billOrderId, isDark && { color: '#9CA3AF' }]}>#{orderId}</Text> : null}
                  </View>
                </View>

                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.customer}</Text>
                  <Text style={[styles.billValue, isDark && { color: '#F9FAFB' }]}>
                    {[form.firstName, form.lastName].filter(Boolean).join(' ') || 'Customer'}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{txt.paymentMode}</Text>
                  <Text style={[styles.billValue, { color: isDark ? '#2DD4BF' : CustomerColors.teal700 }]}>
                    {paymentMethod === 'cod' ? (txt.codTitle || 'Cash on Delivery (COD)') : paymentMethod === 'credit' ? (txt.storeCreditTitle || 'Store Credit (Kadan)') : txt.onlinePayment}
                  </Text>
                </View>

                <View style={[styles.billRow, { borderTopWidth: 1, borderTopColor: isDark ? '#374151' : CustomerColors.steelBorder, paddingTop: 6, marginTop: 4 }]}>
                  <Text style={[styles.billLabel, isDark && { color: '#9CA3AF' }]}>{items.length} {items.length !== 1 ? 'items' : 'item'}</Text>
                  <Text style={[styles.billTotal, isDark && { color: '#2DD4BF' }]}>{txt.total.replace('{amount}', chosen.totalAmount.toFixed(0))}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ width: '100%', gap: Spacing.sm, marginTop: Spacing.xs }}>
                {orderId ? (
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.viewInvoiceBtn, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)', borderColor: '#0f766e' }]}
                      onPress={() => setShowInvoiceModal(true)}
                    >
                      <FileText size={15} color={isDark ? '#5EEAD4' : CustomerColors.teal700} />
                      <Text style={[styles.viewInvoiceBtnText, isDark && { color: '#5EEAD4' }]}>{txt.viewInvoice}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.downloadBillBtn]}
                      onPress={async () => {
                        const pdfUrl = smartOrderApi.getInvoicePdfUrl(orderId);
                        try {
                          await Linking.openURL(pdfUrl);
                        } catch {
                          Alert.alert('Download', 'Opening invoice...');
                        }
                      }}
                    >
                      <Download size={15} color="#FFFFFF" />
                      <Text style={styles.downloadBillBtnText}>{txt.downloadBill}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.doneBtn, isDark && { backgroundColor: '#1F2937', borderColor: '#374151', borderWidth: 1 }]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={[styles.doneBtnText, isDark && { color: '#FFFFFF' }]}>{txt.done}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {orderId ? (
        <InvoiceModal
          orderId={orderId}
          visible={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      ) : null}

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Place Order"
        subtitle="Please sign in or register to continue with your bulk purchase."
        onLogin={() => navigateToAuthFlow(navigation)}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: CustomerColors.mint,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  closeBtn: {
    flexShrink: 0,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    flexShrink: 1,
  },
  body: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  errorBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: { flex: 1, color: CustomerColors.danger, fontSize: FontSizes.xs },
  stepText: { fontSize: FontSizes.sm, color: '#4B5563' },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.bg,
  },
  radiusChipActive: {
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.teal600,
  },
  radiusChipText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextActive: { color: CustomerColors.teal700 },
  input: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
    color: CustomerColors.black,
  },
  primaryBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
    flexShrink: 1,
    textAlign: 'center',
  },
  secondaryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  secondaryBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  center: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: '#374151' },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
  },
  linkText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal600,
    fontWeight: '600',
    textAlign: 'center',
  },
  storeCard: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: CustomerColors.white,
  },
  storeCardBest: {
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  storeCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  storeName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  storeRatingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  storeRatingTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  bestBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  bestBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  storeMeta: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  storeAmount: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  matchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  matchedText: { fontSize: FontSizes.xs, color: '#4B5563' },
  unmatchedText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.warning,
    marginTop: Spacing.xs,
  },
  selectBtn: {
    backgroundColor: CustomerColors.teal600,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    minHeight: 38,
  },
  selectBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FontSizes.sm,
    flexShrink: 1,
    textAlign: 'center',
  },
  chosenSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  row3: { flexDirection: 'row', gap: Spacing.sm },
  half: { flex: 1 },
  third: { flex: 1 },
  buttonRow: { flexDirection: 'row', gap: Spacing.sm },
  optionCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  optionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  optionDesc: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoBoxText: { fontSize: FontSizes.sm, color: '#4B5563' },
  warningBox: {
    backgroundColor: CustomerColors.warningBg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  warningBoxText: { fontSize: FontSizes.sm, color: '#92400E' },
  qrBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  qrImage: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.sm,
  },
  qrCaption: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
  },
  screenshotBtn: {
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  screenshotBtnText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.teal700,
    fontWeight: '600',
  },
  successTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  successText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  doneBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    alignItems: 'center',
    width: '100%',
  },
  doneBtnText: { color: '#374151', fontWeight: '700', fontSize: FontSizes.xs },
  billCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 6,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.steelBorder,
    paddingBottom: 6,
    marginBottom: 4,
  },
  billBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: CustomerColors.teal700,
    letterSpacing: 0.5,
  },
  billStoreName: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    marginTop: 1,
  },
  paidBadge: {
    alignItems: 'flex-end',
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: CustomerColors.success,
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
    fontWeight: '600',
    color: CustomerColors.black,
  },
  billTotal: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  viewInvoiceBtn: {
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  viewInvoiceBtnText: {
    color: CustomerColors.teal700,
    fontWeight: '800',
    fontSize: FontSizes.xs,
  },
  downloadBillBtn: {
    backgroundColor: CustomerColors.primary,
  },
  downloadBillBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: FontSizes.xs,
  },
  razorpayOptionCard: {
    borderColor: CustomerColors.teal600,
    borderWidth: 1.5,
    backgroundColor: '#F0FDFA',
  },
  razorpayIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: CustomerColors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantBadge: {
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  instantBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  subMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  subMethodCardActive: {
    borderColor: CustomerColors.teal600,
    borderWidth: 1.5,
    backgroundColor: '#F0FDFA',
  },
  subMethodIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subMethodIconActive: {
    backgroundColor: '#CCFBF1',
  },
  subMethodTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  subMethodDesc: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  feeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bankTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  walletTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  trustBannerText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  priceSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  priceValue: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    marginTop: 2,
  },
  totalPriceLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  totalPriceValue: {
    fontSize: FontSizes.md,
    fontWeight: '900',
    color: CustomerColors.teal700,
  },
});

