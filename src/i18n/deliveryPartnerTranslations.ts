import { LanguageCode } from './types';

export interface DeliveryPartnerTranslations {
  // Top Header Bar
  goOffline: string;
  goAvailable: string;
  verified: string;
  online: string;
  offline: string;
  vehicleFallback: string;
  registeredFallback: string;

  // Tabs
  liveTripsTab: string;
  earningsTab: string;
  profileTab: string;

  // GPS Bar
  gpsActiveZone: string;
  gpsOfflinePrompt: string;

  // Stats / Quick Metrics
  statusLabel: string;
  availableStatus: string;
  offlineStatus: string;
  receivingTripsSub: string;
  standbySub: string;
  newTripsLabel: string;
  waitingSub: string;
  completedLabel: string;
  tripsSub: string;

  // Active Order
  activeOrderInProgress: string;
  orderPrefix: string;
  storePickup: string;
  dropoffAddress: string;
  mapBtn: string;
  actionStartNavStore: string;
  actionArrivedStore: string;
  actionConfirmPickup: string;
  actionStartDelivery: string;
  actionMarkDelivered: string;

  // Available Requests
  availableRequestsTitle: string;
  noPendingRequestsTitle: string;
  nearbyStoreRequestsDesc: string;
  goAvailableToReceiveDesc: string;
  pickupLabel: string;
  dropoffLabel: string;
  storeFallback: string;
  acceptRequestBtn: string;
  declineBtn: string;
  currencyPrefix: string;
  kmUnit: string;

  // Earnings Tab
  estimatedTotalEarnings: string;
  avgPerVerifiedDelivery: string;
  payoutSummaryTitle: string;
  completedTripsLabel: string;
  baseFareLabel: string;
  baseFareValue: string;
  distanceIncentiveLabel: string;
  distanceIncentiveValue: string;
  payoutFrequencyLabel: string;
  weeklyDirectTransfer: string;

  // Profile Tab
  editBtn: string;
  vehicleTypeLabel: string;
  vehicleNumberLabel: string;
  partnerRatingLabel: string;
  topRated: string;
  serviceAreaLabel: string;
  notSpecified: string;
  returnToStoreHomeBtn: string;
  signOutPartnerAccountBtn: string;

  // Edit Profile Form
  editPartnerProfileTitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  mobileNumberLabel: string;
  mobileNumberPlaceholder: string;
  licensePlateLabel: string;
  vehicleNumberPlaceholder: string;
  serviceAreaPlaceholder: string;
  saveProfileBtn: string;
  savingProfileBtn: string;
  cancelBtn: string;

  // Vehicles
  vehicleBike: string;
  vehicleScooter: string;
  vehicleBicycle: string;
  vehicleCar: string;
  vehicleAuto: string;
  vehicleVan: string;

  // Navigation Modal
  liveGpsNavTitle: string;
  storePickupLocation: string;
  customerDropoffDestination: string;
  directionsFromCurrentGps: string;
  openTurnByTurnMaps: string;
  closeNavBtn: string;

  // Alerts
  newRequestAlertTitle: string;
  newRequestAlertMsg: string;
  viewRequestsBtn: string;
  dismissBtn: string;
  loadingDashboard: string;
  loadingDashboardSub: string;
  deliveryUnavailableTitle: string;
  deliveryUnavailableMsg: string;
  okBtn: string;

  // Header & Home Banner
  dashboardBtn: string;
  deliveryPartnerMode: string;
  deliveryPartnerBannerDesc: string;
  goToDashboard: string;
}

