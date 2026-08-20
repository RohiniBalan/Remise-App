import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import {
  X,
  Truck,
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
} from 'lucide-react-native';
import { smartOrderApi } from '../../api/smartOrderApi';
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
  const [stage, setStage] = useState<
    'initial' | 'has_person' | 'no_person' | 'link_generated' | 'network_joined' | 'self_arranged'
  >('initial');

  const [deliveryPersonName, setDeliveryPersonName] = useState(order?.deliveryPerson?.name || '');
  const [deliveryPersonPhone, setDeliveryPersonPhone] = useState(order?.deliveryPerson?.phone || '');
  const [notes, setNotes] = useState('');

  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible && order) {
      if (order.deliveryToken) {
        const webBase = GATEWAY_URL.replace(/:\d+$/, ':4000').replace(/\/api\/?$/, '');
        setDeliveryUrl(`${webBase}/delivery/${order.deliveryToken}`);
        setStage('link_generated');
      } else if (order.deliveryMode === 'portal_delivery') {
        setStage('network_joined');
      } else if (order.deliveryMode === 'self_arrange') {
        setStage('self_arranged');
      } else {
        setStage('initial');
      }
      setDeliveryPersonName(order.deliveryPerson?.name || '');
      setDeliveryPersonPhone(order.deliveryPerson?.phone || '');
      setNotes(order.deliveryPerson?.notes || '');
      setErrorMessage('');
    }
  }, [visible, order]);

  if (!visible || !order) return null;

  const orderId = order.orderId || order._id;

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await smartOrderApi.generateDeliveryLink(orderId, {
        deliveryPersonName: deliveryPersonName || undefined,
        deliveryPersonPhone: deliveryPersonPhone || undefined,
        notes: notes || undefined,
      });

      if (res.data.success) {
        const tokenVal = res.data.data.deliveryToken;
        const webBase = GATEWAY_URL.replace(/:\d+$/, ':4000').replace(/\/api\/?$/, '');
        const url = `${webBase}/delivery/${tokenVal}`;
        setDeliveryUrl(url);
        setStage('link_generated');
        if (onRefresh) onRefresh();
      } else {
        setErrorMessage(res.data.message || 'Failed to generate link');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to generate delivery link',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNetwork = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      await smartOrderApi.enrollDeliveryPortal({ enabled: true, hasOwnDelivery: false });
      await smartOrderApi.setDeliveryMode(orderId, { mode: 'portal_delivery' });
      setStage('network_joined');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to enroll in delivery network',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelfArrange = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      await smartOrderApi.setDeliveryMode(orderId, { mode: 'self_arrange' });
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
      await smartOrderApi.updateDeliveryStatusDirect(orderId, { status });
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
        title: `Delivery for Order #${order.orderId}`,
        message: `Hello, here is your delivery link for Order #${order.orderId}:\n${deliveryUrl}\n\nPlease tap the link to accept and update delivery milestones.`,
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
                <Truck size={18} color={CustomerColors.teal700} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Manage Delivery</Text>
                <Text style={styles.headerSub}>Order #{order.orderId}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#6B7280" />
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
                  <Text style={styles.badgeText}>Delivery Flow</Text>
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
                        Generate a unique link to share with them.
                      </Text>
                    </View>
                    <ArrowRight size={16} color={CustomerColors.teal700} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionCardSecondary}
                    onPress={() => setStage('no_person')}
                  >
                    <View style={styles.optionIconSecondary}>
                      <Users size={20} color="#4B5563" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitleSecondary}>NO, I don't have one</Text>
                      <Text style={styles.optionSubSecondary}>
                        Join Remise Delivery Portal or arrange yourself.
                      </Text>
                    </View>
                    <ArrowRight size={16} color="#9CA3AF" />
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
                  <ChevronLeft size={14} color="#6B7280" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Assign Delivery Person</Text>
                <Text style={styles.sectionSub}>
                  Enter contact details to create a trackable delivery link.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Person Name (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryPersonName}
                    onChangeText={setDeliveryPersonName}
                    placeholder="e.g. Ramesh"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Delivery Person Phone (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryPersonPhone}
                    onChangeText={setDeliveryPersonPhone}
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Special Instructions</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. Collect cash, call upon arrival"
                    placeholderTextColor="#9CA3AF"
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
                    <Text style={styles.primaryActionBtnText}>Generate Unique Delivery Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 3: Link Generated & Ready ── */}
            {stage === 'link_generated' && (
              <View style={styles.stageWrap}>
                <View style={styles.successBanner}>
                  <CheckCircle2 size={18} color="#15803D" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.successBannerTitle}>Unique Delivery Link Active</Text>
                    <Text style={styles.successBannerSub}>
                      Share this link with your delivery person. They can open it on mobile without logging in.
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
                    <ExternalLink size={16} color="#374151" />
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

            {/* ── STAGE 4: No Person (Join Portal Network Prompt) ── */}
            {stage === 'no_person' && (
              <View style={styles.stageWrap}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStage('initial')}
                >
                  <ChevronLeft size={14} color="#6B7280" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.centerIconWrap}>
                  <Sparkles size={28} color="#4F46E5" />
                </View>
                <Text style={styles.promptTitle}>Join Remise Delivery Portal?</Text>
                <Text style={styles.promptSub}>
                  Connect your store with on-demand delivery partners in your area.
                </Text>

                <TouchableOpacity
                  style={styles.joinNetworkBtn}
                  onPress={handleJoinNetwork}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.joinNetworkBtnText}>
                      YES, Join Remise Delivery Network
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.selfArrangeBtn}
                  onPress={handleSelfArrange}
                  disabled={loading}
                >
                  <Text style={styles.selfArrangeBtnText}>
                    NO, I will arrange delivery myself
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 5: Network Enrolled Confirmation ── */}
            {stage === 'network_joined' && (
              <View style={styles.stageWrap}>
                <View style={styles.centerIconWrap}>
                  <ShieldCheck size={32} color="#15803D" />
                </View>
                <Text style={styles.promptTitle}>Enrolled in Delivery Network!</Text>
                <Text style={styles.promptSub}>
                  Your store profile is now active for automated delivery partner matching.
                </Text>

                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STAGE 6: Self Arranged Controls ── */}
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#DFF1F1',
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.steelBorder,
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  headerSub: {
    fontSize: FontSizes.xs - 1,
    color: CustomerColors.textSecondary,
    fontFamily: 'monospace',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#DC2626',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  stageWrap: {
    gap: Spacing.sm,
  },
  badgeWrap: {
    alignSelf: 'center',
    backgroundColor: CustomerColors.mint,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  promptTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  promptSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
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
    borderColor: CustomerColors.teal600,
    backgroundColor: '#F0FDFA',
  },
  optionIconPrimary: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: CustomerColors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitlePrimary: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  optionSubPrimary: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },
  optionCardSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: '#FFFFFF',
  },
  optionIconSecondary: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitleSecondary: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  optionSubSecondary: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
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
    color: '#6B7280',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FontSizes.sm + 1,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  sectionSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.xs,
    color: CustomerColors.black,
  },
  primaryActionBtn: {
    backgroundColor: CustomerColors.primary,
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
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  successBannerTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: '#15803D',
  },
  successBannerSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  urlBox: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  urlText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  openPortalBtnText: {
    color: '#374151',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusLabel: {
    fontSize: FontSizes.xs,
    color: '#4B5563',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: CustomerColors.mint,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
  centerIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  joinNetworkBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinNetworkBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs + 1,
    fontWeight: '700',
  },
  selfArrangeBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfArrangeBtnText: {
    color: '#374151',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  doneBtn: {
    backgroundColor: '#111827',
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
    borderColor: CustomerColors.steelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  milestoneBtnActive: {
    backgroundColor: CustomerColors.teal600,
    borderColor: CustomerColors.teal600,
  },
  milestoneBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  milestoneBtnTextActive: {
    color: '#FFFFFF',
  },
});
