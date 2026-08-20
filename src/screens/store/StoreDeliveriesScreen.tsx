import React, { useState, useEffect } from 'react';
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
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';
import DeliveryFlowModal from '../../components/store/DeliveryFlowModal';
import PaginationControl from '../../components/common/PaginationControl';

export default function StoreDeliveriesScreen() {
  const { orders, loading, refresh } = useStoreDashboard();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<any>(null);

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, modeFilter]);

  // Filter only orders that involve home delivery or have delivery tracking
  const deliveryOrders = orders.filter((o: any) => {
    const isDelivery =
      o.deliveryMethod !== 'pickup' &&
      (o.deliveryMethod === 'delivery' ||
        !!o.deliveryAddress ||
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
        <ActivityIndicator size="large" color={CustomerColors.teal700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stat Bar */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <View style={[styles.statCard, { borderColor: CustomerColors.steelBorder }]}>
            <View style={styles.statIconWrap}>
              <Truck size={14} color={CustomerColors.teal700} />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Deliveries</Text>
              <Text style={styles.statValue}>{totalCount}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={14} color="#15803D" />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: '#166534' }]}>Delivered</Text>
              <Text style={[styles.statValue, { color: '#15803D' }]}>{deliveredCount}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#E0E7FF' }]}>
              <Navigation size={14} color="#4338CA" />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: '#3730A3' }]}>Out for Delivery</Text>
              <Text style={[styles.statValue, { color: '#4338CA' }]}>{outForDeliveryCount}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={14} color="#B45309" />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: '#92400E' }]}>Pending / Assigned</Text>
              <Text style={[styles.statValue, { color: '#B45309' }]}>{pendingCount}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <Search size={14} color={CustomerColors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by rider, customer, phone, address…"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'Delivered', 'Out for Delivery', 'Picked Up', 'Accepted', 'Assigned'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                {s === 'all' ? 'All Statuses' : s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Delivery Cards List */}
      <FlatList
        data={paginatedDeliveries}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Truck size={44} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No delivery records found</Text>
            <Text style={styles.emptySubtitle}>Orders with home delivery dispatch will appear here.</Text>
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
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderIdText}>#{o.orderId || o._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderDateText}>
                    {new Date(o.createdAt).toLocaleString('en-IN', {
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
                  >
                    {currentDeliveryStatus}
                  </Text>
                </View>
              </View>

              {/* Who Delivered Section */}
              <View style={styles.sectionBox}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWithIcon}>
                    <Truck size={13} color={CustomerColors.teal700} />
                    <Text style={styles.sectionTitle}>WHO DELIVERED (RIDER)</Text>
                  </View>
                  <View style={styles.modeTag}>
                    <Text style={styles.modeTagText}>
                      {o.deliveryMode === 'portal_delivery'
                        ? 'Remise Network'
                        : o.deliveryMode === 'self_arrange'
                        ? 'Self-Arranged'
                        : 'Own Rider'}
                    </Text>
                  </View>
                </View>

                <View style={styles.personRow}>
                  <Text style={styles.personName}>
                    {o.deliveryPerson?.name ||
                      (o.deliveryMode === 'self_arrange'
                        ? 'Store Owner (Self-Delivery)'
                        : 'Assigned Delivery Partner')}
                  </Text>
                  {o.deliveryPerson?.phone ? (
                    <TouchableOpacity
                      style={styles.callSmallBtn}
                      onPress={() => handleCall(o.deliveryPerson.phone)}
                    >
                      <Phone size={10} color="#0D9488" />
                      <Text style={styles.callSmallBtnText}>Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {o.deliveryPerson?.phone ? (
                  <Text style={styles.personPhoneText}>📞 {o.deliveryPerson.phone}</Text>
                ) : null}

                {o.deliveryPerson?.deliveredAt && (
                  <Text style={styles.timestampDelivered}>
                    ✓ Delivered at{' '}
                    {new Date(o.deliveryPerson.deliveredAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>

              {/* To Whom Section */}
              <View style={[styles.sectionBox, { marginTop: 8 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWithIcon}>
                    <User size={13} color={CustomerColors.teal700} />
                    <Text style={styles.sectionTitle}>TO WHOM (CUSTOMER)</Text>
                  </View>
                  {o.customerPhone ? (
                    <TouchableOpacity
                      style={styles.callSmallBtn}
                      onPress={() => handleCall(o.customerPhone)}
                    >
                      <Phone size={10} color="#0D9488" />
                      <Text style={styles.callSmallBtnText}>Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={styles.personName}>{o.customerName || 'Customer'}</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  📍 {o.deliveryAddress || 'Address not provided'}
                </Text>

                {o.deliveryAddress ? (
                  <TouchableOpacity
                    style={styles.mapLinkBtn}
                    onPress={() => handleOpenMap(o.deliveryAddress)}
                  >
                    <MapPin size={11} color="#2563EB" />
                    <Text style={styles.mapLinkBtnText}>Open in Google Maps</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Items & Footer */}
              <View style={styles.footerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemsSummary} numberOfLines={1}>
                    {o.offerTitle}
                  </Text>
                  <Text style={styles.paymentInfoText}>
                    ₹{o.totalAmount} · {o.paymentMethod === 'qr' ? 'QR Payment' : 'Cash on Delivery'} (
                    {o.paymentStatus === 'SUCCESS' ? 'Paid' : 'Pending'})
                  </Text>
                </View>

                {!isCompleted && (
                  <TouchableOpacity
                    style={styles.manageDeliveryBtn}
                    onPress={() => setSelectedDeliveryOrder(o)}
                  >
                    <Truck size={12} color={CustomerColors.teal700} />
                    <Text style={styles.manageDeliveryBtnText}>
                      {o.deliveryToken ? 'View Link' : 'Manage'}
                    </Text>
                  </TouchableOpacity>
                )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CustomerColors.bg },
  statsContainer: { marginTop: Spacing.sm },
  statsScroll: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 140,
  },
  statIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 10, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase' },
  statValue: { fontSize: FontSizes.base, fontWeight: '900', color: CustomerColors.black, marginTop: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm, color: CustomerColors.black },
  filterScrollWrap: { marginTop: Spacing.xs },
  filterScroll: { paddingHorizontal: Spacing.md, gap: Spacing.xs, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
  },
  filterChipActive: { backgroundColor: CustomerColors.mint, borderColor: CustomerColors.teal600 },
  filterChipText: { fontSize: 10, color: CustomerColors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: CustomerColors.teal700, fontWeight: '700' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.xs },
  emptyTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#374151', marginTop: Spacing.sm },
  emptySubtitle: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, textAlign: 'center' },
  deliveryCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8 },

  orderIdText: { fontSize: FontSizes.xs, fontWeight: '800', color: CustomerColors.black, fontFamily: 'monospace' },
  orderDateText: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.pill, borderWidth: 1 },
  statusBadgeDelivered: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  statusBadgeTransit: { backgroundColor: '#E0E7FF', borderColor: '#A5B4FC' },
  statusBadgePending: { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusTextDelivered: { color: '#15803D' },
  statusTextTransit: { color: '#4338CA' },
  statusTextPending: { color: '#0F766E' },
  sectionBox: { backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionTitle: { fontSize: 9, fontWeight: '800', color: CustomerColors.teal700, letterSpacing: 0.5 },
  modeTag: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  modeTagText: { fontSize: 8, fontWeight: '700', color: '#475569' },
  personRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personName: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  personPhoneText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  timestampDelivered: { fontSize: 10, fontWeight: '700', color: '#16A34A', marginTop: 4 },
  callSmallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#CCFBF1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.pill },
  callSmallBtnText: { fontSize: 9, fontWeight: '800', color: '#0F766E' },
  addressText: { fontSize: 11, color: '#4B5563', marginTop: 2, lineHeight: 15 },
  mapLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  mapLinkBtnText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  itemsSummary: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.black },
  paymentInfoText: { fontSize: 10, color: CustomerColors.teal700, fontWeight: '600', marginTop: 2 },
  manageDeliveryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CustomerColors.mint, borderWidth: 1, borderColor: CustomerColors.steelBorder, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md },
  manageDeliveryBtnText: { fontSize: 10, fontWeight: '700', color: CustomerColors.teal700 },
});
