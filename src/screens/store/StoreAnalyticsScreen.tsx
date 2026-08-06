import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { TrendingUp, ChevronDown, X } from 'lucide-react-native';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../styles/theme';
import {
  extractLineItems,
  computeAnalytics,
  buildTrend,
  getDateRange,
  DateRangeKey,
} from './analytics';
import { mergeCategories } from '../../utils/storeCategories';

// Ported from client/app/store/dashboard/page.tsx's OverviewTab — everything
// BELOW the 6 stat tiles / Recent Orders / Product Stock, which already live
// in StoreOverviewScreen. This screen owns: the date/category/product filter
// bar, Total Products Sold, the sales trend chart, top/least selling tables,
// brand-wise revenue, category-wise pie, revenue-by-month, and best sales day.
//
// NOTE: assumes useStoreDashboard() also exposes `categories` (same shape as
// web's separate `categories` prop). If your StoreDashboardContext doesn't
// load categories yet, add that fetch there the same way products/offers
// are already loaded — the category filter below has nothing to show
// without it.

const SCREEN_WIDTH = Dimensions.get('window').width;
const OUTER_PADDING = Spacing.md * 2 + Spacing.md * 2;
const Y_AXIS_LABEL_WIDTH = 44;
const CATEGORY_LABEL_WIDTH = 70;

const CHART_WIDTH = SCREEN_WIDTH - OUTER_PADDING - Y_AXIS_LABEL_WIDTH;
const HBAR_CHART_WIDTH = SCREEN_WIDTH - OUTER_PADDING - CATEGORY_LABEL_WIDTH;

const PIE_COLORS = [
  '#0d9488',
  '#FF0000',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

const RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'custom', label: 'Custom' },
];

