import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import {
  FileText,
  Download,
  CheckCircle2,
  X,
  Store,
  User,
  CreditCard,
  Package,
  AlertCircle,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';

export interface MobileInvoiceData {
  invoiceNumber: string;
  orderId: string;
  paymentId?: string;
  invoiceDateFormatted: string;
  paymentMethod: string;
  paymentMethodFormatted: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryMethod?: string;
  deliveryMethodFormatted?: string;
  store: {
    name: string;
    email?: string;
    phone?: string;
    upiId?: string;
    address?: any;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    productId: string;
    title: string;
    brand?: string;
    price: number;
    quantity: number;
    subtotal: number;
    image?: string;
    tierLabel?: string;
  }>;
  summary: {
    itemCount: number;
    subtotal: number;
    discount?: number;
    tax?: number;
    shipping?: number;
    totalAmount: number;
  };
}

interface Props {
  orderId: string;
  visible: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ orderId, visible, onClose }: Props) {
  const [invoice, setInvoice] = useState<MobileInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || !orderId) return;

    setLoading(true);
    setError('');

    smartOrderApi
      .getInvoice(orderId)
      .then((res: any) => {
        if (res.data?.success && res.data.data) {
          setInvoice(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to load invoice details.');
        }
      })
      .catch((err: any) => {
        console.error('Invoice load error:', err);
        setError(
          err.response?.data?.message ||
            'Invoice is only available for confirmed successful payments.',
        );
      })
      .finally(() => setLoading(false));
  }, [visible, orderId]);

  if (!visible) return null;

  const pdfUrl = smartOrderApi.getInvoicePdfUrl(orderId);

  const handleDownloadPdf = async () => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Download Error', 'Unable to open PDF download link.');
      }
    } catch {
      Alert.alert('Download Error', 'Could not initiate invoice download.');
    }
  };

  const formatAddress = (addr: any) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.street, addr.city, addr.state, addr.pinCode, addr.country]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <FileText size={18} color={CustomerColors.teal700} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Official Tax Invoice</Text>
                <Text style={styles.headerSubtitle}>Order #{orderId}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
          >
            {loading && (
              <View style={styles.centerContainer}>
                <ActivityIndicator
                  size="large"
                  color={CustomerColors.teal700}
                />
                <Text style={styles.loadingText}>
                  Generating verified bill...
                </Text>
              </View>
            )}

            {error && !loading && (
              <View style={styles.errorCard}>
                <AlertCircle size={20} color={CustomerColors.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>Invoice Unavailable</Text>
                  <Text style={styles.errorSubtitle}>{error}</Text>
                </View>
              </View>
            )}

            {!loading && !error && invoice && (
              <View style={styles.invoiceContent}>
                {/* Store Header */}
                <View style={styles.storeCard}>
                  <View style={styles.storeTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.storeName}>
                        {invoice.store?.name || 'Remise Store'}
                      </Text>
                      <Text style={styles.storeAddress}>
                        {formatAddress(invoice.store?.address)}
                      </Text>
                      {invoice.store?.phone && (
                        <Text style={styles.storeMeta}>
                          Tel: {invoice.store.phone}
                        </Text>
                      )}
                      {invoice.store?.upiId && (
                        <Text style={styles.storeMeta}>
                          UPI: {invoice.store.upiId}
                        </Text>
                      )}
                    </View>
                    {invoice.paymentStatus === 'SUCCESS' ? (
                      <View style={styles.paidBadge}>
                        <CheckCircle2 size={12} color={CustomerColors.success} />
                        <Text style={styles.paidBadgeText}>PAID</Text>
                      </View>
                    ) : (invoice.paymentMethod === 'cod' || invoice.paymentMethod === 'cash') ? (
                      <View style={[styles.paidBadge, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }]}>
                        <CheckCircle2 size={12} color={CustomerColors.teal700} />
                        <Text style={[styles.paidBadgeText, { color: CustomerColors.teal700 }]}>COD</Text>
                      </View>
                    ) : (
                      <View style={[styles.paidBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <Text style={[styles.paidBadgeText, { color: '#B45309' }]}>PENDING</Text>
                      </View>
                    )}
                  </View>


                  <View style={styles.divider} />

                  <View style={styles.invoiceMetaRow}>
                    <Text style={styles.metaLabel}>Invoice No:</Text>
                    <Text style={styles.metaValue}>
                      {invoice.invoiceNumber}
                    </Text>
                  </View>
                  <View style={styles.invoiceMetaRow}>
                    <Text style={styles.metaLabel}>Date & Time:</Text>
                    <Text style={styles.metaValue}>
                      {invoice.invoiceDateFormatted}
                    </Text>
                  </View>
                </View>

                {/* Customer & Order Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailBox}>
                    <View style={styles.sectionHeader}>
                      <User size={13} color={CustomerColors.teal700} />
                      <Text style={styles.sectionTitle}>Billed To</Text>
                    </View>
                    <Text style={styles.customerName}>
                      {invoice.customer?.name}
                    </Text>
                    {invoice.customer?.phone ? (
                      <Text style={styles.detailText}>
                        {invoice.customer.phone}
                      </Text>
                    ) : null}
                    {invoice.customer?.email ? (
                      <Text style={styles.detailText} numberOfLines={1}>
                        {invoice.customer.email}
                      </Text>
                    ) : null}
                    {invoice.customer?.address ? (
                      <Text style={styles.addressText} numberOfLines={2}>
                        {invoice.customer.address}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.detailBox}>
                    <View style={styles.sectionHeader}>
                      <CreditCard size={13} color={CustomerColors.teal700} />
                      <Text style={styles.sectionTitle}>Payment Info</Text>
                    </View>
                    <Text style={styles.detailText}>
                      Mode: {invoice.paymentMethodFormatted}
                    </Text>
                    <Text style={styles.detailText}>
                      Delivery:{' '}
                      {invoice.deliveryMethodFormatted || 'Standard'}
                    </Text>
                    <Text style={styles.statusConfirmed}>
                      Status: CONFIRMED
                    </Text>
                  </View>
                </View>

                {/* Items Table */}
                <View style={styles.itemsCard}>
                  <View style={styles.sectionHeader}>
                    <Package size={13} color={CustomerColors.teal700} />
                    <Text style={styles.sectionTitle}>Purchased Items</Text>
                  </View>

                  {invoice.items?.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={{ flex: 1, paddingRight: Spacing.xs }}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.title}
                          {item.brand ? ` (${item.brand})` : ''}
                        </Text>
                        <Text style={styles.itemSub}>
                          {item.quantity} × ₹
                          {(item.price || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        ₹{(item.subtotal || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      ₹
                      {(
                        invoice.summary?.subtotal || invoice.summary?.totalAmount
                      ).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery</Text>
                    <Text style={styles.summaryValue}>
                      {invoice.summary?.shipping ? `₹${invoice.summary.shipping}` : 'FREE'}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Taxes (GST)</Text>
                    <Text style={styles.summaryValue}>Included</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total Paid</Text>
                    <Text style={styles.grandTotalValue}>
                      ₹
                      {(
                        invoice.summary?.totalAmount ||
                        invoice.summary?.subtotal ||
                        0
                      ).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.footerNote}>
                  {(invoice.paymentMethod === 'cod' || invoice.paymentMethod === 'cash')
                    ? 'Verified computer-generated order bill / invoice payable on delivery.'
                    : 'Verified computer-generated tax invoice for completed payment.'}
                </Text>
              </View>

            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.downloadBtn,
                (loading || !!error) && styles.btnDisabled,
              ]}
              onPress={handleDownloadPdf}
              disabled={loading || !!error}
            >
              <Download size={16} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Download PDF Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CustomerColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.mint,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: CustomerColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerSubtitle: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    padding: Spacing.md,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.danger,
  },
  errorSubtitle: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
  },
  invoiceContent: {
    gap: Spacing.sm,
  },
  storeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
  },
  storeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeName: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  storeAddress: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  storeMeta: {
    fontSize: 10,
    color: CustomerColors.teal700,
    marginTop: 2,
    fontWeight: '600',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CustomerColors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: CustomerColors.success,
  },
  divider: {
    height: 1,
    backgroundColor: CustomerColors.steelBorder,
    marginVertical: Spacing.sm,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: CustomerColors.teal700,
  },
  customerName: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  detailText: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  addressText: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  statusConfirmed: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.success,
    marginTop: 2,
  },
  itemsCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  itemSub: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    marginTop: 1,
  },
  itemTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: CustomerColors.steelBorder,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  grandTotalValue: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  footerNote: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.white,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
