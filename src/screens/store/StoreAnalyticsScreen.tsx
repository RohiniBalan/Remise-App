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
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { TrendingUp } from 'lucide-react-native';
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

        <Text style={[styles.filterLabel, { marginTop: Spacing.sm }]}>
          Category
        </Text>
        <View style={styles.pillRow}>
          <TouchableOpacity
            onPress={() => setCategory('')}
            style={[styles.pill, !category && styles.pillActive]}
          >
            <Text style={[styles.pillText, !category && styles.pillTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((c: any) => (
            <TouchableOpacity
              key={c._id}
              onPress={() => setCategory(c.name)}
              style={[styles.pill, category === c.name && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  category === c.name && styles.pillTextActive,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.filterLabel, { marginTop: Spacing.sm }]}>
          Product
        </Text>
        <View style={styles.pillRow}>
          <TouchableOpacity
            onPress={() => setProductFilter('')}
            style={[styles.pill, !productFilter && styles.pillActive]}
          >
            <Text
              style={[styles.pillText, !productFilter && styles.pillTextActive]}
            >
              All
            </Text>
          </TouchableOpacity>
          {products.map((p: any) => (
            <TouchableOpacity
              key={p._id}
              onPress={() => setProductFilter(p.title)}
              style={[
                styles.pill,
                productFilter === p.title && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  productFilter === p.title && styles.pillTextActive,
                ]}
                numberOfLines={1}
              >
                {p.title}
              </Text>
            </TouchableOpacity>
          ))}
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
