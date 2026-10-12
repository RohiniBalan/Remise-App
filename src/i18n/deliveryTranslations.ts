import { LanguageCode } from './types';

export interface DeliveryTranslations {
  // Modal Header
  manageDeliveryTitle: string;
  orderPrefix: string;

  // Stage 1: Initial
  setupBadge: string;
  promptTitle: string;
  promptSub: string;
  yesHavePersonTitle: string;
  yesHavePersonSub: string;
  noHavePersonTitle: string;
  noHavePersonSub: string;

  // Stage 2: Has Person Form
  back: string;
  assignPersonTitle: string;
  assignPersonSub: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  instructionsLabel: string;
  instructionsPlaceholder: string;
  assignBtn: string;

  // Stage 3: No Person Options
  chooseOptionTitle: string;
  chooseOptionSub: string;
  requestRemisePartnerTitle: string;
  requestRemisePartnerSub: string;
  enableNetworkTitle: string;
  enableNetworkSub: string;
  selfArrangeBtn: string;

  // Stage 4: Network Enrolled Done
  networkEnabledTitle: string;
  networkEnabledSub: string;
  doneBtn: string;
  requestForOrderBtn: string;

  // Stage 5: Confirm Remise Request
  confirmRequestTitle: string;
  confirmRequestSub: string;
  orderIdLabel: string;
  dropAddressLabel: string;
  estDistanceLabel: string;
  estFeeLabel: string;
  confirmFindPartnerBtn: string;

  // Stage 6: Searching
  searchingTitle: string;
  searchingSub: string;
  statusLabel: string;
  searchingStatus: string;
  estFareLabel: string;
  fareFromDispatch: string;
  refreshStatus: string;
  close: string;

  // Stage 7: Accepted
  deliveryPartner: string;
  milestone: string;
  eta: string;
  call: string;
  milestoneProgress: string;
  deliveryPortal: string;
  share: string;

  // Stage 8: Unavailable
  unavailableTitle: string;
  unavailableSub: string;
  rerequestBtn: string;

  // Stage 9: Link Generated
  linkActiveTitle: string;
  linkActiveSub: string;
  shareLink: string;
  openPortal: string;
  currentMilestone: string;

  // Stage 10: Self Arranged
  selfArrangedTitle: string;
  selfArrangedSub: string;

  // Sharing & Messages
  shareMessage: string;
  failedGenerateLink: string;
  failedEnableNetwork: string;
  failedRequestPartner: string;
  failedUpdateStatus: string;

  // Live Tracking Screen
  liveTrackingTitle: string;
  liveBadge: string;
  loadingTracking: string;
  trackingUnavailable: string;
  couldNotLocateOrder: string;
  retry: string;
  modePrefix: string;
  remiseNetworkMode: string;
  storeDeliveryMode: string;
  partnerHeadingToStore: string;
  partnerOnTheWayDoorstep: string;
  liveGps: string;
  pickupStorePin: string;
  customerDoorstepPin: string;
  route: string;
  partnerStatusTitle: string;
  noDriverAssigned: string;
  broadcastingToDrivers: string;
  pendingAction: string;
  customerDropoffLocation: string;
  noAddressSpecified: string;
  callCustomer: string;
  directions: string;
  quickMilestoneOverride: string;
  milestoneTimelineTitle: string;
  noMilestonesYet: string;
  statusUpdatedBy: string;
  orderItemsTitle: string;
  totalRevenue: string;
  confirmDeliveryModalTitle: string;
  confirmDeliveryModalSub: string;
  cancel: string;
  verifyCompleteBtn: string;
  enterValid6DigitOtp: string;
  otpVerifiedSuccess: string;

  // Milestones
  statusPending: string;
  statusSearching: string;
  statusAssigned: string;
  statusAccepted: string;
  statusGoingToStore: string;
  statusArrivedAtStore: string;
  statusReady: string;
  statusPickedUp: string;
  statusOutForDelivery: string;
  statusDelivered: string;
  statusCancelled: string;
  statusUnavailable: string;
  statusRejected: string;
}