export const deliveryPartnerTranslations: Record<LanguageCode, DeliveryPartnerTranslations> = {
  en: {
    goOffline: 'Go Offline',
    goAvailable: 'Go Available',
    verified: 'Verified',
    online: 'ONLINE',
    offline: 'OFFLINE',
    vehicleFallback: 'Vehicle',
    registeredFallback: 'Registered',

    liveTripsTab: 'Live Trips',
    earningsTab: 'Earnings',
    profileTab: 'Profile',

    gpsActiveZone: 'GPS Active · Available in Your Zone',
    gpsOfflinePrompt: 'Offline · Go available to receive trips',

    statusLabel: 'STATUS',
    availableStatus: 'Available',
    offlineStatus: 'Offline',
    receivingTripsSub: 'Receiving trips',
    standbySub: 'Standby',
    newTripsLabel: 'NEW TRIPS',
    waitingSub: 'waiting',
    completedLabel: 'COMPLETED',
    tripsSub: 'trips',

    activeOrderInProgress: 'Active Order in Progress',
    orderPrefix: 'Order #',
    storePickup: 'Store Pickup',
    dropoffAddress: 'Drop-off Address',
    mapBtn: 'Map',
    actionStartNavStore: 'Start Navigation to Store',
    actionArrivedStore: "I've Arrived at Store",
    actionConfirmPickup: 'Confirm Pickup',
    actionStartDelivery: 'Start Delivery',
    actionMarkDelivered: 'Mark as Delivered',

    availableRequestsTitle: 'Available Delivery Requests',
    noPendingRequestsTitle: 'No pending requests',
    nearbyStoreRequestsDesc: 'Nearby store requests will appear here in realtime.',
    goAvailableToReceiveDesc: 'Go available above to start receiving delivery requests.',
    pickupLabel: 'PICKUP',
    dropoffLabel: 'DROP-OFF',
    storeFallback: 'Store Location',
    acceptRequestBtn: 'Accept Request',
    declineBtn: 'Decline',
    currencyPrefix: '₹',
    kmUnit: 'km',

    estimatedTotalEarnings: 'ESTIMATED TOTAL EARNINGS',
    avgPerVerifiedDelivery: '₹120 avg per verified delivery',
    payoutSummaryTitle: 'Payout Summary',
    completedTripsLabel: 'Completed Trips',
    baseFareLabel: 'Base Fare',
    baseFareValue: '₹80.00 / trip',
    distanceIncentiveLabel: 'Distance Incentive',
    distanceIncentiveValue: '₹40.00 avg',
    payoutFrequencyLabel: 'Payout Frequency',
    weeklyDirectTransfer: 'Weekly Direct Transfer',

    editBtn: 'Edit',
    vehicleTypeLabel: 'Vehicle Type',
    vehicleNumberLabel: 'Vehicle Number',
    partnerRatingLabel: 'Partner Rating',
    topRated: 'Top Rated',
    serviceAreaLabel: 'Service Area',
    notSpecified: 'Not specified',
    returnToStoreHomeBtn: 'Return to Store / Home Page',
    signOutPartnerAccountBtn: 'Sign Out Partner Account',

    editPartnerProfileTitle: 'Edit Partner Profile',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Your Full Name',
    mobileNumberLabel: 'Mobile Number',
    mobileNumberPlaceholder: '10-digit mobile number',
    licensePlateLabel: 'Vehicle License Plate Number',
    vehicleNumberPlaceholder: 'e.g. TN 20 AQ 2004',
    serviceAreaPlaceholder: 'e.g. RS Puram, Coimbatore',
    saveProfileBtn: 'Save Profile Changes',
    savingProfileBtn: 'Saving...',
    cancelBtn: 'Cancel',

    vehicleBike: 'Bike',
    vehicleScooter: 'Scooter',
    vehicleBicycle: 'Bicycle',
    vehicleCar: 'Car',
    vehicleAuto: 'Auto',
    vehicleVan: 'Van',

    liveGpsNavTitle: 'LIVE GPS NAVIGATION',
    storePickupLocation: 'STORE PICKUP LOCATION',
    customerDropoffDestination: 'CUSTOMER DROP-OFF DESTINATION',
    directionsFromCurrentGps: 'Directions from your current GPS location',
    openTurnByTurnMaps: 'Open Turn-by-Turn in Google Maps',
    closeNavBtn: 'Close Navigation',

    newRequestAlertTitle: '🚨 New Delivery Request!',
    newRequestAlertMsg: 'New delivery request available!',
    viewRequestsBtn: 'View Requests',
    dismissBtn: 'Dismiss',
    loadingDashboard: 'Loading delivery partner dashboard...',
    loadingDashboardSub: 'Connecting to live trips & earnings data',
    deliveryUnavailableTitle: 'Delivery Unavailable',
    deliveryUnavailableMsg: 'This delivery request is no longer available.',
    okBtn: 'OK',

    dashboardBtn: 'Dashboard',
    deliveryPartnerMode: 'Delivery Partner Console',
    deliveryPartnerBannerDesc: 'Tap to return to your dashboard for live trips & earnings',
    goToDashboard: 'Go to Delivery Dashboard',
  },

  ta: {
    goOffline: 'ஆஃப்லைனில் செல்',
    goAvailable: 'ஆர்டர்களை ஏற்க தொடங்கு',
    verified: 'சரிபார்க்கப்பட்டது',
    online: 'ஆன்லைன்',
    offline: 'ஆஃப்லைன்',
    vehicleFallback: 'வாகனம்',
    registeredFallback: 'பதிவு செய்யப்பட்டது',

    liveTripsTab: 'நேரலை பயணங்கள்',
    earningsTab: 'வருவாய்',
    profileTab: 'சுயவிவரம்',

    gpsActiveZone: 'GPS செயலில் உள்ளது · உங்கள் மண்டலத்தில் கிடைக்கும்',
    gpsOfflinePrompt: 'ஆஃப்லைன் · பயணங்களைப் பெற ஆன்லைனில் செல்லவும்',

    statusLabel: 'நிலை',
    availableStatus: 'கிடைக்கக்கூடியது',
    offlineStatus: 'ஆஃப்லைன்',
    receivingTripsSub: 'பயணங்களைப் பெறுகிறது',
    standbySub: 'காத்திருப்பு',
    newTripsLabel: 'புதிய பயணங்கள்',
    waitingSub: 'காத்திருக்கிறது',
    completedLabel: 'முடிக்கப்பட்டது',
    tripsSub: 'பயணங்கள்',

    activeOrderInProgress: 'செயலில் உள்ள ஆர்டர் பயணத்தில் உள்ளது',
    orderPrefix: 'ஆர்டர் #',
    storePickup: 'ஸ்டோர் பிக்அப்',
    dropoffAddress: 'டெலிவரி முகவரி',
    mapBtn: 'வரைபடம்',
    actionStartNavStore: 'ஸ்டோருக்கு வழிசெலுத்தலைத் தொடங்கு',
    actionArrivedStore: 'ஸ்டோருக்கு வந்துவிட்டேன்',
    actionConfirmPickup: 'பிக்அப் உறுதிப்படுத்து',
    actionStartDelivery: 'டெலிவரியைத் தொடங்கு',
    actionMarkDelivered: 'டெலிவரி செய்யப்பட்டதாகக் குறி',

    availableRequestsTitle: 'கிடைக்கக்கூடிய டெலிவரி கோரிக்கைகள்',
    noPendingRequestsTitle: 'நிலுவையில் உள்ள கோரிக்கைகள் இல்லை',
    nearbyStoreRequestsDesc: 'அருகிலுள்ள ஸ்டோர் கோரிக்கைகள் நிகழ்நேரத்தில் இங்கே தோன்றும்.',
    goAvailableToReceiveDesc: 'டெலிவரி கோரிக்கைகளைப் பெற மேலே ஆன்லைனுக்கு மாறவும்.',
    pickupLabel: 'பிக்அப்',
    dropoffLabel: 'டெலிவரி',
    storeFallback: 'ஸ்டோர் இடம்',
    acceptRequestBtn: 'கோரிக்கையை ஏற்றுக்கொள்',
    declineBtn: 'நிராகரி',
    currencyPrefix: '₹',
    kmUnit: 'கி.மீ',

    estimatedTotalEarnings: 'மதிப்பிடப்பட்ட மொத்த வருவாய்',
    avgPerVerifiedDelivery: 'சரிபார்க்கப்பட்ட டெலிவரிக்கு சராசரியாக ₹120',
    payoutSummaryTitle: 'பணப்பட்டுவாடா விவரம்',
    completedTripsLabel: 'முடிக்கப்பட்ட பயணங்கள்',
    baseFareLabel: 'அடிப்படை கட்டணம்',
    baseFareValue: '₹80.00 / பயணம்',
    distanceIncentiveLabel: 'தூர ஊக்கத்தொகை',
    distanceIncentiveValue: 'சராசரி ₹40.00',
    payoutFrequencyLabel: 'செலுத்தும் காலம்',
    weeklyDirectTransfer: 'வாராந்திர நேரடி வங்கிப் பரிமாற்றம்',

    editBtn: 'திருத்து',
    vehicleTypeLabel: 'வாகன வகை',
    vehicleNumberLabel: 'வாகன எண்',
    partnerRatingLabel: 'பார்ட்னர் மதிப்பீடு',
    topRated: 'சிறந்த மதிப்பீடு',
    serviceAreaLabel: 'சேவை பகுதி',
    notSpecified: 'குறிப்பிடப்படவில்லை',
    returnToStoreHomeBtn: 'ஸ்டோர் / முகப்புப் பக்கத்திற்குத் திரும்பு',
    signOutPartnerAccountBtn: 'பார்ட்னர் கணக்கிலிருந்து வெளியேறு',

    editPartnerProfileTitle: 'பார்ட்னர் சுயவிவரத்தைத் திருத்து',
    fullNameLabel: 'முழுப் பெயர்',
    fullNamePlaceholder: 'உங்கள் முழுப் பெயர்',
    mobileNumberLabel: 'மொபைல் எண்',
    mobileNumberPlaceholder: '10 இலக்க மொபைல் எண்',
    licensePlateLabel: 'வாகன பதிவு எண்',
    vehicleNumberPlaceholder: 'எ.கா. TN 20 AQ 2004',
    serviceAreaPlaceholder: 'எ.கா. ஆர்.எஸ் புரம், கோயம்புத்தூர்',
    saveProfileBtn: 'சுயவிவர மாற்றங்களைச் சேமி',
    savingProfileBtn: 'சேமிக்கப்படுகிறது…',
    cancelBtn: 'ரத்து',

    vehicleBike: 'பைக்',
    vehicleScooter: 'ஸ்கூட்டர்',
    vehicleBicycle: 'சைக்கிள்',
    vehicleCar: 'கார்',
    vehicleAuto: 'ஆட்டோ',
    vehicleVan: 'வேன்',

    liveGpsNavTitle: 'நேரலை GPS வழிசெலுத்தல்',
    storePickupLocation: 'ஸ்டோர் பிக்அப் இடம்',
    customerDropoffDestination: 'வாடிக்கையாளர் டெலிவரி இடம்',
    directionsFromCurrentGps: 'உங்கள் தற்போதைய GPS இருப்பிடத்திலிருந்து வழிகள்',
    openTurnByTurnMaps: 'Google Maps-ல் வழிகளைத் திற',
    closeNavBtn: 'வழிசெலுத்தலை மூடு',

    newRequestAlertTitle: '🚨 புதிய டெலிவரி கோரிக்கை!',
    newRequestAlertMsg: 'புதிய டெலிவரி கோரிக்கை கிடைத்துள்ளது!',
    viewRequestsBtn: 'கோரிக்கைகளைப் பார்',
    dismissBtn: 'விலக்கு',
    loadingDashboard: 'டெலிவரி பார்ட்னர் டாஷ்போர்டு ஏற்றப்படுகிறது…',
    loadingDashboardSub: 'நேரலை டிரிப்கள் மற்றும் வருவாய் விவரங்கள் ஏற்றப்படுகின்றன',
    deliveryUnavailableTitle: 'டெலிவரி கிடைக்கவில்லை',
    deliveryUnavailableMsg: 'இந்த டெலிவரி கோரிக்கை தற்போது கிடைக்கவில்லை.',
    okBtn: 'சரி',

    dashboardBtn: 'டாஷ்போர்டு',
    deliveryPartnerMode: 'டெலிவரி பார்ட்னர் கன்சோல்',
    deliveryPartnerBannerDesc: 'லைவ் டிரிப்கள் மற்றும் வருவாய்க்கு உங்கள் டாஷ்போர்டுக்குத் திரும்புங்கள்',
    goToDashboard: 'டெலிவரி டாஷ்போர்டுக்குச் செல்',
  },

  hi: {
    goOffline: 'ऑफलाइन जाएं',
    goAvailable: 'उपलब्ध हों',
    verified: 'सत्यापित',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    vehicleFallback: 'वाहन',
    registeredFallback: 'पंजीकृत',

    liveTripsTab: 'लाइव ट्रिप्स',
    earningsTab: 'कमाई',
    profileTab: 'प्रोफ़ाइल',

    gpsActiveZone: 'GPS सक्रिय · आपके ज़ोन में उपलब्ध',
    gpsOfflinePrompt: 'ऑफलाइन · ट्रिप्स प्राप्त करने के लिए उपलब्ध हों',

    statusLabel: 'स्थिति',
    availableStatus: 'उपलब्ध',
    offlineStatus: 'ऑफलाइन',
    receivingTripsSub: 'ट्रिप्स प्राप्त हो रही हैं',
    standbySub: 'स्टैंडबाय',
    newTripsLabel: 'नई ट्रिप्स',
    waitingSub: 'प्रतीक्षारत',
    completedLabel: 'पूर्ण',
    tripsSub: 'ट्रिप्स',

    activeOrderInProgress: 'सक्रिय ऑर्डर प्रगति पर है',
    orderPrefix: 'ऑर्डर #',
    storePickup: 'स्टोर पिकअप',
    dropoffAddress: 'डिलीवरी पता',
    mapBtn: 'मानचित्र',
    actionStartNavStore: 'स्टोर के लिए नेविगेशन शुरू करें',
    actionArrivedStore: 'मैं स्टोर पर पहुंच गया हूँ',
    actionConfirmPickup: 'पिकअप की पुष्टि करें',
    actionStartDelivery: 'डिलीवरी शुरू करें',
    actionMarkDelivered: 'डिलीवर के रूप में चिह्नित करें',

    availableRequestsTitle: 'उपलब्ध डिलीवरी अनुरोध',
    noPendingRequestsTitle: 'कोई लंबित अनुरोध नहीं',
    nearbyStoreRequestsDesc: 'आस-पास के स्टोर अनुरोध यहां रीयलटाइम में दिखाई देंगे।',
    goAvailableToReceiveDesc: 'अनुरोध प्राप्त करने के लिए ऊपर उपलब्ध पर क्लिक करें।',
    pickupLabel: 'पिकअप',
    dropoffLabel: 'ड्रॉप-ऑफ',
    storeFallback: 'स्टोर स्थान',
    acceptRequestBtn: 'अनुरोध स्वीकार करें',
    declineBtn: 'अस्वीकार करें',
    currencyPrefix: '₹',
    kmUnit: 'किमी',

    estimatedTotalEarnings: 'अनुमानित कुल कमाई',
    avgPerVerifiedDelivery: '₹120 औसत प्रति सत्यापित डिलीवरी',
    payoutSummaryTitle: 'भुगतान सारांश',
    completedTripsLabel: 'पूरी हुई ट्रिप्स',
    baseFareLabel: 'मूल किराया',
    baseFareValue: '₹80.00 / ट्रिप',
    distanceIncentiveLabel: 'दूरी प्रोत्साहन',
    distanceIncentiveValue: '₹40.00 औसत',
    payoutFrequencyLabel: 'भुगतान आवृत्ति',
    weeklyDirectTransfer: 'साप्ताहिक सीधा बैंक ट्रांसफर',

    editBtn: 'संपादित करें',
    vehicleTypeLabel: 'वाहन प्रकार',
    vehicleNumberLabel: 'वाहन संख्या',
    partnerRatingLabel: 'पार्टनर रेटिंग',
    topRated: 'टॉप रेटेड',
    serviceAreaLabel: 'सेवा क्षेत्र',
    notSpecified: 'निर्दिष्ट नहीं है',
    returnToStoreHomeBtn: 'स्टोर / होम पेज पर लौटें',
    signOutPartnerAccountBtn: 'पार्टनर खाते से साइन आउट करें',

    editPartnerProfileTitle: 'पार्टनर प्रोफ़ाइल संपादित करें',
    fullNameLabel: 'पूरा नाम',
    fullNamePlaceholder: 'आपका पूरा नाम',
    mobileNumberLabel: 'मोबाइल नंबर',
    mobileNumberPlaceholder: '10-अंकीय मोबाइल नंबर',
    licensePlateLabel: 'वाहन नंबर प्लेट',
    vehicleNumberPlaceholder: 'उदा. TN 20 AQ 2004',
    serviceAreaPlaceholder: 'उदा. आरएस पुरम, कोयंबटूर',
    saveProfileBtn: 'प्रोफ़ाइल परिवर्तन सहेजें',
    savingProfileBtn: 'सहेजा जा रहा है…',
    cancelBtn: 'रद्द करें',

    vehicleBike: 'बाइक',
    vehicleScooter: 'स्कूटर',
    vehicleBicycle: 'साइकिल',
    vehicleCar: 'कार',
    vehicleAuto: 'ऑटो',
    vehicleVan: 'वैन',

    liveGpsNavTitle: 'लाइव जीपीएस नेविगेशन',
    storePickupLocation: 'स्टोर पिकअप स्थान',
    customerDropoffDestination: 'ग्राहक ड्रॉप-ऑफ गंतव्य',
    directionsFromCurrentGps: 'आपके वर्तमान जीपीएस स्थान से दिशा-निर्देश',
    openTurnByTurnMaps: 'गूगल मैप्स में नेविगेशन खोलें',
    closeNavBtn: 'नेविगेशन बंद करें',

    newRequestAlertTitle: '🚨 नया डिलीवरी अनुरोध!',
    newRequestAlertMsg: 'नया डिलीवरी अनुरोध उपलब्ध है!',
    viewRequestsBtn: 'अनुरोध देखें',
    dismissBtn: 'खारिज करें',
    loadingDashboard: 'डिलीवरी पार्टनर डैशबोर्ड लोड हो रहा है…',
    loadingDashboardSub: 'लाइव ट्रिप और कमाई डेटा लोड हो रहा है',
    deliveryUnavailableTitle: 'डिलीवरी अनुपलब्ध',
    deliveryUnavailableMsg: 'यह डिलीवरी अनुरोध अब उपलब्ध नहीं है।',
    okBtn: 'ठीक है',

    dashboardBtn: 'डैशबोर्ड',
    deliveryPartnerMode: 'डिलीवरी पार्टनर कंसोल',
    deliveryPartnerBannerDesc: 'लाइव ट्रिप्स और कमाई के लिए अपने डैशबोर्ड पर लौटें',
    goToDashboard: 'डिलीवरी डैशबोर्ड पर जाएं',
  },

  te: {
    goOffline: 'ఆఫ్‌లైన్‌కు వెళ్లండి',
    goAvailable: 'అందుబాటులోకి రండి',
    verified: 'ధృవీకరించబడింది',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్',
    vehicleFallback: 'వాహనం',
    registeredFallback: 'నమోదైంది',

    liveTripsTab: 'లైవ్ ట్రిప్‌లు',
    earningsTab: 'ఆదాయం',
    profileTab: 'ప్రొఫైల్',

    gpsActiveZone: 'GPS యాక్టివ్ · మీ జోన్‌లో అందుబాటులో ఉంది',
    gpsOfflinePrompt: 'ఆఫ్‌లైన్ · ట్రిప్‌లను స్వీకరించడానికి అందుబాటులో ఉండండి',

    statusLabel: 'స్థితి',
    availableStatus: 'అందుబాటులో ఉంది',
    offlineStatus: 'ఆఫ్‌లైన్',
    receivingTripsSub: 'ట్రిప్‌లను అందుకుంటోంది',
    standbySub: 'స్టాండ్‌బై',
    newTripsLabel: 'కొత్త ట్రిప్‌లు',
    waitingSub: 'వేచి ఉన్నాయి',
    completedLabel: 'పూర్తయినవి',
    tripsSub: 'ట్రిప్‌లు',

    activeOrderInProgress: 'క్రియాశీల ఆర్డర్ పురోగతిలో ఉంది',
    orderPrefix: 'ఆర్డర్ #',
    storePickup: 'స్టోర్ పికప్',
    dropoffAddress: 'డ్రాప్-ఆఫ్ చిరునామా',
    mapBtn: 'మ్యాప్',
    actionStartNavStore: 'స్టోర్‌కు నావిగేషన్ ప్రారంభించండి',
    actionArrivedStore: 'నేను స్టోర్‌కు చేరుకున్నాను',
    actionConfirmPickup: 'పికప్‌ను నిర్ధారించండి',
    actionStartDelivery: 'డెలివరీని ప్రారంభించండి',
    actionMarkDelivered: 'డెలివరీ చేసినట్లు గుర్తు పెట్టండి',

    availableRequestsTitle: 'అందుబాటులో ఉన్న డెలివరీ అభ్యర్థనలు',
    noPendingRequestsTitle: 'పెండింగ్ అభ్యర్థనలు లేవు',
    nearbyStoreRequestsDesc: 'సమీపంలోని స్టోర్ అభ్యర్థనలు ఇక్కడ నిజ సమయంలో కనిపిస్తాయి.',
    goAvailableToReceiveDesc: 'అభ్యర్థనలను స్వీకరించడానికి పైన ఆన్‌లైన్‌కు మారండి.',
    pickupLabel: 'పికప్',
    dropoffLabel: 'డ్రాప్-ఆఫ్',
    storeFallback: 'స్టోర్ ప్రదేశం',
    acceptRequestBtn: 'అభ్యర్థనను అంగీకరించండి',
    declineBtn: 'తిరస్కరించండి',
    currencyPrefix: '₹',
    kmUnit: 'కి.మీ',

    estimatedTotalEarnings: 'అంచనా వేసిన మొత్తం ఆదాయం',
    avgPerVerifiedDelivery: 'ధృవీకరించబడిన డెలివరీకి సగటున ₹120',
    payoutSummaryTitle: 'చెల్లింపు సారాంశం',
    completedTripsLabel: 'పూర్తయిన ట్రిప్‌లు',
    baseFareLabel: 'ప్రాథమిక ఛార్జీ',
    baseFareValue: '₹80.00 / ట్రిప్',
    distanceIncentiveLabel: 'దూర ప్రోత్సాహకం',
    distanceIncentiveValue: 'సగటు ₹40.00',
    payoutFrequencyLabel: 'చెల్లింపు వ్యవధి',
    weeklyDirectTransfer: 'వారపు ప్రత్యక్ష బదిలీ',

    editBtn: 'సవరించు',
    vehicleTypeLabel: 'వాహన రకం',
    vehicleNumberLabel: 'వాహన సంఖ్య',
    partnerRatingLabel: 'భాగస్వామి రేటింగ్',
    topRated: 'టాప్ రేటెడ్',
    serviceAreaLabel: 'సేవా ప్రాంతం',
    notSpecified: 'పేర్కొనబడలేదు',
    returnToStoreHomeBtn: 'స్టోర్ / హోమ్ పేజీకి తిరిగి వెళ్లండి',
    signOutPartnerAccountBtn: 'భాగస్వామి ఖాతా నుండి నిష్క్రమించండి',

    editPartnerProfileTitle: 'భాగస్వామి ప్రొఫైల్‌ను సవరించండి',
    fullNameLabel: 'పూర్తి పేరు',
    fullNamePlaceholder: 'మీ పూర్తి పేరు',
    mobileNumberLabel: 'మొబైల్ నంబర్',
    mobileNumberPlaceholder: '10 అంకెల మొబైల్ నంబర్',
    licensePlateLabel: 'వాహన లైసెన్స్ ప్లేట్ సంఖ్య',
    vehicleNumberPlaceholder: 'ఉదా. TN 20 AQ 2004',
    serviceAreaPlaceholder: 'ఉదా. RS పురం, కోయంబత్తూర్',
    saveProfileBtn: 'ప్రొఫైల్ మార్పులను సేవ్ చేయండి',
    savingProfileBtn: 'సేవ్ చేస్తోంది…',
    cancelBtn: 'రద్దు చేయండి',

    vehicleBike: 'బైక్',
    vehicleScooter: 'స్కూటర్',
    vehicleBicycle: 'సైకిల్',
    vehicleCar: 'కారు',
    vehicleAuto: 'ఆటో',
    vehicleVan: 'వ్యాన్',

    liveGpsNavTitle: 'లైవ్ GPS నావిగేషన్',
    storePickupLocation: 'స్టోర్ పికప్ ప్రదేశం',
    customerDropoffDestination: 'కస్టమర్ డ్రాప్-ఆఫ్ గమ్యం',
    directionsFromCurrentGps: 'మీ ప్రస్తుత GPS స్థానం నుండి దిశలు',
    openTurnByTurnMaps: 'Google Mapsలో నావిగేషన్ తెరవండి',
    closeNavBtn: 'నావిగేషన్ మూసివేయండి',

    newRequestAlertTitle: '🚨 కొత్త డెలివరీ అభ్యర్థన!',
    newRequestAlertMsg: 'కొత్త డెలివరీ అభ్యర్థన అందుబాటులో ఉంది!',
    viewRequestsBtn: 'అభ్యర్థనలను వీక్షించండి',
    dismissBtn: 'తీసివేయండి',
    loadingDashboard: 'డెలివరీ భాగస్వామి డ్యాష్‌బోర్డ్ లోడ్ అవుతోంది…',
    loadingDashboardSub: 'లైవ్ ట్రిప్‌లు మరియు ఆదాయాల డేటా లోడ్ అవుతోంది',
    deliveryUnavailableTitle: 'డెలివరీ అందుబాటులో లేదు',
    deliveryUnavailableMsg: 'ఈ డెలివరీ అభ్యర్థన ఇప్పుడు అందుబాటులో లేదు.',
    okBtn: 'సరే',

    dashboardBtn: 'డ్యాష్‌బోర్డ్',
    deliveryPartnerMode: 'డెలివరీ పార్టనర్ కన్సోల్',
    deliveryPartnerBannerDesc: 'లైవ్ ట్రిప్పులు మరియు సంపాదన కోసం మీ డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి',
    goToDashboard: 'డెలివరీ డ్యాష్‌బోర్డ్‌కు వెళ్లండి',
  },

  kn: {
    goOffline: 'ಆಫ್‌ಲೈನ್‌ಗೆ ಹೋಗಿ',
    goAvailable: 'ಲಭ್ಯವಿರಿ',
    verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    online: 'ಆನ್‌ಲೈನ್',
    offline: 'ಆಫ್‌ಲೈನ್',
    vehicleFallback: 'ವಾಹನ',
    registeredFallback: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',

    liveTripsTab: 'ಲೈವ್ ಟ್ರಿಪ್‌ಗಳು',
    earningsTab: 'ಗಳಿಕೆ',
    profileTab: 'ಪ್ರೊಫೈಲ್',

    gpsActiveZone: 'GPS ಸಕ್ರಿಯ · ನಿಮ್ಮ ವಲಯದಲ್ಲಿ ಲಭ್ಯವಿದೆ',
    gpsOfflinePrompt: 'ಆಫ್‌ಲೈನ್ · ಟ್ರಿಪ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ಲಭ್ಯವಿರಿ',

    statusLabel: 'ಸ್ಥಿತಿ',
    availableStatus: 'ಲಭ್ಯವಿದೆ',
    offlineStatus: 'ಆಫ್‌ಲೈನ್',
    receivingTripsSub: 'ಟ್ರಿಪ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುತ್ತಿದೆ',
    standbySub: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ',
    newTripsLabel: 'ಹೊಸ ಟ್ರಿಪ್‌ಗಳು',
    waitingSub: 'ಕಾಯುತ್ತಿದೆ',
    completedLabel: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    tripsSub: 'ಟ್ರಿಪ್‌ಗಳು',

    activeOrderInProgress: 'ಸಕ್ರಿಯ ಆರ್ಡರ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    orderPrefix: 'ಆರ್ಡರ್ #',
    storePickup: 'ಸ್ಟೋರ್ ಪಿಕಪ್',
    dropoffAddress: 'ತಲುಪಿಸುವ ವಿಳಾಸ',
    mapBtn: 'ನಕ್ಷೆ',
    actionStartNavStore: 'ಅಂಗಡಿಗೆ ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭಿಸಿ',
    actionArrivedStore: 'ನಾನು ಅಂಗಡಿಗೆ ತಲುಪಿದ್ದೇನೆ',
    actionConfirmPickup: 'ಪಿಕಪ್ ದೃಢೀಕರಿಸಿ',
    actionStartDelivery: 'ವಿತರಣೆ ಪ್ರಾರಂಭಿಸಿ',
    actionMarkDelivered: 'ವಿತರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',

    availableRequestsTitle: 'ಲಭ್ಯವಿರುವ ವಿತರಣಾ ವಿನಂತಿಗಳು',
    noPendingRequestsTitle: 'ಯಾವುದೇ ಬಾಕಿ ವಿನಂತಿಗಳಿಲ್ಲ',
    nearbyStoreRequestsDesc: 'ಹತ್ತಿರದ ಅಂಗಡಿ ವಿನಂತಿಗಳು ಇಲ್ಲಿ ನೈಜ ಸಮಯದಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    goAvailableToReceiveDesc: 'ವಿನಂತಿಗಳನ್ನು ಪಡೆಯಲು ಮೇಲೆ ಆನ್‌ಲೈನ್‌ಗೆ ಬದಲಾಯಿಸಿ.',
    pickupLabel: 'ಪಿಕಪ್',
    dropoffLabel: 'ಡ್ರಾಪ್-ಆಫ್',
    storeFallback: 'ಅಂಗಡಿ ಸ್ಥಳ',
    acceptRequestBtn: 'ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿ',
    declineBtn: 'ತಿರಸ್ಕರಿಸಿ',
    currencyPrefix: '₹',
    kmUnit: 'ಕಿ.ಮೀ',

    estimatedTotalEarnings: 'ಅಂದಾಜು ಒಟ್ಟು ಗಳಿಕೆ',
    avgPerVerifiedDelivery: 'ಪರಿಶೀಲಿಸಿದ ವಿತರಣೆಗೆ ಸರಾಸರಿ ₹120',
    payoutSummaryTitle: 'ಪಾವತಿ ಸಾರಾಂಶ',
    completedTripsLabel: 'ಪೂರ್ಣಗೊಂಡ ಟ್ರಿಪ್‌ಗಳು',
    baseFareLabel: 'ಮೂಲ ದರ',
    baseFareValue: '₹80.00 / ಟ್ರಿಪ್',
    distanceIncentiveLabel: 'ದೂರ ಪ್ರೋತ್ಸಾಹಕ',
    distanceIncentiveValue: 'ಸರಾಸರಿ ₹40.00',
    payoutFrequencyLabel: 'ಪಾವತಿ ಆವರ್ತನ',
    weeklyDirectTransfer: 'ವಾರದ ನೇರ ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ',

    editBtn: 'ತಿದ್ದುಪಡಿ',
    vehicleTypeLabel: 'ವಾಹನ ಪ್ರಕಾರ',
    vehicleNumberLabel: 'ವಾಹನ ಸಂಖ್ಯೆ',
    partnerRatingLabel: 'ಪಾಲುದಾರ ರೇಟಿಂಗ್',
    topRated: 'ಟಾಪ್ ರೇಟೆಡ್',
    serviceAreaLabel: 'ಸೇವಾ ಪ್ರದೇಶ',
    notSpecified: 'ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ',
    returnToStoreHomeBtn: 'ಸ್ಟೋರ್ / ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    signOutPartnerAccountBtn: 'ಪಾಲುದಾರ ಖಾತೆಯಿಂದ ಸೈನ್ ಔಟ್ ಮಾಡಿ',

    editPartnerProfileTitle: 'ಪಾಲುದಾರ ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    fullNamePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು',
    mobileNumberLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    mobileNumberPlaceholder: '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    licensePlateLabel: 'ವಾಹನ ನಂಬರ್ ಪ್ಲೇಟ್ ಸಂಖ್ಯೆ',
    vehicleNumberPlaceholder: 'ಉದಾ. TN 20 AQ 2004',
    serviceAreaPlaceholder: 'ಉದಾ. ಆರ್.ಎಸ್ ಪುರಂ, ಕೊಯಮತ್ತೂರು',
    saveProfileBtn: 'ಪ್ರೊಫೈಲ್ ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    savingProfileBtn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
    cancelBtn: 'ರದ್ದುಮಾಡಿ',

    vehicleBike: 'ಬೈಕ್',
    vehicleScooter: 'ಸ್ಕೂಟರ್',
    vehicleBicycle: 'ಸೈಕಲ್',
    vehicleCar: 'ಕಾರು',
    vehicleAuto: 'ಆಟೋ',
    vehicleVan: 'ವ್ಯಾನ್',

    liveGpsNavTitle: 'ಲೈವ್ GPS ನ್ಯಾವಿಗೇಷನ್',
    storePickupLocation: 'ಸ್ಟೋರ್ ಪಿಕಪ್ ಸ್ಥಳ',
    customerDropoffDestination: 'ಗ್ರಾಹಕರ ವಿತರಣಾ ತಾಣ',
    directionsFromCurrentGps: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ GPS ಸ್ಥಳದಿಂದ ನಿರ್ದೇಶನಗಳು',
    openTurnByTurnMaps: 'Google Maps ನಲ್ಲಿ ನ್ಯಾವಿಗೇಷನ್ ತೆರೆಯಿರಿ',
    closeNavBtn: 'ನ್ಯಾವಿಗೇಷನ್ ಮುಚ್ಚಿ',

    newRequestAlertTitle: '🚨 ಹೊಸ ವಿತರಣಾ ವಿನಂತಿ!',
    newRequestAlertMsg: 'ಹೊಸ ವಿತರಣಾ ವಿನಂತಿ ಲಭ್ಯವಿದೆ!',
    viewRequestsBtn: 'ವಿನಂತಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    dismissBtn: 'ವಜಾಗೊಳಿಸಿ',
    loadingDashboard: 'ವಿತರಣಾ ಪಾಲುದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    loadingDashboardSub: 'ಲೈವ್ ಟ್ರಿಪ್‌ಗಳು ಮತ್ತು ಗಳಿಕೆಯ ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ',
    deliveryUnavailableTitle: 'ವಿತರಣೆ ಲಭ್ಯವಿಲ್ಲ',
    deliveryUnavailableMsg: 'ಈ ವಿತರಣಾ ವಿನಂತಿಯು ಇನ್ನು ಮುಂದೆ ಲಭ್ಯವಿಲ್ಲ.',
    okBtn: 'ಸರಿ',

    dashboardBtn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    deliveryPartnerMode: 'ಡೆಲಿವರಿ ಪಾರ್ಟ್ನರ್ ಕನ್ಸೋಲ್',
    deliveryPartnerBannerDesc: 'ಲೈವ್ ಟ್ರಿಪ್‌ಗಳು ಮತ್ತು ಗಳಿಕೆಗಾಗಿ ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    goToDashboard: 'ಡೆಲಿವರಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
  },

  ml: {
    goOffline: 'ഓഫ്‌ലൈനാകൂ',
    goAvailable: 'ലഭ്യമാകൂ',
    verified: 'പരിശോധിച്ചു',
    online: 'ഓൺ‌ലൈൻ',
    offline: 'ഓഫ്‌ലൈൻ',
    vehicleFallback: 'വാഹനം',
    registeredFallback: 'രജിസ്റ്റർ ചെയ്തത്',

    liveTripsTab: 'ലൈവ് ട്രിപ്പുകൾ',
    earningsTab: 'വരുമാനം',
    profileTab: 'പ്രൊഫൈൽ',

    gpsActiveZone: 'GPS സജീവം · നിങ്ങളുടെ സോണിൽ ലഭ്യമാണ്',
    gpsOfflinePrompt: 'ഓഫ്‌ലൈൻ · ട്രിപ്പുകൾ ലഭിക്കാൻ ലഭ്യമാകൂ',

    statusLabel: 'നില',
    availableStatus: 'ലഭ്യമാണ്',
    offlineStatus: 'ഓഫ്‌ലൈൻ',
    receivingTripsSub: 'ട്രിപ്പുകൾ സ്വീകരിക്കുന്നു',
    standbySub: 'സ്റ്റാൻഡ്‌ബൈ',
    newTripsLabel: 'പുതിയ ട്രിപ്പുകൾ',
    waitingSub: 'കാത്തിരിക്കുന്നു',
    completedLabel: 'പൂർത്തിയായി',
    tripsSub: 'ട്രിപ്പുകൾ',

    activeOrderInProgress: 'സജീവ ഓർഡർ പുരോഗമിക്കുന്നു',
    orderPrefix: 'ഓർഡർ #',
    storePickup: 'സ്റ്റോർ പിക്കപ്പ്',
    dropoffAddress: 'ഡെലിവറി വിലാസം',
    mapBtn: 'മാപ്പ്',
    actionStartNavStore: 'സ്റ്റോറിലേക്ക് നാവിഗേഷൻ ആരംഭിക്കുക',
    actionArrivedStore: 'ഞാൻ സ്റ്റോറിലെത്തി',
    actionConfirmPickup: 'പിക്കപ്പ് സ്ഥിരീകരിക്കുക',
    actionStartDelivery: 'ഡെലിവറി ആരംഭിക്കുക',
    actionMarkDelivered: 'ഡെലിവർ ചെയ്തതായി അടയാളപ്പെടുത്തുക',

    availableRequestsTitle: 'ലഭ്യമായ ഡെലിവറി അഭ്യർത്ഥനകൾ',
    noPendingRequestsTitle: 'തീർപ്പുകൽപ്പിക്കാത്ത അഭ്യർത്ഥനകളില്ല',
    nearbyStoreRequestsDesc: 'അടുത്തുള്ള സ്റ്റോർ അഭ്യർത്ഥനകൾ ഇവിടെ തത്സമയം ദൃശ്യമാകും.',
    goAvailableToReceiveDesc: 'അഭ്യർത്ഥനകൾ ലഭിക്കാൻ മുകളിൽ ലഭ്യമാകൂ തിരഞ്ഞെടുക്കുക.',
    pickupLabel: 'പിക്കപ്പ്',
    dropoffLabel: 'ഡ്രോപ്പ്-ഓഫ്',
    storeFallback: 'സ്റ്റോർ സ്ഥലം',
    acceptRequestBtn: 'അഭ്യർത്ഥന സ്വീകരിക്കുക',
    declineBtn: 'നിരസിക്കുക',
    currencyPrefix: '₹',
    kmUnit: 'കി.മീ',

    estimatedTotalEarnings: 'കണക്കാക്കിയ ആകെ വരുമാനം',
    avgPerVerifiedDelivery: 'സ്ഥിരീകരിച്ച ഡെലിവറിക്ക് ശരാശരി ₹120',
    payoutSummaryTitle: 'പേഔട്ട് സംഗ്രഹം',
    completedTripsLabel: 'പൂർത്തിയാക്കിയ ട്രിപ്പുകൾ',
    baseFareLabel: 'അടിസ്ഥാന നിരക്ക്',
    baseFareValue: '₹80.00 / ട്രിപ്പ്',
    distanceIncentiveLabel: 'ദൂര ഇൻസെന്റീവ്',
    distanceIncentiveValue: 'ശരാശരി ₹40.00',
    payoutFrequencyLabel: 'പേഔട്ട് ആവൃത്തി',
    weeklyDirectTransfer: 'പ്രതിവാര ബാങ്ക് ട്രാൻസ്ഫർ',

    editBtn: 'മാറ്റുക',
    vehicleTypeLabel: 'വാഹന തരം',
    vehicleNumberLabel: 'വാഹന നമ്പർ',
    partnerRatingLabel: 'പങ്കാളി റേറ്റിംഗ്',
    topRated: 'ടോപ്പ് റേറ്റഡ്',
    serviceAreaLabel: 'സേവന മേഖല',
    notSpecified: 'വ്യക്തമാക്കിയിട്ടില്ല',
    returnToStoreHomeBtn: 'സ്റ്റോർ / ഹോം പേജിലേക്ക് മടങ്ങുക',
    signOutPartnerAccountBtn: 'പങ്കാളി അക്കൗണ്ടിൽ നിന്ന് സൈൻ ഔട്ട് ചെയ്യുക',

    editPartnerProfileTitle: 'പങ്കാളി പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
    fullNameLabel: 'പൂർണ്ണ നാമം',
    fullNamePlaceholder: 'നിങ്ങളുടെ പൂർണ്ണ നാമം',
    mobileNumberLabel: 'മൊബൈൽ നമ്പർ',
    mobileNumberPlaceholder: '10 അക്ക മൊബൈൽ നമ്പർ',
    licensePlateLabel: 'വാഹന നമ്പർ പ്ലേറ്റ്',
    vehicleNumberPlaceholder: 'ഉദാ. TN 20 AQ 2004',
    serviceAreaPlaceholder: 'ഉദാ. ആർ.എസ് പുരം, കോയമ്പത്തൂർ',
    saveProfileBtn: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
    savingProfileBtn: 'സംരക്ഷിക്കുന്നു…',
    cancelBtn: 'റദ്ദാക്കുക',

    vehicleBike: 'ബൈക്ക്',
    vehicleScooter: 'സ്കൂട്ടർ',
    vehicleBicycle: 'സൈക്കിൾ',
    vehicleCar: 'കാർ',
    vehicleAuto: 'ഓട്ടോ',
    vehicleVan: 'വാൻ',

    liveGpsNavTitle: 'തത്സമയ GPS നാവിഗേഷൻ',
    storePickupLocation: 'സ്റ്റോർ പിക്കപ്പ് സ്ഥലം',
    customerDropoffDestination: 'ഉപഭോക്താവിന്റെ ലക്ഷ്യസ്ഥാനം',
    directionsFromCurrentGps: 'നിങ്ങളുടെ നിലവിലെ GPS ലൊക്കേഷനിൽ നിന്നുള്ള ദിശകൾ',
    openTurnByTurnMaps: 'Google Maps-ൽ നാവിഗേഷൻ തുറക്കുക',
    closeNavBtn: 'നാവിഗേഷൻ അടയ്ക്കുക',

    newRequestAlertTitle: '🚨 പുതിയ ഡെലിവറി അഭ്യർത്ഥന!',
    newRequestAlertMsg: 'പുതിയ ഡെലിവറി അഭ്യർത്ഥന ലഭ്യമാണ്!',
    viewRequestsBtn: 'അഭ്യർത്ഥനകൾ കാണുക',
    dismissBtn: 'ഒഴിവാക്കുക',
    loadingDashboard: 'ഡെലിവറി പങ്കാളി ഡാഷ്‌ബോർഡ് ലോഡ് ചെയ്യുന്നു…',
    loadingDashboardSub: 'ലൈവ് ട്രിപ്പുകളും വരുമാന ഡാറ്റയും ലോഡ് ചെയ്യുന്നു',
    deliveryUnavailableTitle: 'ഡെലിവറി ലഭ്യമല്ല',
    deliveryUnavailableMsg: 'ഈ ഡെലിവറി അഭ്യർത്ഥന ഇപ്പോൾ ലഭ്യമല്ല.',
    okBtn: 'ശരി',

    dashboardBtn: 'ഡാഷ്‌ബോർഡ്',
    deliveryPartnerMode: 'ഡെലിവറി പാർട്ണർ കൺസോൾ',
    deliveryPartnerBannerDesc: 'ലൈവ് ട്രിപ്പുകൾക്കും വരുമാനത്തിനും നിങ്ങളുടെ ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക',
    goToDashboard: 'ഡെലിവറി ഡാഷ്‌ബോർഡിലേക്ക് പോകുക',
  },
};

export function useDeliveryPartnerTranslations(): DeliveryPartnerTranslations {
  try {
    const { useTranslation } = require('./index');
    const { language } = useTranslation();
    return (
      deliveryPartnerTranslations[language as LanguageCode] ||
      deliveryPartnerTranslations.en
    );
  } catch {
    return deliveryPartnerTranslations.en;
  }
}
