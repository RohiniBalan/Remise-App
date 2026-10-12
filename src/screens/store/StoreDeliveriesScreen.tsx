import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import {
  Search,
  Truck,
  CheckCircle2,
  Navigation,
  Clock,
  User,
  Phone,
  ExternalLink,
  MapPin,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react-native';
import { StoreDashboardContext } from '../../context/StoreDashboardContext';
import { SellerDashboardContext } from '../../context/SellerDashboardContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import DeliveryFlowModal from '../../components/store/DeliveryFlowModal';
import PaginationControl from '../../components/common/PaginationControl';
import { useTranslation, translateProductName } from '../../i18n';

export default function StoreDeliveriesScreen() {
  const navigation = useNavigation<any>();
  const storeDashboard = React.useContext(StoreDashboardContext);
  const sellerDashboard = React.useContext(SellerDashboardContext);
  const { t, language } = useTranslation();

  const translateStatus = (s: string) => {
    switch (s) {
      case 'Pending':
        return t.store.deliveryPending;
      case 'Delivered':
        return t.store.deliveryDelivered;
      case 'Out for Delivery':
        return t.store.deliveryOutForDelivery;
      case 'Picked Up':
        return t.store.deliveryPickedUp;
      case 'Accepted':
        return t.store.deliveryAccepted;
      case 'Assigned':
        return t.store.deliveryAssigned;
      default:
        return s;
    }
  };

  const rawOrders = storeDashboard?.orders || sellerDashboard?.orders || [];
  const loading = storeDashboard?.loading ?? sellerDashboard?.loading ?? false;
  const refresh = storeDashboard?.refresh || sellerDashboard?.refresh || (() => {});

  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<any>(null);

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, modeFilter]);

  const orders = useMemo(() => {
    return rawOrders.map((o: any) => {
      const addr = o.shippingAddress || {};
      const items = o.items || o.rawItems || [];
      const offerTitle =
        o.offerTitle ||
        (items.length
          ? items.map((i: any) => `${i.quantity}x ${translateProductName(i.title, language) || 'Item'}`).join(', ')
          : `Order ${o.orderId || o._id?.slice(-6) || ''}`);

      const customerName =
        o.customerName ||
        (typeof o.shippingAddress === 'object'
          ? [addr.firstName, addr.lastName].filter(Boolean).join(' ')
          : '') ||
        o.contactEmail ||
        'Customer';

      const customerPhone =
        o.customerPhone ||
        (typeof o.shippingAddress === 'object' ? addr.phone : '') ||
        '';

      const deliveryAddress =
        o.deliveryAddress ||
        (typeof o.shippingAddress === 'object'
          ? [addr.address, addr.city, addr.state, addr.pinCode].filter(Boolean).join(', ')
          : typeof o.shippingAddress === 'string'
          ? o.shippingAddress
          : '');

      return {
        ...o,
        offerTitle,
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryStatus:
          o.deliveryStatus ||
          (o.orderStatus === 'Delivered' || o.status === 'Delivered' ? 'Delivered' : 'Pending'),
        deliveryPerson: o.deliveryPerson || null,
        deliveryMode: o.deliveryMode || 'own_delivery',
      };
    });
  }, [rawOrders]);

  const deliveryOrders = orders.filter((o: any) => {
    const isDelivery =
      o.deliveryMethod !== 'pickup' &&
      (o.deliveryMethod === 'delivery' ||
        !!o.deliveryAddress ||
        !!o.shippingAddress ||
        !!o.deliveryPerson?.name ||
        !!o.deliveryStatus);
    return isDelivery;
  });

  const filtered = deliveryOrders.filter((o: any) => {
    const personName = o.deliveryPerson?.name || '';
    const personPhone = o.deliveryPerson?.phone || '';
    const customerName = o.customerName || '';
    const customerPhone = o.customerPhone || '';
    const orderId = o.orderId || o._id || '';
    const deliveryAddress = o.deliveryAddress || '';

    const matchSearch =
      !search ||
      personName.toLowerCase().includes(search.toLowerCase()) ||
      personPhone.includes(search) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerPhone.includes(search) ||
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      deliveryAddress.toLowerCase().includes(search.toLowerCase());

    const deliverySt =
      o.deliveryStatus || (o.status === 'Delivered' ? 'Delivered' : 'Pending');
    const matchStatus = statusFilter === 'all' || deliverySt === statusFilter;
    const matchMode =
      modeFilter === 'all' || (o.deliveryMode || 'own_delivery') === modeFilter;

    return matchSearch && matchStatus && matchMode;
  });

  const paginatedDeliveries = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalCount = deliveryOrders.length;
  const deliveredCount = deliveryOrders.filter(
    (o: any) => o.deliveryStatus === 'Delivered' || o.status === 'Delivered'
  ).length;
  const outForDeliveryCount = deliveryOrders.filter(
    (o: any) => o.deliveryStatus === 'Out for Delivery'
  ).length;
  const pendingCount = deliveryOrders.filter(
    (o: any) =>
      !o.deliveryStatus ||
      o.deliveryStatus === 'Pending' ||
      o.deliveryStatus === 'Assigned'
  ).length;

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenMap = (address: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
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
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder }]}>
            <View style={styles.statIconWrap}>
              <Truck size={15} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={styles.statLabel} numberOfLines={2}>{t.store.totalDeliveries}</Text>
              <Text style={styles.statValue}>{totalCount}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#064e3b' : '#F0FDF4', borderColor: isDark ? '#059669' : '#BBF7D0' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: isDark ? '#047857' : '#DCFCE7' }]}>
              <CheckCircle2 size={15} color={isDark ? '#34D399' : '#15803D'} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={[styles.statLabel, { color: isDark ? '#A7F3D0' : '#166534' }]} numberOfLines={2}>{t.store.deliveredStat}</Text>
              <Text style={[styles.statValue, { color: isDark ? '#34D399' : '#15803D' }]}>{deliveredCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#312e81' : '#EEF2FF', borderColor: isDark ? '#4338CA' : '#C7D2FE' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: isDark ? '#3730A3' : '#E0E7FF' }]}>
              <Navigation size={15} color={isDark ? '#A5B4FC' : '#4338CA'} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={[styles.statLabel, { color: isDark ? '#C7D2FE' : '#3730A3' }]} numberOfLines={2}>{t.store.outForDeliveryStat}</Text>
              <Text style={[styles.statValue, { color: isDark ? '#A5B4FC' : '#4338CA' }]}>{outForDeliveryCount}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#451a03' : '#FFFBEB', borderColor: isDark ? '#78350f' : '#FDE68A' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: isDark ? '#78350f' : '#FEF3C7' }]}>
              <Clock size={15} color={isDark ? '#FBBF24' : '#B45309'} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={[styles.statLabel, { color: isDark ? '#FDE68A' : '#92400E' }]} numberOfLines={2}>{t.store.pendingAssignedStat}</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FBBF24' : '#B45309' }]}>{pendingCount}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Search size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t.store.searchDeliveriesPlaceholder || 'Search deliveries…'}
          placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          numberOfLines={1}
          multiline={false}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'Delivered', 'Out for Delivery', 'Picked Up', 'Accepted', 'Assigned'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                {s === 'all' ? t.store.allStatuses : translateStatus(s)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={paginatedDeliveries}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Truck size={44} color={isDark ? '#374151' : '#D1D5DB'} />
            <Text style={styles.emptyTitle}>{t.store.noDeliveriesFound}</Text>
            <Text style={styles.emptySubtitle}>{t.store.noDeliveriesFoundDesc}</Text>
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
        renderItem={({ item: o }) => {
          const currentDeliveryStatus =
            o.deliveryStatus || (o.status === 'Delivered' ? 'Delivered' : 'Assigned');
          const isCompleted =
            currentDeliveryStatus === 'Delivered' || o.status === 'Delivered';

          return (
            <View style={styles.deliveryCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.orderIdOtpRow}>
                    <Text style={styles.orderIdText}>#{o.orderId || o._id.slice(-6).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.orderDateText}>
                    {new Date(o.createdAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    isCompleted
                      ? styles.statusBadgeDelivered
                      : currentDeliveryStatus === 'Out for Delivery'
                      ? styles.statusBadgeTransit
                      : styles.statusBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCompleted
                        ? styles.statusTextDelivered
                        : currentDeliveryStatus === 'Out for Delivery'
                        ? styles.statusTextTransit
                        : styles.statusTextPending,
                    ]}
                    numberOfLines={1}
                  >
                    {translateStatus(currentDeliveryStatus)}
                  </Text>
                </View>
              </View>

              <View style={[styles.sectionBox, { marginTop: 10 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWithIcon}>
                    <Truck size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    <Text style={styles.sectionTitle} numberOfLines={1}>{t.store.whoDeliveredTitle}</Text>
                  </View>
                  <View style={styles.modeTag}>
                    <Text style={styles.modeTagText} numberOfLines={1} ellipsizeMode="tail">
                      {o.deliveryMode === 'portal_delivery'
                        ? t.store.remisePortalNetwork
                        : o.deliveryMode === 'self_arrange'
                        ? t.store.selfArranged
                        : t.store.ownDeliveryPerson}
                    </Text>
                  </View>
                </View>

                <View style={styles.personRow}>
                  <Text style={styles.personName} numberOfLines={1}>
                    {o.deliveryPerson?.name || t.store.assignedDeliveryPartner}
                  </Text>
                  {o.deliveryPerson?.phone ? (
                    <TouchableOpacity
                      style={styles.callSmallBtn}
                      onPress={() => handleCall(o.deliveryPerson.phone)}
                    >
                      <Phone size={11} color="#0D9488" />
                      <Text style={styles.callSmallBtnText}>{t.store.callBtn}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {o.deliveryPerson?.phone ? (
                  <Text style={styles.personPhoneText}>📞 {o.deliveryPerson.phone}</Text>
                ) : null}

                {o.deliveryPerson?.deliveredAt && (
                  <Text style={styles.timestampDelivered}>
                    ✓ {t.store.deliveredTimePrefix}{' '}
                    {new Date(o.deliveryPerson.deliveredAt).toLocaleTimeString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>

              <View style={[styles.sectionBox, { marginTop: 8 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWithIcon}>
                    <User size={14} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                    <Text style={styles.sectionTitle} numberOfLines={1}>{t.store.toWhomTitle}</Text>
                  </View>
                  {o.customerPhone ? (
                    <TouchableOpacity
                      style={styles.callSmallBtn}
                      onPress={() => handleCall(o.customerPhone)}
                    >
                      <Phone size={11} color="#0D9488" />
                      <Text style={styles.callSmallBtnText}>{t.store.callBtn}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={styles.personName} numberOfLines={1}>{o.customerName || 'Customer'}</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  📍 {o.deliveryAddress || t.store.addressNotProvided}
                </Text>

                {o.deliveryAddress ? (
                  <TouchableOpacity
                    style={styles.mapLinkBtn}
                    onPress={() => handleOpenMap(o.deliveryAddress)}
                  >
                    <MapPin size={12} color="#3B82F6" />
                    <Text style={styles.mapLinkBtnText}>{t.store.openMapNavigation}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.footerContainer}>
                <View style={styles.footerInfoBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <ShoppingBag size={13} color={isDark ? '#9CA3AF' : '#64748B'} />
                    <Text style={styles.itemsSummary} numberOfLines={1}>
                      {o.offerTitle}
                    </Text>
                  </View>
                  <Text style={styles.paymentInfoText}>
                    ₹{o.totalAmount} · {o.paymentMethod === 'razorpay' ? 'Razorpay' : o.paymentMethod === 'qr' ? 'QR Payment' : o.paymentMethod === 'cod' ? 'Cash on Delivery' : (o.paymentMethod || 'Online')} ({o.paymentStatus === 'SUCCESS' ? t.store.paymentPaid : t.store.paymentPending})
                  </Text>
                </View>

                <View style={styles.footerActionsRow}>
                  <TouchableOpacity
                    style={[styles.trackDeliveryBtn, !isCompleted && styles.actionBtnFlex]}
                    onPress={() => navigation.navigate('StoreOrderTracking', { orderId: o.orderId || o._id })}
                    activeOpacity={0.8}
                  >
                    <Navigation size={13} color={isDark ? '#93C5FD' : '#2563EB'} />
                    <Text style={styles.trackDeliveryBtnText} numberOfLines={1} ellipsizeMode="tail">
                      {t.store.viewDeliveryLinkBtn || 'Live Track'}
                    </Text>
                  </TouchableOpacity>

                  {!isCompleted && (
                    <TouchableOpacity
                      style={[styles.manageDeliveryBtn, styles.actionBtnFlex]}
                      onPress={() => setSelectedDeliveryOrder(o)}
                      activeOpacity={0.8}
                    >
                      <Truck size={13} color={isDark ? '#2DD4BF' : CustomerColors.teal700} />
                      <Text style={styles.manageDeliveryBtnText} numberOfLines={1} ellipsizeMode="tail">
                        {t.store.manageDeliveryBtn || 'Manage Delivery'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {selectedDeliveryOrder && (
        <DeliveryFlowModal
          order={selectedDeliveryOrder}
          visible={!!selectedDeliveryOrder}
          onClose={() => setSelectedDeliveryOrder(null)}
          onRefresh={refresh}
        />
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0f1d' : CustomerColors.bg },
    statsGrid: {
      paddingHorizontal: Spacing.md,
      marginTop: Spacing.sm,
      gap: Spacing.xs,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    statCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
    },
    statIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? '#1F2937' : '#F0FDFA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statTextWrap: {
      flex: 1,
      justifyContent: 'center',
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#9CA3AF' : CustomerColors.textSecondary,
      lineHeight: 13,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '900',
      color: isDark ? '#FFFFFF' : CustomerColors.black,
      marginTop: 2,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      marginHorizontal: Spacing.md,
      marginTop: Spacing.sm,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      height: 46,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      paddingVertical: 0,
      textAlignVertical: 'center',
      fontSize: FontSizes.sm,
      color: isDark ? '#FFFFFF' : CustomerColors.black,
    },
    filterScrollWrap: { marginTop: Spacing.xs },
    filterScroll: { paddingHorizontal: Spacing.md, gap: Spacing.xs, paddingVertical: 4 },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      minHeight: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.pill,
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
    },
    filterChipActive: { backgroundColor: isDark ? '#134e4a' : CustomerColors.mint, borderColor: isDark ? '#2DD4BF' : CustomerColors.teal600 },
    filterChipText: { fontSize: 11, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
    filterChipTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '700' },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.xs },
    emptyTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#9CA3AF' : '#374151', marginTop: Spacing.sm },
    emptySubtitle: { fontSize: FontSizes.xs, color: isDark ? '#6B7280' : CustomerColors.textSecondary, textAlign: 'center' },
    deliveryCard: {
      backgroundColor: isDark ? '#111827' : CustomerColors.white,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? '#1F2937' : CustomerColors.steelBorder,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      ...Shadows.card,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1F2937' : '#F3F4F6',
      paddingBottom: 10,
      gap: 8,
    },
    cardHeaderLeft: { flex: 1 },
    orderIdOtpRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    otpBadge: {
      backgroundColor: isDark ? '#0f2928' : '#F0FDFA',
      borderWidth: 1,
      borderColor: isDark ? '#115e59' : '#99F6E4',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    otpBadgeText: { fontSize: 11, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    orderIdText: { fontSize: 13, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black, fontFamily: 'monospace' },
    orderDateText: { fontSize: 11, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 3 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.pill, borderWidth: 1, alignSelf: 'flex-start' },
    statusBadgeDelivered: { backgroundColor: isDark ? '#064e3b' : '#DCFCE7', borderColor: isDark ? '#059669' : '#86EFAC' },
    statusBadgeTransit: { backgroundColor: isDark ? '#312e81' : '#E0E7FF', borderColor: isDark ? '#4338CA' : '#A5B4FC' },
    statusBadgePending: { backgroundColor: isDark ? '#134e4a' : '#F0FDFA', borderColor: isDark ? '#115e59' : '#99F6E4' },
    statusBadgeText: { fontSize: 11, fontWeight: '800' },
    statusTextDelivered: { color: isDark ? '#34D399' : '#15803D' },
    statusTextTransit: { color: isDark ? '#A5B4FC' : '#4338CA' },
    statusTextPending: { color: isDark ? '#2DD4BF' : '#0F766E' },
    sectionBox: {
      backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
      borderRadius: BorderRadius.md,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E2E8F0',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      gap: 6,
    },
    sectionTitleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, marginRight: 6 },
    sectionTitle: { fontSize: 10, fontWeight: '800', color: isDark ? '#2DD4BF' : CustomerColors.teal700 },
    modeTag: {
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#CBD5E1',
      paddingHorizontal: 7,
      paddingVertical: 2.5,
      borderRadius: 5,
      alignSelf: 'flex-start',
      maxWidth: '48%',
    },
    modeTagText: { fontSize: 9, fontWeight: '700', color: isDark ? '#9CA3AF' : '#475569' },
    personRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    personName: { flex: 1, fontSize: 13, fontWeight: '800', color: isDark ? '#FFFFFF' : CustomerColors.black },
    personPhoneText: { fontSize: 11, color: isDark ? '#9CA3AF' : '#64748B', marginTop: 3 },
    timestampDelivered: { fontSize: 10, fontWeight: '700', color: isDark ? '#34D399' : '#16A34A', marginTop: 4 },
    callSmallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(45,212,191,0.2)' : '#CCFBF1',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: BorderRadius.pill,
    },
    callSmallBtnText: { fontSize: 10, fontWeight: '800', color: isDark ? '#2DD4BF' : '#0F766E' },
    addressText: { fontSize: 11, color: isDark ? '#D1D5DB' : '#4B5563', marginTop: 4, lineHeight: 16 },
    mapLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start' },
    mapLinkBtnText: { fontSize: 11, fontWeight: '700', color: isDark ? '#60A5FA' : '#2563EB' },
    footerContainer: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1F2937' : '#F3F4F6',
    },
    footerInfoBox: { marginBottom: 8 },
    itemsSummary: { flex: 1, fontSize: 12, fontWeight: '700', color: isDark ? '#FFFFFF' : CustomerColors.black },
    paymentInfoText: { fontSize: 11, color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '600', marginTop: 3 },
    footerActionsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    actionBtnFlex: { flex: 1 },
    trackDeliveryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isDark ? '#1e3a8a' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? '#3b82f6' : '#BFDBFE',
      paddingHorizontal: 8,
      paddingVertical: 9,
      borderRadius: BorderRadius.md,
      minHeight: 38,
    },
    trackDeliveryBtnText: { fontSize: 11, fontWeight: '700', color: isDark ? '#93C5FD' : '#1D4ED8', textAlign: 'center' },
    manageDeliveryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isDark ? '#134e4a' : CustomerColors.mint,
      borderWidth: 1,
      borderColor: isDark ? '#115e59' : CustomerColors.steelBorder,
      paddingHorizontal: 8,
      paddingVertical: 9,
      borderRadius: BorderRadius.md,
      minHeight: 38,
    },
    manageDeliveryBtnText: { fontSize: 11, fontWeight: '700', color: isDark ? '#2DD4BF' : CustomerColors.teal700, textAlign: 'center' },
  });