export const deliveryTranslations: Record<LanguageCode, DeliveryTranslations> = {
  en: {
    manageDeliveryTitle: 'Manage Delivery',
    orderPrefix: 'Order #',
    setupBadge: 'Delivery Flow Setup',
    promptTitle: 'Do you have your own delivery person?',
    promptSub: 'Select how this order will be delivered to the customer.',
    yesHavePersonTitle: 'YES, I have a delivery person',
    yesHavePersonSub: 'Assign to your staff and generate a delivery link.',
    noHavePersonTitle: "NO, I don't have one",
    noHavePersonSub: 'Request on-demand Remise Delivery Network partner.',

    back: 'Back',
    assignPersonTitle: 'Assign Store Delivery Person',
    assignPersonSub: 'Enter contact details to create a trackable delivery link.',
    nameLabel: 'Delivery Person Name *',
    namePlaceholder: 'e.g. Ramesh',
    phoneLabel: 'Mobile Number *',
    phonePlaceholder: 'e.g. 9876543210',
    instructionsLabel: 'Special Instructions',
    instructionsPlaceholder: 'e.g. Collect cash, call upon arrival',
    assignBtn: 'Assign & Generate Delivery Link',

    chooseOptionTitle: 'Choose a Delivery Option',
    chooseOptionSub: 'Request an on-demand verified partner or manage fulfillment yourself.',
    requestRemisePartnerTitle: 'Request Remise Partner',
    requestRemisePartnerSub: 'Nearby verified driver will arrive in ~15 mins.',
    enableNetworkTitle: 'Enable Network for Store',
    enableNetworkSub: 'One-time store enrollment for on-demand dispatch.',
    selfArrangeBtn: 'I will arrange delivery myself',

    networkEnabledTitle: 'Remise Delivery Network Enabled',
    networkEnabledSub: 'Your store is now enabled for on-demand delivery partner dispatch.',
    doneBtn: 'Done',
    requestForOrderBtn: 'Request for Order',

    confirmRequestTitle: 'Confirm Remise Delivery Request',
    confirmRequestSub: 'A nearby delivery partner will be dispatched to your store.',
    orderIdLabel: 'Order ID:',
    dropAddressLabel: 'Drop Address:',
    estDistanceLabel: 'Est. Distance:',
    estFeeLabel: 'Estimated Delivery Fee:',
    confirmFindPartnerBtn: 'Confirm & Find Delivery Partner',

    searchingTitle: 'Searching for a delivery partner...',
    searchingSub: "We're notifying nearby available Remise delivery partners.",
    statusLabel: 'Status:',
    searchingStatus: 'Searching for delivery partner',
    estFareLabel: 'Est. Fare:',
    fareFromDispatch: 'Fare & distance from dispatch',
    refreshStatus: 'Refresh Status',
    close: 'Close',

    deliveryPartner: 'Delivery Partner',
    milestone: 'Milestone:',
    eta: 'ETA:',
    call: 'Call',
    milestoneProgress: 'Milestone Progress',
    deliveryPortal: 'Delivery Portal',
    share: 'Share',

    unavailableTitle: 'Delivery Partner Unavailable',
    unavailableSub: 'No nearby Remise delivery partner accepted the request. You can retry finding a partner or assign your store delivery staff.',
    rerequestBtn: 'Re-request Remise Delivery',

    linkActiveTitle: 'Store Delivery Link Active',
    linkActiveSub: 'Share this link with your delivery person to view location and update milestones.',
    shareLink: 'Share Link',
    openPortal: 'Open Portal',
    currentMilestone: 'Current Milestone:',

    selfArrangedTitle: 'Self-Arranged Delivery',
    selfArrangedSub: 'Update the delivery milestone directly below:',

    shareMessage: 'Hello, here is your delivery link for Order #{{orderId}}:\n{{url}}\n\nPlease tap to view customer details and update delivery milestones.',
    failedGenerateLink: 'Failed to generate delivery link',
    failedEnableNetwork: 'Failed to enable delivery network',
    failedRequestPartner: 'Failed to request delivery partner',
    failedUpdateStatus: 'Failed to update status',

    liveTrackingTitle: 'Store Live Tracking',
    liveBadge: 'LIVE',
    loadingTracking: 'Loading Live Tracking…',
    trackingUnavailable: 'Tracking Unavailable',
    couldNotLocateOrder: 'Could not locate this order.',
    retry: 'Retry',
    modePrefix: 'Mode:',
    remiseNetworkMode: 'Remise Network',
    storeDeliveryMode: 'Store Delivery',
    partnerHeadingToStore: 'Heading to Store',
    partnerOnTheWayDoorstep: 'On the Way to Doorstep',
    liveGps: 'LIVE GPS',
    pickupStorePin: 'Pickup Store',
    customerDoorstepPin: 'Your Doorstep',
    route: 'Route',
    partnerStatusTitle: 'Delivery Partner Status',
    noDriverAssigned: 'No driver assigned yet',
    broadcastingToDrivers: 'Broadcasting to drivers…',
    pendingAction: 'Pending Action',
    customerDropoffLocation: 'Customer Drop-off Location',
    noAddressSpecified: 'No address specified',
    callCustomer: 'Call',
    directions: 'Directions',
    quickMilestoneOverride: 'Quick Milestone Override',
    milestoneTimelineTitle: 'Delivery Milestone Timeline',
    noMilestonesYet: 'No milestone events recorded yet.',
    statusUpdatedBy: 'Status updated by {{updater}}',
    orderItemsTitle: 'Order Items',
    totalRevenue: 'Total Revenue:',
    confirmDeliveryModalTitle: 'Confirm Delivery',
    confirmDeliveryModalSub: "Enter customer's 6-digit OTP received via WhatsApp to confirm handover",
    cancel: 'Cancel',
    verifyCompleteBtn: 'Verify & Complete',
    enterValid6DigitOtp: 'Please enter a valid 6-digit OTP',
    otpVerifiedSuccess: 'Order OTP verified! Marked as Delivered.',

    statusPending: 'Pending',
    statusSearching: 'Searching',
    statusAssigned: 'Assigned',
    statusAccepted: 'Accepted',
    statusGoingToStore: 'Heading to Store',
    statusArrivedAtStore: 'Arrived at Store',
    statusReady: 'Ready',
    statusPickedUp: 'Picked Up',
    statusOutForDelivery: 'Out for Delivery',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',
    statusUnavailable: 'Unavailable',
    statusRejected: 'Rejected',
  },

  ta: {
    manageDeliveryTitle: 'டெலிவரியை நிர்வகி',
    orderPrefix: 'ஆர்டர் #',
    setupBadge: 'டெலிவரி அமைவு',
    promptTitle: 'உங்களிடம் சொந்த டெலிவரி நபர் உள்ளாரா?',
    promptSub: 'இந்த ஆர்டர் வாடிக்கையாளருக்கு எவ்வாறு டெலிவரி செய்யப்படும் என்பதைத் தேர்ந்தெடுக்கவும்.',
    yesHavePersonTitle: 'ஆம், என்னிடம் டெலிவரி நபர் உள்ளார்',
    yesHavePersonSub: 'உங்கள் ஊழியருக்கு ஒதுக்கி டெலிவரி இணைப்பை உருவாக்கவும்.',
    noHavePersonTitle: 'இல்லை, என்னிடம் யாரும் இல்லை',
    noHavePersonSub: 'ரெமிஸ் டெலிவரி நெட்வொர்க் பார்ட்னரைக் கோரவும்.',

    back: 'பின்செல்',
    assignPersonTitle: 'ஸ்டோர் டெலிவரி நபரை ஒதுக்கு',
    assignPersonSub: 'கண்காணிக்கக்கூடிய டெலிவரி இணைப்பை உருவாக்க தொடர்பு விவரங்களை உள்ளிடவும்.',
    nameLabel: 'டெலிவரி நபர் பெயர் *',
    namePlaceholder: 'எ.கா. ரமேஷ்',
    phoneLabel: 'மொபைல் எண் *',
    phonePlaceholder: 'எ.கா. 9876543210',
    instructionsLabel: 'சிறப்பு வழிமுறைகள்',
    instructionsPlaceholder: 'எ.கா. ரொக்கம் வசூலிக்கவும், வந்ததும் அழைக்கவும்',
    assignBtn: 'ஒதுக்கி டெலிவரி இணைப்பை உருவாக்கு',

    chooseOptionTitle: 'டெலிவரி விருப்பத்தைத் தேர்ந்தெடுக்கவும்',
    chooseOptionSub: 'தேவைக்கேற்ப சரிபார்க்கப்பட்ட பார்ட்னரைக் கோரவும் அல்லது நீங்களே நிறைவேற்றவும்.',
    requestRemisePartnerTitle: 'ரெமிஸ் பார்ட்னரைக் கோரவும்',
    requestRemisePartnerSub: 'அருகிலுள்ள சரிபார்க்கப்பட்ட ஓட்டுநர் ~15 நிமிடங்களில் வருவார்.',
    enableNetworkTitle: 'ஸ்டோருக்கு நெட்வொர்க்கை இயக்கு',
    enableNetworkSub: 'விரைவான டெலிவரிக்கான ஒரு முறை ஸ்டோர் பதிவு.',
    selfArrangeBtn: 'நானே டெலிவரி ஏற்பாடு செய்வேன்',

    networkEnabledTitle: 'ரெமிஸ் டெலிவரி நெட்வொர்க் இயக்கப்பட்டது',
    networkEnabledSub: 'உங்கள் ஸ்டோர் இப்போது தேவைக்கேற்ப டெலிவரி பார்ட்னரை அனுப்ப இயக்கப்பட்டுள்ளது.',
    doneBtn: 'முடிந்தது',
    requestForOrderBtn: 'ஆர்டருக்கு பார்ட்னரைக் கோரு',

    confirmRequestTitle: 'ரெமிஸ் டெலிவரி கோரிக்கையை உறுதிப்படுத்து',
    confirmRequestSub: 'அருகிலுள்ள டெலிவரி பார்ட்னர் உங்கள் கடைக்கு அனுப்பப்படுவார்.',
    orderIdLabel: 'ஆர்டர் ஐடி:',
    dropAddressLabel: 'டெலிவரி முகவரி:',
    estDistanceLabel: 'மதிப்பிடப்பட்ட தூரம்:',
    estFeeLabel: 'மதிப்பிடப்பட்ட டெலிவரி கட்டணம்:',
    confirmFindPartnerBtn: 'உறுதிசெய்து பார்ட்னரைக் கண்டுபிடி',

    searchingTitle: 'டெலிவரி பார்ட்னரைத் தேடுகிறது...',
    searchingSub: 'அருகிலுள்ள ரெமிஸ் டெலிவரி பார்ட்னர்களுக்கு அறிவிக்கிறோம்.',
    statusLabel: 'நிலை:',
    searchingStatus: 'டெலிவரி பார்ட்னர் தேடப்படுகிறது',
    estFareLabel: 'மதிப்பிடப்பட்ட கட்டணம்:',
    fareFromDispatch: 'அனுப்புமிட தூரம் & கட்டணம்',
    refreshStatus: 'நிலையைப் புதுப்பி',
    close: 'மூடு',

    deliveryPartner: 'டெலிவரி பார்ட்னர்',
    milestone: 'மைல்கல்:',
    eta: 'வருகை நேரம்:',
    call: 'அழை',
    milestoneProgress: 'மைல்கல் முன்னேற்றம்',
    deliveryPortal: 'டெலிவரி போர்டல்',
    share: 'பகிர்',

    unavailableTitle: 'டெலிவரி பார்ட்னர் கிடைக்கவில்லை',
    unavailableSub: 'அருகிலுள்ள ரெமிஸ் பார்ட்னர் யாரும் கோரிக்கையை ஏற்கவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது உங்கள் ஊழியரை ஒதுக்கவும்.',
    rerequestBtn: 'மீண்டும் ரெமிஸ் டெலிவரியைக் கோரு',

    linkActiveTitle: 'ஸ்டோர் டெலிவரி இணைப்பு செயலில் உள்ளது',
    linkActiveSub: 'இருப்பிடத்தைப் பார்க்கவும் நிலைகளைப் புதுப்பிக்கவும் இந்த இணைப்பை உங்கள் டெலிவரி நபருடன் பகிரவும்.',
    shareLink: 'இணைப்பைப் பகிர்',
    openPortal: 'போர்ட்டலைத் திற',
    currentMilestone: 'தற்போதைய மைல்கல்:',

    selfArrangedTitle: 'சுயமாக ஏற்பாடு செய்த டெலிவரி',
    selfArrangedSub: 'கீழே நேரடியாக டெலிவரி மைல்கல்லைப் புதுப்பிக்கவும்:',

    shareMessage: 'வணக்கம், ஆர்டர் #{{orderId}} க்கான உங்கள் டெலிவரி இணைப்பு இதோ:\n{{url}}\n\nவாடிக்கையாளர் விவரங்களைப் பார்க்கவும் டெலிவரி நிலைகளைப் புதுப்பிக்கவும் தட்டவும்.',
    failedGenerateLink: 'டெலிவரி இணைப்பை உருவாக்க முடியவில்லை',
    failedEnableNetwork: 'டெலிவரி நெட்வொர்க்கை இயக்க முடியவில்லை',
    failedRequestPartner: 'டெலிவரி பார்ட்னரைக் கோர முடியவில்லை',
    failedUpdateStatus: 'நிலையைப் புதுப்பிக்க முடியவில்லை',

    liveTrackingTitle: 'ஸ்டோர் நேரடி கண்காணிப்பு',
    liveBadge: 'நேரலை',
    loadingTracking: 'நேரடி கண்காணிப்பு ஏற்றப்படுகிறது…',
    trackingUnavailable: 'கண்காணிப்பு கிடைக்கவில்லை',
    couldNotLocateOrder: 'இந்த ஆர்டரைக் கண்டுபிடிக்க முடியவில்லை.',
    retry: 'மீண்டும் முயற்சி',
    modePrefix: 'முறை:',
    remiseNetworkMode: 'ரெமிஸ் நெட்வொர்க்',
    storeDeliveryMode: 'ஸ்டோர் டெலிவரி',
    partnerHeadingToStore: 'ஸ்டோருக்கு செல்கிறார்',
    partnerOnTheWayDoorstep: 'வாடிக்கையாளர் இடத்திற்கு வழியில்',
    liveGps: 'நேரடி ஜிபிஎஸ்',
    pickupStorePin: 'பிக்கப் ஸ்டோர்',
    customerDoorstepPin: 'வாடிக்கையாளர் இடம்',
    route: 'பாதை',
    partnerStatusTitle: 'டெலிவரி பார்ட்னர் நிலை',
    noDriverAssigned: 'இன்னும் ஓட்டுநர் ஒதுக்கப்படவில்லை',
    broadcastingToDrivers: 'டெலிவரி பார்ட்னர்களுக்கு அறிவிக்கப்படுகிறது…',
    pendingAction: 'நடவடிக்கை நிலுவையில் உள்ளது',
    customerDropoffLocation: 'வாடிக்கையாளர் டெலிவரி இடம்',
    noAddressSpecified: 'முகவரி குறிப்பிடப்படவில்லை',
    callCustomer: 'அழை',
    directions: 'திசைகள்',
    quickMilestoneOverride: 'டெலிவரி நிலையை விரைவாக மாற்று',
    milestoneTimelineTitle: 'டெலிவரி மைல்கல் காலவரிசை',
    noMilestonesYet: 'மைல்கல் நிகழ்வுகள் இன்னும் பதிவு செய்யப்படவில்லை.',
    statusUpdatedBy: 'நிலை மாற்றியவர்: {{updater}}',
    orderItemsTitle: 'ஆர்டர் பொருட்கள்',
    totalRevenue: 'மொத்த வருவாய்:',
    confirmDeliveryModalTitle: 'டெலிவரியை உறுதிப்படுத்து',
    confirmDeliveryModalSub: 'ஒப்படைப்பை உறுதிப்படுத்த வாடிக்கையாளரின் 6-இலக்க வாட்ஸ்அப் OTP-ஐ உள்ளிடவும்',
    cancel: 'ரத்துசெய்',
    verifyCompleteBtn: 'சரிபார்த்து முடி',
    enterValid6DigitOtp: 'சரியான 6-இலக்க OTP-ஐ உள்ளிடவும்',
    otpVerifiedSuccess: 'ஆர்டர் OTP சரிபார்க்கப்பட்டது! டெலிவரி செய்யப்பட்டது.',

    statusPending: 'நிலுவையில்',
    statusSearching: 'தேடப்படுகிறது',
    statusAssigned: 'ஒதுக்கப்பட்டது',
    statusAccepted: 'ஏற்கப்பட்டது',
    statusGoingToStore: 'ஸ்டோருக்கு செல்கிறார்',
    statusArrivedAtStore: 'ஸ்டோருக்கு வந்துவிட்டார்',
    statusReady: 'தயார்',
    statusPickedUp: 'எடுக்கப்பட்டது',
    statusOutForDelivery: 'விநியோகத்தில் உள்ளது',
    statusDelivered: 'டெலிவரி செய்யப்பட்டது',
    statusCancelled: 'ரத்து செய்யப்பட்டது',
    statusUnavailable: 'கிடைக்கவில்லை',
    statusRejected: 'நிராகரிக்கப்பட்டது',
  },

  hi: {
    manageDeliveryTitle: 'डिलीवरी प्रबंधित करें',
    orderPrefix: 'ऑर्डर #',
    setupBadge: 'डिलीवरी सेटअप',
    promptTitle: 'क्या आपके पास अपना डिलीवरी व्यक्ति है?',
    promptSub: 'चुनें कि यह ऑर्डर ग्राहक तक कैसे पहुंचाया जाएगा।',
    yesHavePersonTitle: 'हाँ, मेरे पास डिलीवरी व्यक्ति है',
    yesHavePersonSub: 'अपने कर्मचारी को सौंपें और डिलीवरी लिंक बनाएं।',
    noHavePersonTitle: 'नहीं, मेरे पास कोई नहीं है',
    noHavePersonSub: 'रेमिस डिलीवरी नेटवर्क पार्टनर का अनुरोध करें।',

    back: 'पीछे',
    assignPersonTitle: 'स्टोर डिलीवरी व्यक्ति सौंपें',
    assignPersonSub: 'ट्रैक करने योग्य डिलीवरी लिंक बनाने के लिए संपर्क विवरण दर्ज करें।',
    nameLabel: 'डिलीवरी व्यक्ति का नाम *',
    namePlaceholder: 'उदा. रमेश',
    phoneLabel: 'मोबाइल नंबर *',
    phonePlaceholder: 'उदा. 9876543210',
    instructionsLabel: 'विशेष निर्देश',
    instructionsPlaceholder: 'उदा. नकद लें, पहुंचने पर कॉल करें',
    assignBtn: 'सौंपें और डिलीवरी लिंक बनाएं',

    chooseOptionTitle: 'डिलीवरी विकल्प चुनें',
    chooseOptionSub: 'सत्यापित पार्टनर का अनुरोध करें या स्वयं प्रबंधित करें।',
    requestRemisePartnerTitle: 'रेमिस पार्टनर का अनुरोध करें',
    requestRemisePartnerSub: 'नजदीकी सत्यापित ड्राइवर ~15 मिनट में पहुंचेगा।',
    enableNetworkTitle: 'स्टोर के लिए नेटवर्क सक्षम करें',
    enableNetworkSub: 'ऑन-डिमांड डिस्पैच के लिए एक बार स्टोर नामांकन।',
    selfArrangeBtn: 'मैं स्वयं डिलीवरी की व्यवस्था करूंगा',

    networkEnabledTitle: 'रेमिस डिलीवरी नेटवर्क सक्षम',
    networkEnabledSub: 'आपका स्टोर अब ऑन-डिमांड डिलीवरी पार्टनर के लिए सक्षम है।',
    doneBtn: 'पूर्ण',
    requestForOrderBtn: 'ऑर्डर के लिए पार्टनर का अनुरोध करें',

    confirmRequestTitle: 'रेमिस डिलीवरी अनुरोध की पुष्टि करें',
    confirmRequestSub: 'आपके स्टोर पर नजदीकी डिलीवरी पार्टनर भेजा जाएगा।',
    orderIdLabel: 'ऑर्डर आईडी:',
    dropAddressLabel: 'डिलीवरी पता:',
    estDistanceLabel: 'अनुमानित दूरी:',
    estFeeLabel: 'अनुमानित डिलीवरी शुल्क:',
    confirmFindPartnerBtn: 'पुष्टि करें और पार्टनर खोजें',

    searchingTitle: 'डिलीवरी पार्टनर की तलाश की जा रही है...',
    searchingSub: 'हम नजदीकी उपलब्ध रेमिस डिलीवरी पार्टनर्स को सूचित कर रहे हैं।',
    statusLabel: 'स्थिति:',
    searchingStatus: 'डिलीवरी पार्टनर खोजा जा रहा है',
    estFareLabel: 'अनुमानित किराया:',
    fareFromDispatch: 'डिस्पैच से दूरी व किराया',
    refreshStatus: 'स्थिति ताज़ा करें',
    close: 'बंद करें',

    deliveryPartner: 'डिलीवरी पार्टनर',
    milestone: 'माइलस्टोन:',
    eta: 'पहुंचने का समय:',
    call: 'कॉल करें',
    milestoneProgress: 'माइलस्टोन प्रगति',
    deliveryPortal: 'डिलीवरी पोर्टल',
    share: 'साझा करें',

    unavailableTitle: 'डिलीवरी पार्टनर अनुपलब्ध',
    unavailableSub: 'किसी भी नजदीकी रेमिस पार्टनर ने अनुरोध स्वीकार नहीं किया। पुन: प्रयास करें या अपना स्टाफ नियुक्त करें।',
    rerequestBtn: 'पुन: रेमिस डिलीवरी का अनुरोध करें',

    linkActiveTitle: 'स्टोर डिलीवरी लिंक सक्रिय',
    linkActiveSub: 'स्थान देखने और स्थिति अपडेट करने के लिए इस लिंक को अपने डिलीवरी व्यक्ति के साथ साझा करें।',
    shareLink: 'लिंक साझा करें',
    openPortal: 'पोर्टल खोलें',
    currentMilestone: 'वर्तमान माइलस्टोन:',

    selfArrangedTitle: 'स्व-व्यवस्थित डिलीवरी',
    selfArrangedSub: 'नीचे सीधे डिलीवरी माइलस्टोन अपडेट करें:',

    shareMessage: 'नमस्ते, ऑर्डर #{{orderId}} के लिए आपका डिलीवरी लिंक यह है:\n{{url}}\n\nग्राहक विवरण देखने और स्थिति अपडेट करने के लिए टैप करें।',
    failedGenerateLink: 'डिलीवरी लिंक बनाने में विफल',
    failedEnableNetwork: 'डिलीवरी नेटवर्क सक्षम करने में विफल',
    failedRequestPartner: 'डिलीवरी पार्टनर का अनुरोध करने में विफल',
    failedUpdateStatus: 'स्थिति अपडेट करने में विफल',

    liveTrackingTitle: 'स्टोर लाइव ट्रैकिंग',
    liveBadge: 'लाइव',
    loadingTracking: 'लाइव ट्रैकिंग लोड हो रही है…',
    trackingUnavailable: 'ट्रैकिंग अनुपलब्ध',
    couldNotLocateOrder: 'यह ऑर्डर नहीं मिला।',
    retry: 'पुनः प्रयास करें',
    modePrefix: 'मोड:',
    remiseNetworkMode: 'रेमिस नेटवर्क',
    storeDeliveryMode: 'स्टोर डिलीवरी',
    partnerHeadingToStore: 'स्टोर की ओर जा रहे हैं',
    partnerOnTheWayDoorstep: 'ग्राहक के पते पर जा रहे हैं',
    liveGps: 'लाइव जीपीएस',
    pickupStorePin: 'पिकअप स्टोर',
    customerDoorstepPin: 'ग्राहक का पता',
    route: 'मार्ग',
    partnerStatusTitle: 'डिलीवरी पार्टनर स्थिति',
    noDriverAssigned: 'अभी तक कोई ड्राइवर नियुक्त नहीं',
    broadcastingToDrivers: 'ड्राइवरों को सूचित किया जा रहा है…',
    pendingAction: 'कार्रवाई लंबित',
    customerDropoffLocation: 'ग्राहक का डिलीवरी स्थान',
    noAddressSpecified: 'कोई पता निर्दिष्ट नहीं',
    callCustomer: 'कॉल करें',
    directions: 'दिशा-निर्देश',
    quickMilestoneOverride: 'त्वरित माइलस्टोन बदलें',
    milestoneTimelineTitle: 'डिलीवरी माइलस्टोन टाइमलाइन',
    noMilestonesYet: 'अभी तक कोई माइलस्टोन दर्ज नहीं हुआ।',
    statusUpdatedBy: 'स्थिति अपडेट की गई: {{updater}}',
    orderItemsTitle: 'ऑर्डर आइटम',
    totalRevenue: 'कुल राजस्व:',
    confirmDeliveryModalTitle: 'डिलीवरी की पुष्टि करें',
    confirmDeliveryModalSub: 'हैंडओवर की पुष्टि के लिए ग्राहक का 6-अंकीय व्हाट्सएप ओटीपी दर्ज करें',
    cancel: 'रद्द करें',
    verifyCompleteBtn: 'सत्यापित करें और पूर्ण करें',
    enterValid6DigitOtp: 'कृपया मान्य 6-अंकीय ओटीपी दर्ज करें',
    otpVerifiedSuccess: 'ऑर्डर ओटीपी सत्यापित! डिलीवर किया गया।',

    statusPending: 'लंबित',
    statusSearching: 'खोज जारी',
    statusAssigned: 'सौंपा गया',
    statusAccepted: 'स्वीकृत',
    statusGoingToStore: 'स्टोर जा रहे हैं',
    statusArrivedAtStore: 'स्टोर पहुंच गए',
    statusReady: 'तैयार',
    statusPickedUp: 'पिकअप किया',
    statusOutForDelivery: 'डिलीवरी के लिए निकला',
    statusDelivered: 'डिलीवर किया गया',
    statusCancelled: 'रद्द किया गया',
    statusUnavailable: 'अनुपलब्ध',
    statusRejected: 'अस्वीकृत',
  },

  te: {
    manageDeliveryTitle: 'డెలివరీని నిర్వహించండి',
    orderPrefix: 'ఆర్డర్ #',
    setupBadge: 'డెలివరీ సెటప్',
    promptTitle: 'మీకు స్వంత డెలివరీ వ్యక్తి ఉన్నారా?',
    promptSub: 'ఈ ఆర్డర్ కస్టమర్‌కు ఎలా డెలివరీ చేయబడుతుందో ఎంచుకోండి.',
    yesHavePersonTitle: 'అవును, నాకు డెలివరీ వ్యక్తి ఉన్నారు',
    yesHavePersonSub: 'మీ సిబ్బందికి కేటాయించి డెలివరీ లింక్‌ను రూపొందించండి.',
    noHavePersonTitle: 'లేదు, నా దగ్గర ఎవరూ లేరు',
    noHavePersonSub: 'రెమిస్ డెలివరీ నెట్‌వర్క్ భాగస్వామిని అభ్యర్థించండి.',

    back: 'వెనుకకు',
    assignPersonTitle: 'స్టోర్ డెలివరీ వ్యక్తిని కేటాయించండి',
    assignPersonSub: 'ట్రాక్ చేయగల డెలివరీ లింక్ కోసం సంప్రదింపు వివరాలను నమోదు చేయండి.',
    nameLabel: 'డెలివరీ వ్యక్తి పేరు *',
    namePlaceholder: 'ఉదా. రమేష్',
    phoneLabel: 'మొబైల్ నంబర్ *',
    phonePlaceholder: 'ఉదా. 9876543210',
    instructionsLabel: 'ప్రత్యేక సూచనలు',
    instructionsPlaceholder: 'ఉదా. నగదు స్వీకరించండి, వచ్చినప్పుడు కాల్ చేయండి',
    assignBtn: 'కేటాయించి డెలివరీ లింక్ రూపొందించండి',

    chooseOptionTitle: 'డెలివరీ ఎంపికను ఎంచుకోండి',
    chooseOptionSub: 'ధృవీకరించబడిన భాగస్వామిని అభ్యర్థించండి లేదా మీరే నిర్వహించండి.',
    requestRemisePartnerTitle: 'రెమిస్ భాగస్వామిని అభ్యర్థించండి',
    requestRemisePartnerSub: 'సమీప డ్రైవర్ ~15 నిమిషాల్లో చేరుకుంటారు.',
    enableNetworkTitle: 'స్టోర్ కోసం నెట్‌వర్క్ ప్రారంభించండి',
    enableNetworkSub: 'ఆన్-డిమాండ్ డిస్పాచ్ కోసం ఒకసారి స్టోర్ నమోదు.',
    selfArrangeBtn: 'నేనే డెలివరీ ఏర్పాట్లు చేస్తాను',

    networkEnabledTitle: 'రెమిస్ డెలివరీ నెట్‌వర్క్ ప్రారంభించబడింది',
    networkEnabledSub: 'మీ స్టోర్ ఇప్పుడు ఆన్-డిమాండ్ డెలివరీ భాగస్వామి డిస్పాచ్ కోసం ప్రారంభించబడింది.',
    doneBtn: 'పూర్తయింది',
    requestForOrderBtn: 'ఆర్డర్ కోసం భాగస్వామిని అభ్యర్థించండి',

    confirmRequestTitle: 'రెమిస్ డెలివరీ అభ్యర్థనను నిర్ధారించండి',
    confirmRequestSub: 'మీ స్టోర్‌కు సమీప డెలివరీ భాగస్వామి పంపబడతారు.',
    orderIdLabel: 'ఆర్డర్ ఐడి:',
    dropAddressLabel: 'డెలివరీ చిరునామా:',
    estDistanceLabel: 'అంచనా వేసిన దూరం:',
    estFeeLabel: 'అంచనా వేసిన డెలివరీ రుసుము:',
    confirmFindPartnerBtn: 'నిర్ధారించి భాగస్వామిని కనుగొనండి',

    searchingTitle: 'డెలివరీ భాగస్వామి కోసం శోధిస్తోంది...',
    searchingSub: 'మేము సమీపంలోని అందుబాటులో ఉన్న రెమిస్ భాగస్వాములకు తెలియజేస్తున్నాము.',
    statusLabel: 'స్థితి:',
    searchingStatus: 'డెలివరీ భాగస్వామి కోసం శోధిస్తోంది',
    estFareLabel: 'అంచనా వేసిన ఛార్జీ:',
    fareFromDispatch: 'డిస్పాచ్ దూరం & ఛార్జీ',
    refreshStatus: 'స్థితిని రిఫ్రెష్ చేయండి',
    close: 'మూసివేయి',

    deliveryPartner: 'డెలివరీ భాగస్వామి',
    milestone: 'మైలురాయి:',
    eta: 'చేరుకునే సమయం:',
    call: 'కాల్ చేయండి',
    milestoneProgress: 'మైలురాయి పురోగతి',
    deliveryPortal: 'డెలివరీ పోర్టల్',
    share: 'భాగస్వామ్యం చేయండి',

    unavailableTitle: 'డెలివరీ భాగస్వామి అందుబాటులో లేరు',
    unavailableSub: 'సమీపంలోని రెమిస్ భాగస్వామి ఎవరూ అంగీకరించలేదు. మళ్లీ ప్రయత్నించండి లేదా మీ స్వంత సిబ్బందిని కేటాయించండి.',
    rerequestBtn: 'మళ్లీ రెమిస్ డెలివరీని అభ్యర్థించండి',

    linkActiveTitle: 'స్టోర్ డెలివరీ లింక్ సక్రియంగా ఉంది',
    linkActiveSub: 'స్థానాన్ని వీక్షించడానికి మరియు మైలురాళ్లను నవీకరించడానికి మీ డెలివరీ వ్యక్తితో ఈ లింక్‌ను భాగస్వామ్యం చేయండి.',
    shareLink: 'లింక్ భాగస్వామ్యం చేయండి',
    openPortal: 'పోర్టల్ తెరవండి',
    currentMilestone: 'ప్రస్తుత మైలురాయి:',

    selfArrangedTitle: 'స్వయంగా ఏర్పాటు చేసిన డెలివరీ',
    selfArrangedSub: 'క్రింద నేరుగా డెలివరీ మైలురాయిని నవీకరించండి:',

    shareMessage: 'నమస్కారం, ఆర్డర్ #{{orderId}} కోసం మీ డెలివరీ లింక్ ఇక్కడ ఉంది:\n{{url}}\n\nకస్టమర్ వివరాలను చూడటానికి మరియు స్థితిని నవీకరించడానికి నొక్కండి.',
    failedGenerateLink: 'డెలివరీ లింక్ రూపొందించడంలో విఫలమైంది',
    failedEnableNetwork: 'డెలివరీ నెట్‌వర్క్ ప్రారంభించడంలో విఫలమైంది',
    failedRequestPartner: 'డెలివరీ భాగస్వామిని అభ్యర్థించడంలో విఫలమైంది',
    failedUpdateStatus: 'స్థితిని నవీకరించడంలో విఫలమైంది',

    liveTrackingTitle: 'స్టోర్ లైవ్ ట్రాకింగ్',
    liveBadge: 'లైవ్',
    loadingTracking: 'లైవ్ ట్రాకింగ్ లోడ్ అవుతోంది…',
    trackingUnavailable: 'ట్రాకింగ్ అందుబాటులో లేదు',
    couldNotLocateOrder: 'ఈ ఆర్డర్ కనుగొనబడలేదు.',
    retry: 'మళ్లీ ప్రయత్నించండి',
    modePrefix: 'మోడ్:',
    remiseNetworkMode: 'రెమిస్ నెట్‌వర్క్',
    storeDeliveryMode: 'స్టోర్ డెలివరీ',
    partnerHeadingToStore: 'స్టోర్‌కు వెళ్తున్నారు',
    partnerOnTheWayDoorstep: 'కస్టమర్ వద్దకు వెళ్తున్నారు',
    liveGps: 'లైవ్ జీపీఎస్',
    pickupStorePin: 'పికప్ స్టోర్',
    customerDoorstepPin: 'కస్టమర్ చిరునామా',
    route: 'మార్గం',
    partnerStatusTitle: 'డెలివరీ భాగస్వామి స్థితి',
    noDriverAssigned: 'ఇంకా డ్రైవర్ కేటాయించబడలేదు',
    broadcastingToDrivers: 'డ్రైవర్లకు తెలియజేయబడుతోంది…',
    pendingAction: 'చర్య పెండింగ్‌లో ఉంది',
    customerDropoffLocation: 'కస్టమర్ డెలివరీ స్థానం',
    noAddressSpecified: 'చిరునామా పేర్కొనబడలేదు',
    callCustomer: 'కాల్ చేయండి',
    directions: 'దిశలు',
    quickMilestoneOverride: 'మైలురాయిని త్వరగా మార్చండి',
    milestoneTimelineTitle: 'డెలివరీ మైలురాయి కాలక్రమం',
    noMilestonesYet: 'ఇంకా మైలురాయి నమోదు కాలేదు.',
    statusUpdatedBy: 'స్థితి నవీకరించినవారు: {{updater}}',
    orderItemsTitle: 'ఆర్డర్ అంశాలు',
    totalRevenue: 'మొత్తం ఆదాయం:',
    confirmDeliveryModalTitle: 'డెలివరీని నిర్ధారించండి',
    confirmDeliveryModalSub: 'హ్యాండోవర్‌ను నిర్ధారించడానికి కస్టమర్ యొక్క 6-అంకెల వాట్సాప్ OTP నమోదు చేయండి',
    cancel: 'రద్దు చేయి',
    verifyCompleteBtn: 'ధృవీకరించి పూర్తి చేయండి',
    enterValid6DigitOtp: 'దయచేసి సరైన 6-అంకెల OTP నమోదు చేయండి',
    otpVerifiedSuccess: 'ఆర్డర్ OTP ధృవీకరించబడింది! డెలివరీ చేయబడింది.',

    statusPending: 'పెండింగ్',
    statusSearching: 'శోధిస్తోంది',
    statusAssigned: 'కేటాయించబడింది',
    statusAccepted: 'అంగీకరించబడింది',
    statusGoingToStore: 'స్టోర్‌కు వెళ్తున్నారు',
    statusArrivedAtStore: 'స్టోర్‌కు చేరుకున్నారు',
    statusReady: 'సిద్ధం',
    statusPickedUp: 'పికప్ చేశారు',
    statusOutForDelivery: 'డెలివరీ కోసం బయలుదేరారు',
    statusDelivered: 'డెలివరీ చేయబడింది',
    statusCancelled: 'రద్దు చేయబడింది',
    statusUnavailable: 'అందుబాటులో లేదు',
    statusRejected: 'తిరస్కరించబడింది',
  },

  kn: {
    manageDeliveryTitle: 'ವಿತರಣೆಯನ್ನು ನಿರ್ವಹಿಸಿ',
    orderPrefix: 'ಆರ್ಡರ್ #',
    setupBadge: 'ವಿತರಣಾ ಸೆಟಪ್',
    promptTitle: 'ನಿಮ್ಮ ಸ್ವಂತ ವಿತರಣಾ ವ್ಯಕ್ತಿ ಇದ್ದಾರೆಯೇ?',
    promptSub: 'ಈ ಆರ್ಡರ್ ಗ್ರಾಹಕರಿಗೆ ಹೇಗೆ ತಲುಪಿಸಲಾಗುತ್ತದೆ ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    yesHavePersonTitle: 'ಹೌದು, ನನ್ನ ಬಳಿ ವಿತರಣಾ ವ್ಯಕ್ತಿ ಇದ್ದಾರೆ',
    yesHavePersonSub: 'ನಿಮ್ಮ ಸಿಬ್ಬಂದಿಗೆ ನಿಯೋಜಿಸಿ ಮತ್ತು ವಿತರಣಾ ಲಿಂಕ್ ರಚಿಸಿ.',
    noHavePersonTitle: 'ಇಲ್ಲ, ನನ್ನ ಬಳಿ ಯಾರೂ ಇಲ್ಲ',
    noHavePersonSub: 'ರೆಮಿಸ್ ಡೆಲಿವರಿ ನೆಟ್‌ವರ್ಕ್ ಪಾಲುದಾರರನ್ನು ವಿನಂತಿಸಿ.',

    back: 'ಹಿಂದೆ',
    assignPersonTitle: 'ಸ್ಟೋರ್ ವಿತರಣಾ ವ್ಯಕ್ತಿಯನ್ನು ನಿಯೋಜಿಸಿ',
    assignPersonSub: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದಾದ ಲಿಂಕ್ ರಚಿಸಲು ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
    nameLabel: 'ವಿತರಣಾ ವ್ಯಕ್ತಿಯ ಹೆಸರು *',
    namePlaceholder: 'ಉದಾ. ರಮೇಶ್',
    phoneLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *',
    phonePlaceholder: 'ಉದಾ. 9876543210',
    instructionsLabel: 'ವಿಶೇಷ ಸೂಚನೆಗಳು',
    instructionsPlaceholder: 'ಉದಾ. ಹಣ ಸಂಗ್ರಹಿಸಿ, ಬಂದಾಗ ಕರೆ ಮಾಡಿ',
    assignBtn: 'ನಿಯೋಜಿಸಿ ಮತ್ತು ವಿತರಣಾ ಲಿಂಕ್ ರಚಿಸಿ',

    chooseOptionTitle: 'ವಿತರಣಾ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ',
    chooseOptionSub: 'ಪರಿಶೀಲಿಸಿದ ಪಾಲುದಾರರನ್ನು ವಿನಂತಿಸಿ ಅಥವಾ ನೀವೇ ನಿರ್ವಹಿಸಿ.',
    requestRemisePartnerTitle: 'ರೆಮಿಸ್ ಪಾಲುದಾರರನ್ನು ವಿನಂತಿಸಿ',
    requestRemisePartnerSub: 'ಹತ್ತಿರದ ಚಾಲಕರು ~15 ನಿಮಿಷಗಳಲ್ಲಿ ತಲುಪುತ್ತಾರೆ.',
    enableNetworkTitle: 'ಸ್ಟೋರ್‌ಗೆ ನೆಟ್‌ವರ್ಕ್ ಸಕ್ರಿಯಗೊಳಿಸಿ',
    enableNetworkSub: 'ಆನ್-ಡಿಮಾಂಡ್ ರವಾನೆಗಾಗಿ ಒಂದು ಬಾರಿ ನೋಂದಣಿ.',
    selfArrangeBtn: 'ನಾನೇ ವಿತರಣೆಯನ್ನು ವ್ಯವಸ್ಥೆ ಮಾಡುತ್ತೇನೆ',

    networkEnabledTitle: 'ರೆಮಿಸ್ ಡೆಲಿವರಿ ನೆಟ್‌ವರ್ಕ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    networkEnabledSub: 'ನಿಮ್ಮ ಅಂಗಡಿಯಲ್ಲಿ ಈಗ ಆನ್-ಡಿಮಾಂಡ್ ವಿತರಣಾ ಪಾಲುದಾರರನ್ನು ನಿಯೋಜಿಸಬಹುದು.',
    doneBtn: 'ಮುಗಿದಿದೆ',
    requestForOrderBtn: 'ಆರ್ಡರ್‌ಗಾಗಿ ಪಾಲುದಾರರನ್ನು ವಿನಂತಿಸಿ',

    confirmRequestTitle: 'ರೆಮಿಸ್ ವಿತರಣಾ ವಿನಂತಿಯನ್ನು ದೃಢೀಕರಿಸಿ',
    confirmRequestSub: 'ಹತ್ತಿರದ ವಿತರಣಾ ಪಾಲುದಾರರನ್ನು ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.',
    orderIdLabel: 'ಆರ್ಡರ್ ಐಡಿ:',
    dropAddressLabel: 'ತಲುಪಿಸುವ ವಿಳಾಸ:',
    estDistanceLabel: 'ಅಂದಾಜು ದೂರ:',
    estFeeLabel: 'ಅಂದಾಜು ವಿತರಣಾ ಶುಲ್ಕ:',
    confirmFindPartnerBtn: 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ಪಾಲುದಾರರನ್ನು ಹುಡುಕಿ',

    searchingTitle: 'ವಿತರಣಾ ಪಾಲುದಾರರನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    searchingSub: 'ಹತ್ತಿರದ ಲಭ್ಯವಿರುವ ರೆಮಿಸ್ ಪಾಲುದಾರರಿಗೆ ತಿಳಿಸಲಾಗುತ್ತಿದೆ.',
    statusLabel: 'ಸ್ಥಿತಿ:',
    searchingStatus: 'ವಿತರಣಾ ಪಾಲುದಾರರನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ',
    estFareLabel: 'ಅಂದಾಜು ಶುಲ್ಕ:',
    fareFromDispatch: 'ರವಾನೆ ದೂರ ಮತ್ತು ದರ',
    refreshStatus: 'ಸ್ಥಿತಿಯನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ',
    close: 'ಮುಚ್ಚಿ',

    deliveryPartner: 'ವಿತರಣಾ ಪಾಲುದಾರ',
    milestone: 'ಮೈಲಿಗಲ್ಲು:',
    eta: 'ತಲುಪುವ ಸಮಯ:',
    call: 'ಕರೆ ಮಾಡಿ',
    milestoneProgress: 'ಮೈಲಿಗಲ್ಲು ಪ್ರಗತಿ',
    deliveryPortal: 'ವಿತರಣಾ ಪೋರ್ಟಲ್',
    share: 'ಹಂಚಿಕೊಳ್ಳಿ',

    unavailableTitle: 'ವಿತರಣಾ ಪಾಲುದಾರರು ಲಭ್ಯವಿಲ್ಲ',
    unavailableSub: 'ಯಾವುದೇ ಪಾಲುದಾರರು ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿಲ್ಲ. ಪುನಃ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಸಿಬ್ಬಂದಿಯನ್ನು ನಿಯೋಜಿಸಿ.',
    rerequestBtn: 'ಮತ್ತೆ ರೆಮಿಸ್ ವಿತರಣೆಯನ್ನು ವಿನಂತಿಸಿ',

    linkActiveTitle: 'ಸ್ಟೋರ್ ವಿತರಣಾ ಲಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    linkActiveSub: 'ಸ್ಥಳವನ್ನು ನೋಡಲು ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ನಿಮ್ಮ ವಿತರಣಾ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಈ ಲಿಂಕ್ ಹಂಚಿಕೊಳ್ಳಿ.',
    shareLink: 'ಲಿಂಕ್ ಹಂಚಿಕೊಳ್ಳಿ',
    openPortal: 'ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ',
    currentMilestone: 'ಪ್ರಸ್ತುತ ಮೈಲಿಗಲ್ಲು:',

    selfArrangedTitle: 'ಸ್ವಯಂ-ವ್ಯವಸ್ಥಿತ ವಿತರಣೆ',
    selfArrangedSub: 'ಕೆಳಗೆ ನೇರವಾಗಿ ವಿತರಣಾ ಮೈಲಿಗಲ್ಲನ್ನು ನವೀಕರಿಸಿ:',

    shareMessage: 'ನಮಸ್ಕಾರ, ಆರ್ಡರ್ #{{orderId}} ಗಾಗಿ ನಿಮ್ಮ ವಿತರಣಾ ಲಿಂಕ್ ಇಲ್ಲಿದೆ:\n{{url}}\n\nಗ್ರಾಹಕರ ವಿವರಗಳನ್ನು ನೋಡಲು ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ.',
    failedGenerateLink: 'ವಿತರಣಾ ಲಿಂಕ್ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ',
    failedEnableNetwork: 'ಡೆಲಿವರಿ ನೆಟ್‌ವರ್ಕ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ',
    failedRequestPartner: 'ವಿತರಣಾ ಪಾಲುದಾರರನ್ನು ವಿನಂತಿಸಲು ವಿಫಲವಾಗಿದೆ',
    failedUpdateStatus: 'ಸ್ಥಿತಿ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ',

    liveTrackingTitle: 'ಸ್ಟೋರ್ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    liveBadge: 'ಲೈವ್',
    loadingTracking: 'ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    trackingUnavailable: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಲಭ್ಯವಿಲ್ಲ',
    couldNotLocateOrder: 'ಈ ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    modePrefix: 'ಮೋಡ್:',
    remiseNetworkMode: 'ರೆಮಿಸ್ ನೆಟ್‌ವರ್ಕ್',
    storeDeliveryMode: 'ಸ್ಟೋರ್ ವಿತರಣೆ',
    partnerHeadingToStore: 'ಅಂಗಡಿಯತ್ತ ತೆರಳುತ್ತಿದ್ದಾರೆ',
    partnerOnTheWayDoorstep: 'ಗ್ರಾಹಕರ ವಿಳಾಸದತ್ತ ತೆರಳುತ್ತಿದ್ದಾರೆ',
    liveGps: 'ಲೈವ್ ಜಿಪಿಎಸ್',
    pickupStorePin: 'ಪಿಕಪ್ ಸ್ಟೋರ್',
    customerDoorstepPin: 'ಗ್ರಾಹಕರ ವಿಳಾಸ',
    route: 'ಮಾರ್ಗ',
    partnerStatusTitle: 'ವಿತರಣಾ ಪಾಲುದಾರರ ಸ್ಥಿತಿ',
    noDriverAssigned: 'ಇನ್ನೂ ಚಾಲಕರನ್ನು ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ',
    broadcastingToDrivers: 'ಚಾಲಕರಿಗೆ ತಿಳಿಸಲಾಗುತ್ತಿದೆ…',
    pendingAction: 'ಕ್ರಮ ಬಾಕಿ ಇದೆ',
    customerDropoffLocation: 'ಗ್ರಾಹಕರ ವಿತರಣಾ ಸ್ಥಳ',
    noAddressSpecified: 'ವಿಳಾಸ ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ',
    callCustomer: 'ಕರೆ ಮಾಡಿ',
    directions: 'ದಿಕ್ಕುಗಳು',
    quickMilestoneOverride: 'ಮೈಲಿಗಲ್ಲನ್ನು ಶೀಘ್ರವಾಗಿ ಬದಲಾಯಿಸಿ',
    milestoneTimelineTitle: 'ವಿತರಣಾ ಮೈಲಿಗಲ್ಲು ಕಾಲಾನುಕ್ರಮ',
    noMilestonesYet: 'ಯಾವುದೇ ಮೈಲಿಗಲ್ಲು ದಾಖಲಾಗಿಲ್ಲ.',
    statusUpdatedBy: 'ಸ್ಥಿತಿ ನವೀಕರಿಸಿದವರು: {{updater}}',
    orderItemsTitle: 'ಆರ್ಡರ್ ಐಟಂಗಳು',
    totalRevenue: 'ಒಟ್ಟು ಆದಾಯ:',
    confirmDeliveryModalTitle: 'ವಿತರಣೆಯನ್ನು ದೃಢೀಕರಿಸಿ',
    confirmDeliveryModalSub: 'ವಿತರಣೆಯನ್ನು ದೃಢೀಕರಿಸಲು ಗ್ರಾಹಕರ 6-ಅಂಕಿಯ ವಾಟ್ಸಾಪ್ OTP ನಮೂದಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    verifyCompleteBtn: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪೂರ್ಣಗೊಳಿಸಿ',
    enterValid6DigitOtp: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
    otpVerifiedSuccess: 'ಆರ್ಡರ್ OTP ಪರಿಶೀಲಿಸಲಾಗಿದೆ! ವಿತರಿಸಲಾಗಿದೆ.',

    statusPending: 'ಬಾಕಿ ಇದೆ',
    statusSearching: 'ಹುಡುಕಲಾಗುತ್ತಿದೆ',
    statusAssigned: 'ನಿಯೋಜಿಸಲಾಗಿದೆ',
    statusAccepted: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    statusGoingToStore: 'ಅಂಗಡಿಯತ್ತ ತೆರಳುತ್ತಿದ್ದಾರೆ',
    statusArrivedAtStore: 'ಅಂಗಡಿ ತಲುಪಿದ್ದಾರೆ',
    statusReady: 'ಸಿದ್ಧ',
    statusPickedUp: 'ಪಿಕಪ್ ಮಾಡಲಾಗಿದೆ',
    statusOutForDelivery: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ',
    statusDelivered: 'ವಿತರಿಸಲಾಗಿದೆ',
    statusCancelled: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
    statusUnavailable: 'ಲಭ್ಯವಿಲ್ಲ',
    statusRejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  },

  ml: {
    manageDeliveryTitle: 'ഡെലിവറി കൈകാര്യം ചെയ്യുക',
    orderPrefix: 'ഓർഡർ #',
    setupBadge: 'ഡെലിവറി സജ്ജീകരണം',
    promptTitle: 'നിങ്ങൾക്ക് സ്വന്തമായി ഡെലിവറി ജീവനക്കാരനുണ്ടോ?',
    promptSub: 'ഈ ഓർഡർ ഉപഭോക്താവിന് എങ്ങനെ എത്തിക്കണമെന്ന് തിരഞ്ഞെടുക്കുക.',
    yesHavePersonTitle: 'അതെ, എനിക്ക് ഡെലിവറി ആളുണ്ട്',
    yesHavePersonSub: 'നിങ്ങളുടെ ജീവനക്കാരന് നൽകി ഡെലിവറി ലിങ്ക് സൃഷ്ടിക്കുക.',
    noHavePersonTitle: 'ഇല്ല, എനിക്ക് ആരുമില്ല',
    noHavePersonSub: 'റെമിസ് ഡെലിവറി നെറ്റ്‌വർക്ക് പങ്കാളിയെ അഭ്യർത്ഥിക്കുക.',

    back: 'തിരികെ',
    assignPersonTitle: 'സ്റ്റോർ ഡെലിവറി ആളെ നിയോഗിക്കുക',
    assignPersonSub: 'ട്രാക്ക് ചെയ്യാവുന്ന ലിങ്ക് സൃഷ്ടിക്കാൻ ഫോൺ നമ്പർ നൽകുക.',
    nameLabel: 'ഡെലിവറി ആളുടെ പേര് *',
    namePlaceholder: 'ഉദാ. രമേഷ്',
    phoneLabel: 'മൊബൈൽ നമ്പർ *',
    phonePlaceholder: 'ഉദാ. 9876543210',
    instructionsLabel: 'പ്രത്യേക നിർദ്ദേശങ്ങൾ',
    instructionsPlaceholder: 'ഉദാ. പണം വാങ്ങുക, എത്തുമ്പോൾ വിളിക്കുക',
    assignBtn: 'നിയോഗിച്ച് ഡെലിവറി ലിങ്ക് സൃഷ്ടിക്കുക',

    chooseOptionTitle: 'ഡെലിവറി ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക',
    chooseOptionSub: 'സ്ഥിരീകരിച്ച പങ്കാളിയെ അഭ്യർത്ഥിക്കുക അല്ലെങ്കിൽ സ്വയം നിർവഹിക്കുക.',
    requestRemisePartnerTitle: 'റെമിസ് പങ്കാളിയെ അഭ്യർത്ഥിക്കുക',
    requestRemisePartnerSub: 'അടുത്തുള്ള ഡ്രൈവർ ~15 മിനിറ്റിനുള്ളിൽ എത്തും.',
    enableNetworkTitle: 'സ്റ്റോറിനായി നെറ്റ്‌വർക്ക് പ്രവർത്തനക്ഷമമാക്കുക',
    enableNetworkSub: 'ഓൺ-ഡിമാൻഡ് ഡിസ്പാച്ചിനായുള്ള ഒറ്റത്തവണ സ്റ്റോർ എൻറോൾമെന്റ്.',
    selfArrangeBtn: 'ഞാൻ തന്നെ ഡെലിവറി ക്രമീകരിക്കും',

    networkEnabledTitle: 'റെമിസ് ഡെലിവറി നെറ്റ്‌വർക്ക് പ്രവർത്തനക്ഷമമാക്കി',
    networkEnabledSub: 'നിങ്ങളുടെ സ്റ്റോറിൽ ഇപ്പോൾ ഓൺ-ഡിമാൻഡ് ഡെലിവറി പങ്കാളികളെ അയയ്ക്കാൻ സാധിക്കും.',
    doneBtn: 'പൂർത്തിയായി',
    requestForOrderBtn: 'ഓർഡറിനായി പങ്കാളിയെ അഭ്യർത്ഥിക്കുക',

    confirmRequestTitle: 'റെമിസ് ഡെലിവറി അഭ്യർത്ഥന സ്ഥിരീകരിക്കുക',
    confirmRequestSub: 'അടുത്തുള്ള ഡെലിവറി പങ്കാളിയെ നിങ്ങളുടെ സ്റ്റോറിലേക്ക് അയക്കും.',
    orderIdLabel: 'ഓർഡർ ഐഡി:',
    dropAddressLabel: 'ഡെലിവറി വിലാസം:',
    estDistanceLabel: 'കണക്കാക്കിയ ദൂരം:',
    estFeeLabel: 'കണക്കാക്കിയ ഡെലിവറി നിരക്ക്:',
    confirmFindPartnerBtn: 'സ്ഥിരീകരിച്ച് പങ്കാളിയെ കണ്ടെത്തുക',

    searchingTitle: 'ഡെലിവറി പങ്കാളിക്കായി തിരയുന്നു...',
    searchingSub: 'ലഭ്യമായ അടുത്തുള്ള റെമിസ് പങ്കാളികളെ അറിയിക്കുന്നു.',
    statusLabel: 'നില:',
    searchingStatus: 'ഡെലിവറി പങ്കാളിക്കായി തിരയുന്നു',
    estFareLabel: 'കണക്കാക്കിയ നിരക്ക്:',
    fareFromDispatch: 'ഡിസ്പാച്ച് ദൂരവും നിരക്കും',
    refreshStatus: 'നില പുതുക്കുക',
    close: 'അടയ്ക്കുക',

    deliveryPartner: 'ഡെലിവറി പങ്കാളി',
    milestone: 'ഘട്ടം:',
    eta: 'എത്തുന്ന സമയം:',
    call: 'വിളിക്കുക',
    milestoneProgress: 'പുരോഗതി',
    deliveryPortal: 'ഡെലിവറി പോർട്ടൽ',
    share: 'പങ്കിടുക',

    unavailableTitle: 'ഡെലിവറി പങ്കாളി ലഭ്യമല്ല',
    unavailableSub: 'അടുത്തുള്ള റെമിസ് പങ്കാളികളാരും അഭ്യർത്ഥന സ്വീകരിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ നിങ്ങളുടെ ജീവനക്കാരനെ ചുമതലപ്പെടുത്തുക.',
    rerequestBtn: 'വീണ്ടും റെമിസ് ഡെലിവറി അഭ്യർത്ഥിക്കുക',

    linkActiveTitle: 'സ്റ്റോർ ഡെലിവറി ലിങ്ക് സജീവമാണ്',
    linkActiveSub: 'ലൊക്കേഷൻ കാണാനും നില അപ്‌ഡേറ്റ് ചെയ്യാനും ഈ ലിങ്ക് ഡെലിവറി ആളുമായി പങ്കിടുക.',
    shareLink: 'ലിങ്ക് പങ്കിടുക',
    openPortal: 'പോർട്ടൽ തുറക്കുക',
    currentMilestone: 'നിലവിലെ ഘട്ടം:',

    selfArrangedTitle: 'സ്വയം ക്രമീകരിച്ച ഡെലിവറി',
    selfArrangedSub: 'ഡെലിവറി ഘട്ടം നേരിട്ട് താഴെ അപ്‌ഡേറ്റ് ചെയ്യുക:',

    shareMessage: 'നമസ്കാരം, ഓർഡർ #{{orderId}} നുള്ള നിങ്ങളുടെ ഡെലിവറി ലിങ്ക് ഇതാ:\n{{url}}\n\nഉപഭോക്തൃ വിവരങ്ങൾ കാണാനും നില അപ്‌ഡേറ്റ് ചെയ്യാനും ടാപ്പ് ചെയ്യുക.',
    failedGenerateLink: 'ഡെലിവറി ലിങ്ക് സൃഷ്ടിക്കുന്നതിൽ പരാജയപ്പെട്ടു',
    failedEnableNetwork: 'ഡെലിവറി നെറ്റ്‌വർക്ക് പ്രവർത്തനക്ഷമമാക്കുന്നതിൽ പരാജയപ്പെട്ടു',
    failedRequestPartner: 'ഡെലിവറി പങ്കാളിയെ അഭ്യർത്ഥിക്കുന്നതിൽ പരാജയപ്പെട്ടു',
    failedUpdateStatus: 'നില അപ്‌ഡേറ്റ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു',

    liveTrackingTitle: 'സ്റ്റോർ തത്സമയ ട്രാക്കിംഗ്',
    liveBadge: 'ലൈവ്',
    loadingTracking: 'തത്സമയ ട്രാക്കിംഗ് ലോഡ് ചെയ്യുന്നു…',
    trackingUnavailable: 'ട്രാക്കിംഗ് ലഭ്യമല്ല',
    couldNotLocateOrder: 'ഈ ഓർഡർ കണ്ടെത്താനായില്ല.',
    retry: 'വീണ്ടും ശ്രമിക്കുക',
    modePrefix: 'രീതി:',
    remiseNetworkMode: 'റെമിസ് നെറ്റ്‌വർക്ക്',
    storeDeliveryMode: 'സ്റ്റോർ ഡെലിവറി',
    partnerHeadingToStore: 'സ്റ്റോറിലേക്ക് പോകുന്നു',
    partnerOnTheWayDoorstep: 'ഉപഭോക്താവിന്റെ വിലാസത്തിലേക്ക് പോകുന്നു',
    liveGps: 'ലൈവ് ജിപിഎസ്',
    pickupStorePin: 'പിക്കപ്പ് സ്റ്റോർ',
    customerDoorstepPin: 'ഉപഭോക്താവിന്റെ വിലാസം',
    route: 'റൂട്ട്',
    partnerStatusTitle: 'ഡെലിവറി പങ്കാളിയുടെ നില',
    noDriverAssigned: 'ഡ്രൈവറെ ഇതുവരെ നിയോഗിച്ചിട്ടില്ല',
    broadcastingToDrivers: 'ഡ്രൈവർമാരെ അറിയിക്കുന്നു…',
    pendingAction: 'നടപടി ബാക്കി',
    customerDropoffLocation: 'ഡെലിവറി സ്ഥലം',
    noAddressSpecified: 'വിലാസം നൽകിയിട്ടില്ല',
    callCustomer: 'വിളിക്കുക',
    directions: 'വഴി',
    quickMilestoneOverride: 'ഘട്ടം വേഗത്തിൽ മാറ്റുക',
    milestoneTimelineTitle: 'ഡെലിവറി നാഴികക്കല്ലുകൾ',
    noMilestonesYet: 'ഇതുവരെ നാഴികക്കല്ലുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.',
    statusUpdatedBy: 'നില മാറ്റിയത്: {{updater}}',
    orderItemsTitle: 'ഓർഡർ ഇനങ്ങൾ',
    totalRevenue: 'ആകെ വരുമാനം:',
    confirmDeliveryModalTitle: 'ഡെലിവറി സ്ഥിരീകരിക്കുക',
    confirmDeliveryModalSub: 'കൈമാറ്റം സ്ഥിരീകരിക്കാൻ ഉപഭോക്താവിന്റെ 6-അക്ക വാട്ട്‌സ്ആപ്പ് OTP നൽകുക',
    cancel: 'റദ്ദാക്കുക',
    verifyCompleteBtn: 'സ്ഥിരീകരിച്ച് പൂർത്തിയാക്കുക',
    enterValid6DigitOtp: 'സാധുവായ 6-അക്ക OTP നൽകുക',
    otpVerifiedSuccess: 'ഓർഡർ OTP സ്ഥിരീകരിച്ചു! ഡെലിവർ ചെയ്തു.',

    statusPending: 'തീർച്ചപ്പെടുത്തിയിട്ടില്ല',
    statusSearching: 'തിരയുന്നു',
    statusAssigned: 'നിയോഗിച്ചു',
    statusAccepted: 'സ്വീകരിച്ചു',
    statusGoingToStore: 'സ്റ്റോറിലേക്ക് പോകുന്നു',
    statusArrivedAtStore: 'സ്റ്റോറിലെത്തി',
    statusReady: 'തയ്യാർ',
    statusPickedUp: 'പിക്കപ്പ് ചെയ്തു',
    statusOutForDelivery: 'ഡെലിവറിക്കായി പുറപ്പെട്ടു',
    statusDelivered: 'ഡെലിവർ ചെയ്തു',
    statusCancelled: 'റദ്ദാക്കി',
    statusUnavailable: 'ലഭ്യമല്ല',
    statusRejected: 'നിരസിച്ചു',
  },
};

export function useDeliveryTranslations(): DeliveryTranslations {
  // Can be called wherever language context is available
  try {
    const { useTranslation } = require('./index');
    const { language } = useTranslation();
    return deliveryTranslations[language as LanguageCode] || deliveryTranslations.en;
  } catch {
    return deliveryTranslations.en;
  }
}
