import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle, XCircle, RefreshCw, ShoppingBag, Download, FileText, ArrowLeft } from 'lucide-react-native';
import { paymentApi } from '../../api/paymentApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useCart } from '../../context/CartContext';
import InvoiceModal from '../../components/common/InvoiceModal';
import { useAuth } from '../../context/AuthContext';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation, getSupplierTranslations } from '../../i18n';

type Status = 'LOADING' | 'SUCCESS' | 'FAILED' | 'PENDING';

export default function PaymentStatusScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { language } = useTranslation();
  const tSupplier = getSupplierTranslations(language);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId: string | undefined = route.params?.orderId;
  const returnScreen: string | undefined = route.params?.returnScreen;
  const { setBuyNowItem } = useCart();

  const [status, setStatus] = useState<Status>('LOADING');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const cardBg = isDark ? '#111827' : CustomerColors.white;
  const borderColor = isDark ? '#1F2937' : '#F3F4F6';
  const textPri = isDark ? '#F9FAFB' : '#111827';
  const textSec = isDark ? '#9CA3AF' : CustomerColors.textSecondary;
  const bg = isDark ? '#0a0f1d' : '#F9F9F9';
  const secBtnBg = isDark ? '#1f2937' : '#F3F4F6';
  const secBtnText = isDark ? '#F9FAFB' : '#1F2937';

  const goToHome = () => {
    try {
      const role = (user?.role as string) || '';
      if (role === 'store_owner') {
        navigation.navigate('StoreOwnerTabs', { screen: 'Overview' });
        return;
      }
      if (role === 'wholesaler' || role === 'whole_saler') {
        navigation.navigate('WholesalerTabs', { screen: 'WholesalerOverview' });
        return;
      }
      if (role === 'home_business') {
        navigation.navigate('HomeBusinessTabs', { screen: 'HomeBusinessOverview' });
        return;
      }
      if (role === 'seller') {
        navigation.navigate('SellerTabs', { screen: 'SellerOverview' });
        return;
      }
      if (role === 'admin') {
        navigation.navigate('AdminTabs', { screen: 'AdminOverview' });
        return;
      }
      navigation.navigate('CustomerTabs', { screen: 'Home' });
    } catch {
      try {
        navigation.navigate('Home');
      } catch {
        navigation.popToTop();
      }
    }
  };

  const goToOrders = () => {
    try {
      const role = (user?.role as string) || '';
      if (role === 'store_owner') {
        navigation.navigate('StoreOwnerTabs', { screen: 'StoreOwnerOrders' });
        return;
      }
      if (role === 'wholesaler' || role === 'whole_saler') {
        navigation.navigate('WholesalerTabs', { screen: 'WholesalerOrders' });
        return;
      }
      if (role === 'home_business') {
        navigation.navigate('HomeBusinessTabs', { screen: 'HomeBusinessOrders' });
        return;
      }
      if (role === 'seller') {
        navigation.navigate('SellerTabs', { screen: 'SellerOrders' });
        return;
      }
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    } catch {
      try {
        navigation.navigate('Orders');
      } catch {
        navigation.popToTop();
      }
    }
  };

  const checkStatus = useCallback(async () => {
    if (!orderId) {
      setStatus('FAILED');
      setErrorMessage(tSupplier.noOrderId);
      return;
    }
    setStatus('LOADING');
    try {
      const res = await paymentApi.getStatus(orderId);
      const data = res.data;
      if (data.success) {
        if (data.status === 'SUCCESS') {
          setStatus('SUCCESS');
          setBuyNowItem(null);
        } else if (data.status === 'PENDING') {
          setStatus('PENDING');
        } else {
          setStatus('FAILED');
          setErrorMessage(data.message || tSupplier.paymentDeclined);
        }
      } else {
        setStatus('FAILED');
        setErrorMessage(data.message || tSupplier.verificationFailed);
      }
    } catch {
      setStatus('FAILED');
      setErrorMessage(tSupplier.serverUnreachable);
    }
  }, [orderId, setBuyNowItem, tSupplier]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleDownloadPdf = async () => {
    if (!orderId) return;
    const pdfUrl = smartOrderApi.getInvoicePdfUrl(orderId);
    try {
      await Linking.openURL(pdfUrl);
    } catch {
      Alert.alert('Download', 'Could not open download link.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        {status === 'LOADING' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={CustomerColors.primary} />
            <Text style={[styles.title, { color: textPri }]}>{tSupplier.verifyingPayment}</Text>
            <Text style={[styles.subtitle, { color: textSec }]}>{tSupplier.verifyingPaymentSub}</Text>
          </View>
        )}

        {status === 'SUCCESS' && (
          <View style={styles.center}>
            <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
              <CheckCircle size={40} color={CustomerColors.success} />
            </View>
            <Text style={[styles.title, { color: textPri }]}>{tSupplier.orderPlacedSuccessTitle}</Text>
            <Text style={[styles.subtitle, { color: textSec }]}>
              {tSupplier.orderPlacedSuccessSub.replace('{{orderId}}', orderId || '')}
            </Text>

            {/* Bill Actions */}
            {orderId ? (
              <View style={styles.billActions}>
                <TouchableOpacity style={styles.downloadBillBtn} onPress={handleDownloadPdf}>
                  <Download size={16} color="#FFFFFF" />
                  <Text style={styles.downloadBillBtnText}>{tSupplier.downloadPdfBill}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewInvoiceBtn,
                    {
                      backgroundColor: isDark ? '#1f2937' : CustomerColors.mint,
                      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
                    },
                  ]}
                  onPress={() => setShowInvoiceModal(true)}
                >
                  <FileText size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  <Text style={[styles.viewInvoiceBtnText, isDark ? { color: '#2DD4BF' } : undefined]}>
                    {tSupplier.viewInvoiceDetails}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {returnScreen === 'BulkPurchase' ? (
              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.backToBulkBtn}
                  onPress={() => {
                    try {
                      navigation.navigate('CustomerTabs', { screen: 'BulkPurchase' });
                    } catch {
                      goToHome();
                    }
                  }}
                >
                  <ArrowLeft size={16} color="#FFFFFF" />
                  <Text style={styles.backToBulkBtnText}>{tSupplier.backToBulkPurchase}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { backgroundColor: secBtnBg }]}
                  onPress={goToOrders}
                >
                  <ShoppingBag size={16} color={secBtnText} />
                  <Text style={[styles.secondaryActionBtnText, { color: secBtnText }]}>
                    {tSupplier.viewMyOrders}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.continueShoppingBtn} onPress={goToHome}>
                <ShoppingBag size={18} color="#FFFFFF" />
                <Text style={styles.continueShoppingBtnText}>{tSupplier.continueShopping}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {status === 'FAILED' && (
          <View style={styles.center}>
            <View style={[styles.iconCircle, styles.iconCircleDanger]}>
              <XCircle size={40} color={CustomerColors.danger} />
            </View>
            <Text style={[styles.title, { color: textPri }]}>{tSupplier.paymentFailedTitle}</Text>
            <Text style={[styles.subtitle, { color: textSec }]}>{errorMessage}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: secBtnBg }]}
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text style={[styles.secondaryBtnText, { color: secBtnText }]}>{tSupplier.tryAgain}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={goToHome}>
                <Text style={styles.primaryBtnText}>{tSupplier.home}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {status === 'PENDING' && (
          <View style={styles.center}>
            <View style={[styles.iconCircle, styles.iconCircleWarning]}>
              <ActivityIndicator size="large" color={CustomerColors.warning} />
            </View>
            <Text style={[styles.title, { color: textPri }]}>{tSupplier.paymentPendingTitle}</Text>
            <Text style={[styles.subtitle, { color: textSec }]}>{tSupplier.paymentPendingSub}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: secBtnBg }]}
                onPress={checkStatus}
              >
                <RefreshCw size={16} color={secBtnText} />
                <Text style={[styles.secondaryBtnText, { color: secBtnText }]}>{tSupplier.refresh}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={goToHome}>
                <Text style={styles.primaryBtnText}>{tSupplier.home}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {orderId ? (
        <InvoiceModal
          orderId={orderId}
          visible={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  card: { backgroundColor: CustomerColors.white, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.xl, width: '100%', maxWidth: 420 },
  center: { alignItems: 'center', width: '100%' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  iconCircleSuccess: { backgroundColor: CustomerColors.successBg },
  iconCircleDanger: { backgroundColor: CustomerColors.dangerBg },
  iconCircleWarning: { backgroundColor: CustomerColors.warningBg },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: '#111827', marginTop: Spacing.md, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  primaryBtn: { flex: 1, flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  continueShoppingBtn: { width: '100%', flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  continueShoppingBtnText: { color: '#FFFFFF', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  secondaryBtn: { flex: 1, flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  secondaryBtnText: { color: '#1F2937', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  billActions: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.lg },
  downloadBillBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  downloadBillBtnText: { color: '#FFFFFF', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  viewInvoiceBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  viewInvoiceBtnText: { color: CustomerColors.teal700, fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  actionColumn: { width: '100%', gap: Spacing.sm },
  backToBulkBtn: { width: '100%', flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.teal600, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  backToBulkBtnText: { color: '#FFFFFF', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  secondaryActionBtn: { width: '100%', flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  secondaryActionBtnText: { color: '#1F2937', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
});