const GRANULARITY_OPTIONS: {
  key: 'daily' | 'weekly' | 'monthly';
  label: string;
}[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

// Modal-based dropdown since RN has no native <select>. Same pattern as
// the one used on the Store Settings screen (State/City pickers).
function SelectField({
  label,
  value,
  placeholder,
  options,
  disabled,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectInput, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={CustomerColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item.key}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item.key, item.label);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalItemText, item.label === value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.modalEmpty}>No options found</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function StoreAnalyticsScreen() {
  const {
    orders,
    products,
    categories = [],
    loading,
    refresh,
  } = useStoreDashboard() as any;

  const [range, setRange] = useState<DateRangeKey>('month');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [category, setCategory] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [granularity, setGranularity] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');

  // "All" + real options for the two dropdowns. mergeCategories combines the
  // store's default categories with any it has added itself — same helper
  // the Categories screen uses — so the filter isn't limited to added-only.
  const mergedCategories = useMemo(() => mergeCategories(categories || []), [categories]);
  const categoryOptions = useMemo(
    () => [
      { key: '', label: 'All' },
      ...mergedCategories.map((c: any) => ({ key: c.name, label: c.name })),
    ],
    [mergedCategories],
  );
  const productOptions = useMemo(
    () => [
      { key: '', label: 'All' },
      ...products.map((p: any) => ({ key: p.title, label: p.title })),
    ],
    [products],
  );

  const analytics = useMemo(() => {
    // Guard: a half-typed custom range would throw inside getDateRange.
    if (range === 'custom' && (!custom.from || !custom.to)) return null;

    const { from, to } = getDateRange(range, custom);
    const filteredOrders = orders.filter((o: any) => {
      const d = new Date(o.createdAt);
      return d >= from && d <= to;
    });

    let items = extractLineItems(filteredOrders, products);
    if (category) items = items.filter(i => i.category === category);
    if (productFilter)
      items = items.filter(i => i.productTitle === productFilter);

    return computeAnalytics(items);
  }, [orders, products, range, custom, category, productFilter]);

  const trend = useMemo(
    () => (analytics ? buildTrend(analytics.byDay, granularity) : []),
    [analytics, granularity],
  );

  const lineData = useMemo(
    () =>
      trend.map(t => ({
        value: t.revenue,
        label: t.label.slice(5) /* trim year for daily labels */,
      })),
    [trend],
  );

  const brandBarData = useMemo(
    () =>
      (analytics?.brandWise || []).map(b => ({
        value: b.revenue,
        label: b.brand,
      })),
    [analytics],
  );

  const monthBarData = useMemo(
    () =>
      (analytics?.revenueByMonth || []).map(m => ({
        value: m.revenue,
        label: m.month.slice(5),
      })),
    [analytics],
  );

  const pieData = useMemo(
    () =>
      (analytics?.categoryWise || []).map((c, i) => ({
        value: c.revenue,
        color: PIE_COLORS[i % PIE_COLORS.length],
        text: c.name,
      })),
    [analytics],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
      }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      {/* ── Filter bar ── */}
      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Date Range</Text>
        <View style={styles.pillRow}>
          {RANGE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setRange(opt.key)}
              style={[styles.pill, range === opt.key && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  range === opt.key && styles.pillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {range === 'custom' && (
          <View style={styles.customRow}>
            <TextInput
              style={styles.dateInput}
              placeholder="From (YYYY-MM-DD)"
              value={custom.from}
              onChangeText={v => setCustom(c => ({ ...c, from: v }))}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="To (YYYY-MM-DD)"
              value={custom.to}
              onChangeText={v => setCustom(c => ({ ...c, to: v }))}
            />
          </View>
        )}

        {/* Category / Product — dropdowns instead of pill rows */}
        <View style={styles.dropdownRow}>
          <SelectField
            label="Category"
            value={category}
            placeholder="All"
            options={categoryOptions}
            onSelect={key => setCategory(key)}
          />
          <SelectField
            label="Product"
            value={productFilter}
            placeholder="All"
            options={productOptions}
            onSelect={key => setProductFilter(key)}
          />
        </View>
      </View>

      {!analytics ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Enter both custom dates to see analytics.
          </Text>
        </View>
      ) : (
        <>
          {/* ── Total products sold ── */}
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#7C3AED" />
            <Text style={styles.statValue}>{analytics.totalProductsSold}</Text>
            <Text style={styles.statLabel}>Total Products Sold</Text>
          </View>

          {/* ── Sales trend ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Sales Trend</Text>
              <View style={styles.pillRowTight}>
                {GRANULARITY_OPTIONS.map(g => (
                  <TouchableOpacity
                    key={g.key}
                    onPress={() => setGranularity(g.key)}
                    style={[
                      styles.smallPill,
                      granularity === g.key && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallPillText,
                        granularity === g.key && styles.pillTextActive,
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {lineData.length === 0 ? (
              <Text style={styles.emptyText}>No data for this range.</Text>
            ) : (
              <LineChart
                data={lineData}
                width={CHART_WIDTH}
                height={180}
                color="#0d9488"
                thickness={2}
                hideDataPoints
                curved
                xAxisLabelTextStyle={{
                  fontSize: 9,
                  color: CustomerColors.textSecondary,
                }}
                yAxisTextStyle={{
                  fontSize: 9,
                  color: CustomerColors.textSecondary,
                }}
                noOfSections={4}
                yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
                initialSpacing={8}
                endSpacing={8}
              />
            )}
          </View>

          {/* ── Top / Least selling products ── */}
          {[
            { title: 'Top Selling Products', rows: analytics.topProducts },
            { title: 'Least Selling Products', rows: analytics.leastProducts },
          ].map(({ title, rows }) => (
            <View key={title} style={styles.section}>
              <Text style={styles.sectionTitle}>{title}</Text>
              {rows.length === 0 ? (
                <Text style={styles.emptyText}>No data</Text>
              ) : (
                rows.map((r: any) => (
                  <View key={`${r.title}-${r.brand}`} style={styles.productRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productRowTitle} numberOfLines={1}>
                        {r.title}
                      </Text>
                      <Text style={styles.productRowSub}>{r.brand}</Text>
                    </View>
                    <Text style={styles.productRowQty}>Qty {r.qty}</Text>
                    <Text style={styles.productRowRevenue}>
                      ₹{r.revenue.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ))}

          {/* ── Brand-wise revenue (horizontal bar) ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand-wise Revenue</Text>
            {brandBarData.length === 0 ? (
              <Text style={styles.emptyText}>No data</Text>
            ) : (
              <BarChart
                data={brandBarData}
                horizontal
                width={HBAR_CHART_WIDTH}
                height={Math.max(180, brandBarData.length * 36)}
                frontColor="#0d9488"
                barBorderRadius={4}
                yAxisTextStyle={{ fontSize: 10, color: CustomerColors.textSecondary }}
                xAxisLabelTextStyle={{ fontSize: 9, color: CustomerColors.textSecondary }}
                yAxisLabelWidth={CATEGORY_LABEL_WIDTH}
                initialSpacing={8}
                spacing={20}
                barWidth={22}
              />
            )}
          </View>

          {/* ── Category-wise pie ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category-wise Sales</Text>
            {pieData.length === 0 ? (
              <Text style={styles.emptyText}>No data</Text>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <PieChart
                  data={pieData}
                  radius={90}
                  showText
                  textColor="#fff"
                  textSize={10}
                />
                <View style={styles.legendWrap}>
                  {pieData.map((d, i) => (
                    <View key={i} style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: d.color }]}
                      />
                      <Text style={styles.legendText}>{d.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ── Revenue by month ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue by Month</Text>
            {monthBarData.length === 0 ? (
              <Text style={styles.emptyText}>No data</Text>
            ) : (
              <BarChart
                data={monthBarData}
                width={CHART_WIDTH}
                height={180}
                frontColor="#0d9488"
                barBorderRadius={4}
                xAxisLabelTextStyle={{ fontSize: 9, color: CustomerColors.textSecondary }}
                yAxisTextStyle={{ fontSize: 9, color: CustomerColors.textSecondary }}
                yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
                initialSpacing={8}
                endSpacing={8}
              />
            )}
          </View>

          {/* ── Best sales day ── */}
          {analytics.bestDay && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best Sales Day</Text>
              <Text style={styles.bestDayDate}>
                {new Date(analytics.bestDay.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.bestDaySub}>
                Revenue: ₹{analytics.bestDay.revenue.toLocaleString('en-IN')} ·
                Orders: {analytics.bestDay.orders}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
  },

  filterCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  filterLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: CustomerColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  pillRowTight: { flexDirection: 'row', gap: 4 },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.bg,
  },
  pillActive: {
    backgroundColor: CustomerColors.teal600,
    borderColor: CustomerColors.teal600,
  },
  pillText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: { color: CustomerColors.white },
  smallPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    backgroundColor: CustomerColors.bg,
  },
  smallPillText: {
    fontSize: 10,
    color: CustomerColors.textSecondary,
    fontWeight: '700',
  },
  customRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  dateInput: {
    flex: 1,
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: FontSizes.xs,
  },

  // ── Category / Product dropdown row ──
  dropdownRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CustomerColors.bg,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
  },
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: FontSizes.xs, color: CustomerColors.black, flex: 1 },
  selectPlaceholder: { fontSize: FontSizes.xs, color: '#9CA3AF', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '70%',
    paddingBottom: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { color: CustomerColors.teal700, fontWeight: '700' },
  modalEmpty: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },

  statCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#7C3AED',
    marginTop: 4,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },

  section: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
    marginBottom: Spacing.sm,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  productRowTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  productRowSub: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
  },
  productRowQty: {
    fontSize: FontSizes.xs,
    color: CustomerColors.textSecondary,
    marginRight: Spacing.sm,
  },
  productRowRevenue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.teal700,
  },

  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },

  bestDayDate: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.teal700,
  },
  bestDaySub: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: CustomerColors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
});