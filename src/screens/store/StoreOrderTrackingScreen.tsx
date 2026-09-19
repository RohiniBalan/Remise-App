import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Package,
  Navigation,
  Store,
  User,
  AlertCircle,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { GATEWAY_URL } from '../../api/endpoints';

export default function StoreOrderTrackingScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const orderId = route.params?.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = useCallback(
    async (isBackground = false) => {
      if (!orderId) return;
      try {
        if (!isBackground) setLoading(true);
        else setRefreshing(true);
        setError('');

        const res = await smartOrderApi.getOrderTracking(orderId);
        if (res.data?.success) {
          setOrder(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to load tracking data');
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Order not found or tracking unavailable'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchTracking(false);
  }, [fetchTracking]);

  // Live auto-polling every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTracking(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  const currentStatus = order?.deliveryStatus || 'Pending';
  const driver = order?.deliveryPerson || {};
  const webBase = GATEWAY_URL.replace(/:\d+$/, ':4000').replace(/\/api\/?$/, '');
  const deliveryUrl = order?.deliveryToken ? `${webBase}/delivery/${order.deliveryToken}` : '';

  const handleShare = async () => {
    if (!deliveryUrl) return;
    try {
      await Share.share({
        title: `Delivery for Order #${order?.orderId}`,
        message: `Delivery Portal Link for Order #${order?.orderId}:\n${deliveryUrl}`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenMap = (address: string) => {
    if (!address) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  const handleDirectStatusUpdate = async (status: string) => {
    try {
      setUpdating(true);
      await smartOrderApi.updateDeliveryStatusDirect(orderId, { status });
      await fetchTracking(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update milestone');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={isDark ? '#F9FAFB' : CustomerColors.black} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.headerTitle}>Store Live Tracking</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>Order #{orderId}</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchTracking(true)}>
          <RefreshCw size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
          <Text style={styles.loadingText}>Loading Live Tracking…</Text>
        </View>
      ) : error || !order ? (
        <View style={styles.center}>
          <AlertCircle size={36} color="#DC2626" />
          <Text style={styles.errorTitle}>Tracking Unavailable</Text>
          <Text style={styles.errorSub}>{error || 'Could not locate this order.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTracking(false)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTracking(true)}
              colors={[CustomerColors.teal600]}
              tintColor={CustomerColors.teal600}
            />
          }
        >
          {/* Main Status Header Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusIconWrap}>
                <Truck size={24} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusMode}>
                  Mode: {order.deliveryMode === 'portal_delivery' ? 'Remise Network' : 'Store Delivery'}
                </Text>
                <Text style={styles.statusText}>{currentStatus}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{currentStatus}</Text>
              </View>
            </View>
          </View>

          {/* Assigned Driver Card */}
          {driver?.name ? (
            <View style={styles.driverCard}>
              <View style={styles.driverRow}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {driver.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {driver.rating || '4.8'}</Text>
                    </View>
                  </View>
                  <Text style={styles.driverVehicle}>
                    {driver.vehicleType || 'Bike'} {driver.vehicleNumber ? `• ${driver.vehicleNumber}` : ''}
                  </Text>
                </View>

                {driver.phone ? (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(driver.phone)}
                  >
                    <Phone size={13} color="#FFFFFF" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.driverFooter}>
                <Text style={styles.driverEtaText}>Pickup ETA: {driver.eta || '10-15 mins'}</Text>
                {deliveryUrl ? (
                  <TouchableOpacity style={styles.shareDriverLinkBtn} onPress={handleShare}>
                    <Share2 size={12} color="#FFFFFF" />
                    <Text style={styles.shareDriverLinkBtnText}>Share Link</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delivery Partner Status</Text>
              <View style={styles.unassignedRow}>
                <Text style={styles.unassignedText}>No driver assigned yet</Text>
                <Text style={styles.unassignedSub}>
                  {order.deliveryStatus === 'Searching' ? 'Broadcasting to drivers…' : 'Pending Action'}
                </Text>
              </View>
            </View>
          )}

          {/* Customer Drop-off Card */}
          <View style={styles.card}>
            <View style={styles.addressHeader}>
              <User size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              <Text style={styles.cardTitle}>Customer Drop-off Location</Text>
            </View>

            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress?.fullAddress || 'No address specified'}
            </Text>

            <View style={styles.customerActionsRow}>
              {order.customerPhone ? (
                <TouchableOpacity
                  style={styles.customerCallBtn}
                  onPress={() => handleCall(order.customerPhone)}
                >
                  <Phone size={12} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  <Text style={styles.customerCallBtnText}>Call: {order.customerPhone}</Text>
                </TouchableOpacity>
              ) : null}

              {order.deliveryAddress?.fullAddress ? (
                <TouchableOpacity
                  style={styles.customerMapBtn}
                  onPress={() => handleOpenMap(order.deliveryAddress.fullAddress)}
                >
                  <Navigation size={12} color="#2563EB" />
                  <Text style={styles.customerMapBtnText}>Directions</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Quick Milestone Override Buttons */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Milestone Override</Text>
            <View style={styles.milestoneButtonsRow}>
              {['Ready', 'Out for Delivery', 'Delivered'].map(st => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.milestoneBtn,
                    currentStatus === st && styles.milestoneBtnActive,
                  ]}
                  onPress={() => handleDirectStatusUpdate(st)}
                  disabled={updating}
                >
                  <Text
                    style={[
                      styles.milestoneBtnText,
                      currentStatus === st && styles.milestoneBtnTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Milestone Timeline History */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Milestone Timeline</Text>
            <View style={styles.timelineList}>
              {(order.deliveryTimeline || []).length === 0 ? (
                <Text style={styles.emptyTimelineText}>No milestone events recorded yet.</Text>
              ) : (
                (order.deliveryTimeline || []).map((ev: any, idx: number) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineIndexWrap}>
                      <Text style={styles.timelineIndexText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.timelineStatus}>{ev.status}</Text>
                        <Text style={styles.timelineTime}>
                          {new Date(ev.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.timelineNote}>
                        {ev.note || `Status updated by ${ev.updatedBy || 'System'}`}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Order Items Checklist */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Items ({order.items?.length || 0})</Text>
            <View style={styles.itemsList}>
              {(order.items || []).map((item: any, idx: number) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.brand ? <Text style={styles.itemBrand}>{item.brand}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Revenue:</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0B0F17' : '#F4F7F9',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    backBtn: {
      padding: 6,
      borderRadius: BorderRadius.md,
    },
    headerTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    headerSub: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontFamily: 'monospace',
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(22, 163, 74, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: 'rgba(22, 163, 74, 0.3)',
    },
    liveDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: '#16A34A',
    },
    liveBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#16A34A',
    },
    refreshBtn: {
      padding: 8,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
      gap: 8,
    },
    loadingText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontWeight: '600',
    },
    errorTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    errorSub: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
    },
    retryBtn: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      backgroundColor: CustomerColors.teal600,
      borderRadius: BorderRadius.md,
      marginTop: 8,
    },
    retryBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    content: {
      padding: Spacing.md,
      gap: Spacing.md,
    },
    statusCard: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      ...Shadows.card,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusMode: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#6B7280',
      textTransform: 'uppercase',
    },
    statusText: {
      fontSize: FontSizes.lg,
      fontWeight: '900',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      marginTop: 2,
    },
    statusBadge: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: CustomerColors.teal600,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    card: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      ...Shadows.card,
      gap: Spacing.sm,
    },
    cardTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: isDark ? '#9CA3AF' : '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    driverCard: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#0f766e' : '#CCFBF1',
      gap: 10,
    },
    driverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    driverAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: CustomerColors.teal600,
      alignItems: 'center',
      justifyContent: 'center',
    },
    driverAvatarText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 16,
    },
    driverName: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    ratingBadge: {
      backgroundColor: isDark ? '#0f766e' : '#CCFBF1',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },
    ratingText: {
      fontSize: 9,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.teal700,
    },
    driverVehicle: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    callBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: CustomerColors.teal600,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: BorderRadius.pill,
    },
    callBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    driverFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#0f766e' : '#CCFBF1',
    },
    driverEtaText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    shareDriverLinkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#16A34A',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: BorderRadius.pill,
    },
    shareDriverLinkBtnText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    unassignedRow: {
      paddingVertical: 6,
    },
    unassignedText: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    unassignedSub: {
      fontSize: 11,
      color: '#D97706',
      marginTop: 2,
    },
    addressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    customerName: {
      fontSize: FontSizes.xs + 1,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    addressText: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      lineHeight: 16,
    },
    customerActionsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: 4,
    },
    customerCallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#CCFBF1',
    },
    customerCallBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    customerMapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: BorderRadius.md,
    },
    customerMapBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#2563EB',
    },
    milestoneButtonsRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    milestoneBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    milestoneBtnActive: {
      backgroundColor: CustomerColors.teal600,
      borderColor: CustomerColors.teal600,
    },
    milestoneBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#4B5563',
    },
    milestoneBtnTextActive: {
      color: '#FFFFFF',
    },
    timelineList: {
      gap: 8,
    },
    emptyTimelineText: {
      fontSize: 11,
      color: isDark ? '#6B7280' : '#9CA3AF',
      fontStyle: 'italic',
    },
    timelineItem: {
      flexDirection: 'row',
      gap: 8,
      padding: Spacing.sm,
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderRadius: BorderRadius.md,
    },
    timelineIndexWrap: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineIndexText: {
      fontSize: 10,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    timelineStatus: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    timelineTime: {
      fontSize: 10,
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
    timelineNote: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    itemsList: {
      gap: 8,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemTitle: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    itemBrand: {
      fontSize: 10,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    itemQty: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    itemPrice: {
      fontSize: FontSizes.xs,
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      marginVertical: 4,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 4,
    },
    totalLabel: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    totalValue: {
      fontSize: FontSizes.base,
      fontWeight: '900',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
  });
