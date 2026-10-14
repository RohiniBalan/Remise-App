import { LanguageCode } from './types';

export interface CreditTranslations {
  // Screen / Header Titles
  storeCreditTitle: string;
  storeCreditSubtitle: string;
  creditManagement: string;
  creditManagementSubtitle: string;
  myStoreCredit: string;
  myStoreCreditSubtitle: string;

  // Search & Actions
  searchPlaceholder: string;
  inPersonCreditBtn: string;

  // Store Owner KPIs
  totalOutstanding: string;
  totalApprovedLimit: string;
  activeAccounts: string;
  overdue: string;

  // Customer KPIs
  creditLimit: string;
  totalCreditGranted: string;
  usedCredit: string;
  inOrders: string;
  available: string;
  ofLimit: string;

  // Filters & Tabs
  filterAll: string;
  filterActive: string;
  filterWithBalance: string;
  filterSuspended: string;

  // Badges & Statuses
  statusApproved: string;
  statusSuspended: string;

  // Account Card
  customer: string;
  outstanding: string;
  nextDue: string;
  policyLabel: string;
  maskedIdLabel: string;
  withinDays: string;
  weeklyEvery: string;
  monthlyOnDay: string;
  everyDays: string;
  specificDueDate: string;
  standardTerms: string;
  dueOn: string;
  overdueText: string;
  overdueWarning: string;
  settlementRequired: string;
  settlementBlockedDesc: string;

  // Action Buttons
  recordRepaymentBtn: string;
  ledgerBtn: string;
  termsBtn: string;
  reactivateCredit: string;
  suspendCredit: string;
  payViaUpiBtn: string;
  repaymentHistoryBtn: string;
  cancel: string;
  confirm: string;
  change: string;
  resend: string;

  // Loading & Empty States
  loadingStoreCredit: string;
  loadingCustomerCredit: string;
  noCreditAccountsFound: string;
  registerInPersonDesc: string;
  noCustomerCreditTitle: string;
  noCustomerCreditDesc: string;
  howItWorksTitle: string;
  howItWorksStep1: string;
  howItWorksStep2: string;
  howItWorksStep3: string;

  // Registration Modal (In-Person)
  registerModalTitle: string;
  registerModalSubtitle: string;
  step1CustomerInfo: string;
  step1Subtitle: string;
  searchAutoFillPlaceholder: string;
  customerFullName: string;
  fullNamePlaceholder: string;
  mobileNumberLabel: string;
  mobilePlaceholder: string;
  emailAddressLabel: string;
  emailPlaceholder: string;
  linkedAccountPrefix: string;
  customerMustBeRegistered: string;
  step2CreditLimit: string;
  limitPlaceholder: string;
  step3RepaymentPolicy: string;
  policyWeekly: string;
  policyMonthly: string;
  policyCustomDays: string;
  policySpecificDate: string;
  weeklyDueDayLabel: string;
  dueDayOfMonthLabel: string;
  repayWithinDaysLabel: string;
  agreedDueDateLabel: string;
  step4IdentityVerification: string;
  cashfreeVerifiedBadge: string;
  uidaiItdCheck: string;
  aadhaarOption: string;
  panOption: string;
  aadhaarNumberLabel: string;
  panNumberLabel: string;
  aadhaarPlaceholder: string;
  panPlaceholder: string;
  legalNameLabel: string;
  legalNamePlaceholder: string;
  enterAadhaarOtpTitle: string;
  sentToUidaiMobile: string;
  confirmAadhaarOtpBtn: string;
  sendingAadhaarOtp: string;
  verifyingPan: string;
  verifiedViaCashfreeTap: string;
  verifyAadhaarBtn: string;
  verifyPanBtn: string;
  cashfreeConfirmedTitle: string;
  govtRecordNamePrefix: string;
  maskedTokenPrefix: string;
  verifiedViaCashfreeSuffix: string;
  consentCheckboxLabel: string;
  agreementCheckboxLabel: string;
  approveAndActivateBtn: string;

  // Repayment Modal
  recordRepaymentTitle: string;
  customerLabelPrefix: string;
  outstandingDebtLabel: string;
  repaymentAmountLabel: string;
  amountCollectedPlaceholder: string;
  notesReferenceLabel: string;
  notesPlaceholder: string;
  confirmReceiptBtn: string;

  // Terms Modal
  modifyTermsTitle: string;
  newLimitLabel: string;
  limitShortPlaceholder: string;
  auditReasonLabel: string;
  auditReasonPlaceholder: string;
  updateTermsBtn: string;

  // Ledger Modal
  ledgerModalTitle: string;
  customerCreditLedgerTitle: string;
  noLedgerEntries: string;
  loadingLedger: string;
  noLedgerEntriesCustomer: string;
  noLedgerEntriesCustomerDesc: string;
  balPrefix: string;
  refPrefix: string;
  repaymentType: string;
  orderDebitType: string;

  // Days of Week
  days: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  // Alerts & Messages
  alerts: {
    invalidLimitTitle: string;
    invalidLimitMsg: string;
    identityRequiredTitle: string;
    identityRequiredMsg: string;
    nameOnIdRequiredTitle: string;
    nameOnIdRequiredMsg: string;
    cashfreeRequiredTitle: string;
    cashfreeRequiredMsg: string;
    consentRequiredTitle: string;
    consentRequiredMsg: string;
    successTitle: string;
    creditApprovedMsg: string;
    errorTitle: string;
    registrationFailedMsg: string;
    invalidAmountTitle: string;
    invalidAmountMsg: string;
    amountExceedsDebtTitle: string;
    amountExceedsDebtMsg: string;
    repaymentRecordedTitle: string;
    repaymentRecordedMsg: string;
    repaymentFailedMsg: string;
    reasonRequiredTitle: string;
    reasonRequiredMsg: string;
    termsUpdatedMsg: string;
    termsFailedMsg: string;
    suspendCreditTitle: string;
    reactivateCreditTitle: string;
    suspendConfirmMsg: string;
    reactivateConfirmMsg: string;
    updateStatusFailed: string;
    nameRequiredTitle: string;
    nameRequiredMsg: string;
    phoneRequiredTitle: string;
    phoneRequiredMsg: string;
    emailRequiredTitle: string;
    emailRequiredMsg: string;
    enterLegalNameMsg: string;
    enter12AadhaarMsg: string;
    invalidPanFormatMsg: string;
    enterAadhaarOtpMsg: string;
  };
}

export const CREDIT_TRANSLATIONS: Record<LanguageCode, CreditTranslations> = {
  en: {
    storeCreditTitle: 'Store Credit (Kadan)',
    storeCreditSubtitle: 'Private credit lines & repayment ledgers',
    creditManagement: 'Credit (Kadan) Management',
    creditManagementSubtitle: 'In-person approval, limits, repayments & ledger',
    myStoreCredit: 'My Store Credit (Kadan)',
    myStoreCreditSubtitle: 'View store credit lines, due dates, & ledger',

    searchPlaceholder: 'Search customers by name, phone...',
    inPersonCreditBtn: 'In-Person Credit',

    totalOutstanding: 'Total Outstanding',
    totalApprovedLimit: 'Total Approved Limit',
    activeAccounts: 'Active Accounts',
    overdue: 'Overdue',

    creditLimit: 'Credit Limit',
    totalCreditGranted: 'Total credit granted',
    usedCredit: 'Used Credit',
    inOrders: 'In orders',
    available: 'Available',
    ofLimit: 'of ₹{{limit}} limit',

    filterAll: 'All',
    filterActive: 'Active',
    filterWithBalance: 'With Balance',
    filterSuspended: 'Suspended',

    statusApproved: 'APPROVED',
    statusSuspended: 'SUSPENDED',

    customer: 'Customer',
    outstanding: 'Outstanding',
    nextDue: 'Next Due',
    policyLabel: 'Policy:',
    maskedIdLabel: 'Masked ID:',
    withinDays: 'Within {{days}} days',
    weeklyEvery: 'Weekly every {{day}}',
    monthlyOnDay: 'Monthly on day {{day}}',
    everyDays: 'Every {{days}} days',
    specificDueDate: 'Specific due date',
    standardTerms: 'Standard Terms',
    dueOn: 'Due: {{date}}',
    overdueText: '(OVERDUE)',
    overdueWarning: 'Overdue: Due on {{date}}. Settle in person with store.',
    settlementRequired: 'Settlement Required: New purchases at this store are blocked until ₹{{balance}} is settled.',
    settlementBlockedDesc: 'New purchases at this store are blocked until the balance is cleared.',

    recordRepaymentBtn: 'Record Repayment',
    ledgerBtn: 'Ledger',
    termsBtn: 'Terms',
    reactivateCredit: 'Reactivate Credit',
    suspendCredit: 'Suspend Credit',
    payViaUpiBtn: 'Pay via UPI / Card',
    repaymentHistoryBtn: 'Repayment History (Ledger)',
    cancel: 'Cancel',
    confirm: 'Confirm',
    change: 'Change',
    resend: 'Resend',

    loadingStoreCredit: 'Loading store credit accounts...',
    loadingCustomerCredit: 'Loading your credit accounts...',
    noCreditAccountsFound: 'No credit accounts found',
    registerInPersonDesc: 'Register an in-person customer to grant store credit (Kadan).',
    noCustomerCreditTitle: 'No Store Credit Accounts Yet',
    noCustomerCreditDesc: 'Store credit (Kadan) is registered in person with local store merchants. Visit any participating store to agree on a credit limit and repayment policy.',
    howItWorksTitle: 'How it works:',
    howItWorksStep1: '1. Visit the store in person with your Remise account.',
    howItWorksStep2: '2. Agree on credit terms (weekly, monthly, or days).',
    howItWorksStep3: '3. The store owner approves your account. Credit immediately becomes usable at checkout!',

    registerModalTitle: 'In-Person Credit Registration',
    registerModalSubtitle: 'Store-specific private credit agreement',
    step1CustomerInfo: '1. Customer Information *',
    step1Subtitle: 'Name, Phone & Email',
    searchAutoFillPlaceholder: 'Search registered customer to auto-fill...',
    customerFullName: 'Customer Full Name *',
    fullNamePlaceholder: 'e.g. John Doe',
    mobileNumberLabel: 'Mobile Number (10 digits) *',
    mobilePlaceholder: 'e.g. 9876543210',
    emailAddressLabel: 'Email Address *',
    emailPlaceholder: 'e.g. customer@example.com',
    linkedAccountPrefix: '✓ Linked Account:',
    customerMustBeRegistered: '⚠ Customer must have a registered Remise account to activate credit.',
    step2CreditLimit: '2. Credit Limit (INR ₹)',
    limitPlaceholder: 'e.g. 5000',
    step3RepaymentPolicy: '3. Repayment Policy',
    policyWeekly: 'Weekly',
    policyMonthly: 'Monthly',
    policyCustomDays: 'Custom Days',
    policySpecificDate: 'Specific Date',
    weeklyDueDayLabel: 'Weekly Due Day',
    dueDayOfMonthLabel: 'Due Day of Month (1 - 31)',
    repayWithinDaysLabel: 'Repay within (Days)',
    agreedDueDateLabel: 'Agreed Due Date (YYYY-MM-DD)',
    step4IdentityVerification: '4. Identity Verification (Cashfree SecureID) *',
    cashfreeVerifiedBadge: 'Cashfree Verified',
    uidaiItdCheck: 'UIDAI / ITD Check',
    aadhaarOption: 'Aadhaar (UIDAI OTP)',
    panOption: 'PAN Card (Income Tax)',
    aadhaarNumberLabel: 'Aadhaar Number (12 digits) *',
    panNumberLabel: 'PAN Number (10 alphanumeric chars) *',
    aadhaarPlaceholder: 'e.g. 123456789012',
    panPlaceholder: 'e.g. ABCDE1234F',
    legalNameLabel: 'Legal Name on Identity Document *',
    legalNamePlaceholder: 'Name exactly as on document',
    enterAadhaarOtpTitle: 'Enter 6-Digit Aadhaar OTP',
    sentToUidaiMobile: 'Sent to UIDAI mobile',
    confirmAadhaarOtpBtn: 'Confirm Aadhaar OTP',
    sendingAadhaarOtp: 'Sending Aadhaar OTP via Cashfree...',
    verifyingPan: 'Verifying PAN with Cashfree...',
    verifiedViaCashfreeTap: '✓ Verified via Cashfree (Tap to Re-verify)',
    verifyAadhaarBtn: 'Verify Aadhaar with Cashfree (Send OTP)',
    verifyPanBtn: 'Verify PAN with Cashfree',
    cashfreeConfirmedTitle: 'Cashfree Verification Confirmed',
    govtRecordNamePrefix: 'Govt Record Name:',
    maskedTokenPrefix: 'Masked Token:',
    verifiedViaCashfreeSuffix: 'Verified via Cashfree',
    consentCheckboxLabel: 'Customer has presented identity document in-person and consented to verification.',
    agreementCheckboxLabel: 'Customer reviewed & agreed to the credit limit, repayment policy, and conditions.',
    approveAndActivateBtn: 'Approve & Activate Credit',

    recordRepaymentTitle: 'Record Cash Repayment',
    customerLabelPrefix: 'Customer:',
    outstandingDebtLabel: 'Outstanding Debt:',
    repaymentAmountLabel: 'Repayment Amount (INR ₹)',
    amountCollectedPlaceholder: 'Amount collected',
    notesReferenceLabel: 'Notes / Reference (Optional)',
    notesPlaceholder: 'e.g. Cash handed in person at counter',
    confirmReceiptBtn: 'Confirm & Issue Receipt',

    modifyTermsTitle: 'Modify Credit Terms',
    newLimitLabel: 'New Credit Limit (INR ₹)',
    limitShortPlaceholder: 'Limit',
    auditReasonLabel: 'Audit Reason (Mandatory)',
    auditReasonPlaceholder: 'Explain why terms are being changed (e.g., customer requested increase based on punctual repayment history)',
    updateTermsBtn: 'Update Terms',

    ledgerModalTitle: 'Credit Ledger History',
    customerCreditLedgerTitle: 'Credit Ledger',
    noLedgerEntries: 'No ledger transactions recorded yet.',
    loadingLedger: 'Loading ledger...',
    noLedgerEntriesCustomer: 'No transactions yet',
    noLedgerEntriesCustomerDesc: 'Transactions will appear here when you make credit purchases or repayments.',
    balPrefix: 'Bal:',
    refPrefix: 'Ref:',
    repaymentType: 'Repayment',
    orderDebitType: 'Order Debit',

    days: {
      mon: 'MON',
      tue: 'TUE',
      wed: 'WED',
      thu: 'THU',
      fri: 'FRI',
      sat: 'SAT',
      sun: 'SUN',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },

    alerts: {
      invalidLimitTitle: 'Invalid Limit',
      invalidLimitMsg: 'Credit limit must be a positive number.',
      identityRequiredTitle: 'Identity Required',
      identityRequiredMsg: 'Please enter identity verification document number.',
      nameOnIdRequiredTitle: 'Name on ID Required',
      nameOnIdRequiredMsg: 'Please enter legal name matching the identity document.',
      cashfreeRequiredTitle: 'Cashfree Verification Required',
      cashfreeRequiredMsg: 'Please verify the customer identity document with Cashfree SecureID before granting credit.',
      consentRequiredTitle: 'Consent Required',
      consentRequiredMsg: 'Both customer consent and agreement to terms must be confirmed.',
      successTitle: 'Success',
      creditApprovedMsg: 'Credit account approved and active for this customer.',
      errorTitle: 'Error',
      registrationFailedMsg: 'Registration failed',
      invalidAmountTitle: 'Invalid Amount',
      invalidAmountMsg: 'Please enter a valid repayment amount greater than 0.',
      amountExceedsDebtTitle: 'Amount Exceeds Debt',
      amountExceedsDebtMsg: 'Maximum repayment allowed is ₹{{amount}}',
      repaymentRecordedTitle: 'Repayment Recorded',
      repaymentRecordedMsg: 'Payment of ₹{{amount}} verified.\nReceipt: {{receipt}}\nNew Balance: ₹{{balance}}',
      repaymentFailedMsg: 'Repayment failed',
      reasonRequiredTitle: 'Reason Required',
      reasonRequiredMsg: 'Please provide an audit reason for changing terms.',
      termsUpdatedMsg: 'Credit terms updated successfully.',
      termsFailedMsg: 'Terms update failed',
      suspendCreditTitle: 'Suspend Credit',
      reactivateCreditTitle: 'Reactivate Credit',
      suspendConfirmMsg: 'Are you sure you want to suspend credit for {{name}}?',
      reactivateConfirmMsg: 'Are you sure you want to reactivate credit for {{name}}?',
      updateStatusFailed: 'Failed to update account status',
      nameRequiredTitle: 'Name Required',
      nameRequiredMsg: 'Customer Full Name is required.',
      phoneRequiredTitle: 'Phone Required',
      phoneRequiredMsg: 'Valid 10-digit mobile phone number is required.',
      emailRequiredTitle: 'Email Required',
      emailRequiredMsg: 'Valid customer email address is required.',
      enterLegalNameMsg: 'Please enter legal name on the identity document.',
      enter12AadhaarMsg: 'Please enter a valid 12-digit Aadhaar number.',
      invalidPanFormatMsg: 'Invalid PAN format (must be 10 alphanumeric characters e.g. ABCDE1234F).',
      enterAadhaarOtpMsg: 'Please enter the OTP sent to your Aadhaar-linked mobile.',
    },
  },

  ta: {
    storeCreditTitle: 'கடை கடன் (கடன்)',
    storeCreditSubtitle: 'தனிப்பட்ட கடன் வரம்புகள் & திருப்பிச் செலுத்தும் கணக்குகள்',
    creditManagement: 'கடன் (கடன்) மேலாண்மை',
    creditManagementSubtitle: 'நேரடி ஒப்புதல், வரம்புகள், திருப்பிச் செலுத்துதல் & லெட்ஜர்',
    myStoreCredit: 'எனது கடை கடன் (கடன்)',
    myStoreCreditSubtitle: 'கடை கடன் வரம்புகள், நிலுவைத் தேதிகள் & லெட்ஜரைக் காண்க',

    searchPlaceholder: 'பெயர், மொபைல் மூலம் வாடிக்கையாளர்களைத் தேடவும்...',
    inPersonCreditBtn: 'நேரடி கடன் பதிவு',

    totalOutstanding: 'மொத்த நிலுவைத் தொகை',
    totalApprovedLimit: 'மொத்த அங்கீகரிக்கப்பட்ட வரம்பு',
    activeAccounts: 'செயலில் உள்ள கணக்குகள்',
    overdue: 'காலாவதியானது',

    creditLimit: 'கடன் வரம்பு',
    totalCreditGranted: 'வழங்கப்பட்ட மொத்த கடன்',
    usedCredit: 'பயன்படுத்திய கடன்',
    inOrders: 'ஆர்டர்களில்',
    available: 'கிடைக்கும் தொகை',
    ofLimit: '₹{{limit}} வரம்பில்',

    filterAll: 'அனைத்தும்',
    filterActive: 'செயலில்',
    filterWithBalance: 'நிலுவையுடன்',
    filterSuspended: 'இடைநிறுத்தப்பட்டது',

    statusApproved: 'அங்கீகரிக்கப்பட்டது',
    statusSuspended: 'இடைநிறுத்தப்பட்டது',

    customer: 'வாடிக்கையாளர்',
    outstanding: 'நிலுவை',
    nextDue: 'அடுத்த நிலுவை',
    policyLabel: 'கொள்கை:',
    maskedIdLabel: 'அடையாள எண்:',
    withinDays: '{{days}} நாட்களுக்குள்',
    weeklyEvery: 'வாரந்தோறும் {{day}}',
    monthlyOnDay: 'மாதந்தோறும் {{day}}-ம் தேதி',
    everyDays: 'ஒவ்வொரு {{days}} நாட்களும்',
    specificDueDate: 'குறிப்பிட்ட நிலுவைத் தேதி',
    standardTerms: 'நிலையான விதிமுறைகள்',
    dueOn: 'செலுத்த வேண்டிய நாள்: {{date}}',
    overdueText: '(காலாவதியானது)',
    overdueWarning: 'காலாவதியானது: செலுத்த வேண்டிய தேதி {{date}}. கடையை நேரில் அணுகி நிலுவையைச் செலுத்துங்கள்.',
    settlementRequired: 'நிலுவை தீர்க்கப்பட வேண்டும்: ₹{{balance}} செலுத்தப்படும் வரை இந்த கடையில் புதிய கொள்முதல்கள் தடுக்கப்பட்டுள்ளன.',
    settlementBlockedDesc: 'நிலுவை தொகை செலுத்தப்படும் வரை இந்த கடையில் புதிய ஆர்டர்கள் தடுக்கப்பட்டுள்ளன.',

    recordRepaymentBtn: 'பணம் பெறுதலைப் பதிவுசெய்',
    ledgerBtn: 'லெட்ஜர்',
    termsBtn: 'விதிமுறைகள்',
    reactivateCredit: 'கடனை மீண்டும் செயல்படுத்து',
    suspendCredit: 'கடனை இடைநிறுத்து',
    payViaUpiBtn: 'UPI / கார்டு மூலம் செலுத்து',
    repaymentHistoryBtn: 'திருப்பிச் செலுத்திய வரலாறு (லெட்ஜர்)',
    cancel: 'ரத்துசெய்',
    confirm: 'உறுதிசெய்',
    change: 'மாற்று',
    resend: 'மீண்டும் அனுப்பு',

    loadingStoreCredit: 'கடை கடன் கணக்குகள் ஏற்றப்படுகின்றன...',
    loadingCustomerCredit: 'உங்கள் கடன் கணக்குகள் ஏற்றப்படுகின்றன...',
    noCreditAccountsFound: 'கடன் கணக்குகள் எதுவும் கிடைக்கவில்லை',
    registerInPersonDesc: 'கடை கடன் (கடன்) வழங்க ஒரு வாடிக்கையாளரை நேரில் பதிவு செய்யவும்.',
    noCustomerCreditTitle: 'இதுவரை கடை கடன் கணக்குகள் எதுவும் இல்லை',
    noCustomerCreditDesc: 'கடை கடன் (கடன்) உள்ளூர் கடைக்காரர்களிடம் நேரில் பதிவு செய்யப்படுகிறது. கடன் வரம்பு மற்றும் திருப்பிச் செலுத்தும் கொள்கையை ஒப்புக்கொள்ள பங்கேற்கும் ஏதேனும் ஒரு கடைக்குச் செல்லவும்.',
    howItWorksTitle: 'இது எவ்வாறு இயங்குகிறது:',
    howItWorksStep1: '1. உங்கள் Remise கணக்குடன் கடைக்கு நேரில் செல்லுங்கள்.',
    howItWorksStep2: '2. கடன் விதிமுறைகளை (வாரம், மாதம் அல்லது நாட்கள்) ஒப்புக்கொள்ளுங்கள்.',
    howItWorksStep3: '3. கடை உரிமையாளர் உங்கள் கணக்கை அங்கீகரிப்பார். செக்அவுட்டின் போது கடன் உடனடியாகப் பயன்படுத்தக்கூடியதாகிவிடும்!',

    registerModalTitle: 'நேரடி கடன் பதிவு',
    registerModalSubtitle: 'கடைக்கான தனிப்பட்ட கடன் ஒப்பந்தம்',
    step1CustomerInfo: '1. வாடிக்கையாளர் தகவல் *',
    step1Subtitle: 'பெயர், தொலைபேசி & மின்னஞ்சல்',
    searchAutoFillPlaceholder: 'தானாக நிரப்ப பதிவுசெய்த வாடிக்கையாளரைத் தேடுங்கள்...',
    customerFullName: 'வாடிக்கையாளர் முழுப் பெயர் *',
    fullNamePlaceholder: 'எ.கா. முருகன்',
    mobileNumberLabel: 'மொபைல் எண் (10 இலக்கங்கள்) *',
    mobilePlaceholder: 'எ.கா. 9876543210',
    emailAddressLabel: 'மின்னஞ்சல் முகவரி *',
    emailPlaceholder: 'எ.கா. customer@example.com',
    linkedAccountPrefix: '✓ இணைக்கப்பட்ட கணக்கு:',
    customerMustBeRegistered: '⚠ கடனைச் செயல்படுத்த வாடிக்கையாளர் Remise கணக்கு வைத்திருக்க வேண்டும்.',
    step2CreditLimit: '2. கடன் வரம்பு (INR ₹)',
    limitPlaceholder: 'எ.கா. 5000',
    step3RepaymentPolicy: '3. திருப்பிச் செலுத்தும் கொள்கை',
    policyWeekly: 'வாராந்திரம்',
    policyMonthly: 'மாதாந்திரம்',
    policyCustomDays: 'தனிப்பயன் நாட்கள்',
    policySpecificDate: 'குறிப்பிட்ட தேதி',
    weeklyDueDayLabel: 'வாராந்திர நிலுவை நாள்',
    dueDayOfMonthLabel: 'மாதத்தின் நிலுவை நாள் (1 - 31)',
    repayWithinDaysLabel: 'திருப்பிச் செலுத்தும் நாட்கள்',
    agreedDueDateLabel: 'ஒப்புக்கொள்ளப்பட்ட நிலுவைத் தேதி (YYYY-MM-DD)',
    step4IdentityVerification: '4. அடையாள சரிபார்ப்பு (Cashfree SecureID) *',
    cashfreeVerifiedBadge: 'Cashfree சரிபார்க்கப்பட்டது',
    uidaiItdCheck: 'UIDAI / ITD சரிபார்ப்பு',
    aadhaarOption: 'ஆதார் (UIDAI OTP)',
    panOption: 'பான் கார்டு (வருமான வரி)',
    aadhaarNumberLabel: 'ஆதார் எண் (12 இலக்கங்கள்) *',
    panNumberLabel: 'பான் எண் (10 இலக்கங்கள்) *',
    aadhaarPlaceholder: 'எ.கா. 123456789012',
    panPlaceholder: 'எ.கா. ABCDE1234F',
    legalNameLabel: 'அடையாள ஆவணத்தில் உள்ள சட்டப்பூர்வ பெயர் *',
    legalNamePlaceholder: 'ஆவணத்தில் உள்ளபடியே பெயர்',
    enterAadhaarOtpTitle: '6-இலக்க ஆதார் OTP-ஐ உள்ளிடவும்',
    sentToUidaiMobile: 'UIDAI பதிவுசெய்த மொபைலுக்கு அனுப்பப்பட்டது',
    confirmAadhaarOtpBtn: 'ஆதார் OTP-ஐ உறுதிசெய்',
    sendingAadhaarOtp: 'Cashfree மூலம் ஆதார் OTP அனுப்பப்படுகிறது...',
    verifyingPan: 'Cashfree மூலம் பான் சரிபார்க்கப்படுகிறது...',
    verifiedViaCashfreeTap: '✓ Cashfree மூலம் சரிபார்க்கப்பட்டது (மீண்டும் சரிபார்க்க தட்டவும்)',
    verifyAadhaarBtn: 'Cashfree மூலம் ஆதாரை சரிபார்க்கவும் (OTP அனுப்பு)',
    verifyPanBtn: 'Cashfree மூலம் பான் கார்டை சரிபார்க்கவும்',
    cashfreeConfirmedTitle: 'Cashfree சரிபார்ப்பு உறுதிசெய்யப்பட்டது',
    govtRecordNamePrefix: 'அரசுப் பதிவேட்டில் உள்ள பெயர்:',
    maskedTokenPrefix: 'மறைக்கப்பட்ட எண்:',
    verifiedViaCashfreeSuffix: 'Cashfree மூலம் சரிபார்க்கப்பட்டது',
    consentCheckboxLabel: 'வாடிக்கையாளர் அடையாள ஆவணத்தை நேரில் சமர்ப்பித்து சரிபார்ப்புக்கு ஒப்புதல் அளித்துள்ளார்.',
    agreementCheckboxLabel: 'வாடிக்கையாளர் கடன் வரம்பு, திருப்பிச் செலுத்தும் கொள்கை மற்றும் நிபந்தனைகளை ஒப்புக்கொண்டார்.',
    approveAndActivateBtn: 'கடனை அங்கீகரித்து செயல்படுத்து',

    recordRepaymentTitle: 'ரொக்கத் திருப்பிச் செலுத்துதலைப் பதிவுசெய்',
    customerLabelPrefix: 'வாடிக்கையாளர்:',
    outstandingDebtLabel: 'நிலுவைக் கடன்:',
    repaymentAmountLabel: 'திருப்பிச் செலுத்தும் தொகை (INR ₹)',
    amountCollectedPlaceholder: 'வசூலிக்கப்பட்ட தொகை',
    notesReferenceLabel: 'குறிப்புகள் / குறிப்பு எண் (விருப்பத்தேர்வு)',
    notesPlaceholder: 'எ.கா. கடையில் ரொக்கமாக செலுத்தப்பட்டது',
    confirmReceiptBtn: 'உறுதிசெய்து ரசீது வழங்கவும்',

    modifyTermsTitle: 'கடன் விதிமுறைகளை மாற்று',
    newLimitLabel: 'புதிய கடன் வரம்பு (INR ₹)',
    limitShortPlaceholder: 'வரம்பு',
    auditReasonLabel: 'தணிக்கைக் காரணம் (கட்டாயம்)',
    auditReasonPlaceholder: 'விதிமுறைகள் ஏன் மாற்றப்படுகின்றன என்பதை விளக்குங்கள் (எ.கா. சரியான நேரத்தில் திருப்பிச் செலுத்திய வரலாறு)',
    updateTermsBtn: 'விதிமுறைகளைப் புதுப்பி',

    ledgerModalTitle: 'கடன் லெட்ஜர் வரலாறு',
    customerCreditLedgerTitle: 'கடன் லெட்ஜர்',
    noLedgerEntries: 'லெட்ஜர் பரிவர்த்தனைகள் எதுவும் இன்னும் பதிவு செய்யப்படவில்லை.',
    loadingLedger: 'லெட்ஜர் ஏற்றப்படுகிறது...',
    noLedgerEntriesCustomer: 'பரிவர்த்தனைகள் எதுவும் இல்லை',
    noLedgerEntriesCustomerDesc: 'கடன் வாங்கும் போது அல்லது திருப்பிச் செலுத்தும் போது பரிவர்த்தனைகள் இங்கு தோன்றும்.',
    balPrefix: 'இருப்பு:',
    refPrefix: 'குறிப்பு:',
    repaymentType: 'திருப்பிச் செலுத்துதல்',
    orderDebitType: 'ஆர்டர் பற்று',

    days: {
      mon: 'திங்கள்',
      tue: 'செவ்வாய்',
      wed: 'புதன்',
      thu: 'வியாழன்',
      fri: 'வெள்ளி',
      sat: 'சனி',
      sun: 'ஞாயிறு',
      monday: 'திங்கட்கிழமை',
      tuesday: 'செவ்வாய்க்கிழமை',
      wednesday: 'புதன்கிழமை',
      thursday: 'வியாழக்கிழமை',
      friday: 'வெள்ளிக்கிழமை',
      saturday: 'சனிக்கிழமை',
      sunday: 'ஞாயிற்றுக்கிழமை',
    },

    alerts: {
      invalidLimitTitle: 'தவறான வரம்பு',
      invalidLimitMsg: 'கடன் வரம்பு நேர்மறை எண்ணாக இருக்க வேண்டும்.',
      identityRequiredTitle: 'அடையாள ஆவணம் தேவை',
      identityRequiredMsg: 'அடையாள சரிபார்ப்பு ஆவண எண்ணை உள்ளிடவும்.',
      nameOnIdRequiredTitle: 'ஆவணப் பெயர் தேவை',
      nameOnIdRequiredMsg: 'அடையாள ஆவணத்தில் உள்ளபடியே சட்டப்பூர்வ பெயரை உள்ளிடவும்.',
      cashfreeRequiredTitle: 'Cashfree சரிபார்ப்பு தேவை',
      cashfreeRequiredMsg: 'கடன் வழங்குவதற்கு முன் Cashfree SecureID மூலம் வாடிக்கையாளர் அடையாள ஆவணத்தை சரிபார்க்கவும்.',
      consentRequiredTitle: 'ஒப்புதல் தேவை',
      consentRequiredMsg: 'வாடிக்கையாளர் ஒப்புதல் மற்றும் விதிமுறைகளுக்கான உடன்பாடு இரண்டும் உறுதிசெய்யப்பட வேண்டும்.',
      successTitle: 'வெற்றி',
      creditApprovedMsg: 'இந்த வாடிக்கையாளருக்கான கடன் கணக்கு அங்கீகரிக்கப்பட்டு செயல்படுத்தப்பட்டது.',
      errorTitle: 'பிழை',
      registrationFailedMsg: 'பதிவு தோல்வியடைந்தது',
      invalidAmountTitle: 'தவறான தொகை',
      invalidAmountMsg: '0-ஐ விட அதிகமான சரியான திருப்பிச் செலுத்தும் தொகையை உள்ளிடவும்.',
      amountExceedsDebtTitle: 'தொகை நிலுவையை விட அதிகம்',
      amountExceedsDebtMsg: 'அனுமதிக்கப்பட்ட அதிகபட்ச திருப்பிச் செலுத்துதல் ₹{{amount}}',
      repaymentRecordedTitle: 'திருப்பிச் செலுத்துதல் பதிவு செய்யப்பட்டது',
      repaymentRecordedMsg: '₹{{amount}} செலுத்துதல் சரிபார்க்கப்பட்டது.\nரசீது: {{receipt}}\nபுதிய இருப்பு: ₹{{balance}}',
      repaymentFailedMsg: 'திருப்பிச் செலுத்துதல் தோல்வியடைந்தது',
      reasonRequiredTitle: 'காரணம் தேவை',
      reasonRequiredMsg: 'விதிமுறைகளை மாற்றுவதற்கான தணிக்கைக் காரணத்தை வழங்கவும்.',
      termsUpdatedMsg: 'கடன் விதிமுறைகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன.',
      termsFailedMsg: 'விதிமுறைகள் புதுப்பித்தல் தோல்வியடைந்தது',
      suspendCreditTitle: 'கடனை இடைநிறுத்து',
      reactivateCreditTitle: 'கடனை மீண்டும் செயல்படுத்து',
      suspendConfirmMsg: '{{name}} என்பவருக்கு கடனை இடைநிறுத்த விரும்புகிறீர்களா?',
      reactivateConfirmMsg: '{{name}} என்பவருக்கு கடனை மீண்டும் செயல்படுத்த விரும்புகிறீர்களா?',
      updateStatusFailed: 'கணக்கு நிலையைப் புதுப்பிக்க முடியவில்லை',
      nameRequiredTitle: 'பெயர் தேவை',
      nameRequiredMsg: 'வாடிக்கையாளர் முழுப் பெயர் தேவை.',
      phoneRequiredTitle: 'தொலைபேசி எண் தேவை',
      phoneRequiredMsg: 'செல்லுபடியாகும் 10-இலக்க மொபைல் எண் தேவை.',
      emailRequiredTitle: 'மின்னஞ்சல் தேவை',
      emailRequiredMsg: 'செல்லுபடியாகும் வாடிக்கையாளர் மின்னஞ்சல் முகவரி தேவை.',
      enterLegalNameMsg: 'அடையாள ஆவணத்தில் உள்ள சட்டப்பூர்வ பெயரை உள்ளிடவும்.',
      enter12AadhaarMsg: 'செல்லுபடியாகும் 12-இலக்க ஆதார் எண்ணை உள்ளிடவும்.',
      invalidPanFormatMsg: 'தவறான பான் வடிவம் (10 எழுத்துக்கள்/எண்கள் எ.கா. ABCDE1234F).',
      enterAadhaarOtpMsg: 'ஆதாருடன் இணைக்கப்பட்ட மொபைலுக்கு வந்த OTP-ஐ உள்ளிடவும்.',
    },
  },

  te: {
    storeCreditTitle: 'స్టోర్ క్రెడిట్ (అప్పు/ఖాదా)',
    storeCreditSubtitle: 'ప్రైవేట్ క్రెడిట్ లైన్లు & రీపేమెంట్ లెడ్జర్లు',
    creditManagement: 'క్రెడిట్ (ఖాదా) నిర్వహణ',
    creditManagementSubtitle: 'ప్రత్యక్ష ఆమోదం, పరిమితులు, చెల్లింపులు & లెడ్జర్',
    myStoreCredit: 'నా స్టోర్ క్రెడిట్ (ఖాదా)',
    myStoreCreditSubtitle: 'స్టోర్ క్రెడిట్ పరిమితులు, చెల్లింపు తేదీలు & లెడ్జర్ చూడండి',

    searchPlaceholder: 'పేరు, ఫోన్ నంబర్ ద్వారా కస్టమర్లను వెతకండి...',
    inPersonCreditBtn: 'ప్రత్యక్ష క్రెడిట్ నమోదు',

    totalOutstanding: 'మొత్తం బకాయి',
    totalApprovedLimit: 'మొత్తం ఆమోదిత పరిమితి',
    activeAccounts: 'యాక్టివ్ ఖాతాలు',
    overdue: 'గడువు ముగిసినవి',

    creditLimit: 'క్రెడిట్ పరిమితి',
    totalCreditGranted: 'మంజూరు చేసిన మొత్తం క్రెడిట్',
    usedCredit: 'వాడిన క్రెడిట్',
    inOrders: 'ఆర్డర్లలో',
    available: 'అందుబాటులో ఉన్నది',
    ofLimit: '₹{{limit}} పరిమితిలో',

    filterAll: 'అన్నీ',
    filterActive: 'యాక్టివ్',
    filterWithBalance: 'బకాయి ఉన్నవి',
    filterSuspended: 'నిలిపివేయబడినవి',

    statusApproved: 'ఆమోదించబడింది',
    statusSuspended: 'నిలిపివేయబడింది',

    customer: 'కస్టమర్',
    outstanding: 'బకాయి',
    nextDue: 'తదుపరి గడువు',
    policyLabel: 'విధానం:',
    maskedIdLabel: 'గుర్తింపు సంఖ్య:',
    withinDays: '{{days}} రోజుల్లోగా',
    weeklyEvery: 'వారపు ప్రతి {{day}}',
    monthlyOnDay: 'నెలవారీ {{day}}వ తేదీ',
    everyDays: 'ప్రతి {{days}} రోజులకు',
    specificDueDate: 'నిర్దిష్ట గడువు తేదీ',
    standardTerms: 'ప్రామాణిక నిబంధనలు',
    dueOn: 'గడువు: {{date}}',
    overdueText: '(గడువు ముగిసింది)',
    overdueWarning: 'గడువు ముగిసింది: {{date}} లోపు చెల్లించాలి. స్టోర్‌ను స్వయంగా కలిసి చెల్లించండి.',
    settlementRequired: 'చెల్లింపు అవసరం: ₹{{balance}} చెల్లించే వరకు ఈ స్టోర్‌లో కొత్త కొనుగోళ్లు నిలిపివేయబడతాయి.',
    settlementBlockedDesc: 'బకాయి మొత్తం చెల్లించే వరకు కొత్త కొనుగోళ్లు నిలిపివేయబడతాయి.',

    recordRepaymentBtn: 'చెల్లింపును నమోదు చేయండి',
    ledgerBtn: 'లెడ్జర్',
    termsBtn: 'నిబంధనలు',
    reactivateCredit: 'క్రెడిట్‌ను పునరుద్ధరించండి',
    suspendCredit: 'క్రెడిట్‌ను నిలిపివేయండి',
    payViaUpiBtn: 'UPI / కార్డు ద్వారా చెల్లించండి',
    repaymentHistoryBtn: 'చెల్లింపుల చరిత్ర (లెడ్జర్)',
    cancel: 'రద్దు',
    confirm: 'ధృవీకరించు',
    change: 'మార్చు',
    resend: 'మళ్ళీ పంపు',

    loadingStoreCredit: 'స్టోర్ క్రెడిట్ ఖాతాలు లోడ్ అవుతున్నాయి...',
    loadingCustomerCredit: 'మీ క్రెడిట్ ఖాతాలు లోడ్ అవుతున్నాయి...',
    noCreditAccountsFound: 'క్రెడిట్ ఖాతాలు ఏవీ కనుగొనబడలేదు',
    registerInPersonDesc: 'స్టోర్ క్రెడిట్ మంజూరు చేయడానికి కస్టమర్‌ను ప్రత్యక్షంగా నమోదు చేయండి.',
    noCustomerCreditTitle: 'ఇంకా స్టోర్ క్రెడిట్ ఖాతాలు లేవు',
    noCustomerCreditDesc: 'స్టోర్ క్రెడిట్ స్థానిక దుకాణదారులతో ప్రత్యక్షంగా నమోదు చేయబడుతుంది. క్రెడిట్ నిబంధనలను అంగీకరించడానికి పాల్గొనే ఏదైనా స్టోర్‌ను సందర్శించండి.',
    howItWorksTitle: 'ఇది ఎలా పనిచేస్తుంది:',
    howItWorksStep1: '1. మీ Remise ఖాతాతో నేరుగా దుకాణానికి వెళ్ళండి.',
    howItWorksStep2: '2. క్రెడిట్ నిబంధనలను (వారం, నెల లేదా రోజులు) ఒప్పందం చేసుకోండి.',
    howItWorksStep3: '3. దుకాణదారుడు మీ ఖాతాను ఆమోదిస్తాడు. చెక్అవుట్ వద్ద వెంటనే క్రెడిట్ ఉపయోగించవచ్చు!',

    registerModalTitle: 'ప్రత్యక్ష క్రెడిట్ నమోదు',
    registerModalSubtitle: 'స్టోర్ ప్రైవేట్ క్రెడిట్ ఒప్పందం',
    step1CustomerInfo: '1. కస్టమర్ సమాచారం *',
    step1Subtitle: 'పేరు, ఫోన్ & ఇమెయిల్',
    searchAutoFillPlaceholder: 'ఆటో-ఫిల్ కోసం రిజిస్టర్డ్ కస్టమర్‌ను వెతకండి...',
    customerFullName: 'కస్టమర్ పూర్తి పేరు *',
    fullNamePlaceholder: 'ఉదా. రమేష్ బాబు',
    mobileNumberLabel: 'మొబైల్ నంబర్ (10 అంకెలు) *',
    mobilePlaceholder: 'ఉదా. 9876543210',
    emailAddressLabel: 'ఇమెయిల్ చిరునామా *',
    emailPlaceholder: 'ఉదా. customer@example.com',
    linkedAccountPrefix: '✓ అనుసంధానించబడిన ఖాతా:',
    customerMustBeRegistered: '⚠ క్రెడిట్ యాక్టివేట్ చేయడానికి కస్టమర్‌కు Remise ఖాతా ఉండాలి.',
    step2CreditLimit: '2. క్రెడిట్ పరిమితి (INR ₹)',
    limitPlaceholder: 'ఉదా. 5000',
    step3RepaymentPolicy: '3. రీపేమెంట్ విధానం',
    policyWeekly: 'వారపు',
    policyMonthly: 'నెలవారీ',
    policyCustomDays: 'కస్టమ్ రోజులు',
    policySpecificDate: 'నిర్దిష్ట తేదీ',
    weeklyDueDayLabel: 'వారపు గడువు రోజు',
    dueDayOfMonthLabel: 'నెలలో గడువు రోజు (1 - 31)',
    repayWithinDaysLabel: 'చెల్లించాల్సిన రోజులు',
    agreedDueDateLabel: 'ఒప్పంద గడువు తేదీ (YYYY-MM-DD)',
    step4IdentityVerification: '4. గుర్తింపు ధృవీకరణ (Cashfree SecureID) *',
    cashfreeVerifiedBadge: 'Cashfree ధృవీకరించబడింది',
    uidaiItdCheck: 'UIDAI / ITD తనిఖీ',
    aadhaarOption: 'ఆధార్ (UIDAI OTP)',
    panOption: 'పాన్ కార్డు (ఆదాయపు పన్ను)',
    aadhaarNumberLabel: 'ఆధార్ సంఖ్య (12 అంకెలు) *',
    panNumberLabel: 'పాన్ సంఖ్య (10 అక్షరాలు/అంకెలు) *',
    aadhaarPlaceholder: 'ఉదా. 123456789012',
    panPlaceholder: 'ఉదా. ABCDE1234F',
    legalNameLabel: 'గుర్తింపు పత్రంపై ఉన్న చట్టపరమైన పేరు *',
    legalNamePlaceholder: 'పత్రంలో ఉన్న విధంగానే పేరు',
    enterAadhaarOtpTitle: '6-అంకెల ఆధార్ OTP నమోదు చేయండి',
    sentToUidaiMobile: 'UIDAI లింక్ చేసిన మొబైల్‌కు పంపబడింది',
    confirmAadhaarOtpBtn: 'ఆధార్ OTP నిర్ధారించండి',
    sendingAadhaarOtp: 'Cashfree ద్వారా ఆధార్ OTP పంపబడుతోంది...',
    verifyingPan: 'Cashfree ద్వారా పాన్ ధృవీకరించబడుతోంది...',
    verifiedViaCashfreeTap: '✓ Cashfree ద్వారా ధృవీకరించబడింది (మళ్ళీ ధృవీకరించడానికి నొక్కండి)',
    verifyAadhaarBtn: 'Cashfree ద్వారా ఆధార్ ధృవీకరించండి (OTP పంపు)',
    verifyPanBtn: 'Cashfree ద్వారా పాన్ ధృవీకరించండి',
    cashfreeConfirmedTitle: 'Cashfree ధృవీకరణ విజయవంతమైంది',
    govtRecordNamePrefix: 'ప్రభుత్వ రికార్డులో పేరు:',
    maskedTokenPrefix: 'మాస్క్ చేయబడిన టోకెన్:',
    verifiedViaCashfreeSuffix: 'Cashfree ద్వారా ధృవీకరించబడింది',
    consentCheckboxLabel: 'కస్టమర్ గుర్తింపు పత్రాన్ని స్వయంగా సమర్పించి ధృవీకరణకు సమ్మతించారు.',
    agreementCheckboxLabel: 'కస్టమర్ క్రెడిట్ పరిమితి మరియు నిబంధనలను సమీక్షించి అంగీకరించారు.',
    approveAndActivateBtn: 'క్రెడిట్‌ను ఆమోదించి యాక్టివేట్ చేయండి',

    recordRepaymentTitle: 'నగదు చెల్లింపును నమోదు చేయండి',
    customerLabelPrefix: 'కస్టమర్:',
    outstandingDebtLabel: 'బకాయి ఉన్న అప్పు:',
    repaymentAmountLabel: 'చెల్లింపు మొత్తం (INR ₹)',
    amountCollectedPlaceholder: 'వసూలు చేసిన మొత్తం',
    notesReferenceLabel: 'గమనికలు / రిఫరెన్స్ (ఐచ్ఛికం)',
    notesPlaceholder: 'ఉదా. కౌంటర్‌లో నేరుగా నగదు చెల్లించారు',
    confirmReceiptBtn: 'ధృవీకరించి రసీదు జారీ చేయండి',

    modifyTermsTitle: 'క్రెడిట్ నిబంధనలను సవరించండి',
    newLimitLabel: 'కొత్త క్రెడిట్ పరిమితి (INR ₹)',
    limitShortPlaceholder: 'పరిమితి',
    auditReasonLabel: 'ఆడిట్ కారణం (తప్పనిసరి)',
    auditReasonPlaceholder: 'నిబంధనలు ఎందుకు మారుస్తున్నారో వివరించండి',
    updateTermsBtn: 'నిబంధనలను నవీకరించండి',

    ledgerModalTitle: 'క్రెడిట్ లెడ్జర్ చరిత్ర',
    customerCreditLedgerTitle: 'క్రెడిట్ లెడ్జర్',
    noLedgerEntries: 'ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు.',
    loadingLedger: 'లెడ్జర్ లోడ్ అవుతోంది...',
    noLedgerEntriesCustomer: 'ఇంకా లావాదేవీలు లేవు',
    noLedgerEntriesCustomerDesc: 'మీరు క్రెడిట్ కొనుగోళ్లు లేదా చెల్లింపులు చేసినప్పుడు లావాదేవీలు ఇక్కడ కనిపిస్తాయి.',
    balPrefix: 'నిల్వ:',
    refPrefix: 'రెఫ్:',
    repaymentType: 'చెల్లింపు',
    orderDebitType: 'ఆర్డర్ డెబిట్',

    days: {
      mon: 'సోమ',
      tue: 'మంగళ',
      wed: 'బుధ',
      thu: 'గురు',
      fri: 'శుక్ర',
      sat: 'శని',
      sun: 'ఆది',
      monday: 'సోమవారం',
      tuesday: 'మంగళవారం',
      wednesday: 'బుధవారం',
      thursday: 'గురువారం',
      friday: 'శుక్రవారం',
      saturday: 'శనివారం',
      sunday: 'ఆదివారం',
    },

    alerts: {
      invalidLimitTitle: 'చెల్లని పరిమితి',
      invalidLimitMsg: 'క్రెడిట్ పరిమితి ధనాత్మక సంఖ్య అయి ఉండాలి.',
      identityRequiredTitle: 'గుర్తింపు అవసరం',
      identityRequiredMsg: 'దయచేసి గుర్తింపు పత్రం సంఖ్యను నమోదు చేయండి.',
      nameOnIdRequiredTitle: 'పత్రంపై పేరు అవసరం',
      nameOnIdRequiredMsg: 'దయచేసి గుర్తింపు పత్రంతో సరిపోయే చట్టపరమైన పేరును నమోదు చేయండి.',
      cashfreeRequiredTitle: 'Cashfree ధృవీకరణ అవసరం',
      cashfreeRequiredMsg: 'క్రెడిట్ మంజూరు చేయడానికి ముందు Cashfree SecureID ద్వారా గుర్తింపును ధృవీకరించండి.',
      consentRequiredTitle: 'సమ్మతి అవసరం',
      consentRequiredMsg: 'కస్టమర్ సమ్మతి మరియు నిబంధనల అంగీకారం రెండూ అవసరం.',
      successTitle: 'విజయం',
      creditApprovedMsg: 'ఈ కస్టమర్ కోసం క్రెడిట్ ఖాతా ఆమోదించబడింది మరియు యాక్టివేట్ చేయబడింది.',
      errorTitle: 'లోపం',
      registrationFailedMsg: 'నమోదు విఫలమైంది',
      invalidAmountTitle: 'చెల్లని మొత్తం',
      invalidAmountMsg: 'దయచేసి 0 కంటే ఎక్కువ చెల్లుబాటు అయ్యే మొత్తాన్ని నమోదు చేయండి.',
      amountExceedsDebtTitle: 'మొత్తం బకాయిని మించిపోయింది',
      amountExceedsDebtMsg: 'గరిష్టంగా అనుమతించబడే చెల్లింపు ₹{{amount}}',
      repaymentRecordedTitle: 'చెల్లింపు నమోదైంది',
      repaymentRecordedMsg: '₹{{amount}} చెల్లింపు ధృవీకరించబడింది.\nరసీదు: {{receipt}}\nకొత్త నిల్వ: ₹{{balance}}',
      repaymentFailedMsg: 'చెల్లింపు విఫలమైంది',
      reasonRequiredTitle: 'కారణం అవసరం',
      reasonRequiredMsg: 'నిబంధనలు మార్చడానికి ఆడిట్ కారణాన్ని తెలియజేయండి.',
      termsUpdatedMsg: 'క్రెడిట్ నిబంధనలు విజయవంతంగా నవీకరించబడ్డాయి.',
      termsFailedMsg: 'నిబంధనల నవీకరణ విఫలమైంది',
      suspendCreditTitle: 'క్రెడిట్‌ను నిలిపివేయండి',
      reactivateCreditTitle: 'క్రెడిట్‌ను పునరుద్ధరించండి',
      suspendConfirmMsg: 'మీరు ఖచ్చితంగా {{name}} కోసం క్రెడిట్‌ను నిలిపివేయాలనుకుంటున్నారా?',
      reactivateConfirmMsg: 'మీరు ఖచ్చితంగా {{name}} కోసం క్రెడిట్‌ను పునరుద్ధరించాలనుకుంటున్నారా?',
      updateStatusFailed: 'ఖాతా స్థితిని నవీకరించడం విఫలమైంది',
      nameRequiredTitle: 'పేరు అవసరం',
      nameRequiredMsg: 'కస్టమర్ పూర్తి పేరు అవసరం.',
      phoneRequiredTitle: 'ఫోన్ నంబర్ అవసరం',
      phoneRequiredMsg: 'చెల్లుబాటు అయ్యే 10-అంకెల మొబైల్ నంబర్ అవసరం.',
      emailRequiredTitle: 'ఇమెయిల్ అవసరం',
      emailRequiredMsg: 'చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా అవసరం.',
      enterLegalNameMsg: 'దయచేసి గుర్తింపు పత్రంపై ఉన్న చట్టపరమైన పేరును నమోదు చేయండి.',
      enter12AadhaarMsg: 'దయచేసి చెల్లుబాటు అయ్యే 12-అంకెల ఆధార్ సంఖ్యను నమోదు చేయండి.',
      invalidPanFormatMsg: 'చెల్లని పాన్ ఫార్మాట్ (10 అక్షరాలు/అంకెలు ఉండాలి, ఉదా. ABCDE1234F).',
      enterAadhaarOtpMsg: 'దయచేసి ఆధార్ లింక్ చేసిన మొబైల్‌కు వచ్చిన OTP నమోదు చేయండి.',
    },
  },

  kn: {
    storeCreditTitle: 'ಅಂಗಡಿ ಕ್ರೆಡಿಟ್ (ಉದ್ದರಿ/ಸಾಲ)',
    storeCreditSubtitle: 'ಖಾಸಗಿ ಕ್ರೆಡಿಟ್ ಮಿತಿಗಳು & ಮರುಪಾವತಿ ಲೆಡ್ಜರ್ಗಳು',
    creditManagement: 'ಕ್ರೆಡಿಟ್ (ಉದ್ದರಿ) ನಿರ್ವಹಣೆ',
    creditManagementSubtitle: 'ನೇರ ಅನುಮೋದನೆ, ಮಿತಿಗಳು, ಮರುಪಾವತಿಗಳು & ಲೆಡ್ಜರ್',
    myStoreCredit: 'ನನ್ನ ಅಂಗಡಿ ಕ್ರೆಡಿಟ್ (ಉದ್ದರಿ)',
    myStoreCreditSubtitle: 'ಕ್ರೆಡಿಟ್ ಮಿತಿಗಳು, ಬಾಕಿ ದಿನಾಂಕಗಳು & ಲೆಡ್ಜರ್ ವೀಕ್ಷಿಸಿ',

    searchPlaceholder: 'ಹೆಸರು, ಫೋನ್ ಮೂಲಕ ಗ್ರಾಹಕರನ್ನು ಹುಡುಕಿ...',
    inPersonCreditBtn: 'ನೇರ ಕ್ರೆಡಿಟ್ ನೋಂದಣಿ',

    totalOutstanding: 'ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ',
    totalApprovedLimit: 'ಒಟ್ಟು ಅನುಮೋದಿತ ಮಿತಿ',
    activeAccounts: 'ಸಕ್ರಿಯ ಖಾತೆಗಳು',
    overdue: 'ಅವಧಿ ಮೀರಿದ್ದು',

    creditLimit: 'ಕ್ರೆಡಿಟ್ ಮಿತಿ',
    totalCreditGranted: 'ನೀಡಲಾದ ಒಟ್ಟು ಕ್ರೆಡಿಟ್',
    usedCredit: 'ಬಳಸಿದ ಕ್ರೆಡಿಟ್',
    inOrders: 'ಆರ್ಡರ್‌ಗಳಲ್ಲಿ',
    available: 'ಲಭ್ಯವಿರುವುದು',
    ofLimit: '₹{{limit}} ಮಿತಿಯಲ್ಲಿ',

    filterAll: 'ಎಲ್ಲವೂ',
    filterActive: 'ಸಕ್ರಿಯ',
    filterWithBalance: 'ಬಾಕಿ ಇರುವವು',
    filterSuspended: 'ಅಮಾನತುಗೊಂಡಿದೆ',

    statusApproved: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    statusSuspended: 'ಅಮಾನತುಗೊಂಡಿದೆ',

    customer: 'ಗ್ರಾಹಕ',
    outstanding: 'ಬಾಕಿ',
    nextDue: 'ಮುಂದಿನ ಬಾಕಿ ದಿನ',
    policyLabel: 'ನೀತಿ:',
    maskedIdLabel: 'ಗುರುತಿನ ಸಂಖ್ಯೆ:',
    withinDays: '{{days}} ದಿನಗಳ ಒಳಗೆ',
    weeklyEvery: 'ವಾರಕ್ಕೊಮ್ಮೆ ಪ್ರತಿ {{day}}',
    monthlyOnDay: 'ತಿಂಗಳಿನ {{day}}ನೇ ದಿನ',
    everyDays: 'ಪ್ರತಿ {{days}} ದಿನಗಳಿಗೊಮ್ಮೆ',
    specificDueDate: 'ನಿರ್ದಿಷ್ಟ ಬಾಕಿ ದಿನಾಂಕ',
    standardTerms: 'ಪ್ರಮಾಣಿತ ನಿಯಮಗಳು',
    dueOn: 'ಬಾಕಿ ದಿನಾಂಕ: {{date}}',
    overdueText: '(ಅವಧಿ ಮೀರಿದೆ)',
    overdueWarning: 'ಅವಧಿ ಮೀರಿದೆ: {{date}} ಒಳಗೆ ಪಾವತಿಸಬೇಕು. ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ ಪಾವತಿಸಿ.',
    settlementRequired: 'ಪಾವತಿ ಅಗತ್ಯವಿದೆ: ₹{{balance}} ಪಾವತಿಸುವವರೆಗೆ ಈ ಅಂಗಡಿಯಲ್ಲಿ ಹೊಸ ಖರೀದಿಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.',
    settlementBlockedDesc: 'ಬಾಕಿ ಪಾವತಿಸುವವರೆಗೆ ಹೊಸ ಖರೀದಿಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.',

    recordRepaymentBtn: 'ಮರುಪಾವತಿ ದಾಖಲಿಸಿ',
    ledgerBtn: 'ಲೆಡ್ಜರ್',
    termsBtn: 'ನಿಯಮಗಳು',
    reactivateCredit: 'ಕ್ರೆಡಿಟ್ ಮರುಸಕ್ರಿಯಗೊಳಿಸಿ',
    suspendCredit: 'ಕ್ರೆಡಿಟ್ ಅಮಾನತುಗೊಳಿಸಿ',
    payViaUpiBtn: 'UPI / ಕಾರ್ಡ್ ಮೂಲಕ ಪಾವತಿಸಿ',
    repaymentHistoryBtn: 'ಮರುಪಾವತಿ ಇತಿಹಾಸ (ಲೆಡ್ಜರ್)',
    cancel: 'ರದ್ದು',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    change: 'ಬದಲಾಯಿಸಿ',
    resend: 'ಮತ್ತೆ ಕಳುಹಿಸಿ',

    loadingStoreCredit: 'ಅಂಗಡಿ ಕ್ರೆಡಿಟ್ ಖಾತೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    loadingCustomerCredit: 'ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಖಾತೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    noCreditAccountsFound: 'ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಖಾತೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    registerInPersonDesc: 'ಅಂಗಡಿ ಕ್ರೆಡಿಟ್ ನೀಡಲು ಗ್ರಾಹಕರನ್ನು ನೇರವಾಗಿ ನೋಂದಾಯಿಸಿ.',
    noCustomerCreditTitle: 'ಇನ್ನೂ ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಖಾತೆಗಳಿಲ್ಲ',
    noCustomerCreditDesc: 'ಅಂಗಡಿ ಕ್ರೆಡಿಟ್ ಅನ್ನು ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಿಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ನೋಂದಾಯಿಸಲಾಗುತ್ತದೆ. ಕ್ರೆಡಿಟ್ ಒಪ್ಪಂದಕ್ಕೆ ಯಾವುದೇ ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ.',
    howItWorksTitle: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ:',
    howItWorksStep1: '1. ನಿಮ್ಮ Remise ಖಾತೆಯೊಂದಿಗೆ ಅಂಗಡಿಗೆ ನೇರವಾಗಿ ಭೇಟಿ ನೀಡಿ.',
    howItWorksStep2: '2. ಮರುಪಾವತಿ ನಿಯಮಗಳನ್ನು (ವಾರ, ತಿಂಗಳು ಅಥವಾ ದಿನಗಳು) ಒಪ್ಪಿಕೊಳ್ಳಿ.',
    howItWorksStep3: '3. ಅಂಗಡಿ ಮಾಲೀಕರು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅನುಮೋದಿಸುತ್ತಾರೆ. ತಕ್ಷಣವೇ ಕ್ರೆಡಿಟ್ ಬಳಸಬಹುದು!',

    registerModalTitle: 'ನೇರ ಕ್ರೆಡಿಟ್ ನೋಂದಣಿ',
    registerModalSubtitle: 'ಅಂಗಡಿಯ ಖಾಸಗಿ ಕ್ರೆಡಿಟ್ ಒಪ್ಪಂದ',
    step1CustomerInfo: '1. ಗ್ರಾಹಕರ ಮಾಹಿತಿ *',
    step1Subtitle: 'ಹೆಸರು, ಫೋನ್ & ಇಮೇಲ್',
    searchAutoFillPlaceholder: 'ಆಟೋ-ಫಿಲ್ ಮಾಡಲು ಗ್ರಾಹಕರನ್ನು ಹುಡುಕಿ...',
    customerFullName: 'ಗ್ರಾಹಕರ ಪೂರ್ಣ ಹೆಸರು *',
    fullNamePlaceholder: 'ಉದಾ. ಸುರೇಶ್ ಕುಮಾರ್',
    mobileNumberLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು) *',
    mobilePlaceholder: 'ಉದಾ. 9876543210',
    emailAddressLabel: 'ಇಮೇಲ್ ವಿಳಾಸ *',
    emailPlaceholder: 'ಉದಾ. customer@example.com',
    linkedAccountPrefix: '✓ ಲಿಂಕ್ ಆದ ಖಾತೆ:',
    customerMustBeRegistered: '⚠ ಕ್ರೆಡಿಟ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ಗ್ರಾಹಕರು Remise ಖಾತೆ ಹೊಂದಿರಬೇಕು.',
    step2CreditLimit: '2. ಕ್ರೆಡಿಟ್ ಮಿತಿ (INR ₹)',
    limitPlaceholder: 'ಉದಾ. 5000',
    step3RepaymentPolicy: '3. ಮರುಪಾವತಿ ನೀತಿ',
    policyWeekly: 'ಸಾಪ್ತಾಹಿಕ',
    policyMonthly: 'ಮಾಸಿಕ',
    policyCustomDays: 'ಕಸ್ಟಮ್ ದಿನಗಳು',
    policySpecificDate: 'ನಿರ್ದಿಷ್ಟ ದಿನಾಂಕ',
    weeklyDueDayLabel: 'ವಾರದ ಬಾಕಿ ದಿನ',
    dueDayOfMonthLabel: 'ತಿಂಗಳ ಬಾಕಿ ದಿನ (1 - 31)',
    repayWithinDaysLabel: 'ಪಾವತಿಸಬೇಕಾದ ದಿನಗಳು',
    agreedDueDateLabel: 'ಒಪ್ಪಂದದ ಬಾಕಿ ದಿನಾಂಕ (YYYY-MM-DD)',
    step4IdentityVerification: '4. ಗುರುತಿನ ಪರಿಶೀಲನೆ (Cashfree SecureID) *',
    cashfreeVerifiedBadge: 'Cashfree ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    uidaiItdCheck: 'UIDAI / ITD ಪರಿಶೀಲನೆ',
    aadhaarOption: 'ಆಧಾರ್ (UIDAI OTP)',
    panOption: 'ಪ್ಯಾನ್ ಕಾರ್ಡ್ (ಆದಾಯ ತೆರಿಗೆ)',
    aadhaarNumberLabel: 'ಆಧಾರ್ ಸಂಖ್ಯೆ (12 ಅಂಕಿಗಳು) *',
    panNumberLabel: 'ಪ್ಯಾನ್ ಸಂಖ್ಯೆ (10 ಅಕ್ಷರಗಳು/ಅಂಕಿಗಳು) *',
    aadhaarPlaceholder: 'ಉದಾ. 123456789012',
    panPlaceholder: 'ಉದಾ. ABCDE1234F',
    legalNameLabel: 'ಗುರುತಿನ ಪತ್ರದಲ್ಲಿರುವ ಕಾನೂನುಬದ್ಧ ಹೆಸರು *',
    legalNamePlaceholder: 'ಪತ್ರದಲ್ಲಿರುವಂತೆ ನಿಖರ ಹೆಸರು',
    enterAadhaarOtpTitle: '6-ಅಂಕಿಯ ಆಧಾರ್ OTP ನಮೂದಿಸಿ',
    sentToUidaiMobile: 'UIDAI ಮೊಬೈಲ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ',
    confirmAadhaarOtpBtn: 'ಆಧಾರ್ OTP ದೃಢೀಕರಿಸಿ',
    sendingAadhaarOtp: 'Cashfree ಮೂಲಕ ಆಧಾರ್ OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    verifyingPan: 'Cashfree ಮೂಲಕ ಪ್ಯಾನ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    verifiedViaCashfreeTap: '✓ Cashfree ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ಮರುಪರಿಶೀಲಿಸಲು ಸ್ಪರ್ಶಿಸಿ)',
    verifyAadhaarBtn: 'Cashfree ಮೂಲಕ ಆಧಾರ್ ಪರಿಶೀಲಿಸಿ (OTP ಕಳುಹಿಸಿ)',
    verifyPanBtn: 'Cashfree ಮೂಲಕ ಪ್ಯಾನ್ ಪರಿಶೀಲಿಸಿ',
    cashfreeConfirmedTitle: 'Cashfree ಪರಿಶೀಲನೆ ದೃಢಪಟ್ಟಿದೆ',
    govtRecordNamePrefix: 'ಸರ್ಕಾರಿ ದಾಖಲೆಯ ಹೆಸರು:',
    maskedTokenPrefix: 'ಮರೆಮಾಡಿದ ಸಂಖ್ಯೆ:',
    verifiedViaCashfreeSuffix: 'Cashfree ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    consentCheckboxLabel: 'ಗ್ರಾಹಕರು ಗುರುತಿನ ಪತ್ರವನ್ನು ಖುದ್ದಾಗಿ ಪ್ರಸ್ತುತಪಡಿಸಿ ಪರಿಶೀಲನೆಗೆ ಸಮ್ಮತಿಸಿದ್ದಾರೆ.',
    agreementCheckboxLabel: 'ಗ್ರಾಹಕರು ಕ್ರೆಡಿಟ್ ಮಿತಿ ಮತ್ತು ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಒಪ್ಪಿಕೊಂಡಿದ್ದಾರೆ.',
    approveAndActivateBtn: 'ಕ್ರೆಡಿಟ್ ಅನುಮೋದಿಸಿ ಸಕ್ರಿಯಗೊಳಿಸಿ',

    recordRepaymentTitle: 'ನಗದು ಮರುಪಾವತಿ ದಾಖಲಿಸಿ',
    customerLabelPrefix: 'ಗ್ರಾಹಕ:',
    outstandingDebtLabel: 'ಬಾಕಿ ಇರುವ ಸಾಲ:',
    repaymentAmountLabel: 'ಮರುಪಾವತಿ ಮೊತ್ತ (INR ₹)',
    amountCollectedPlaceholder: 'ಸ್ವೀಕರಿಸಿದ ಮೊತ್ತ',
    notesReferenceLabel: 'ಟಿಪ್ಪಣಿಗಳು / ಉಲ್ಲೇಖ (ಐಚ್ಛಿಕ)',
    notesPlaceholder: 'ಉದಾ. ಕೌಂಟರ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ನಗದು ಪಾವತಿಸಲಾಗಿದೆ',
    confirmReceiptBtn: 'ದೃಢೀಕರಿಸಿ ರಸೀದಿ ನೀಡಿ',

    modifyTermsTitle: 'ಕ್ರೆಡಿಟ್ ನಿಯಮಗಳನ್ನು ಮಾರ್ಪಡಿಸಿ',
    newLimitLabel: 'ಹೊಸ ಕ್ರೆಡಿಟ್ ಮಿತಿ (INR ₹)',
    limitShortPlaceholder: 'ಮಿತಿ',
    auditReasonLabel: 'ಆಡಿಟ್ ಕಾರಣ (ಕಡ್ಡಾಯ)',
    auditReasonPlaceholder: 'ನಿಯಮಗಳನ್ನು ಬದಲಾಯಿಸಲು ಕಾರಣವನ್ನು ವಿವರಿಸಿ',
    updateTermsBtn: 'ನಿಯಮಗಳನ್ನು ನವೀಕರಿಸಿ',

    ledgerModalTitle: 'ಕ್ರೆಡಿಟ್ ಲೆಡ್ಜರ್ ಇತಿಹಾಸ',
    customerCreditLedgerTitle: 'ಕ್ರೆಡಿಟ್ ಲೆಡ್ಜರ್',
    noLedgerEntries: 'ಯಾವುದೇ ವಹಿವಾಟುಗಳು ದಾಖಲಾಗಿಲ್ಲ.',
    loadingLedger: 'ಲೆಡ್ಜರ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    noLedgerEntriesCustomer: 'ಯಾವುದೇ ವಹಿವಾಟುಗಳಿಲ್ಲ',
    noLedgerEntriesCustomerDesc: 'ನೀವು ಕ್ರೆಡಿಟ್ ಖರೀದಿ ಅಥವಾ ಮರುಪಾವತಿ ಮಾಡಿದಾಗ ವಹಿವಾಟುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    balPrefix: 'ಉಳಿಕೆ:',
    refPrefix: 'ರೆಫ್:',
    repaymentType: 'ಮರುಪಾವತಿ',
    orderDebitType: 'ಆರ್ಡರ್ ಡೆಬಿಟ್',

    days: {
      mon: 'ಸೋಮ',
      tue: 'ಮಂಗಳ',
      wed: 'ಬುಧ',
      thu: 'ಗುರು',
      fri: 'ಶುಕ್ರ',
      sat: 'ಶನಿ',
      sun: 'ಭಾನು',
      monday: 'ಸೋಮವಾರ',
      tuesday: 'ಮಂಗಳವಾರ',
      wednesday: 'ಬುಧವಾರ',
      thursday: 'ಗುರುವಾರ',
      friday: 'ಶುಕ್ರವಾರ',
      saturday: 'ಶನಿವಾರ',
      sunday: 'ಭಾನುವಾರ',
    },

    alerts: {
      invalidLimitTitle: 'ಅಮಾನ್ಯ ಮಿತಿ',
      invalidLimitMsg: 'ಕ್ರೆಡಿಟ್ ಮಿತಿಯು ಧನಾತ್ಮಕ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು.',
      identityRequiredTitle: 'ಗುರುತಿನ ಪತ್ರ ಅಗತ್ಯವಿದೆ',
      identityRequiredMsg: 'ದಯವಿಟ್ಟು ಗುರುತಿನ ಪತ್ರದ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
      nameOnIdRequiredTitle: 'ಪತ್ರದಲ್ಲಿನ ಹೆಸರು ಅಗತ್ಯವಿದೆ',
      nameOnIdRequiredMsg: 'ದಯವಿಟ್ಟು ಗುರುತಿನ ಪತ್ರಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ಕಾನೂನುಬದ್ಧ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
      cashfreeRequiredTitle: 'Cashfree ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
      cashfreeRequiredMsg: 'ಕ್ರೆಡಿಟ್ ನೀಡುವ ಮೊದಲು Cashfree SecureID ಮೂಲಕ ಗುರುತನ್ನು ಪರಿಶೀಲಿಸಿ.',
      consentRequiredTitle: 'ಸಮ್ಮತಿ ಅಗತ್ಯವಿದೆ',
      consentRequiredMsg: 'ಗ್ರಾಹಕರ ಸಮ್ಮತಿ ಮತ್ತು ಒಪ್ಪಂದ ಎರಡನ್ನೂ ದೃಢೀಕರಿಸಬೇಕು.',
      successTitle: 'ಯಶಸ್ಸು',
      creditApprovedMsg: 'ಈ ಗ್ರಾಹಕರಿಗೆ ಕ್ರೆಡಿಟ್ ಖಾತೆಯನ್ನು ಅನುಮೋದಿಸಲಾಗಿದೆ ಮತ್ತು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.',
      errorTitle: 'ದೋಷ',
      registrationFailedMsg: 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ',
      invalidAmountTitle: 'ಅಮಾನ್ಯ ಮೊತ್ತ',
      invalidAmountMsg: 'ದಯವಿಟ್ಟು 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಮಾನ್ಯ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ.',
      amountExceedsDebtTitle: 'ಮೊತ್ತವು ಸಾಲಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿದೆ',
      amountExceedsDebtMsg: 'ಗರಿಷ್ಠ ಅನುಮತಿಸಲಾದ ಮರುಪಾವತಿ ₹{{amount}}',
      repaymentRecordedTitle: 'ಮರುಪಾವತಿ ದಾಖಲಾಗಿದೆ',
      repaymentRecordedMsg: '₹{{amount}} ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ.\nರಸೀದಿ: {{receipt}}\nಹೊಸ ಉಳಿಕೆ: ₹{{balance}}',
      repaymentFailedMsg: 'ಮರುಪಾವತಿ ವಿಫಲವಾಗಿದೆ',
      reasonRequiredTitle: 'ಕಾರಣ ಅಗತ್ಯವಿದೆ',
      reasonRequiredMsg: 'ನಿಯಮಗಳನ್ನು ಬದಲಾಯಿಸಲು ದಯವಿಟ್ಟು ಆಡಿಟ್ ಕಾರಣವನ್ನು ನೀಡಿ.',
      termsUpdatedMsg: 'ಕ್ರೆಡಿಟ್ ನಿಯಮಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
      termsFailedMsg: 'ನಿಯಮಗಳ ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ',
      suspendCreditTitle: 'ಕ್ರೆಡಿಟ್ ಅಮಾನತುಗೊಳಿಸಿ',
      reactivateCreditTitle: 'ಕ್ರೆಡಿಟ್ ಮರುಸಕ್ರಿಯಗೊಳಿಸಿ',
      suspendConfirmMsg: 'ನೀವು ಖಚಿತವಾಗಿ {{name}} ಅವರಿಗೆ ಕ್ರೆಡಿಟ್ ಅಮಾನತುಗೊಳಿಸಲು ಬಯಸುವಿರಾ?',
      reactivateConfirmMsg: 'ನೀವು ಖಚಿತವಾಗಿ {{name}} ಅವರಿಗೆ ಕ್ರೆಡಿಟ್ ಮರುಸಕ್ರಿಯಗೊಳಿಸಲು ಬಯಸುವಿರಾ?',
      updateStatusFailed: 'ಖಾತೆಯ ಸ್ಥಿತಿ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ',
      nameRequiredTitle: 'ಹೆಸರು ಅಗತ್ಯವಿದೆ',
      nameRequiredMsg: 'ಗ್ರಾಹಕರ ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯವಿದೆ.',
      phoneRequiredTitle: 'ಫೋನ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ',
      phoneRequiredMsg: 'ಮಾನ್ಯ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ.',
      emailRequiredTitle: 'ಇಮೇಲ್ ಅಗತ್ಯವಿದೆ',
      emailRequiredMsg: 'ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ಅಗತ್ಯವಿದೆ.',
      enterLegalNameMsg: 'ದಯವಿಟ್ಟು ಗುರುತಿನ ಪತ್ರದಲ್ಲಿರುವ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
      enter12AadhaarMsg: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ 12-ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
      invalidPanFormatMsg: 'ಅಮಾನ್ಯ ಪ್ಯಾನ್ ಫಾರ್ಮ್ಯಾಟ್ (10 ಅಕ್ಷರಗಳು/ಅಂಕಿಗಳು, ಉದಾ. ABCDE1234F).',
      enterAadhaarOtpMsg: 'ದಯವಿಟ್ಟು ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಮೊಬೈಲ್‌ಗೆ ಬಂದ OTP ನಮೂದಿಸಿ.',
    },
  },

  ml: {
    storeCreditTitle: 'സ്റ്റോർ ക്രെഡിറ്റ് (കടം)',
    storeCreditSubtitle: 'സ്വകാര്യ ക്രെഡിറ്റ് പരിധികളും തിരിച്ചടവ് ലെഡ്ജറുകളും',
    creditManagement: 'ക്രെഡിറ്റ് (കടം) മാനേജ്മെന്റ്',
    creditManagementSubtitle: 'നേരിട്ടുള്ള അനുമതി, പരിധികൾ, തിരിച്ചടവുകൾ & ലെഡ്ജർ',
    myStoreCredit: 'എന്റെ സ്റ്റോർ ക്രെഡിറ്റ് (കടം)',
    myStoreCreditSubtitle: 'സ്റ്റോർ ക്രെഡിറ്റ് പരിധികളും തിരിച്ചടവ് തീയതികളും ലെഡ്ജറും കാണുക',

    searchPlaceholder: 'പേര്, ഫോൺ നമ്പർ വഴി ഉപഭോക്താക്കളെ തിരയുക...',
    inPersonCreditBtn: 'നേരിട്ടുള്ള ക്രെഡിറ്റ് രജിസ്ട്രേഷൻ',

    totalOutstanding: 'ആകെ കുടിശ്ശിക',
    totalApprovedLimit: 'ആകെ അനുവദിച്ച പരിധി',
    activeAccounts: 'സജീവ അക്കൗണ്ടുകൾ',
    overdue: 'കാലഹരണപ്പെട്ടത്',

    creditLimit: 'ക്രെഡിറ്റ് പരിധി',
    totalCreditGranted: 'ആകെ നൽകിയ ക്രെഡിറ്റ്',
    usedCredit: 'ഉപയോഗിച്ച ക്രെഡിറ്റ്',
    inOrders: 'ഓർഡറുകളിൽ',
    available: 'ലഭ്യമായത്',
    ofLimit: '₹{{limit}} പരിധിയിൽ',

    filterAll: 'എല്ലാം',
    filterActive: 'സജീവം',
    filterWithBalance: 'കുടിശ്ശിക ഉള്ളവ',
    filterSuspended: 'താൽക്കാലികമായി നിർത്തിയത്',

    statusApproved: 'അംഗീകരിച്ചു',
    statusSuspended: 'താൽക്കാലികമായി നിർത്തി',

    customer: 'ഉപഭോക്താവ്',
    outstanding: 'കുടിശ്ശിക',
    nextDue: 'അടുത്ത അടവ് തീയതി',
    policyLabel: 'വ്യവസ്ഥ:',
    maskedIdLabel: 'തിരിച്ചറിയൽ നമ്പർ:',
    withinDays: '{{days}} ദിവസത്തിനകം',
    weeklyEvery: 'ആഴ്ചതോറും {{day}}',
    monthlyOnDay: 'മാസത്തിൽ {{day}}-ാം തീയതി',
    everyDays: 'ഓരോ {{days}} ദിവസത്തിലും',
    specificDueDate: 'നിശ്ചിത തീയതി',
    standardTerms: 'സാധാരണ നിബന്ധനകൾ',
    dueOn: 'അടയ്ക്കേണ്ട തീയതി: {{date}}',
    overdueText: '(കാലഹരണപ്പെട്ടു)',
    overdueWarning: 'കാലഹരണപ്പെട്ടു: {{date}}-നകം അടയ്ക്കണം. കടയിൽ നേരിട്ടെത്തി കുടിശ്ശിക തീർക്കുക.',
    settlementRequired: 'കുടിശ്ശിക തീർപ്പാക്കണം: ₹{{balance}} അടയ്ക്കുന്നതുവരെ ഈ കടയിൽ പുതിയ വാങ്ങലുകൾ തടഞ്ഞിരിക്കുന്നു.',
    settlementBlockedDesc: 'കുടിശ്ശിക തീർക്കുന്നതുവരെ പുതിയ വാങ്ങലുകൾ സാധ്യമല്ല.',

    recordRepaymentBtn: 'തിരിച്ചടവ് രേഖപ്പെടുത്തുക',
    ledgerBtn: 'ലെഡ്ജർ',
    termsBtn: 'വ്യവസ്ഥകൾ',
    reactivateCredit: 'ക്രെഡിറ്റ് പുനരാരംഭിക്കുക',
    suspendCredit: 'ക്രെഡിറ്റ് താൽക്കാലികമായി നിർത്തുക',
    payViaUpiBtn: 'UPI / കാർഡ് വഴി അടയ്ക്കുക',
    repaymentHistoryBtn: 'തിരിച്ചടവ് ചരിത്രം (ലെഡ്ജർ)',
    cancel: 'റദ്ദാക്കുക',
    confirm: 'സ്ഥിരീകരിക്കുക',
    change: 'മാറ്റുക',
    resend: 'വീണ്ടും അയക്കുക',

    loadingStoreCredit: 'സ്റ്റോർ ക്രെഡിറ്റ് അക്കൗണ്ടുകൾ ലഭ്യമാക്കുന്നു...',
    loadingCustomerCredit: 'നിങ്ങളുടെ ക്രെഡിറ്റ് അക്കൗണ്ടുകൾ ലഭ്യമാക്കുന്നു...',
    noCreditAccountsFound: 'ക്രെഡിറ്റ് അക്കൗണ്ടുകളൊന്നും കണ്ടെത്തിയില്ല',
    registerInPersonDesc: 'സ്റ്റോർ ക്രെഡിറ്റ് നൽകാൻ ഒരു ഉപഭോക്താവിനെ നേരിട്ട് രജിസ്റ്റർ ചെയ്യുക.',
    noCustomerCreditTitle: 'സ്റ്റോർ ക്രെഡിറ്റ് അക്കൗണ്ടുകളൊന്നുമില്ല',
    noCustomerCreditDesc: 'സ്റ്റോർ ക്രെഡിറ്റ് പ്രാദേശിക വ്യാപാരികളുമായി നേരിട്ട് രജിസ്റ്റർ ചെയ്യുന്നതാണ്. ക്രെഡിറ്റ് സൗകര്യത്തിനായി കട സന്ദർശിക്കുക.',
    howItWorksTitle: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു:',
    howItWorksStep1: '1. നിങ്ങളുടെ Remise അക്കൗണ്ടുമായി കടയിൽ നേരിട്ടെത്തുക.',
    howItWorksStep2: '2. തിരിച്ചടവ് വ്യവസ്ഥകൾ (ആഴ്ചയിലോ മാസത്തിലോ ദിവസങ്ങളിലോ) ധാരണയാക്കുക.',
    howItWorksStep3: '3. വ്യാപാരി നിങ്ങളുടെ അക്കൗണ്ട് അംഗീകരിക്കും. തുടർന്ന് ചെക്ക്ഔട്ടിൽ ക്രെഡിറ്റ് ഉപയോഗിക്കാം!',

    registerModalTitle: 'നേരിട്ടുള്ള ക്രെഡിറ്റ് രജിസ്ട്രേഷൻ',
    registerModalSubtitle: 'കടയുടെ സ്വകാര്യ ക്രെഡിറ്റ് ഉടമ്പടി',
    step1CustomerInfo: '1. ഉപഭോക്തൃ വിവരങ്ങൾ *',
    step1Subtitle: 'പേര്, ഫോൺ & ഇമെയിൽ',
    searchAutoFillPlaceholder: 'രജിസ്റ്റർ ചെയ്ത ഉപഭോക്താവിനെ തിരയുക...',
    customerFullName: 'പൂർണ്ണമായ പേര് *',
    fullNamePlaceholder: 'ഉദാ. അനൂപ് കുമാർ',
    mobileNumberLabel: 'മൊബൈൽ നമ്പർ (10 അക്കങ്ങൾ) *',
    mobilePlaceholder: 'ഉദാ. 9876543210',
    emailAddressLabel: 'ഇമെയിൽ വിലാസം *',
    emailPlaceholder: 'ഉദാ. customer@example.com',
    linkedAccountPrefix: '✓ ലിങ്ക് ചെയ്ത അക്കൗണ്ട്:',
    customerMustBeRegistered: '⚠ ക്രെഡിറ്റ് ലഭ്യമാക്കാൻ ഉപഭോക്താവിന് Remise അക്കൗണ്ട് ഉണ്ടായിരിക്കണം.',
    step2CreditLimit: '2. ക്രെഡിറ്റ് പരിധി (INR ₹)',
    limitPlaceholder: 'ഉദാ. 5000',
    step3RepaymentPolicy: '3. തിരിച്ചടവ് വ്യവസ്ഥ',
    policyWeekly: 'പ്രതിവാരം',
    policyMonthly: 'പ്രതിമാസം',
    policyCustomDays: 'നിശ്ചിത ദിവസങ്ങൾ',
    policySpecificDate: 'നിശ്ചിത തീയതി',
    weeklyDueDayLabel: 'ആഴ്ചയിലെ അടവ് ദിവസം',
    dueDayOfMonthLabel: 'മാസത്തിലെ അടവ് തീയതി (1 - 31)',
    repayWithinDaysLabel: 'തിരിച്ചടയ്ക്കാനുള്ള ദിവസങ്ങൾ',
    agreedDueDateLabel: 'തീരുമാനിച്ച അടവ് തീയതി (YYYY-MM-DD)',
    step4IdentityVerification: '4. തിരിച്ചറിയൽ പരിശോധന (Cashfree SecureID) *',
    cashfreeVerifiedBadge: 'Cashfree പരിശോധിച്ചു',
    uidaiItdCheck: 'UIDAI / ITD പരിശോധന',
    aadhaarOption: 'ആധാർ (UIDAI OTP)',
    panOption: 'പാൻ കാർഡ് (ഇൻകം ടാക്സ്)',
    aadhaarNumberLabel: 'ആധാർ നമ്പർ (12 അക്കങ്ങൾ) *',
    panNumberLabel: 'പാൻ നമ്പർ (10 അക്കങ്ങൾ) *',
    aadhaarPlaceholder: 'ഉദാ. 123456789012',
    panPlaceholder: 'ഉദാ. ABCDE1234F',
    legalNameLabel: 'തിരിച്ചറിയൽ രേഖയിലെ ഔദ്യോഗിക പേര് *',
    legalNamePlaceholder: 'രേഖയിലുള്ളതുപോലെ കൃത്യമായി നൽകുക',
    enterAadhaarOtpTitle: '6-അക്ക ആധാർ OTP നൽകുക',
    sentToUidaiMobile: 'UIDAI മൊബൈലിലേക്ക് അയച്ചിട്ടുണ്ട്',
    confirmAadhaarOtpBtn: 'ആധാർ OTP സ്ഥിരീകരിക്കുക',
    sendingAadhaarOtp: 'Cashfree വഴി ആധാർ OTP അയയ്ക്കുന്നു...',
    verifyingPan: 'Cashfree വഴി പാൻ പരിശോധിക്കുന്നു...',
    verifiedViaCashfreeTap: '✓ Cashfree വഴി പരിശോധിച്ചു (വീണ്ടും പരിശോധിക്കാൻ ടാപ്പ് ചെയ്യുക)',
    verifyAadhaarBtn: 'Cashfree വഴി ആധാർ പരിശോധിക്കുക (OTP അയക്കുക)',
    verifyPanBtn: 'Cashfree വഴി പാൻ പരിശോധിക്കുക',
    cashfreeConfirmedTitle: 'Cashfree പരിശോധന പൂർത്തിയായി',
    govtRecordNamePrefix: 'രേഖയിലെ ഔദ്യോഗിക പേര്:',
    maskedTokenPrefix: 'ടോക്കൺ:',
    verifiedViaCashfreeSuffix: 'Cashfree വഴി പരിശോധിച്ചു',
    consentCheckboxLabel: 'ഉപഭോക്താവ് രേഖ നേരിട്ട് സമർപ്പിക്കുകയും പരിശോധനയ്ക്ക് അനുമതി നൽകുകയും ചെയ്തിട്ടുണ്ട്.',
    agreementCheckboxLabel: 'ഉപഭോക്താവ് ക്രെഡിറ്റ് പരിധിയും നിബന്ധനകളും വായിച്ച് അംഗീകരിച്ചു.',
    approveAndActivateBtn: 'ക്രെഡിറ്റ് അംഗീകരിച്ച് സജീവമാക്കുക',

    recordRepaymentTitle: 'പണമായി തിരിച്ചടവ് രേഖപ്പെടുത്തുക',
    customerLabelPrefix: 'ഉപഭോക്താവ്:',
    outstandingDebtLabel: 'നിലവിലെ കുടിശ്ശിക:',
    repaymentAmountLabel: 'തിരിച്ചടവ് തുക (INR ₹)',
    amountCollectedPlaceholder: 'സ്വീകരിച്ച തുക',
    notesReferenceLabel: 'കുറിപ്പുകൾ / റഫറൻസ് (ഐച്ഛികം)',
    notesPlaceholder: 'ഉദാ. കൗണ്ടറിൽ നേരിട്ട് പണം നൽകി',
    confirmReceiptBtn: 'സ്ഥിരീകരിച്ച് രസീത് നൽകുക',

    modifyTermsTitle: 'ക്രെഡിറ്റ് വ്യവസ്ഥകളിൽ മാറ്റം വരുത്തുക',
    newLimitLabel: 'പുതിയ ക്രെഡിറ്റ് പരിധി (INR ₹)',
    limitShortPlaceholder: 'പരിധി',
    auditReasonLabel: 'ഓഡിറ്റ് കാരണം (നിർബന്ധം)',
    auditReasonPlaceholder: 'വ്യവസ്ഥകളിൽ മാറ്റം വരുത്താനുള്ള കാരണം വ്യക്തമാക്കുക',
    updateTermsBtn: 'വ്യവസ്ഥകൾ പുതുക്കുക',

    ledgerModalTitle: 'ക്രെഡിറ്റ് ലെഡ്ജർ വിവരങ്ങൾ',
    customerCreditLedgerTitle: 'ക്രെഡിറ്റ് ലെഡ്ജർ',
    noLedgerEntries: 'ഇടപാടുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.',
    loadingLedger: 'ലെഡ്ജർ ലഭ്യമാക്കുന്നു...',
    noLedgerEntriesCustomer: 'ഇടപാടുകളൊന്നുമില്ല',
    noLedgerEntriesCustomerDesc: 'ക്രെഡിറ്റ് വാങ്ങലുകളോ തിരിച്ചടവോ നടത്തുമ്പോൾ ഇടപാടുകൾ ഇവിടെ കാണാം.',
    balPrefix: 'ബാക്കി:',
    refPrefix: 'റഫ:',
    repaymentType: 'തിരിച്ചടവ്',
    orderDebitType: 'ഓർഡർ ഡെബിറ്റ്',

    days: {
      mon: 'തിങ്കൾ',
      tue: 'ചൊവ്വ',
      wed: 'ബുധൻ',
      thu: 'വ്യാഴം',
      fri: 'വെള്ളി',
      sat: 'ശനി',
      sun: 'ഞായർ',
      monday: 'തിങ്കളാഴ്ച',
      tuesday: 'ചൊവ്വാഴ്ച',
      wednesday: 'ബുധനാഴ്ച',
      thursday: 'വ്യാഴാഴ്ച',
      friday: 'വെള്ളിയാഴ്ച',
      saturday: 'ശനിയാഴ്ച',
      sunday: 'ഞായറാഴ്ച',
    },

    alerts: {
      invalidLimitTitle: 'അസാധുവായ പരിധി',
      invalidLimitMsg: 'ക്രെഡിറ്റ് പരിധി പോസിറ്റീവ് സംഖ്യയായിരിക്കണം.',
      identityRequiredTitle: 'രേഖ നമ്പർ ആവശ്യമാണ്',
      identityRequiredMsg: 'ദയവായി തിരിച്ചറിയൽ രേഖയുടെ നമ്പർ നൽകുക.',
      nameOnIdRequiredTitle: 'രേഖയിലെ പേര് ആവശ്യമാണ്',
      nameOnIdRequiredMsg: 'തിരിച്ചറിയൽ രേഖയുമായി പൊരുത്തപ്പെടുന്ന ഔദ്യോഗിക പേര് നൽകുക.',
      cashfreeRequiredTitle: 'Cashfree പരിശോധന ആവശ്യമാണ്',
      cashfreeRequiredMsg: 'ക്രെഡിറ്റ് നൽകുന്നതിന് മുൻപ് Cashfree SecureID വഴി തിരിച്ചറിയൽ പരിശോധിക്കുക.',
      consentRequiredTitle: 'സമ്മതം ആവശ്യമാണ്',
      consentRequiredMsg: 'ഉപഭോക്താവിന്റെ സമ്മതവും വ്യവസ്ഥകളോടുള്ള യോജിപ്പും ഉറപ്പാക്കണം.',
      successTitle: 'വിജയം',
      creditApprovedMsg: 'ഈ ഉപഭോക്താവിനുള്ള ക്രെഡിറ്റ് അക്കൗണ്ട് അംഗീകരിച്ച് സജീവമാക്കി.',
      errorTitle: 'പിശക്',
      registrationFailedMsg: 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു',
      invalidAmountTitle: 'അസാധുവായ തുക',
      invalidAmountMsg: '0-ൽ കൂടുതൽ ഉള്ള സാധുവായ തുക നൽകുക.',
      amountExceedsDebtTitle: 'തുക കുടിശ്ശികയേക്കാൾ കൂടുതലാണ്',
      amountExceedsDebtMsg: 'അടയ്ക്കാവുന്ന പരമാവധി തുക ₹{{amount}} ആണ്',
      repaymentRecordedTitle: 'തിരിച്ചടവ് രേഖപ്പെടുത്തി',
      repaymentRecordedMsg: '₹{{amount}} തിരിച്ചടവ് പരിശോധിച്ചുറപ്പിച്ചു.\nരസീത്: {{receipt}}\nപുതിയ ബാക്കി: ₹{{balance}}',
      repaymentFailedMsg: 'തിരിച്ചടവ് പരാജയപ്പെട്ടു',
      reasonRequiredTitle: 'കാരണം ആവശ്യമാണ്',
      reasonRequiredMsg: 'വ്യവസ്ഥകളിൽ മാറ്റം വരുത്താനുള്ള കാരണം നൽകുക.',
      termsUpdatedMsg: 'ക്രെഡിറ്റ് വ്യവസ്ഥകൾ വിജയകരമായി പുതുക്കി.',
      termsFailedMsg: 'വ്യവസ്ഥകൾ പുതുക്കൽ പരാജയപ്പെട്ടു',
      suspendCreditTitle: 'ക്രെഡിറ്റ് താൽക്കാലികമായി നിർത്തുക',
      reactivateCreditTitle: 'ക്രെഡിറ്റ് പുനരാരംഭിക്കുക',
      suspendConfirmMsg: '{{name}}-ന്റെ ക്രെഡിറ്റ് താൽക്കാലികമായി നിർത്താൻ ആഗ്രഹിക്കുന്നുവോ?',
      reactivateConfirmMsg: '{{name}}-ന്റെ ക്രെഡിറ്റ് പുനരാരംഭിക്കാൻ ആഗ്രഹിക്കുന്നുവോ?',
      updateStatusFailed: 'അക്കൗണ്ട് നില പുതുക്കാൻ കഴിഞ്ഞില്ല',
      nameRequiredTitle: 'പേര് ആവശ്യമാണ്',
      nameRequiredMsg: 'ഉപഭോക്താവിന്റെ പൂർണ്ണമായ പേര് നൽകണം.',
      phoneRequiredTitle: 'ഫോൺ നമ്പർ ആവശ്യമാണ്',
      phoneRequiredMsg: 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകണം.',
      emailRequiredTitle: 'ഇമെയിൽ ആവശ്യമാണ്',
      emailRequiredMsg: 'സാധുവായ ഇമെയിൽ വിലാസം നൽകണം.',
      enterLegalNameMsg: 'തിരിച്ചറിയൽ രേഖയിലെ ഔദ്യോഗിക പേര് നൽകുക.',
      enter12AadhaarMsg: 'സാധുവായ 12-അക്ക ആധാർ നമ്പർ നൽകുക.',
      invalidPanFormatMsg: 'തെറ്റായ പാൻ ഫോർമാറ്റ് (10 അക്ഷരങ്ങൾ/അക്കങ്ങൾ ഉദാ. ABCDE1234F).',
      enterAadhaarOtpMsg: 'ആധാർ ലിങ്ക് ചെയ്ത മൊബൈലിൽ വന്ന OTP നൽകുക.',
    },
  },

  hi: {
    storeCreditTitle: 'स्टোর क्रेडिट (उधार/खाता)',
    storeCreditSubtitle: 'निजी क्रेडिट सीमा और पुनर्भुगतान लेज़र',
    creditManagement: 'क्रेडिट (उधार) प्रबंधन',
    creditManagementSubtitle: 'व्यक्तिगत स्वीकृति, सीमाएं, भुगतान और लेज़र',
    myStoreCredit: 'मेरा स्टोर क्रेडिट (उधार)',
    myStoreCreditSubtitle: 'क्रेडिट सीमा, नियत तिथियां और लेज़र देखें',

    searchPlaceholder: 'नाम, फ़ोन नंबर से ग्राहक खोजें...',
    inPersonCreditBtn: 'व्यक्तिगत क्रेडिट पंजीकरण',

    totalOutstanding: 'कुल बकाया राशि',
    totalApprovedLimit: 'कुल स्वीकृत सीमा',
    activeAccounts: 'सक्रिय खाते',
    overdue: 'अतिदेय',

    creditLimit: 'क्रेडिट सीमा',
    totalCreditGranted: 'कुल स्वीकृत क्रेडिट',
    usedCredit: 'उपयोग किया गया क्रेडिट',
    inOrders: 'ऑर्डरों में',
    available: 'उपलब्ध',
    ofLimit: '₹{{limit}} की सीमा में से',

    filterAll: 'सभी',
    filterActive: 'सक्रिय',
    filterWithBalance: 'बकाया सहित',
    filterSuspended: 'निलंबित',

    statusApproved: 'स्वीकृत',
    statusSuspended: 'निलंबित',

    customer: 'ग्राहक',
    outstanding: 'बकाया',
    nextDue: 'अगली देय तिथि',
    policyLabel: 'नीति:',
    maskedIdLabel: 'पहचान संख्या:',
    withinDays: '{{days}} दिनों के भीतर',
    weeklyEvery: 'साप्ताहिक प्रत्येक {{day}}',
    monthlyOnDay: 'मासिक {{day}} तारीख को',
    everyDays: 'प्रत्येक {{days}} दिन',
    specificDueDate: 'विशिष्ट देय तिथि',
    standardTerms: 'मानक शर्तें',
    dueOn: 'देय तिथि: {{date}}',
    overdueText: '(अतिदेय)',
    overdueWarning: 'अतिदेय: देय तिथि {{date}} थी। कृपया स्टोर पर जाकर बकाया राशि चुकाएं।',
    settlementRequired: 'भुगतान आवश्यक: ₹{{balance}} का भुगतान होने तक इस स्टोर पर नई खरीदारी अवरुद्ध है।',
    settlementBlockedDesc: 'बकाया राशि चुकाने तक नई खरीदारी अवरुद्ध रहेगी।',

    recordRepaymentBtn: 'भुगतान दर्ज करें',
    ledgerBtn: 'लेज़र',
    termsBtn: 'शर्तें',
    reactivateCredit: 'क्रेडिट पुनः सक्रिय करें',
    suspendCredit: 'क्रेडिट निलंबित करें',
    payViaUpiBtn: 'UPI / कार्ड से भुगतान करें',
    repaymentHistoryBtn: 'भुगतान इतिहास (लेज़र)',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    change: 'बदलें',
    resend: 'पुनः भेजें',

    loadingStoreCredit: 'स्टोर क्रेडिट खाते लोड हो रहे हैं...',
    loadingCustomerCredit: 'आपके क्रेडिट खाते लोड हो रहे हैं...',
    noCreditAccountsFound: 'कोई क्रेडिट खाता नहीं मिला',
    registerInPersonDesc: 'क्रेडिट (उधार) देने के लिए ग्राहक को व्यक्तिगत रूप से पंजीकृत करें।',
    noCustomerCreditTitle: 'अभी तक कोई स्टोर क्रेडिट खाता नहीं है',
    noCustomerCreditDesc: 'स्टोर क्रेडिट स्थानीय दुकानदारों के साथ व्यक्तिगत रूप से पंजीकृत किया जाता है। क्रेडिट सुविधा के लिए किसी भी भाग लेने वाले स्टोर पर जाएं।',
    howItWorksTitle: 'यह कैसे काम करता है:',
    howItWorksStep1: '1. अपने Remise खाते के साथ स्टोर पर व्यक्तिगत रूप से जाएं।',
    howItWorksStep2: '2. क्रेडिट शर्तों (साप्ताहिक, मासिक या दिन) पर सहमति बनाएं।',
    howItWorksStep3: '3. स्टोर मालिक आपके खाते को स्वीकृति देगा। चेकआउट पर तुरंत क्रेडिट का उपयोग करें!',

    registerModalTitle: 'व्यक्तिगत क्रेडिट पंजीकरण',
    registerModalSubtitle: 'स्टोर-विशिष्ट निजी क्रेडिट समझौता',
    step1CustomerInfo: '1. ग्राहक विवरण *',
    step1Subtitle: 'नाम, फ़ोन और ईमेल',
    searchAutoFillPlaceholder: 'ऑटो-फिल के लिए पंजीकृत ग्राहक खोजें...',
    customerFullName: 'ग्राहक का पूरा नाम *',
    fullNamePlaceholder: 'उदा. राहुल शर्मा',
    mobileNumberLabel: 'मोबाइल नंबर (10 अंक) *',
    mobilePlaceholder: 'उदा. 9876543210',
    emailAddressLabel: 'ईमेल पता *',
    emailPlaceholder: 'उदा. customer@example.com',
    linkedAccountPrefix: '✓ जुड़ा हुआ खाता:',
    customerMustBeRegistered: '⚠ क्रेडिट सक्रिय करने के लिए ग्राहक के पास Remise खाता होना आवश्यक है।',
    step2CreditLimit: '2. क्रेडिट सीमा (INR ₹)',
    limitPlaceholder: 'उदा. 5000',
    step3RepaymentPolicy: '3. पुनर्भुगतान नीति',
    policyWeekly: 'साप्ताहिक',
    policyMonthly: 'मासिक',
    policyCustomDays: 'कस्टम दिन',
    policySpecificDate: 'विशिष्ट तिथि',
    weeklyDueDayLabel: 'साप्ताहिक देय दिन',
    dueDayOfMonthLabel: 'महीने का देय दिन (1 - 31)',
    repayWithinDaysLabel: 'भुगतान की अवधि (दिन)',
    agreedDueDateLabel: 'सहमति की देय तिथि (YYYY-MM-DD)',
    step4IdentityVerification: '4. पहचान सत्यापन (Cashfree SecureID) *',
    cashfreeVerifiedBadge: 'Cashfree सत्यापित',
    uidaiItdCheck: 'UIDAI / ITD जांच',
    aadhaarOption: 'आधार (UIDAI OTP)',
    panOption: 'पैन कार्ड (आयकर)',
    aadhaarNumberLabel: 'आधार नंबर (12 अंक) *',
    panNumberLabel: 'पैन नंबर (10 अंक/अक्षर) *',
    aadhaarPlaceholder: 'उदा. 123456789012',
    panPlaceholder: 'उदा. ABCDE1234F',
    legalNameLabel: 'पहचान दस्तावेज पर कानूनी नाम *',
    legalNamePlaceholder: 'दस्तावेज के अनुसार सटीक नाम',
    enterAadhaarOtpTitle: '6-अंकीय आधार OTP दर्ज करें',
    sentToUidaiMobile: 'UIDAI पंजीकृत मोबाइल पर भेजा गया',
    confirmAadhaarOtpBtn: 'आधार OTP की पुष्टि करें',
    sendingAadhaarOtp: 'Cashfree द्वारा आधार OTP भेजा जा रहा है...',
    verifyingPan: 'Cashfree द्वारा पैन सत्यापित किया जा रहा है...',
    verifiedViaCashfreeTap: '✓ Cashfree द्वारा सत्यापित (पुनः सत्यापित करने के लिए टैप करें)',
    verifyAadhaarBtn: 'Cashfree द्वारा आधार सत्यापित करें (OTP भेजें)',
    verifyPanBtn: 'Cashfree द्वारा पैन सत्यापित करें',
    cashfreeConfirmedTitle: 'Cashfree सत्यापन सफल रहा',
    govtRecordNamePrefix: 'सरकारी रिकॉर्ड में नाम:',
    maskedTokenPrefix: 'मास्क टोकन:',
    verifiedViaCashfreeSuffix: 'Cashfree द्वारा सत्यापित',
    consentCheckboxLabel: 'ग्राहक ने दस्तावेज व्यक्तिगत रूप से प्रस्तुत किया है और सत्यापन की सहमति दी है।',
    agreementCheckboxLabel: 'ग्राहक ने क्रेडिट सीमा और पुनर्भुगतान शर्तों की समीक्षा कर सहमति दी है।',
    approveAndActivateBtn: 'क्रेडिट स्वीकृत और सक्रिय करें',

    recordRepaymentTitle: 'नकद पुनर्भुगतान दर्ज करें',
    customerLabelPrefix: 'ग्राहक:',
    outstandingDebtLabel: 'कुल बकाया ऋण:',
    repaymentAmountLabel: 'पुनर्भुगतान राशि (INR ₹)',
    amountCollectedPlaceholder: 'प्राप्त की गई राशि',
    notesReferenceLabel: 'टिप्पणी / संदर्भ (वैकल्पिक)',
    notesPlaceholder: 'उदा. काउंटर पर नकद भुगतान किया गया',
    confirmReceiptBtn: 'पुष्टि करें और रसीद जारी करें',

    modifyTermsTitle: 'क्रेडिट शर्तों में बदलाव करें',
    newLimitLabel: 'नई क्रेडिट सीमा (INR ₹)',
    limitShortPlaceholder: 'सीमा',
    auditReasonLabel: 'ऑडिट का कारण (अनिवार्य)',
    auditReasonPlaceholder: 'शर्तें बदलने का कारण बताएं',
    updateTermsBtn: 'शर्तें अपडेट करें',

    ledgerModalTitle: 'क्रेडिट लेज़र इतिहास',
    customerCreditLedgerTitle: 'क्रेडिट लेज़र',
    noLedgerEntries: 'अभी तक कोई लेन-देन दर्ज नहीं किया गया है।',
    loadingLedger: 'लेज़र लोड हो रहा है...',
    noLedgerEntriesCustomer: 'अभी तक कोई लेन-देन नहीं',
    noLedgerEntriesCustomerDesc: 'क्रेडिट खरीदारी या पुनर्भुगतान करने पर लेन-देन यहां दिखाई देंगे।',
    balPrefix: 'शेष:',
    refPrefix: 'संदर्भ:',
    repaymentType: 'पुनर्भुगतान',
    orderDebitType: 'ऑर्डर डेबिट',

    days: {
      mon: 'सोम',
      tue: 'मंगल',
      wed: 'बुध',
      thu: 'गुरु',
      fri: 'शुक्र',
      sat: 'शनि',
      sun: 'रवि',
      monday: 'सोमवार',
      tuesday: 'मंगलवार',
      wednesday: 'बुधवार',
      thursday: 'गुरुवार',
      friday: 'शुक्रवार',
      saturday: 'शनिवार',
      sunday: 'रविवार',
    },

    alerts: {
      invalidLimitTitle: 'अमान्य सीमा',
      invalidLimitMsg: 'क्रेडिट सीमा एक धनात्मक संख्या होनी चाहिए।',
      identityRequiredTitle: 'दस्तावेज आवश्यक है',
      identityRequiredMsg: 'कृपया पहचान दस्तावेज संख्या दर्ज करें।',
      nameOnIdRequiredTitle: 'दस्तावेज पर नाम आवश्यक है',
      nameOnIdRequiredMsg: 'कृपया पहचान दस्तावेज से मेल खाने वाला कानूनी नाम दर्ज करें।',
      cashfreeRequiredTitle: 'Cashfree सत्यापन आवश्यक है',
      cashfreeRequiredMsg: 'क्रेडिट देने से पहले Cashfree SecureID से पहचान सत्यापित करें।',
      consentRequiredTitle: 'सहमति आवश्यक है',
      consentRequiredMsg: 'ग्राहक की सहमति और शर्तों की स्वीकृति दोनों आवश्यक हैं।',
      successTitle: 'सफलता',
      creditApprovedMsg: 'इस ग्राहक के लिए क्रेडिट खाता स्वीकृत और सक्रिय कर दिया गया है।',
      errorTitle: 'त्रुटि',
      registrationFailedMsg: 'पंजीकरण विफल रहा',
      invalidAmountTitle: 'अमान्य राशि',
      invalidAmountMsg: 'कृपया 0 से अधिक वैध राशि दर्ज करें।',
      amountExceedsDebtTitle: 'राशि बकाया से अधिक है',
      amountExceedsDebtMsg: 'अधिकतम स्वीकार्य पुनर्भुगतान ₹{{amount}} है',
      repaymentRecordedTitle: 'पुनर्भुगतान दर्ज किया गया',
      repaymentRecordedMsg: '₹{{amount}} का भुगतान सत्यापित हुआ।\nरसीद: {{receipt}}\nनया शेष: ₹{{balance}}',
      repaymentFailedMsg: 'पुनर्भुगतान विफल रहा',
      reasonRequiredTitle: 'कारण आवश्यक है',
      reasonRequiredMsg: 'शर्तें बदलने के लिए ऑडिट कारण बताएं।',
      termsUpdatedMsg: 'क्रेडिट शर्तें सफलतापूर्वक अपडेट की गईं।',
      termsFailedMsg: 'शर्तें अपडेट करना विफल रहा',
      suspendCreditTitle: 'क्रेडिट निलंबित करें',
      reactivateCreditTitle: 'क्रेडिट पुनः सक्रिय करें',
      suspendConfirmMsg: 'क्या आप निश्चित रूप से {{name}} के लिए क्रेडिट निलंबित करना चाहते हैं?',
      reactivateConfirmMsg: 'क्या आप निश्चित रूप से {{name}} के लिए क्रेडिट पुनः सक्रिय करना चाहते हैं?',
      updateStatusFailed: 'खाता स्थिति अपडेट करने में विफल',
      nameRequiredTitle: 'नाम आवश्यक है',
      nameRequiredMsg: 'ग्राहक का पूरा नाम आवश्यक है।',
      phoneRequiredTitle: 'फ़ोन नंबर आवश्यक है',
      phoneRequiredMsg: 'वैध 10-अंकीय मोबाइल नंबर आवश्यक है।',
      emailRequiredTitle: 'ईमेल आवश्यक है',
      emailRequiredMsg: 'वैध ईमेल पता आवश्यक है।',
      enterLegalNameMsg: 'कृपया पहचान दस्तावेज पर कानूनी नाम दर्ज करें।',
      enter12AadhaarMsg: 'कृपया वैध 12-अंकीय आधार संख्या दर्ज करें।',
      invalidPanFormatMsg: 'अमान्य पैन प्रारूप (10 अंक/अक्षर उदा. ABCDE1234F)।',
      enterAadhaarOtpMsg: 'कृपया आधार से जुड़े मोबाइल पर भेजा गया OTP दर्ज करें।',
    },
  },
};

export function getCreditTranslations(lang: LanguageCode): CreditTranslations {
  return CREDIT_TRANSLATIONS[lang] || CREDIT_TRANSLATIONS.en;
}
