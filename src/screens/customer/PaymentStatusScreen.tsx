import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle, XCircle, RefreshCw, ShoppingBag, Download, FileText } from 'lucide-react-native';
import { paymentApi } from '../../api/paymentApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useCart } from '../../context/CartContext';
import InvoiceModal from '../../components/common/InvoiceModal';
import { CustomerColors, GoldColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

type Status = 'LOADING' | 'SUCCESS' | 'FAILED' | 'PENDING';

export default function PaymentStatusScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId: string | undefined = route.params?.orderId;
  const { setBuyNowItem } = useCart();

  const [status, setStatus] = useState<Status>('LOADING');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!orderId) {
      setStatus('FAILED');
      setErrorMessage('No Order ID provided.');
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
          setErrorMessage(data.message || 'Payment was declined by the bank.');
        }
      } else {
        setStatus('FAILED');
        setErrorMessage(data.message || 'Failed to verify payment status.');
      }
    } catch {
      setStatus('FAILED');
      setErrorMessage('Server unreachable. Please contact support if amount was deducted.');
    }
  }, [orderId, setBuyNowItem]);

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
    <View style={styles.container}>
      <View style={styles.card}>
        {status === 'LOADING' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={GoldColors.gold} />
            <Text style={styles.title}>Verifying Payment</Text>
            <Text style={styles.subtitle}>Please wait while we securely confirm your transaction with PhonePe.</Text>
          </View>
        )}

        {status === 'SUCCESS' && (
          <View style={styles.center}>
            <View style={[styles.iconCircle, styles.iconCircleSuccess]}><CheckCircle size={40} color={CustomerColors.success} /></View>
            <Text style={styles.title}>Order Placed Successfully!</Text>
            <Text style={styles.subtitle}>Thank you for your purchase. Your payment was successful and your order {orderId} has been confirmed.</Text>
            
            {/* Bill Actions */}
            {orderId ? (
              <View style={styles.billActions}>
                <TouchableOpacity style={styles.downloadBillBtn} onPress={handleDownloadPdf}>
                  <Download size={16} color="#FFFFFF" />
                  <Text style={styles.downloadBillBtnText}>Download PDF Bill</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.viewInvoiceBtn} onPress={() => setShowInvoiceModal(true)}>
                  <FileText size={16} color={CustomerColors.teal700} />
                  <Text style={styles.viewInvoiceBtnText}>View Invoice Details</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Categories' })}>
              <ShoppingBag size={18} color="#000" />
              <Text style={styles.primaryBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        )}


        {status === 'FAILED' && (
          <View style={styles.center}>
            <View style={[styles.iconCircle, styles.iconCircleDanger]}><XCircle size={40} color={CustomerColors.danger} /></View>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Checkout')}>
                <Text style={styles.secondaryBtnText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}>
                <Text style={styles.primaryBtnText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {status === 'PENDING' && (
          <View style={styles.center}>
            <View style={[styles.iconCircle, styles.iconCircleWarning]}><ActivityIndicator size="large" color={CustomerColors.warning} /></View>
            <Text style={styles.title}>Payment Pending</Text>
            <Text style={styles.subtitle}>Your payment is processing at the bank. Please check back in a moment.</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={checkStatus}>
                <RefreshCw size={16} color={CustomerColors.black} />
                <Text style={styles.secondaryBtnText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}>
                <Text style={styles.primaryBtnText}>Home</Text>
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
  center: { alignItems: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  iconCircleSuccess: { backgroundColor: CustomerColors.successBg },
  iconCircleDanger: { backgroundColor: CustomerColors.dangerBg },
  iconCircleWarning: { backgroundColor: CustomerColors.warningBg },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: '#111827', marginTop: Spacing.md, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  primaryBtn: { flex: 1, flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: GoldColors.gold, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  primaryBtnText: { color: '#000', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  secondaryBtn: { flex: 1, flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  secondaryBtnText: { color: '#1F2937', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  billActions: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.lg },
  downloadBillBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  downloadBillBtnText: { color: '#FFFFFF', fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
  viewInvoiceBtn: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  viewInvoiceBtnText: { color: CustomerColors.teal700, fontWeight: '800', textTransform: 'uppercase', fontSize: FontSizes.xs, letterSpacing: 0.5 },
});

