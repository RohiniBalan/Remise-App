import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, PackageX, Star } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { orderApi, OrderData } from '../../api/orderApi';
import { smartOrderApi } from '../../api/smartOrderApi';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import CustomerHeader from '../../components/home/CustomerHeader';

// Ported from client/app/orders/page.tsx — same flatten-items-per-order
// display model, same "Order Date + 5 days" estimated delivery, same
// status → UI mapping (getStatusUI), same search-by-title filter and
// status checkbox filters (reproduced as filter chips on mobile instead of
// a sidebar). "Order Time" filters on web are present in the UI but never
// actually wired to any filtering logic — not reproduced here since there's
// nothing to port (decorative dead code on web).
const STATUS_FILTERS = [
  'On the way',
  'Delivered',
  'Cancelled',
  'Returned',
] as const;

interface DisplayItem {
  key: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  displayStatus: string;
  orderDate: string;
  deliveryDate: string;
}

function getStatusUI(status: string, orderDate: string, deliveryDate: string) {
  if (status === 'Delivered')
    return {
      color: CustomerColors.success,
      text: `Delivered on ${deliveryDate}`,
      subText: 'Your item has been delivered.',
    };
  if (status === 'Cancelled')
    return {
      color: CustomerColors.danger,
      text: `Cancelled on ${orderDate}`,
      subText: 'Your order was cancelled.',
    };
  if (status === 'Shipped')
    return {
      color: '#3B82F6',
      text: `Shipped, arriving by ${deliveryDate}`,
      subText: 'Your item is on the way.',
    };
  return {
    color: CustomerColors.warning,
    text: `Processing, expected by ${deliveryDate}`,
    subText: 'Your order is currently being packed.',
  };
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      Promise.allSettled([
        orderApi.getMyOrders(user._id, user.email),
        smartOrderApi.getMyOrders(user._id, user.email),
      ])
        .then(([legacyRes, smartRes]) => {
          const legacyOrders =
            legacyRes.status === 'fulfilled' && legacyRes.value.data.success
              ? legacyRes.value.data.data
              : [];
          const smartOrders =
            smartRes.status === 'fulfilled' && smartRes.value.data.success
              ? smartRes.value.data.data
              : [];

          const merged = [...legacyOrders, ...smartOrders].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setOrders(merged);

          if (legacyRes.status === 'rejected')
            console.warn(
              '[Orders] legacy load failed:',
              legacyRes.reason?.response?.status,
              legacyRes.reason?.message,
            );
          if (smartRes.status === 'rejected')
            console.warn(
              '[Orders] smart-order load failed:',
              smartRes.reason?.response?.status,
              smartRes.reason?.message,
            );
          if (
            legacyRes.status === 'rejected' &&
            smartRes.status === 'rejected'
          ) {
            setLoadError(
              'Could not load your orders. Check your connection and try again.',
            );
          }
        })
        .finally(() => setLoading(false));
    }, [user]),
  );

  const displayItems: DisplayItem[] = useMemo(() => {
    return orders.flatMap(order =>
      order.items.map((item, idx) => {
        const orderDateObj = new Date(order.createdAt);
        const deliveryDateObj = new Date(orderDateObj);
        deliveryDateObj.setDate(deliveryDateObj.getDate() + 5);
        const fmt = (d: Date) =>
          d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        return {
          key: `${order.orderId}-${idx}`,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          displayStatus: order.orderStatus || 'Processing',
          orderDate: fmt(orderDateObj),
          deliveryDate: fmt(deliveryDateObj),
        };
      }),
    );
  }, [orders]);

  const toggleStatus = (status: string) =>
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status],
    );

  const filteredItems = displayItems.filter(item => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (statusFilters.length === 0) return matchesSearch;
    const matchesStatus = statusFilters.some(filter => {
      if (filter === 'Cancelled') return item.displayStatus === 'Cancelled';
      if (filter === 'Delivered') return item.displayStatus === 'Delivered';
      if (filter === 'Returned') return item.displayStatus === 'Returned';
      if (filter === 'On the way')
        return (
          item.displayStatus === 'Shipped' ||
          item.displayStatus === 'Processing'
        );
      return false;
    });
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomerHeader />
      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <Search size={16} color={CustomerColors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your orders"
        />
      </View>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              statusFilters.includes(f) && styles.filterChipActive,
            ]}
            onPress={() => toggleStatus(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilters.includes(f) && styles.filterChipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <PackageX size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't placed any orders matching that filter.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusUI = getStatusUI(
            item.displayStatus,
            item.orderDate,
            item.deliveryDate,
          );
          return (
            <View style={styles.orderCard}>
              <Image source={{ uri: item.image }} style={styles.orderImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.orderQty}>
                  Qty: {item.quantity} · ₹{item.price.toLocaleString()}
                </Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusUI.color },
                    ]}
                  />
                  <Text style={styles.statusText}>{statusUI.text}</Text>
                </View>
                <Text style={styles.statusSub}>{statusUI.subText}</Text>
                {item.displayStatus === 'Delivered' && (
                  <TouchableOpacity style={styles.reviewBtn}>
                    <Star
                      size={14}
                      color={CustomerColors.teal700}
                      fill={CustomerColors.teal700}
                    />
                    <Text style={styles.reviewBtnText}>
                      Rate & Review Product
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F3F6' },
  errorBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: { fontSize: FontSizes.xs, color: '#92400E' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F6',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.white,
  },
  filterChipActive: {
    backgroundColor: CustomerColors.primary,
    borderColor: CustomerColors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: { color: CustomerColors.white },
  list: { padding: Spacing.md },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  orderCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  orderImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F9F9F9',
  },
  orderInfo: { flex: 1, gap: 4 },
  orderTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: '#1F2937' },
  orderQty: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#1F2937' },
  statusSub: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  reviewBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },
});
