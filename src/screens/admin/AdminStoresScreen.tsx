import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Store,
  Search,
  RotateCcw,
  Building2,
  CheckCircle2,
  Layers,
  Sparkles,
  DollarSign,
  Package,
  ShoppingCart,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Eye,
  TrendingUp,
  Award,
  AlertTriangle,
  X,
  Check,
  Edit,
  BarChart3,
} from 'lucide-react-native';
import { adminStoreApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreItem {
  _id: string;
  name: string;
  ownerId?: string;
  ownerName?: string;
  phone: string;
  email: string;
  category?: string;
  storeType?: 'store' | 'whole_saler' | 'home_business';
  description?: string;
  logo?: string | null;
  upiId?: string | null;
  pan?: string | null;
  gstin?: string | null;
  fssai?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  };
  isActive?: boolean;
  isVerified?: boolean;
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number;
  createdAt?: string;
}

export default function AdminStoresScreen() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'store' | 'whole_saler' | 'home_business'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'verified'>('all');

  // Modal / Detail states
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'edit'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState<any>({});

  const fetchStores = useCallback(async () => {
    try {
      const res = await adminStoreApi.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setStores(data);
      }
    } catch (err: any) {
      console.warn('Failed to fetch stores:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStores();
  };

  const handleOpenStore = async (store: StoreItem) => {
    setSelectedStore(store);
    setEditForm({
      name: store.name,
      ownerName: store.ownerName || '',
      phone: store.phone || '',
      email: store.email || '',
      category: store.category || '',
      storeType: store.storeType || 'store',
      pan: store.pan || '',
      gstin: store.gstin || '',
      fssai: store.fssai || '',
      street: store.address?.street || '',
      city: store.address?.city || '',
      state: store.address?.state || '',
      pinCode: store.address?.pinCode || '',
    });
    setIsDetailOpen(true);
    setActiveTab('overview');
    setLoadingDetails(true);

    try {
      const [analyticsRes, productsRes] = await Promise.allSettled([
        adminStoreApi.getAnalytics(store._id),
        adminStoreApi.getProductsByStore(store._id),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        const aData = analyticsRes.value.data?.data || analyticsRes.value.data;
        if (aData) setAnalytics(aData);
      }
      if (productsRes.status === 'fulfilled') {
        const pData = productsRes.value.data?.data || productsRes.value.data;
        if (Array.isArray(pData)) setStoreProducts(pData);
      }
    } catch (err) {
      console.warn('Error loading store analytics:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleVerification = async (store: StoreItem) => {
    try {
      const newStatus = !store.isVerified;
      const res = await adminStoreApi.toggleVerify(store._id, newStatus);
      if (res.data?.success) {
        Alert.alert('Success', `Store ${newStatus ? 'verified' : 'unverified'} successfully!`);
        setStores(prev => prev.map(s => s._id === store._id ? { ...s, isVerified: newStatus } : s));
        if (selectedStore?._id === store._id) {
          setSelectedStore(prev => prev ? { ...prev, isVerified: newStatus } : null);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleUpdateStatus = async (store: StoreItem, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const isActive = newStatus === 'active';
      const res = await adminStoreApi.updateStatus(store._id, newStatus, isActive);
      if (res.data?.success) {
        Alert.alert('Success', `Store status changed to ${newStatus}!`);
        setStores(prev => prev.map(s => s._id === store._id ? { ...s, isActive } : s));
        if (selectedStore?._id === store._id) {
          setSelectedStore(prev => prev ? { ...prev, isActive } : null);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaveStore = async () => {
    if (!selectedStore) return;
    setIsSaving(true);
    try {
      const payload = {
        name: editForm.name,
        ownerName: editForm.ownerName,
        phone: editForm.phone,
        email: editForm.email,
        category: editForm.category,
        storeType: editForm.storeType,
        pan: editForm.pan,
        gstin: editForm.gstin,
        fssai: editForm.fssai,
        address: {
          street: editForm.street,
          city: editForm.city,
          state: editForm.state,
          pinCode: editForm.pinCode,
        },
      };
      const res = await adminStoreApi.updateStore(selectedStore._id, payload);
      if (res.data?.success) {
        Alert.alert('Success', 'Store details updated successfully!');
        const updated = res.data.data;
        setSelectedStore(prev => ({ ...prev, ...updated }));
        setStores(prev => prev.map(s => s._id === selectedStore._id ? { ...s, ...updated } : s));
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save store changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Stores
  const filteredStores = useMemo(() => {
    return stores.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (s.name || '').toLowerCase().includes(q) ||
        (s.ownerName || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(searchTerm) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.address?.city || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (typeFilter !== 'all') {
        const st = s.storeType || 'store';
        if (st !== typeFilter) return false;
      }

      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;
      if (statusFilter === 'verified' && !s.isVerified) return false;

      return true;
    });
  }, [stores, searchTerm, typeFilter, statusFilter]);

  // KPIs
  const storeKPIs = useMemo(() => {
    const total = stores.length;
    const active = stores.filter(s => s.isActive).length;
    const storeOwners = stores.filter(s => (s.storeType || 'store') === 'store').length;
    const wholesalers = stores.filter(s => s.storeType === 'whole_saler').length;
    const homeBiz = stores.filter(s => s.storeType === 'home_business').length;
    const totalRev = stores.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    return { total, active, storeOwners, wholesalers, homeBiz, totalRev };
  }, [stores]);

  const formatCompactINR = (val: number = 0) => {
    if (!val || isNaN(val)) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 10000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatType = (type?: string) => {
    if (type === 'whole_saler') return 'Wholesaler';
    if (type === 'home_business') return 'Home Business';
    return 'Store Owner';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AdminColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Title */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Store Management</Text>
          <Text style={styles.pageSub}>Oversee all stores, wholesalers & businesses</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <RotateCcw size={16} color={AdminColors.primary} />
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Building2 size={20} color={AdminColors.primary} />
          <Text style={styles.kpiValue} numberOfLines={1}>{storeKPIs.total}</Text>
          <Text style={styles.kpiLabel}>Total Stores</Text>
        </View>

        <View style={styles.kpiCard}>
          <CheckCircle2 size={20} color="#16A34A" />
          <Text style={styles.kpiValue} numberOfLines={1}>{storeKPIs.active}</Text>
          <Text style={styles.kpiLabel}>Active</Text>
        </View>

        <View style={styles.kpiCard}>
          <Store size={20} color="#2563EB" />
          <Text style={styles.kpiValue} numberOfLines={1}>{storeKPIs.storeOwners}</Text>
          <Text style={styles.kpiLabel}>Retailers</Text>
        </View>

        <View style={styles.kpiCard}>
          <Layers size={20} color="#9333EA" />
          <Text style={styles.kpiValue} numberOfLines={1}>{storeKPIs.wholesalers}</Text>
          <Text style={styles.kpiLabel}>Wholesalers</Text>
        </View>

        <View style={styles.kpiCard}>
          <Sparkles size={20} color="#D97706" />
          <Text style={styles.kpiValue} numberOfLines={1}>{storeKPIs.homeBiz}</Text>
          <Text style={styles.kpiLabel}>Home Biz</Text>
        </View>

        <View style={styles.kpiCard}>
          <DollarSign size={20} color={AdminColors.primary} />
          <Text style={[styles.kpiValue, { color: AdminColors.primary }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatCompactINR(storeKPIs.totalRev)}
          </Text>
          <Text style={styles.kpiLabel}>Total Sales</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by store name, owner, city..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9CA3AF"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, typeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setTypeFilter('all')}
        >
          <Text style={[styles.filterChipText, typeFilter === 'all' && styles.filterChipTextActive]}>All Types</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, typeFilter === 'store' && styles.filterChipActive]}
          onPress={() => setTypeFilter('store')}
        >
          <Text style={[styles.filterChipText, typeFilter === 'store' && styles.filterChipTextActive]}>Store Owners</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, typeFilter === 'whole_saler' && styles.filterChipActive]}
          onPress={() => setTypeFilter('whole_saler')}
        >
          <Text style={[styles.filterChipText, typeFilter === 'whole_saler' && styles.filterChipTextActive]}>Wholesalers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, typeFilter === 'home_business' && styles.filterChipActive]}
          onPress={() => setTypeFilter('home_business')}
        >
          <Text style={[styles.filterChipText, typeFilter === 'home_business' && styles.filterChipTextActive]}>Home Biz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'active' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'active' && styles.filterChipTextActive]}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'verified' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'verified' ? 'all' : 'verified')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'verified' && styles.filterChipTextActive]}>Verified</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Stores List */}
      <Text style={styles.sectionHeader}>Stores ({filteredStores.length})</Text>

      {filteredStores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Store size={40} color="#D1D5DB" />
          <Text style={styles.emptyText}>No stores match your search</Text>
        </View>
      ) : (
        filteredStores.map(store => (
          <TouchableOpacity
            key={store._id}
            style={styles.storeCard}
            onPress={() => handleOpenStore(store)}
            activeOpacity={0.8}
          >
            <View style={styles.storeCardTop}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{store.name.substring(0, 2).toUpperCase()}</Text>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.storeNameText} numberOfLines={1}>{store.name}</Text>
                  {store.isVerified && <ShieldCheck size={16} color="#10B981" />}
                </View>
                <Text style={styles.ownerText}>{store.ownerName || 'Store Owner'} · {formatType(store.storeType)}</Text>
                <Text style={styles.locationText}>
                  <MapPin size={11} color={AdminColors.primary} /> {store.address?.city || 'Location set'}
                </Text>
              </View>

              <View style={[styles.statusChip, { backgroundColor: store.isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                <Text style={[styles.statusChipText, { color: store.isActive ? '#15803D' : '#B91C1C' }]}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.storeCardDivider} />

            <View style={styles.storeCardBottom}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Products</Text>
                <Text style={styles.metaValue}>{store.totalProducts || 0}</Text>
              </View>

              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Orders</Text>
                <Text style={styles.metaValue}>{store.totalOrders || 0}</Text>
              </View>

              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Revenue</Text>
                <Text style={[styles.metaValue, { color: '#16A34A' }]}>
                  ₹{(store.totalRevenue || 0).toLocaleString('en-IN')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => handleOpenStore(store)}
              >
                <Eye size={14} color={AdminColors.primary} />
                <Text style={styles.viewBtnText}>Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Store Detail Modal */}
      <Modal visible={isDetailOpen} animationType="slide" onRequestClose={() => setIsDetailOpen(false)}>
        <View style={styles.modalContainer}>
          {selectedStore && (
            <>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>{selectedStore.name}</Text>
                  <Text style={styles.modalSub}>
                    {selectedStore.ownerName} · {formatType(selectedStore.storeType)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.modalClose} onPress={() => setIsDetailOpen(false)}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Tab Bar */}
              <View style={styles.modalTabs}>
                <TouchableOpacity
                  style={[styles.modalTab, activeTab === 'overview' && styles.modalTabActive]}
                  onPress={() => setActiveTab('overview')}
                >
                  <Text style={[styles.modalTabText, activeTab === 'overview' && styles.modalTabTextActive]}>Overview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalTab, activeTab === 'inventory' && styles.modalTabActive]}
                  onPress={() => setActiveTab('inventory')}
                >
                  <Text style={[styles.modalTabText, activeTab === 'inventory' && styles.modalTabTextActive]}>
                    Products ({storeProducts.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalTab, activeTab === 'orders' && styles.modalTabActive]}
                  onPress={() => setActiveTab('orders')}
                >
                  <Text style={[styles.modalTabText, activeTab === 'orders' && styles.modalTabTextActive]}>
                    Orders ({analytics?.recentOrders?.length || 0})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalTab, activeTab === 'edit' && styles.modalTabActive]}
                  onPress={() => setActiveTab('edit')}
                >
                  <Text style={[styles.modalTabText, activeTab === 'edit' && styles.modalTabTextActive]}>Edit/Actions</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody} contentContainerStyle={{ padding: Spacing.md }}>
                {loadingDetails ? (
                  <View style={styles.center}>
                    <ActivityIndicator size="large" color={AdminColors.primary} />
                  </View>
                ) : (
                  <>
                    {/* TAB 1: Overview & Analytics */}
                    {activeTab === 'overview' && (
                      <View style={{ gap: 14 }}>
                        {/* Profile Box */}
                        <View style={styles.infoBox}>
                          <Text style={styles.infoTitle}>Business Profile</Text>
                          <Text style={styles.infoLine}><Mail size={12} color="#6B7280" /> {selectedStore.email}</Text>
                          <Text style={styles.infoLine}><Phone size={12} color="#6B7280" /> {selectedStore.phone}</Text>
                          <Text style={styles.infoLine}><MapPin size={12} color="#6B7280" /> {selectedStore.address?.city || ''}, {selectedStore.address?.state || ''}</Text>
                          <Text style={styles.infoLine}>PAN: {selectedStore.pan || 'N/A'} · GSTIN: {selectedStore.gstin || 'N/A'}</Text>
                        </View>

                        {/* Metric Grid */}
                        <View style={styles.kpiGrid}>
                          <View style={styles.kpiCard}>
                            <Text style={styles.kpiValue} numberOfLines={1}>{analytics?.totalProducts || storeProducts.length}</Text>
                            <Text style={styles.kpiLabel}>Total Products</Text>
                          </View>
                          <View style={styles.kpiCard}>
                            <Text style={styles.kpiValue} numberOfLines={1}>{analytics?.totalOrders || selectedStore.totalOrders || 0}</Text>
                            <Text style={styles.kpiLabel}>Total Orders</Text>
                          </View>
                          <View style={styles.kpiCard}>
                            <Text style={[styles.kpiValue, { color: '#16A34A' }]} numberOfLines={1} adjustsFontSizeToFit>
                              {formatCompactINR(analytics?.totalRevenue || selectedStore.totalRevenue || 0)}
                            </Text>
                            <Text style={styles.kpiLabel}>Total Revenue</Text>
                          </View>
                          <View style={styles.kpiCard}>
                            <Text style={[styles.kpiValue, { color: AdminColors.primary }]} numberOfLines={1} adjustsFontSizeToFit>
                              {formatCompactINR(analytics?.thisMonthRevenue || 0)}
                            </Text>
                            <Text style={styles.kpiLabel}>This Month</Text>
                          </View>
                        </View>

                        {/* Monthly Revenue Breakdown Chart */}
                        <View style={styles.cardSection}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <View>
                              <Text style={styles.cardTitle}>Monthly Revenue Breakdown</Text>
                              <Text style={{ fontSize: 10, color: '#6B7280' }}>Historical store revenue</Text>
                            </View>
                            {analytics?.bestDay ? (
                              <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                <Text style={{ fontSize: 9, color: '#15803D', fontWeight: '700' }}>
                                  Peak: {formatCompactINR(analytics.bestDay.revenue)}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          {analytics?.revenueByMonth && analytics.revenueByMonth.length > 0 ? (
                            <View style={styles.chartContainer}>
                              <View style={styles.chartBarsRow}>
                                {(() => {
                                  const maxRev = Math.max(...analytics.revenueByMonth.map((m: any) => m.revenue), 1);
                                  return analytics.revenueByMonth.map((m: any, idx: number) => {
                                    const heightPct = Math.max(22, Math.min(100, Math.round((m.revenue / maxRev) * 100)));
                                    return (
                                      <View key={idx} style={styles.chartCol}>
                                        <View style={styles.chartPill}>
                                          <Text style={styles.chartPillText}>{formatCompactINR(m.revenue)}</Text>
                                        </View>
                                        <View style={styles.chartTrack}>
                                          <View style={[styles.chartBar, { height: `${heightPct}%` }]} />
                                        </View>
                                        <Text style={styles.chartMonthLabel}>{m.month}</Text>
                                      </View>
                                    );
                                  });
                                })()}
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.emptyNote}>No monthly revenue history recorded yet.</Text>
                          )}
                        </View>

                        {/* Top Products */}
                        <View style={styles.cardSection}>
                          <Text style={styles.cardTitle}>Top Selling Products</Text>
                          {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                            analytics.topProducts.map((p: any, i: number) => (
                              <View key={i} style={styles.rankRow}>
                                <Text style={styles.rankNum}>#{i + 1}</Text>
                                <View style={{ flex: 1, marginHorizontal: 8 }}>
                                  <Text style={styles.rankName} numberOfLines={1}>{p.title}</Text>
                                  <Text style={styles.rankSub}>₹{p.revenue.toLocaleString('en-IN')}</Text>
                                </View>
                                <Text style={styles.rankBadge}>{p.qty} sold</Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.emptyNote}>No sales data yet</Text>
                          )}
                        </View>

                        {/* Top Brands */}
                        <View style={styles.cardSection}>
                          <Text style={styles.cardTitle}>Top Selling Brands</Text>
                          {analytics?.topBrands && analytics.topBrands.length > 0 ? (
                            analytics.topBrands.map((b: any, i: number) => (
                              <View key={i} style={styles.rankRow}>
                                <Text style={styles.rankNum}>#{i + 1}</Text>
                                <View style={{ flex: 1, marginHorizontal: 8 }}>
                                  <Text style={styles.rankName}>{b.brand}</Text>
                                  <Text style={styles.rankSub}>₹{b.revenue.toLocaleString('en-IN')}</Text>
                                </View>
                                <Text style={[styles.rankBadge, { backgroundColor: '#F3E8FF', color: '#7E22CE' }]}>
                                  {b.qty} sold
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.emptyNote}>No brand data yet</Text>
                          )}
                        </View>
                      </View>
                    )}

                    {/* TAB 2: Products & Inventory */}
                    {activeTab === 'inventory' && (
                      <View style={{ gap: 12 }}>
                        {storeProducts.map(p => (
                          <View key={p._id} style={styles.productCard}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.productTitle} numberOfLines={1}>{p.title}</Text>
                              <Text style={styles.productSub}>{p.brand || 'Other'} · {p.category || 'General'}</Text>
                              <Text style={styles.productPrice}>₹{p.price.toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.stockBadge}>
                              <Text style={styles.stockBadgeText}>{p.totalStock ?? 0} in stock</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* TAB 3: Recent Orders */}
                    {activeTab === 'orders' && (
                      <View style={{ gap: 10 }}>
                        {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
                          analytics.recentOrders.map((o: any) => (
                            <View key={o._id || o.orderId} style={styles.orderCard}>
                              <View style={styles.orderTop}>
                                <Text style={styles.orderId}>{o.orderId}</Text>
                                <Text style={styles.orderAmount}>₹{o.amount.toLocaleString('en-IN')}</Text>
                              </View>
                              <Text style={styles.orderSummary} numberOfLines={1}>{o.itemsSummary}</Text>
                              <View style={styles.orderBottom}>
                                <Text style={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                                <View style={styles.orderStatusChip}>
                                  <Text style={styles.orderStatusText}>{o.paymentStatus}</Text>
                                </View>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.emptyNote}>No orders found for this store</Text>
                        )}
                      </View>
                    )}

                    {/* TAB 4: Edit & Actions */}
                    {activeTab === 'edit' && (
                      <View style={{ gap: 14 }}>
                        {/* Status Action Buttons */}
                        <View style={styles.actionBtnRow}>
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: selectedStore.isVerified ? '#1D4ED8' : '#3B82F6' }]}
                            onPress={() => handleToggleVerification(selectedStore)}
                          >
                            <ShieldCheck size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>
                              {selectedStore.isVerified ? 'Verified' : 'Verify Store'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: selectedStore.isActive ? '#D97706' : '#16A34A' }]}
                            onPress={() => handleUpdateStatus(selectedStore, selectedStore.isActive ? 'inactive' : 'active')}
                          >
                            {selectedStore.isActive ? <XCircle size={16} color="#fff" /> : <CheckCircle2 size={16} color="#fff" />}
                            <Text style={styles.actionBtnText}>
                              {selectedStore.isActive ? 'Deactivate' : 'Activate'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
                            onPress={() => handleUpdateStatus(selectedStore, 'suspended')}
                          >
                            <ShieldAlert size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Suspend</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Edit Form */}
                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Store Name</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.name}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, name: t }))}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Owner Name</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.ownerName}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, ownerName: t }))}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Phone Number</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.phone}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, phone: t }))}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Email</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.email}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, email: t }))}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Category</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.category}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, category: t }))}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>PAN Number</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.pan}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, pan: t.toUpperCase() }))}
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>City</Text>
                          <TextInput
                            style={styles.formInput}
                            value={editForm.city}
                            onChangeText={t => setEditForm((prev: any) => ({ ...prev, city: t }))}
                          />
                        </View>

                        <TouchableOpacity
                          style={styles.saveBtn}
                          onPress={handleSaveStore}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <>
                              <Check size={16} color="#fff" />
                              <Text style={styles.saveBtnText}>Save Store Changes</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  pageTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: AdminColors.textPrimary },
  pageSub: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, marginTop: 2 },
  refreshBtn: { padding: 8, backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  kpiCard: { width: '31%', backgroundColor: '#fff', padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
  kpiValue: { fontSize: FontSizes.sm, fontWeight: '800', color: '#111827', marginTop: 4 },
  kpiLabel: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.md, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: AdminColors.border, marginBottom: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSizes.sm, color: AdminColors.textPrimary },
  filterScroll: { flexDirection: 'row', marginBottom: Spacing.md },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: AdminColors.border, marginRight: 6 },
  filterChipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  filterChipText: { fontSize: 11, fontWeight: '700', color: AdminColors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  sectionHeader: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.textPrimary, marginBottom: Spacing.sm },
  emptyContainer: { padding: Spacing.xl, alignItems: 'center', gap: 6 },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  storeCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  storeCardTop: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { width: 42, height: 42, borderRadius: BorderRadius.md, backgroundColor: AdminColors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeNameText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#111827' },
  ownerText: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  locationText: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.pill },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  storeCardDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: Spacing.sm },
  storeCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaCol: { alignItems: 'center' },
  metaLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 12, fontWeight: '800', color: '#111827', marginTop: 1 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.sm, backgroundColor: '#FEF2F2' },
  viewBtnText: { fontSize: 11, fontWeight: '700', color: AdminColors.primary },
  modalContainer: { flex: 1, backgroundColor: AdminColors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: '#111827' },
  modalSub: { fontSize: 11, color: '#6B7280' },
  modalClose: { padding: 6, borderRadius: BorderRadius.pill, backgroundColor: '#F3F4F6' },
  modalTabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  modalTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  modalTabActive: { borderBottomColor: AdminColors.primary },
  modalTabText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  modalTabTextActive: { color: AdminColors.primary },
  modalBody: { flex: 1 },
  infoBox: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md },
  infoTitle: { fontSize: 12, fontWeight: '800', color: '#111827', marginBottom: 6 },
  infoLine: { fontSize: 11, color: '#4B5563', marginBottom: 4 },
  cardSection: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#111827', marginBottom: 8 },
  chartContainer: { backgroundColor: '#F9FAFB', borderRadius: BorderRadius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#F3F4F6' },
  chartBarsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 130, paddingBottom: 4 },
  chartCol: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartPill: { backgroundColor: '#1F2937', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  chartPillText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  chartTrack: { height: 75, width: 32, justifyContent: 'flex-end', alignItems: 'center' },
  chartBar: { width: 28, backgroundColor: AdminColors.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  chartMonthLabel: { fontSize: 10, fontWeight: '700', color: '#4B5563', marginTop: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rankNum: { fontSize: 11, fontWeight: '800', color: '#9CA3AF' },
  rankName: { fontSize: 12, fontWeight: '700', color: '#111827' },
  rankSub: { fontSize: 10, color: '#6B7280' },
  rankBadge: { fontSize: 10, fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  emptyNote: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
  productCard: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  productSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  productPrice: { fontSize: 12, fontWeight: '800', color: '#111827', marginTop: 2 },
  stockBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.pill },
  stockBadgeText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  orderCard: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#F3F4F6', padding: Spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontSize: 11, fontWeight: '800', color: '#111827', fontFamily: 'monospace' },
  orderAmount: { fontSize: 12, fontWeight: '800', color: '#111827' },
  orderSummary: { fontSize: 11, color: '#4B5563', marginBottom: 4 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDate: { fontSize: 10, color: '#9CA3AF' },
  orderStatusChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.pill },
  orderStatusText: { fontSize: 9, fontWeight: '700', color: '#4B5563' },
  actionBtnRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: BorderRadius.md },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  formGroup: { marginBottom: 8 },
  formLabel: { fontSize: 11, fontWeight: '700', color: '#374151', marginBottom: 4 },
  formInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: 12, height: 38, fontSize: 12, color: AdminColors.textPrimary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: AdminColors.primary, paddingVertical: 12, borderRadius: BorderRadius.md, marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
