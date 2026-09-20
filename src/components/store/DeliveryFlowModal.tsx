import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  ScrollView,
  Linking,
} from 'react-native';
import {
  X,
  Truck,
  Link2,
  Copy,
  Check,
  Share2,
  UserCheck,
  Users,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Phone,
  AlertCircle,
  Zap,
  RotateCcw,
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
import { offersApi } from '../../api/offersApi';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import { GATEWAY_URL } from '../../api/endpoints';

interface DeliveryFlowModalProps {
  order: any;
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function DeliveryFlowModal({
  order,
  visible,
  onClose,
  onRefresh,
}: DeliveryFlowModalProps) {
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const [stage, setStage] = useState<
    | 'initial'
    | 'has_person'
    | 'no_person'
    | 'link_generated'
    | 'network_enrolled_done'
    | 'confirm_remise_request'
    | 'searching'
    | 'accepted'
    | 'unavailable'
    | 'self_arranged'
  >('initial');

  // Form states for store delivery person
  const [deliveryPersonName, setDeliveryPersonName] = useState('');
  const [deliveryPersonPhone, setDeliveryPersonPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Store delivery persons from API
  const [storeDeliveryPersons, setStoreDeliveryPersons] = useState<any[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('custom');

  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible && order) {
      const orderToken = order.deliveryToken;
      const webBase = GATEWAY_URL.replace(/:\d+$/, ':4000').replace(/\/api\/?$/, '');
      if (orderToken) {
        setDeliveryUrl(`${webBase}/delivery/${orderToken}`);
      }

      const status = order.deliveryStatus;
      const mode = order.deliveryMode;

      if (status === 'Searching') {
        setStage('searching');
      } else if (
        [
          'Accepted',
          'Going to Store',
          'Arrived at Store',
          'Picked Up',
          'Out for Delivery',
          'Delivered',
        ].includes(status)
      ) {
        setStage('accepted');
      } else if (status === 'Unavailable' || status === 'Rejected') {
        setStage('unavailable');
      } else if (mode === 'own_delivery' && orderToken) {
        setStage('link_generated');
      } else if (mode === 'self_arrange') {
        setStage('self_arranged');
      } else {
        setStage('initial');
      }

      setDeliveryPersonName(order.deliveryPerson?.name || '');
      setDeliveryPersonPhone(order.deliveryPerson?.phone || '');
      setVehicleType(order.deliveryPerson?.vehicleType || 'Bike');
      setVehicleNumber(order.deliveryPerson?.vehicleNumber || '');
      setNotes(order.deliveryPerson?.notes || '');
      setErrorMessage('');

      // Fetch saved delivery persons
      smartOrderApi
        .getStoreDeliveryPersons()
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setStoreDeliveryPersons(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [visible, order]);

  if (!visible || !order) return null;

  const orderId = order.orderId || order._id || order.id || '';
  const displayOrderId = order.orderId && !order.orderId.match(/^[0-9a-fA-F]{24}$/)
    ? order.orderId
    : (order._id ? order._id.slice(-6).toUpperCase() : (order.id ? String(order.id).slice(-6).toUpperCase() : ''));
  const dropAddress =
    [order.shippingAddress?.address, order.shippingAddress?.city].filter(Boolean).join(', ') ||
    order.deliveryAddress ||
    'Customer Address';

  const currentStatus = order.deliveryStatus || 'Pending';
  const driver = order.deliveryPerson || {};

  // Store delivery person assignment
  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const webBase = GATEWAY_URL.replace(/:\d+$/, ':4000').replace(/\/api\/?$/, '');

      try {
        const res = await smartOrderApi.generateDeliveryLink(orderId, {
          deliveryPersonName: deliveryPersonName || undefined,
          deliveryPersonPhone: deliveryPersonPhone || undefined,
          vehicleType: vehicleType || undefined,
          vehicleNumber: vehicleNumber || undefined,
          notes: notes || undefined,
        });

        if (res.data?.success) {
          const tokenVal = res.data.data.deliveryToken;
          const url = `${webBase}/delivery/${tokenVal}`;
          setDeliveryUrl(url);
          setStage('link_generated');
          if (onRefresh) onRefresh();
          return;
        }
      } catch (err: any) {
        if (order._source === 'offerOrder' || err?.response?.status === 404 || err?.response?.data?.message?.includes('not found')) {
          if (order._id) {
            await offersApi.updateOrderStatus(order._id, 'Out for Delivery').catch(() => {});
          }
          const tokenVal = order.deliveryToken || order._id || 'portal';
          const url = `${webBase}/delivery/${tokenVal}`;
          setDeliveryUrl(url);
          setStage('link_generated');
          if (onRefresh) onRefresh();
          return;
        }
        throw err;
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to generate delivery link',
      );
    } finally {
      setLoading(false);
    }
  };

  // Enable delivery network for store
  const handleEnrollNetwork = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      await smartOrderApi.enrollDeliveryPortal({ enabled: true, hasOwnDelivery: false });
      setStage('network_enrolled_done');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to enable delivery network',
      );
    } finally {
      setLoading(false);
    }
  };

  // Request Remise Delivery partner for this order
  const handleRequestRemisePartner = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const webBase = GATEWAY_URL.replace(/:\d+$/, ':4000').replace(/\/api\/?$/, '');

      try {
        const res = await smartOrderApi.requestRemiseDelivery(orderId, {
          distanceKm: 3.5,
          deliveryFee: 45,
          pickupAddress: order.storeName || 'Store Location',
          dropAddress,
        });

        if (res.data?.success) {
          const tokenVal = res.data.data.deliveryToken;
          setDeliveryUrl(`${webBase}/delivery/${tokenVal}`);
          setStage('searching');
          if (onRefresh) onRefresh();
          return;
        }
      } catch (err: any) {
        if (order._source === 'offerOrder' || err?.response?.status === 404 || err?.response?.data?.message?.includes('not found')) {
          if (order._id) {
            await offersApi.updateOrderStatus(order._id, 'Confirmed').catch(() => {});
          }
          const tokenVal = order.deliveryToken || order._id || 'portal';
          setDeliveryUrl(`${webBase}/delivery/${tokenVal}`);
          setStage('searching');
          if (onRefresh) onRefresh();
          return;
        }
        throw err;
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to request delivery partner',
      );
    } finally {
      setLoading(false);
    }
  };

  // Self arrange
  const handleSelfArrange = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      try {
        await smartOrderApi.setDeliveryMode(orderId, { mode: 'self_arrange' });
      } catch (err: any) {
        if (order._source === 'offerOrder' || err?.response?.status === 404) {
          if (order._id) {
            await offersApi.updateOrderStatus(order._id, 'Confirmed').catch(() => {});
          }
        } else {
          throw err;
        }
      }
      setStage('self_arranged');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to set delivery mode',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectStatusUpdate = async (status: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      if (order._source === 'smartOrder' || (order.orderId && order.orderId.startsWith('ORD-'))) {
        await smartOrderApi.updateDeliveryStatusDirect(orderId, { status }).catch(() => {});
      }
      if (order._id) {
        await offersApi.updateOrderStatus(order._id, status).catch(() => {});
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!deliveryUrl) return;
    try {
      await Share.share({
        title: `Delivery for Order #${displayOrderId}`,
        message: `Hello, here is your delivery link for Order #${displayOrderId}:\n${deliveryUrl}\n\nPlease tap to view customer details and update delivery milestones.`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Truck size={18} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Manage Delivery</Text>
                <Text style={styles.headerSub}>Order #{displayOrderId}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* ── STAGE 1: Initial Question ── */}
            {stage === 'initial' && (
              <View style={styles.stageWrap}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeText}>Delivery Flow Setup</Text>
                </View>
                <Text style={styles.promptTitle}>Do you have your own delivery person?</Text>
                <Text style={styles.promptSub}>
                  Select how this order will be delivered to the customer.
                </Text>

                <View style={styles.optionsList}>
                  <TouchableOpacity
                    style={styles.optionCardPrimary}
                    onPress={() => setStage('has_person')}
                  >
                    <View style={styles.optionIconPrimary}>
                      <UserCheck size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitlePrimary}>YES, I have a delivery person</Text>
                      <Text style={styles.optionSubPrimary}>
                        Assign to your staff and generate a delivery link.
                      </Text>
                    </View>
                    <ArrowRight size={16} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionCardSecondary}
                    onPress={() => setStage('no_person')}
                  >
                    <View style={styles.optionIconSecondary}>
                      <Users size={20} color={isDark ? '#9CA3AF' : '#4B5563'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitleSecondary}>NO, I don't have one</Text>
                      <Text style={styles.optionSubSecondary}>
                        Request on-demand Remise Delivery Network partner.
                      </Text>
                    </View>
                    <ArrowRight size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── STAGE 2: Has Person Form ── */}
            {stage === 'has_person' && (
              <View style={styles.stageWrap}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStage('initial')}
                >
                  <ChevronLeft size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Assign Store Delivery Person</Text>
                <Text style={styles.sectionSub}>
                  Enter contact details to create a trackable delivery link.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Person Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryPersonName}
                    onChangeText={setDeliveryPersonName}
                    placeholder="e.g. Ramesh"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryPersonPhone}
                    onChangeText={setDeliveryPersonPhone}
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Special Instructions</Text>
                  <TextInput
                    style={[styles.textInput, { height: 56 }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. Collect cash, call upon arrival"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={handleGenerateLink}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>Assign & Generate Delivery Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 3: No Person (Choose Remise Network vs Self Arrange) ── */}
            {stage === 'no_person' && (
              <View style={styles.stageWrap}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStage('initial')}
                >
                  <ChevronLeft size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.centerIconWrap}>
                  <Sparkles size={28} color={isDark ? '#818CF8' : '#4F46E5'} />
                </View>
                <Text style={styles.promptTitle}>Choose a Delivery Option</Text>
                <Text style={styles.promptSub}>
                  Request an on-demand verified partner or manage fulfillment yourself.
                </Text>

                {/* Option 1: Request Remise Delivery Partner */}
                <TouchableOpacity
                  style={styles.optionCardPrimary}
                  onPress={() => setStage('confirm_remise_request')}
                >
                  <View style={[styles.optionIconPrimary, { backgroundColor: '#4F46E5' }]}>
                    <Zap size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.optionTitlePrimary}>Request Remise Partner</Text>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#4F46E5' }}>~₹45</Text>
                    </View>
                    <Text style={styles.optionSubPrimary}>
                      Nearby verified driver will arrive in ~15 mins.
                    </Text>
                  </View>
                  <ArrowRight size={16} color="#4F46E5" />
                </TouchableOpacity>

                {/* Option 2: Enable Network for Store */}
                <TouchableOpacity
                  style={styles.optionCardSecondary}
                  onPress={handleEnrollNetwork}
                  disabled={loading}
                >
                  <View style={styles.optionIconSecondary}>
                    <ShieldCheck size={20} color={isDark ? '#34D399' : '#15803D'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitleSecondary}>Enable Network for Store</Text>
                    <Text style={styles.optionSubSecondary}>
                      One-time store enrollment for on-demand dispatch.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Option 3: Self Arrange */}
                <TouchableOpacity
                  style={styles.selfArrangeBtn}
                  onPress={handleSelfArrange}
                  disabled={loading}
                >
                  <Text style={styles.selfArrangeBtnText}>
                    I will arrange delivery myself
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 4: Network Enrolled Done Modal ── */}
            {stage === 'network_enrolled_done' && (
              <View style={styles.stageWrap}>
                <View style={styles.centerIconWrap}>
                  <CheckCircle2 size={32} color={isDark ? '#34D399' : '#15803D'} />
                </View>
                <Text style={styles.promptTitle}>Remise Delivery Network Enabled</Text>
                <Text style={styles.promptSub}>
                  Your store is now enabled for on-demand delivery partner dispatch.
                </Text>

                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
                  <TouchableOpacity style={[styles.doneBtn, { flex: 1 }]} onPress={onClose}>
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { flex: 1, backgroundColor: '#4F46E5', marginTop: Spacing.sm }]}
                    onPress={() => setStage('confirm_remise_request')}
                  >
                    <Text style={styles.primaryActionBtnText}>Request for Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── STAGE 5: Confirm Remise Request ── */}
            {stage === 'confirm_remise_request' && (
              <View style={styles.stageWrap}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStage('no_person')}
                >
                  <ChevronLeft size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Confirm Remise Delivery Request</Text>
                <Text style={styles.sectionSub}>
                  A nearby delivery partner will be dispatched to your store.
                </Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Order ID:</Text>
                    <Text style={styles.summaryValue}>#{displayOrderId}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Drop Address:</Text>
                    <Text style={[styles.summaryValue, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                      {dropAddress}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Est. Distance:</Text>
                    <Text style={styles.summaryValue}>3.5 km</Text>
                  </View>
                  <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#E5E7EB', paddingTop: 6 }]}>
                    <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Estimated Delivery Fee:</Text>
                    <Text style={[styles.summaryValue, { fontSize: 14, fontWeight: '900', color: '#4F46E5' }]}>₹45</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#4F46E5' }]}
                  onPress={handleRequestRemisePartner}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>Confirm & Find Delivery Partner</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 6: Searching Drivers State ── */}
            {stage === 'searching' && (
              <View style={styles.stageWrap}>
                <View style={styles.centerIconWrap}>
                  <Truck size={28} color="#4F46E5" />
                </View>
                <Text style={styles.promptTitle}>Searching for nearby drivers...</Text>
                <Text style={styles.promptSub}>
                  Broadcasting order #{displayOrderId} to active Remise delivery partners.
                </Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Status:</Text>
                    <Text style={[styles.summaryValue, { color: '#4F46E5' }]}>Searching (15 min ETA)</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Est. Fare:</Text>
                    <Text style={styles.summaryValue}>₹45 (3.5 km)</Text>
                  </View>
                </View>

                {deliveryUrl ? (
                  <View style={styles.shareButtonsRow}>
                    <TouchableOpacity
                      style={[styles.openPortalBtn, { flex: 1 }]}
                      onPress={() => Linking.openURL(deliveryUrl)}
                    >
                      <ExternalLink size={14} color={isDark ? '#E5E7EB' : '#374151'} />
                      <Text style={styles.openPortalBtnText}>Open Driver Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.shareBtn, { flex: 1 }]} onPress={handleShare}>
                      <Share2 size={14} color="#FFFFFF" />
                      <Text style={styles.shareBtnText}>Share Link</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
                  <TouchableOpacity
                    style={[styles.selfArrangeBtn, { flex: 1 }]}
                    onPress={() => { if (onRefresh) onRefresh(); }}
                  >
                    <Text style={styles.selfArrangeBtnText}>Refresh Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.doneBtn, { flex: 1, marginTop: 0 }]} onPress={onClose}>
                    <Text style={styles.doneBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── STAGE 7: Accepted & Milestone Tracking ── */}
            {stage === 'accepted' && (
              <View style={styles.stageWrap}>
                {/* Driver Info Card */}
                <View style={styles.driverCard}>
                  <View style={styles.driverRow}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverAvatarText}>
                        {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driverName}>{driver.name || 'Delivery Partner'}</Text>
                      <Text style={styles.driverVehicle}>
                        {driver.vehicleType || 'Bike'} {driver.vehicleNumber ? `• ${driver.vehicleNumber}` : ''}
                      </Text>
                    </View>
                    {driver.phone ? (
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => Linking.openURL(`tel:${driver.phone}`)}
                      >
                        <Phone size={14} color="#FFFFFF" />
                        <Text style={styles.callBtnText}>Call</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.driverFooter}>
                    <Text style={styles.driverMilestoneText}>Milestone: {currentStatus}</Text>
                    <Text style={styles.driverEtaText}>ETA: {driver.eta || '15 mins'}</Text>
                  </View>
                </View>

                {/* Milestone Stepper */}
                <Text style={[styles.sectionTitle, { fontSize: FontSizes.xs + 1, marginTop: 4 }]}>
                  Milestone Progress
                </Text>
                <View style={styles.milestoneList}>
                  {['Accepted', 'Going to Store', 'Arrived at Store', 'Picked Up', 'Out for Delivery', 'Delivered'].map(
                    (st, idx) => {
                      const allSts = ['Accepted', 'Going to Store', 'Arrived at Store', 'Picked Up', 'Out for Delivery', 'Delivered'];
                      const curIdx = allSts.indexOf(currentStatus);
                      const isDone = curIdx >= idx;
                      const isCurrent = currentStatus === st;

                      return (
                        <View
                          key={st}
                          style={[
                            styles.milestoneItem,
                            isCurrent && styles.milestoneItemCurrent,
                          ]}
                        >
                          <View
                            style={[
                              styles.milestoneDot,
                              isDone && styles.milestoneDotDone,
                            ]}
                          >
                            {isDone ? <Check size={10} color="#FFFFFF" /> : null}
                          </View>
                          <Text
                            style={[
                              styles.milestoneItemText,
                              isCurrent && styles.milestoneItemTextCurrent,
                            ]}
                          >
                            {st}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>

                {deliveryUrl ? (
                  <View style={styles.shareButtonsRow}>
                    <TouchableOpacity
                      style={[styles.openPortalBtn, { flex: 1 }]}
                      onPress={() => Linking.openURL(deliveryUrl)}
                    >
                      <ExternalLink size={14} color={isDark ? '#E5E7EB' : '#374151'} />
                      <Text style={styles.openPortalBtnText}>Delivery Portal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.shareBtn, { flex: 1 }]} onPress={handleShare}>
                      <Share2 size={14} color="#FFFFFF" />
                      <Text style={styles.shareBtnText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            {/* ── STAGE 8: Unavailable State ── */}
            {stage === 'unavailable' && (
              <View style={styles.stageWrap}>
                <View style={styles.centerIconWrap}>
                  <AlertCircle size={30} color="#D97706" />
                </View>
                <Text style={styles.promptTitle}>Delivery Partner Unavailable</Text>
                <Text style={styles.promptSub}>
                  No nearby Remise delivery partner accepted the request. You can retry finding a partner or assign your store delivery staff.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#4F46E5' }]}
                  onPress={handleRequestRemisePartner}
                  disabled={loading}
                >
                  <Text style={styles.primaryActionBtnText}>Re-request Remise Delivery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setStage('has_person')}
                  disabled={loading}
                >
                  <Text style={styles.primaryActionBtnText}>Assign Store Delivery Person</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 9: Link Generated (Own Store Delivery) ── */}
            {stage === 'link_generated' && (
              <View style={styles.stageWrap}>
                <View style={styles.successBanner}>
                  <CheckCircle2 size={18} color="#15803D" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.successBannerTitle}>Store Delivery Link Active</Text>
                    <Text style={styles.successBannerSub}>
                      Share this link with your delivery person to view location and update milestones.
                    </Text>
                  </View>
                </View>

                <View style={styles.urlBox}>
                  <Text style={styles.urlText} numberOfLines={2}>
                    {deliveryUrl}
                  </Text>
                </View>

                <View style={styles.shareButtonsRow}>
                  <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Share2 size={16} color="#FFFFFF" />
                    <Text style={styles.shareBtnText}>Share Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.openPortalBtn}
                    onPress={() => Linking.openURL(deliveryUrl)}
                  >
                    <ExternalLink size={16} color={isDark ? '#E5E7EB' : '#374151'} />
                    <Text style={styles.openPortalBtnText}>Open Portal</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Current Milestone:</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {order.deliveryStatus || 'Assigned'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── STAGE 10: Self Arranged Controls ── */}
            {stage === 'self_arranged' && (
              <View style={styles.stageWrap}>
                <Text style={styles.sectionTitle}>Self-Arranged Delivery</Text>
                <Text style={styles.sectionSub}>
                  Update the delivery milestone directly below:
                </Text>

                <View style={styles.milestoneRow}>
                  {['Ready', 'Out for Delivery', 'Delivered'].map(st => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.milestoneBtn,
                        order.deliveryStatus === st && styles.milestoneBtnActive,
                      ]}
                      onPress={() => handleDirectStatusUpdate(st)}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.milestoneBtnText,
                          order.deliveryStatus === st && styles.milestoneBtnTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.md,
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      ...Shadows.card,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: isDark ? '#1F2937' : '#DFF1F1',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : CustomerColors.steelBorder,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: FontSizes.sm,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    headerSub: {
      fontSize: FontSizes.xs - 1,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      fontFamily: 'monospace',
    },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: Spacing.lg,
    },
    errorBox: {
      backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
      borderWidth: 1,
      borderColor: isDark ? '#991B1B' : '#FECACA',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
    },
    errorText: {
      color: isDark ? '#FCA5A5' : '#DC2626',
      fontSize: FontSizes.xs,
      fontWeight: '600',
    },
    stageWrap: {
      gap: Spacing.sm,
    },
    badgeWrap: {
      alignSelf: 'center',
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      paddingHorizontal: Spacing.md,
      paddingVertical: 3,
      borderRadius: BorderRadius.pill,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    promptTitle: {
      fontSize: FontSizes.base,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
      textAlign: 'center',
    },
    promptSub: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    optionsList: {
      gap: Spacing.sm,
    },
    optionCardPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 2,
      borderColor: isDark ? '#0f766e' : CustomerColors.teal600,
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
    },
    optionIconPrimary: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionTitlePrimary: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    optionSubPrimary: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    optionCardSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    },
    optionIconSecondary: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionTitleSecondary: {
      fontSize: FontSizes.sm,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    optionSubSecondary: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginTop: 2,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    backBtnText: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: FontSizes.sm + 1,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    sectionSub: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      marginBottom: Spacing.sm,
    },
    inputGroup: {
      gap: 4,
    },
    inputLabel: {
      fontSize: FontSizes.xs,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#374151',
    },
    textInput: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      fontSize: FontSizes.xs,
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    primaryActionBtn: {
      backgroundColor: CustomerColors.teal600,
      borderRadius: BorderRadius.md,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xs,
    },
    primaryActionBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.sm,
      fontWeight: '700',
    },
    successBanner: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? '#065F46' : '#BBF7D0',
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    successBannerTitle: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#6EE7B7' : '#15803D',
    },
    successBannerSub: {
      fontSize: 11,
      color: isDark ? '#A7F3D0' : '#166534',
      marginTop: 2,
    },
    urlBox: {
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    },
    urlText: {
      fontSize: 11,
      fontFamily: 'monospace',
      color: isDark ? '#E5E7EB' : '#374151',
    },
    shareButtonsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    shareBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#16A34A',
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
    },
    shareBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    openPortalBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
    },
    openPortalBtnText: {
      color: isDark ? '#F9FAFB' : '#374151',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    statusLabel: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : '#4B5563',
      fontWeight: '600',
    },
    statusBadge: {
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.pill,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    centerIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: isDark ? '#312E81' : '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: Spacing.xs,
    },
    selfArrangeBtn: {
      backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selfArrangeBtnText: {
      color: isDark ? '#E5E7EB' : '#374151',
      fontSize: FontSizes.xs,
      fontWeight: '600',
    },
    doneBtn: {
      backgroundColor: isDark ? '#0f766e' : '#111827',
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.sm,
    },
    doneBtnText: {
      color: '#FFFFFF',
      fontSize: FontSizes.xs,
      fontWeight: '700',
    },
    milestoneRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
      marginTop: Spacing.xs,
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
    summaryCard: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      gap: 6,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: FontSizes.xs,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    summaryValue: {
      fontSize: FontSizes.xs,
      fontWeight: '700',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    driverCard: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      borderWidth: 1,
      borderColor: isDark ? '#0f766e' : '#CCFBF1',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      gap: 8,
    },
    driverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    driverAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: CustomerColors.teal600,
      alignItems: 'center',
      justifyContent: 'center',
    },
    driverAvatarText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 14,
    },
    driverName: {
      fontSize: FontSizes.xs + 1,
      fontWeight: '800',
      color: isDark ? '#F9FAFB' : CustomerColors.black,
    },
    driverVehicle: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
    },
    callBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: CustomerColors.teal600,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: BorderRadius.pill,
    },
    callBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    driverFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#0f766e' : '#CCFBF1',
    },
    driverMilestoneText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
    driverEtaText: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#E5E7EB' : '#374151',
    },
    milestoneList: {
      gap: 4,
    },
    milestoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
    },
    milestoneItemCurrent: {
      backgroundColor: isDark ? '#134e4a' : '#F0FDFA',
      borderWidth: 1,
      borderColor: CustomerColors.teal600,
    },
    milestoneDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? '#374151' : '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    milestoneDotDone: {
      backgroundColor: '#16A34A',
    },
    milestoneItemText: {
      fontSize: 11,
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    milestoneItemTextCurrent: {
      fontWeight: '800',
      color: isDark ? '#2DD4BF' : CustomerColors.teal700,
    },
  });
