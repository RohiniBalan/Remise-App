import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert, Image } from 'react-native';
import { Search, Store, Truck, ShoppingBag, AlertCircle, FileText, CreditCard, RotateCcw, CheckCircle2, Banknote, QrCode, RefreshCw, X } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { offersApi } from '../../api/offersApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import { creditApi } from '../../api/creditApi';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';
import DeliveryFlowModal from '../../components/store/DeliveryFlowModal';
import { useTranslation, translateProductName } from '../../i18n';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function StoreOrdersScreen() {
  const navigation = useNavigation<any>();
  const { orders, loading, refresh, markOrdersAsSeen } = useStoreDashboard();
  const { isDark } = useTheme();
  const { t, language } = useTranslation();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Pending':
        return t.store.deliveryPending;
      case 'Delivered':
        return t.store.deliveryDelivered;
      case 'Out for Delivery':
        return t.store.deliveryOutForDelivery;
      case 'Picked Up':
        return t.store.deliveryPickedUp;
      case 'Ready':
        return 'Ready for Pickup';
      case 'Accepted':
        return t.store.deliveryAccepted;
      case 'Assigned':
        return t.store.deliveryAssigned;
      default:
        return status;
    }
  };

  useFocusEffect(
    useCallback(() => {
      markOrdersAsSeen?.();
    }, [markOrdersAsSeen])
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<any>(null);

  const [pickupModalOrder, setPickupModalOrder] = useState<any>(null);
  const [pickupOtp, setPickupOtp] = useState('');
  const [pickupOtpError, setPickupOtpError] = useState('');
  const [verifyingPickupOtp, setVerifyingPickupOtp] = useState(false);

  // Self Pickup inline OTP confirmation state
  const [inlineOtpMap, setInlineOtpMap] = useState<Record<string, string>>({});
  const [inlineVerifyingMap, setInlineVerifyingMap] = useState<Record<string, boolean>>({});
  const [inlineErrorMap, setInlineErrorMap] = useState<Record<string, string>>({});
  const [inlineSuccessMap, setInlineSuccessMap] = useState<Record<string, string>>({});

  // Store QR Payment Modal state for COD + Self Pickup
  const [storeQrModal, setStoreQrModal] = useState<{
    orderId: string;
    amount: number;
    shortUrl: string;
    paymentStatus: string;
    checkingStatus?: boolean;
    statusMessage?: string;
  } | null>(null);
  const [loadingQrId, setLoadingQrId] = useState<string | null>(null);

  const handleInlinePickupDelivery = async (o: any) => {
    const orderId = o.orderId || o._id;
    const otp = (inlineOtpMap[orderId] || '').trim();
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setInlineErrorMap(prev => ({ ...prev, [orderId]: 'Please enter a valid 6-digit OTP' }));
      return;
    }
    setInlineVerifyingMap(prev => ({ ...prev, [orderId]: true }));
    setInlineErrorMap(prev => ({ ...prev, [orderId]: '' }));
    setInlineSuccessMap(prev => ({ ...prev, [orderId]: '' }));
    try {
      const res = await smartOrderApi.confirmSelfPickupOtp(orderId, otp);
      if (res.data?.success) {
        setInlineSuccessMap(prev => ({ ...prev, [orderId]: 'Pickup confirmed! Order marked as Delivered.' }));
        o.deliveryStatus = 'Delivered';
        o.status = 'Delivered';
        refresh();
      } else {
        setInlineErrorMap(prev => ({ ...prev, [orderId]: res.data?.message || 'Verification failed' }));
      }
    } catch (err: any) {
      setInlineErrorMap(prev => ({ ...prev, [orderId]: err?.response?.data?.message || err?.message || 'Failed to verify OTP' }));
    } finally {
      setInlineVerifyingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const [errorModal, setErrorModal] = useState<string | null>(null);

  const counts: Record<string, number> = { all: orders.length };
  ORDER_STATUSES.forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.offerTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await offersApi.updateOrderStatus(orderId, status);
      refresh();
    } catch {
      setErrorModal('Failed to update order status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleMarkReady = async (o: any) => {
    setUpdating(o._id);
    try {
      const orderId = o.orderId || o._id;
      await smartOrderApi.updateDeliveryStatusDirect(orderId, { status: 'Ready' });
      refresh();
    } catch (err: any) {
      setErrorModal(err?.response?.data?.message || err?.message || 'Failed to update order to Ready for Pickup.');
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmCod = (o: any) => {
    Alert.alert(
      'Confirm Cash Collection',
      `Have you collected cash of ₹${o.totalAmount} for order #${(o.orderId || o._id).slice(-6).toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Collected',
          style: 'default',
          onPress: async () => {
            setUpdating(o._id);
            try {
              const res = await creditApi.confirmCodCollection(o.orderId || o._id);
              if (res.data?.success) {
                refresh();
              } else {
                setErrorModal(res.data?.message || 'Failed to confirm COD collection.');
              }
            } catch (err: any) {
              setErrorModal(err?.response?.data?.message || 'Failed to confirm COD collection.');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const handleShowStoreQr = async (o: any) => {
    const oid = o.orderId || o._id;
    setLoadingQrId(oid);
    try {
      const res = await smartOrderApi.createStorePickupPaymentLink(oid);
      if (res.data?.success && res.data.paymentLink) {
        setStoreQrModal({
          orderId: oid,
          amount: res.data.paymentLink.amount,
          shortUrl: res.data.paymentLink.shortUrl,
          paymentStatus: o.paymentStatus || 'PENDING',
        });
      } else {
        setErrorModal(res.data?.message || 'Failed to generate store QR code');
      }
    } catch (err: any) {
      setErrorModal(err?.response?.data?.message || err?.message || 'Failed to generate store QR code');
    } finally {
      setLoadingQrId(null);
    }
  };

  const handleCheckStoreQrStatus = async () => {
    if (!storeQrModal) return;
    const oid = storeQrModal.orderId;
    setStoreQrModal(prev => prev ? { ...prev, checkingStatus: true, statusMessage: undefined } : null);
    try {
      const res = await smartOrderApi.getStorePaymentStatus(oid);
      if (res.data?.paymentStatus === 'SUCCESS') {
        setStoreQrModal(prev => prev ? {
          ...prev,
          paymentStatus: 'SUCCESS',
          checkingStatus: false,
          statusMessage: 'Payment verified! Order marked as Paid.',
        } : null);
        refresh();
      } else {
        setStoreQrModal(prev => prev ? {
          ...prev,
          checkingStatus: false,
          statusMessage: 'Payment is still pending. Waiting for customer.',
        } : null);
      }
    } catch (err: any) {
      setStoreQrModal(prev => prev ? {
        ...prev,
        checkingStatus: false,
        statusMessage: err?.response?.data?.message || 'Failed to check status',
      } : null);
    }
  };

  const handleVerifyPickupOtp = async () => {
    if (!pickupModalOrder) return;
    if (!pickupOtp || pickupOtp.trim().length !== 6) {
      setPickupOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyingPickupOtp(true);
    setPickupOtpError('');
    try {
      const orderId = pickupModalOrder.orderId || pickupModalOrder._id;
      const res = await smartOrderApi.verifyOrderOtp(orderId, pickupOtp.trim());
      if (res.data?.success) {
        setPickupModalOrder(null);
        setPickupOtp('');
        refresh();
      } else {
        setPickupOtpError(res.data?.message || 'Verification failed');
      }
    } catch (err: any) {
      setPickupOtpError(err?.response?.data?.message || err?.message || 'Failed to verify OTP');
    } finally {
      setVerifyingPickupOtp(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topActionBar}>
        <View style={styles.searchRow}>
          <Search size={14} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t.store.searchOrdersPlaceholder}
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          />
        </View>
        <TouchableOpacity
          style={styles.deliveryLogsNavBtn}
          onPress={() => navigation.navigate('StoreDeliveries')}
        >
          <Truck size={14} color="#FFFFFF" />
          <Text style={styles.deliveryLogsNavBtnText}>{t.store.totalDeliveries}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['all', ...ORDER_STATUSES].map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterChipActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterChipText, filter === s && styles.filterChipTextActive]}>
              {s === 'all' ? t.store.allOrdersCount.replace('{count}', String(counts.all)) : `${translateStatus(s)} (${counts[s] || 0})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={paginatedOrders}
        keyExtractor={o => o._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShoppingBag size={40} color={isDark ? '#374151' : '#E5E7EB'} />
            <Text style={styles.emptyTitle}>{t.store.noOrdersFound}</Text>
            <Text style={{ marginTop: 4, color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 13, textAlign: 'center' }}>
              {t.store.ordersPlacedHere || 'Orders placed by customers will show up here.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          <PaginationControl
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        }
        renderItem={({ item: o }) => (
          <View style={styles.card}>
            <View style={styles.orderHeaderRow}>
              <Text style={styles.orderTitle} numberOfLines={1}>{translateProductName(o.offerTitle || o.productName || o.customerName || 'Order', language)}</Text>
              <View style={styles.badgeGroup}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{translateStatus(o.status)}</Text>
                </View>
                {o.deliveryStatus ? (
                  <View style={styles.deliveryBadge}>
                    <Text style={styles.deliveryBadgeText}>{translateStatus(o.deliveryStatus)}</Text>
                  </View>
                ) : null}
                {o.refundStatus && o.refundStatus !== 'none' ? (
                  <View style={[
                    styles.refundBadge,
                    (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundBadgeCompleted : styles.refundBadgePending
                  ]}>
                    <RotateCcw size={10} color={(o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? '#9333EA' : '#D97706'} />
                    <Text style={[
                      styles.refundBadgeText,
                      (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundBadgeTextCompleted : styles.refundBadgeTextPending
                    ]}>
                      {o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED'
                        ? t.store.refundCompletedAmount.replace('{amount}', String(o.totalRefundedAmount || o.totalAmount))
                        : o.refundStatus === 'partially_refunded'
                        ? t.store.partiallyRefundedAmount.replace('{amount}', String(o.totalRefundedAmount))
                        : o.refundStatus === 'requested'
                        ? t.store.refundRequested
                        : o.refundStatus === 'processing'
                        ? t.store.refundProcessing
                        : `${t.store.refundStatusPrefix} ${o.refundStatus}`}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={styles.orderCustomer}>
              {o.customerName}
              {o.customerPhone ? ` · ${o.customerPhone}` : ''}
              {(o.customerId || o.userId || o.userID) ? ` · Customer ID: ${o.customerId || o.userId || o.userID}` : ''}
            </Text>
            <Text style={styles.orderAddress} numberOfLines={1}>{o.deliveryAddress}</Text>
            {o.notes ? <Text style={styles.orderNotes}>"{o.notes}"</Text> : null}
            {o._source === 'smartOrder' && o.deliveryMethod && (
              <View style={styles.chipRow}>
                <View style={styles.metaChip}>
                  {o.deliveryMethod === 'pickup' ? <Store size={10} color={isDark ? '#9CA3AF' : '#6B7280'} /> : <Truck size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />}
                  <Text style={styles.metaChipText}>{o.deliveryMethod === 'pickup' ? t.store.selfPickup : t.store.homeDelivery}</Text>
                </View>
                <View style={[styles.metaChip, (o.paymentStatus === 'REFUNDED' || o.refundStatus === 'refunded') && { backgroundColor: isDark ? '#3b0764' : '#FAF5FF', borderColor: '#E9D5FF' }]}>
                  <CreditCard size={10} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.metaChipText, (o.paymentStatus === 'REFUNDED' || o.refundStatus === 'refunded') && { color: '#9333EA', fontWeight: '700' }]}>
                    {o.paymentMethod === 'razorpay' ? 'Razorpay' : o.paymentMethod === 'qr' ? 'QR' : o.paymentMethod === 'cod' ? 'Cash' : (o.paymentMethod || 'Online')} · {
                      o.paymentStatus === 'REFUNDED' || o.refundStatus === 'refunded'
                        ? t.store.paymentRefunded
                        : o.refundStatus === 'requested'
                        ? t.store.refundRequested
                        : o.paymentStatus === 'SUCCESS'
                        ? t.store.paymentPaid
                        : t.store.paymentPending
                    }
                  </Text>
                </View>
                {o.vendorTransfers?.[0] ? (
                  <View style={[styles.metaChip, { backgroundColor: isDark ? '#134e4a' : '#F0FDFA' }]}>
                    <Text style={[styles.metaChipText, { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '700' }]}>
                      Route: {o.vendorTransfers[0].transferStatus?.toUpperCase()} (Net ₹{o.vendorTransfers[0].vendorAmount})
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {o.refundStatus && o.refundStatus !== 'none' ? (
              <View style={[
                styles.refundNoticeBox,
                (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundNoticeBoxCompleted : styles.refundNoticeBoxPending
              ]}>
                <RotateCcw size={13} color={(o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? '#9333EA' : '#D97706'} />
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.refundNoticeTitle,
                    (o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED') ? styles.refundNoticeTitleCompleted : styles.refundNoticeTitlePending
                  ]}>
                    {o.refundStatus === 'refunded' || o.paymentStatus === 'REFUNDED'
                      ? t.store.refundCompletedAmount.replace('{amount}', String(o.totalRefundedAmount || o.totalAmount))
                      : o.refundStatus === 'partially_refunded'
                      ? t.store.partiallyRefundedAmount.replace('{amount}', String(o.totalRefundedAmount))
                      : o.refundStatus === 'requested'
                      ? t.store.customerRequestedRefundNote
                      : o.refundStatus === 'processing'
                      ? t.store.refundProcessing
                      : `${t.store.refundStatusPrefix} ${o.refundStatus}`}
                  </Text>
                  {o.refunds?.[0]?.reason ? (
                    <Text style={styles.refundNoticeReason}>Reason: "{o.refunds[0].reason}"</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <Text style={styles.orderDate}>
              {new Date(o.createdAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.footerRow}>
              <View style={styles.footerTop}>
                <Text style={styles.orderId}>#{o._id.slice(-6).toUpperCase()}</Text>
                {updating === o._id && <ActivityIndicator size="small" color={isDark ? '#2DD4BF' : CustomerColors.teal700} style={{ marginLeft: 6 }} />}
              </View>
              <Text style={styles.orderAmount}>₹{o.totalAmount}</Text>

              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                {o.paymentMethod === 'cod' && (o.codDetails?.status === 'pending' || (!o.codDetails?.status && o.paymentStatus !== 'SUCCESS')) && (
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={styles.codCollectBtn}
                      disabled={updating === o._id}
                      onPress={() => handleConfirmCod(o)}
                    >
                      <Banknote size={12} color="#FFFFFF" />
                      <Text style={styles.codCollectBtnText}>Confirm Cash (₹{o.totalAmount})</Text>
                    </TouchableOpacity>

                    {/* Show QR Online Payment button for Self Pickup COD orders */}
                    {o.deliveryMethod === 'pickup' && (
                      <TouchableOpacity
                        style={styles.storeQrBtn}
                        disabled={loadingQrId === (o.orderId || o._id)}
                        onPress={() => handleShowStoreQr(o)}
                      >
                        {loadingQrId === (o.orderId || o._id) ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <QrCode size={12} color="#FFFFFF" />
                            <Text style={styles.storeQrBtnText}>Show QR</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Self Pickup OTP Confirmation Section — Only for eligible, not-yet-delivered Self Pickup orders */}
                {o.deliveryMethod === 'pickup' &&
                  o.status !== 'Delivered' &&
                  o.deliveryStatus !== 'Delivered' &&
                  o.deliveryStatus !== 'Picked Up' &&
                  o.status !== 'Cancelled' && (
                    <View style={styles.pickupSection}>
                      <View style={styles.pickupSectionHeader}>
                        <View style={styles.pickupHeaderLeft}>
                          <Store size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                          <Text style={styles.pickupHeaderTitle}>Delivery Method: Self Pickup</Text>
                        </View>
                        <View style={styles.pickupStatusBadge}>
                          <Text style={styles.pickupStatusBadgeText}>
                            Status: {o.deliveryStatus === 'Ready' ? 'Ready for Pickup' : (translateStatus(o.deliveryStatus) || 'Ready for Pickup')}
                          </Text>
                        </View>
                      </View>

                      {/* Success notification */}
                      {inlineSuccessMap[o.orderId || o._id] ? (
                        <View style={styles.pickupSuccessBox}>
                          <CheckCircle2 size={15} color="#059669" />
                          <Text style={styles.pickupSuccessText}>{inlineSuccessMap[o.orderId || o._id]}</Text>
                        </View>
                      ) : null}

                      {/* Error notification */}
                      {inlineErrorMap[o.orderId || o._id] ? (
                        <View style={styles.pickupErrorBox}>
                          <AlertCircle size={15} color="#EF4444" />
                          <Text style={styles.pickupErrorText}>{inlineErrorMap[o.orderId || o._id]}</Text>
                        </View>
                      ) : null}

                      {/* OTP Input and Delivered Button */}
                      {!inlineSuccessMap[o.orderId || o._id] ? (
                        <View style={styles.pickupInputRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.pickupInputLabel}>Enter Customer OTP:</Text>
                            <TextInput
                              style={styles.pickupOtpTextInput}
                              keyboardType="number-pad"
                              maxLength={6}
                              value={inlineOtpMap[o.orderId || o._id] || ''}
                              onChangeText={(text) => {
                                const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
                                setInlineOtpMap(prev => ({ ...prev, [o.orderId || o._id]: clean }));
                                if (inlineErrorMap[o.orderId || o._id]) {
                                  setInlineErrorMap(prev => ({ ...prev, [o.orderId || o._id]: '' }));
                                }
                              }}
                              placeholder="[ _ _ _ _ _ _ ]"
                              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                              editable={!inlineVerifyingMap[o.orderId || o._id]}
                            />
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.pickupDeliveredBtn,
                              (inlineVerifyingMap[o.orderId || o._id] || (inlineOtpMap[o.orderId || o._id] || '').length !== 6) && styles.btnDisabled
                            ]}
                            disabled={inlineVerifyingMap[o.orderId || o._id] || (inlineOtpMap[o.orderId || o._id] || '').length !== 6}
                            onPress={() => handleInlinePickupDelivery(o)}
                          >
                            {inlineVerifyingMap[o.orderId || o._id] ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <CheckCircle2 size={13} color="#FFFFFF" />
                                <Text style={styles.pickupDeliveredBtnText}>Delivered</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                )}

                {o.deliveryMethod !== 'pickup' &&
                  (o.deliveryMethod === 'delivery' || !!o.deliveryAddress) && (
                    <TouchableOpacity
                      style={styles.trackOrderBtn}
                      onPress={() => navigation.navigate('StoreOrderTracking', { orderId: o.orderId || o._id })}
                    >
                      <Truck size={12} color="#2563EB" />
                      <Text style={styles.trackOrderBtnText}>{t.store.viewDeliveryLinkBtn || 'Live Track'}</Text>
                    </TouchableOpacity>
                  )}

                {o.deliveryMethod !== 'pickup' &&
                  (o.deliveryMethod === 'delivery' || !!o.deliveryAddress) &&
                  o.status !== 'Delivered' &&
                  o.deliveryStatus !== 'Delivered' && (
                    <TouchableOpacity
                      style={styles.deliveryFlowBtn}
                      onPress={() => setSelectedDeliveryOrder(o)}
                    >
                      <Truck size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                      <Text style={styles.deliveryFlowBtnText}>
                        {o.deliveryToken ? t.store.viewDeliveryLinkBtn : t.store.manageDeliveryBtn}
                      </Text>
                    </TouchableOpacity>
                  )}

                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{translateStatus(o.deliveryStatus || o.status)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {selectedDeliveryOrder && (
        <DeliveryFlowModal
          order={selectedDeliveryOrder}
          visible={!!selectedDeliveryOrder}
          onClose={() => setSelectedDeliveryOrder(null)}
          onRefresh={refresh}
        />
      )}

      {/* Pickup OTP Verification Modal */}
      {pickupModalOrder && (
        <Modal
          visible={!!pickupModalOrder}
          transparent
          animationType="fade"
          onRequestClose={() => !verifyingPickupOtp && setPickupModalOrder(null)}
        >
          <View style={styles.errorModalBackdrop}>
            <View style={styles.errorModalCard}>
              <View style={[styles.errorModalIconWrap, { backgroundColor: isDark ? '#14532d' : '#DCFCE7' }]}>
                <CheckCircle2 size={28} color="#16A34A" />
              </View>
              <Text style={styles.errorModalTitle}>Confirm Pickup</Text>
              <Text style={styles.errorModalMsg}>
                Enter customer's 6-digit OTP received via WhatsApp
              </Text>
              <TextInput
                style={styles.otpInput}
                value={pickupOtp}
                onChangeText={(text) => {
                  setPickupOtp(text.replace(/[^0-9]/g, ''));
                  setPickupOtpError('');
                }}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="• • • • • •"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                autoFocus
              />
              {pickupOtpError ? (
                <Text style={styles.otpErrorText}>{pickupOtpError}</Text>
              ) : null}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalSecondaryBtn, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                  disabled={verifyingPickupOtp}
                  onPress={() => setPickupModalOrder(null)}
                >
                  <Text style={[styles.modalSecondaryBtnText, { color: isDark ? '#D1D5DB' : '#374151' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalPrimaryBtn, (verifyingPickupOtp || pickupOtp.length !== 6) && { opacity: 0.6 }]}
                  disabled={verifyingPickupOtp || pickupOtp.length !== 6}
                  onPress={handleVerifyPickupOtp}
                >
                  {verifyingPickupOtp ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalPrimaryBtnText}>Verify Pickup</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* In-Store QR Payment Modal for COD + Self Pickup */}
      {storeQrModal ? (
        <Modal visible={!!storeQrModal} transparent animationType="fade" onRequestClose={() => setStoreQrModal(null)}>
          <View style={styles.errorModalBackdrop}>
            <View style={[styles.errorModalCard, { maxWidth: 320, padding: 20 }]}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 12, right: 12, padding: 4 }}
                onPress={() => setStoreQrModal(null)}
              >
                <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>

              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isDark ? '#1e3a8a' : '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <QrCode size={22} color="#3B82F6" />
              </View>

              <Text style={styles.errorModalTitle}>In-Store QR Payment</Text>
              <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>
                Order #{storeQrModal.orderId.slice(-8).toUpperCase()}
              </Text>

              <View style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 16, marginVertical: 12 }}>
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(storeQrModal.shortUrl)}` }}
                  style={{ width: 180, height: 180 }}
                />
              </View>

              <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700, marginBottom: 4 }}>
                ₹{storeQrModal.amount}
              </Text>

              <Text style={{ fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', textAlign: 'center', marginBottom: 10 }}>
                Customer can scan with Google Pay, PhonePe, Paytm, or any UPI app.
              </Text>

              {storeQrModal.statusMessage ? (
                <View style={{
                  padding: 8,
                  borderRadius: BorderRadius.sm,
                  backgroundColor: storeQrModal.paymentStatus === 'SUCCESS' ? (isDark ? '#064e3b' : '#ECFDF5') : (isDark ? '#451a03' : '#FFFBEB'),
                  marginBottom: 10,
                  width: '100%',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: storeQrModal.paymentStatus === 'SUCCESS' ? '#059669' : '#D97706',
                    textAlign: 'center',
                  }}>
                    {storeQrModal.statusMessage}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { width: '100%', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
                disabled={storeQrModal.checkingStatus}
                onPress={handleCheckStoreQrStatus}
              >
                {storeQrModal.checkingStatus ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <RefreshCw size={13} color="#FFFFFF" />
                    <Text style={styles.modalPrimaryBtnText}>Check Payment Status</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Custom Error Modal */}
      {errorModal ? (
        <Modal visible={!!errorModal} transparent animationType="fade" onRequestClose={() => setErrorModal(null)}>
          <View style={styles.errorModalBackdrop}>
            <View style={styles.errorModalCard}>
              <View style={styles.errorModalIconWrap}>
                <AlertCircle size={28} color="#DC2626" />
              </View>
              <Text style={styles.errorModalTitle}>Notification</Text>
              <Text style={styles.errorModalMsg}>{errorModal}</Text>
              <TouchableOpacity style={styles.errorModalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.errorModalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    topActionBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginHorizontal: Spacing.md, marginTop: Spacing.md },
    searchRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: isDark ? '#FFFFFF' : CustomerColors.black },
    deliveryLogsNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CustomerColors.teal700, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.md },
    deliveryLogsNavBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
    filterChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.pill,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    filterChipActive: { backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, borderColor: isDark ? '#2DD4BF' : CustomerColors.teal600 },
    filterChipText: { fontSize: 10, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
    filterChipTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    list: { padding: Spacing.md },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
    emptyTitle: { fontSize: FontSizes.base, fontWeight: '700', color: isDark ? '#9CA3AF' : '#374151', textAlign: 'center' },
    card: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    orderTitle: { fontSize: FontSizes.sm, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black, flex: 1 },
    orderCustomer: { fontSize: FontSizes.xs, color: isDark ? '#D1D5DB' : '#4B5563', marginTop: 2 },
    orderAddress: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, marginTop: 2 },
    chipRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: BorderRadius.pill,
    },
    metaChipText: { fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' },
    footerRow: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: isDark ? '#1F2937' : '#F5F5F5' },
    orderAmount: { fontSize: FontSizes.md, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700, marginBottom: Spacing.xs },
    orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
    deliveryBadge: { backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, borderWidth: 1, borderColor: isDark ? '#115e59' : CustomerColors.steelBorder, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
    deliveryBadgeText: { fontSize: 9, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    refundBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
    refundBadgePending: { backgroundColor: isDark ? '#451a03' : '#FEF3C7', borderColor: isDark ? '#78350f' : '#FDE68A' },
    refundBadgeCompleted: { backgroundColor: isDark ? '#3b0764' : '#F3E8FF', borderColor: isDark ? '#6b21a8' : '#E9D5FF' },
    refundBadgeText: { fontSize: 9, fontWeight: '700' },
    refundBadgeTextPending: { color: isDark ? '#FBBF24' : '#D97706' },
    refundBadgeTextCompleted: { color: isDark ? '#C084FC' : '#9333EA' },
    refundNoticeBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 8, borderRadius: BorderRadius.sm, borderWidth: 1, marginTop: 8 },
    refundNoticeBoxPending: { backgroundColor: isDark ? '#451a03' : '#FFFBEB', borderColor: isDark ? '#78350f' : '#FDE68A' },
    refundNoticeBoxCompleted: { backgroundColor: isDark ? '#3b0764' : '#FAF5FF', borderColor: isDark ? '#6b21a8' : '#F3E8FF' },
    refundNoticeTitle: { fontSize: 11, fontWeight: '700' },
    refundNoticeTitlePending: { color: isDark ? '#FBBF24' : '#B45309' },
    refundNoticeTitleCompleted: { color: isDark ? '#C084FC' : '#7E22CE' },
    refundNoticeReason: { fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 },
    actionButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    trackOrderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#1e3a8a' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? '#3b82f6' : '#BFDBFE',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    trackOrderBtnText: { fontSize: 10, fontWeight: '700', color: isDark ? '#93C5FD' : '#1D4ED8' },
    deliveryFlowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      borderWidth: 1,
      borderColor: isDark ? '#115e59' : CustomerColors.steelBorder,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    deliveryFlowBtnText: { fontSize: 10, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    statusBadge: { alignSelf: 'flex-start', backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.pill },
    statusBadgeText: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    orderNotes: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontStyle: 'italic', marginTop: 2 },
    orderDate: { fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 4 },
    footerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    orderId: { fontSize: 10, color: isDark ? '#9CA3AF' : '#9CA3AF', fontFamily: 'monospace' },
    errorModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
    errorModalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: isDark ? '#111827' : '#fff',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      alignItems: 'center',
      gap: Spacing.xs,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#1F2937' : 'transparent',
    },
    errorModalIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: isDark ? '#450a0a' : '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    errorModalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
    errorModalMsg: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
    errorModalBtn: { width: '100%', backgroundColor: CustomerColors.primary, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
    errorModalBtnText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
    pickupActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#2563EB',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    pickupVerifyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#16A34A',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    pickupActionBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    codCollectBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#059669',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    codCollectBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    storeQrBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#2563EB',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
    },
    storeQrBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    otpInput: {
      width: '100%',
      letterSpacing: 8,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '800',
      fontFamily: 'monospace',
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#D1D5DB',
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      color: isDark ? '#F9FAFB' : '#111827',
      marginVertical: 10,
    },
    otpErrorText: {
      color: '#EF4444',
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 6,
      textAlign: 'center',
    },
    modalBtnRow: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
      marginTop: 8,
    },
    modalSecondaryBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      alignItems: 'center',
    },
    modalSecondaryBtnText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    modalPrimaryBtn: {
      flex: 1,
      backgroundColor: '#16A34A',
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    modalPrimaryBtnText: {
      color: '#fff',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    pickupSection: {
      marginTop: 10,
      padding: 12,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#064e3b22' : '#F0FDFA',
      borderWidth: 1,
      borderColor: isDark ? '#134e4a' : '#CCFBF1',
    },
    pickupSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      flexWrap: 'wrap',
      gap: 6,
    },
    pickupHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    pickupHeaderTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    pickupStatusBadge: {
      backgroundColor: isDark ? '#134e4a' : '#E6FFFA',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: isDark ? '#2DD4BF' : '#99F6E4',
    },
    pickupStatusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#5EEAD4' : '#0F766E',
    },
    pickupSuccessBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#05966915',
      borderColor: '#05966935',
      borderWidth: 1,
      padding: 8,
      borderRadius: BorderRadius.sm,
      marginBottom: 6,
    },
    pickupSuccessText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#059669',
    },
    pickupErrorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#EF444415',
      borderColor: '#EF444435',
      borderWidth: 1,
      padding: 8,
      borderRadius: BorderRadius.sm,
      marginBottom: 6,
    },
    pickupErrorText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#EF4444',
    },
    pickupInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      marginTop: 4,
    },
    pickupInputLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 4,
    },
    pickupOtpTextInput: {
      height: 40,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#99F6E4',
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 12,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 4,
      textAlign: 'center',
      color: isDark ? '#F9FAFB' : '#111827',
      fontFamily: 'monospace',
    },
    pickupDeliveredBtn: {
      height: 40,
      paddingHorizontal: 16,
      backgroundColor: '#0D9488',
      borderRadius: BorderRadius.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    pickupDeliveredBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });

