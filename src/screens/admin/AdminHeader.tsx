import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Animated, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  Store, 
  Mail, 
  Package, 
  RefreshCw, 
  CheckCheck, 
  ExternalLink,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Newspaper,
  Megaphone,
  Users,
  Bike,
  Zap,
  Settings,
  Globe
} from 'lucide-react-native';
import { getAdminColors, AdminColors, Spacing, BorderRadius, FontSizes } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import LanguageSelectorModal from '../../components/common/LanguageSelectorModal';
import { notificationApi } from '../../api/notificationApi';
import type { AdminDrawerParamList } from '../../navigation/AdminNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);

// Exact 10 Menu Pages matching Web Admin (client/app/admin/layout/sidebar.tsx)
interface AdminMenuItem {
  name: keyof AdminDrawerParamList;
  label: string;
  icon: any;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { name: 'AdminDashboard', label: 'Dashboard', icon: LayoutDashboard },
  { name: 'AdminAnalytics', label: 'Analytics', icon: TrendingUp },
  { name: 'AdminStores', label: 'Stores', icon: Store },
  { name: 'AdminBlogs', label: 'Blogs & News', icon: Newspaper },
  { name: 'AdminPress', label: 'Press Releases', icon: Megaphone },
  { name: 'AdminUsers', label: 'User Management', icon: Users },
  { name: 'AdminDeliveryPartners', label: 'Delivery Partners', icon: Bike },
  { name: 'AdminNewsletter', label: 'Newsletter', icon: Mail },
  { name: 'AdminCategory', label: 'Category', icon: Zap },
  { name: 'AdminSettings', label: 'Settings', icon: Settings },
];

const ROUTE_TO_ADMIN_KEY: Record<string, string> = {
  AdminDashboard: 'admin.dashboard',
  AdminAnalytics: 'admin.analytics',
  AdminStores: 'admin.stores',
  AdminStoreRegistrations: 'admin.stores',
  AdminBlogs: 'admin.blogsNews',
  AdminPress: 'admin.pressReleases',
  AdminUsers: 'admin.userManagement',
  AdminDeliveryPartners: 'admin.deliveryPartners',
  AdminNewsletter: 'admin.newsletter',
  AdminCategory: 'admin.category',
  AdminDynamicContent: 'admin.category',
  AdminSettings: 'admin.settings',
};

export default function AdminHeader({ navigation, options, route }: any) {
  const { isDark, toggleTheme } = useTheme();
  const themeColors = getAdminColors(isDark);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  // Helpers for user profile in drawer
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const displayName = user?.fullname || 'Admin User';
  const displayEmail = user?.email || 'admin@remise.in';
  const avatarInitials = getInitials(user?.fullname, user?.email);

  const handleLogout = async () => {
    close();
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleGate' }],
    });
  };

  // Notifications State
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'stores' | 'subscribers'>('all');

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingNotifs(true);
    try {
      const res = await notificationApi.getAll();
      const data = res.data?.data || res.data?.notifications || [];
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(typeof res.data?.unreadCount === 'number' ? res.data.unreadCount : list.filter((n: any) => !n.isRead).length);
    } catch {
      // Ignore background fetch error
    } finally {
      if (showLoading) setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 25000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const open = () => {
    setVisible(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };

  const close = () => {
    Animated.timing(slideAnim, { toValue: -MENU_WIDTH, duration: 200, useNativeDriver: true }).start(() => setVisible(false));
  };

  const go = (name: keyof AdminDrawerParamList) => {
    close();
    navigation.navigate(name);
  };

  const currentRouteName = route?.name;

  const handleOpenNotifs = () => {
    setNotifModalVisible(true);
    fetchNotifications(true);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const handleItemPress = (n: any) => {
    const id = n._id || n.id;
    if (!n.isRead && id) {
      handleMarkRead(id);
    }
    setNotifModalVisible(false);

    if (n.type === 'store_created' || (n.title && n.title.toLowerCase().includes('store'))) {
      navigation.navigate('AdminStores');
    } else if (n.type === 'subscriber_request' || (n.title && (n.title.toLowerCase().includes('subscriber') || n.title.toLowerCase().includes('newsletter')))) {
      navigation.navigate('AdminNewsletter');
    } else if (n.type === 'order' || (n.title && n.title.toLowerCase().includes('order'))) {
      navigation.navigate('AdminDashboard');
    } else {
      navigation.navigate('AdminDashboard');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'stores') return n.type === 'store_created' || (n.title && n.title.toLowerCase().includes('store'));
    if (activeFilter === 'subscribers') return n.type === 'subscriber_request' || (n.title && (n.title.toLowerCase().includes('subscriber') || n.title.toLowerCase().includes('newsletter')));
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return t('admin.justNow');
    const now = new Date();
    const past = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffSec < 60) return t('admin.justNow');
    if (diffSec < 3600) return t('admin.minutesAgo', { count: Math.floor(diffSec / 60) });
    if (diffSec < 86400) return t('admin.hoursAgo', { count: Math.floor(diffSec / 3600) });
    return t('admin.daysAgo', { count: Math.floor(diffSec / 86400) });
  };

  const getHeaderTitle = () => {
    if (route?.name && ROUTE_TO_ADMIN_KEY[route.name]) {
      const localized = t(ROUTE_TO_ADMIN_KEY[route.name]);
      if (localized && localized !== ROUTE_TO_ADMIN_KEY[route.name]) return localized;
    }
    return options?.title ?? route?.name ?? 'Admin';
  };

  const title = getHeaderTitle();

  const getMenuItemLabel = (name: string, fallback: string) => {
    const key = ROUTE_TO_ADMIN_KEY[name];
    if (key) {
      const localized = t(key);
      if (localized && localized !== key) return localized;
    }
    return fallback;
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: themeColors.sidebarBg, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity onPress={open} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Menu color={themeColors.textPrimary} size={22} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.breadcrumbRow}>
              <TouchableOpacity 
                onPress={() => go('CustomerHome')} 
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text style={styles.breadcrumbHome}>{t('common.home')}</Text>
              </TouchableOpacity>
              <Text style={[styles.breadcrumbSep, { color: themeColors.textSecondary }]}> / </Text>
              <Text style={[styles.breadcrumbCurrent, { color: AdminColors.primary }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRightGroup}>
          {/* Notification Bell with Badge */}
          <TouchableOpacity
            onPress={handleOpenNotifs}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1f2937' : '#f1f5f9', borderColor: themeColors.border }]}
            activeOpacity={0.7}
          >
            <Bell color={unreadCount > 0 ? AdminColors.primary : themeColors.textSecondary} size={18} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Language Selector Button */}
          <TouchableOpacity
            onPress={() => setLangModalVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1f2937' : '#f1f5f9', borderColor: themeColors.border }]}
            activeOpacity={0.7}
            accessibilityLabel="Change Language"
          >
            <Globe color={isDark ? '#38BDF8' : '#0284C7'} size={18} />
          </TouchableOpacity>

          {/* Theme Toggle Button */}
          <TouchableOpacity
            onPress={toggleTheme}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1f2937' : '#f1f5f9', borderColor: themeColors.border }]}
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun color="#F59E0B" size={18} />
            ) : (
              <Moon color="#475569" size={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu Drawer Modal */}
      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />
          <Animated.View style={[styles.menu, { backgroundColor: isDark ? '#0f172a' : '#0F172A', transform: [{ translateX: slideAnim }] }]}>
            {/* Exact Web Brand Logo */}
            <View style={[styles.menuHeader, { borderBottomColor: isDark ? '#1e293b' : '#1e293b' }]}>
              <View style={styles.brandContainer}>
                <View style={styles.brandIconBox}>
                  <Text style={styles.brandIconLetter}>R</Text>
                </View>
                <Text style={styles.brandText}>
                  RE<Text style={{ color: '#EF4444' }}>MISE</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            {/* Exact 10 Web Admin Menu Items */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.menuScrollContent} showsVerticalScrollIndicator={false}>
              {ADMIN_MENU_ITEMS.map((item) => {
                const isActive = currentRouteName === item.name || 
                  (item.name === 'AdminStores' && currentRouteName === 'AdminStoreRegistrations') ||
                  (item.name === 'AdminCategory' && currentRouteName === 'AdminDynamicContent');
                const IconComponent = item.icon;

                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.drawerItemRow,
                      isActive && styles.drawerItemRowActive
                    ]}
                    onPress={() => go(item.name)}
                    activeOpacity={0.7}
                  >
                    <IconComponent
                      size={18}
                      color={isActive ? '#FFFFFF' : '#94A3B8'}
                      style={styles.drawerItemIcon}
                    />
                    <Text
                      style={[
                        styles.drawerItemText,
                        isActive ? styles.drawerItemTextActive : styles.drawerItemTextInactive
                      ]}
                      numberOfLines={1}
                    >
                      {getMenuItemLabel(item.name, item.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.drawerItemRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 10 }]}
                onPress={() => go('CustomerHome')}
                activeOpacity={0.7}
              >
                <ExternalLink
                  size={18}
                  color="#38BDF8"
                  style={styles.drawerItemIcon}
                />
                <Text
                  style={[styles.drawerItemText, { color: '#38BDF8', fontWeight: '700' }]}
                  numberOfLines={1}
                >
                  {t('common.home') || 'Customer Home'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Admin User Profile & Logout matching Web */}
            <View style={[styles.drawerFooter, { borderTopColor: '#1e293b', backgroundColor: '#0B1120' }]}>
              <View style={styles.drawerUserCard}>
                <View style={styles.drawerAvatar}>
                  <Text style={styles.drawerAvatarText}>{avatarInitials}</Text>
                </View>
                <View style={styles.drawerUserInfo}>
                  <Text style={[styles.drawerUserName, { color: '#FFFFFF' }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={[styles.drawerUserEmail, { color: '#94A3B8' }]} numberOfLines={1}>
                    {displayEmail}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.drawerLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut size={16} color="#EF4444" />
                <Text style={styles.drawerLogoutText}>{t('common.signOut')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Admin Notifications Modal Sheet */}
      <Modal
        visible={notifModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.notifModalOverlay}>
          <TouchableOpacity 
            style={styles.notifModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setNotifModalVisible(false)} 
          />
          <View style={[styles.notifModalContent, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            {/* Header */}
            <View style={[styles.notifModalHeader, { borderBottomColor: themeColors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
                <Text style={[styles.notifModalTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {t('admin.adminNotificationsTitle')}
                </Text>
                {unreadCount > 0 && (
                  <View style={styles.notifUnreadPill}>
                    <Text style={styles.notifUnreadPillText}>{unreadCount} {t('admin.newBadge')}</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <TouchableOpacity onPress={() => fetchNotifications(true)} style={styles.notifHeaderActionBtn}>
                  <RefreshCw size={15} color={themeColors.textSecondary} />
                </TouchableOpacity>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={handleMarkAllRead} style={styles.notifHeaderActionBtn}>
                    <CheckCheck size={16} color={AdminColors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setNotifModalVisible(false)} style={styles.notifHeaderActionBtn}>
                  <X size={18} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: themeColors.border, backgroundColor: themeColors.bg }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.notifTabsScrollContent}
              >
                <TouchableOpacity
                  onPress={() => setActiveFilter('all')}
                  style={[styles.notifTabBtn, activeFilter === 'all' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
                >
                  <Text style={[styles.notifTabText, activeFilter === 'all' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                    {t('admin.allNotificationsTab')} ({notifications.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveFilter('stores')}
                  style={[styles.notifTabBtn, activeFilter === 'stores' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
                >
                  <Text style={[styles.notifTabText, activeFilter === 'stores' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                    {t('admin.storesNotificationsTab')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveFilter('subscribers')}
                  style={[styles.notifTabBtn, activeFilter === 'subscribers' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
                >
                  <Text style={[styles.notifTabText, activeFilter === 'subscribers' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                    {t('admin.subscribersNotificationsTab')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveFilter('unread')}
                  style={[styles.notifTabBtn, activeFilter === 'unread' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
                >
                  <Text style={[styles.notifTabText, activeFilter === 'unread' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                    {t('admin.unreadNotificationsTab')} ({unreadCount})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* List */}
            <ScrollView style={styles.notifListScroll} contentContainerStyle={{ padding: Spacing.sm }}>
              {loadingNotifs && notifications.length === 0 ? (
                <View style={styles.notifEmptyBox}>
                  <ActivityIndicator size="small" color={AdminColors.primary} />
                  <Text style={[styles.notifEmptyText, { color: themeColors.textMuted }]}>
                    {t('admin.loadingAlerts')}
                  </Text>
                </View>
              ) : filteredNotifications.length === 0 ? (
                <View style={styles.notifEmptyBox}>
                  <Bell size={32} color={themeColors.textMuted} />
                  <Text style={[styles.notifEmptyTitle, { color: themeColors.textPrimary }]}>
                    {t('admin.noNotificationsFound')}
                  </Text>
                  <Text style={[styles.notifEmptyText, { color: themeColors.textMuted }]}>
                    {activeFilter !== 'all' ? t('admin.switchFilterTabsHint') : t('admin.noNotificationsSub')}
                  </Text>
                </View>
              ) : (
                filteredNotifications.map((n: any, idx: number) => {
                  const id = n._id || n.id || idx;
                  const isStore = n.type === 'store_created' || (n.title && n.title.toLowerCase().includes('store'));
                  const isSub = n.type === 'subscriber_request' || (n.title && (n.title.toLowerCase().includes('subscriber') || n.title.toLowerCase().includes('newsletter')));
                  const isOrder = n.type === 'order' || (n.title && n.title.toLowerCase().includes('order'));

                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => handleItemPress(n)}
                      style={[
                        styles.notifCard,
                        { 
                          backgroundColor: !n.isRead ? (isDark ? '#262f40' : '#fef2f2') : themeColors.cardBg, 
                          borderColor: themeColors.border 
                        }
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.notifIconBox,
                        isStore ? styles.iconStoreBox : isSub ? styles.iconSubBox : isOrder ? styles.iconOrderBox : styles.iconSystemBox
                      ]}>
                        {isStore ? (
                          <Store size={18} color="#059669" />
                        ) : isSub ? (
                          <Mail size={18} color="#2563EB" />
                        ) : isOrder ? (
                          <Package size={18} color="#9333EA" />
                        ) : (
                          <Bell size={18} color="#EF4444" />
                        )}
                      </View>

                      <View style={styles.notifContent}>
                        <View style={styles.notifCardTopRow}>
                          <Text style={[styles.notifTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                            {n.title}
                          </Text>
                          <Text style={[styles.notifTime, { color: themeColors.textMuted }]}>
                            {formatTimeAgo(n.createdAt)}
                          </Text>
                        </View>
                        <Text style={[styles.notifDesc, { color: themeColors.textSecondary }]} numberOfLines={2}>
                          {n.body || t('admin.noDetailsProvided')}
                        </Text>
                        
                        <View style={styles.notifCardActionRow}>
                          <Text style={styles.notifJumpText}>
                            {isStore ? t('admin.inspectStoresAction') : isSub ? t('admin.viewNewsletterAction') : isOrder ? t('admin.viewOrderAction') : t('admin.viewDetailsAction')}
                          </Text>
                          {!n.isRead && (
                            <TouchableOpacity onPress={() => handleMarkRead(id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                              <Text style={styles.notifMarkReadText}>{t('admin.markReadBtn')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        isDark={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titleContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: { 
    fontSize: 15, 
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  breadcrumbHome: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.primary,
    textDecorationLine: 'underline',
  },
  breadcrumbSep: {
    fontSize: 11,
    fontWeight: '400',
  },
  breadcrumbCurrent: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 140,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)' },
  menu: { position: 'absolute', top: 0, bottom: 0, left: 0, width: MENU_WIDTH, zIndex: 9999 },
  menuHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 18, 
    borderBottomWidth: 1 
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconLetter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  menuScrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 12,
    marginBottom: 2,
  },
  drawerItemRowActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerItemIcon: {
    marginRight: 2,
  },
  drawerItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  drawerItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  drawerItemTextInactive: {
    color: '#94A3B8',
  },
  drawerFooter: {
    borderTopWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  drawerUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  drawerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  drawerUserInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  drawerUserName: {
    fontSize: 13,
    fontWeight: '700',
  },
  drawerUserEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  drawerLogoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },

  // Notifications Modal Styles
  notifModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  notifModalBackdrop: {
    flex: 1,
  },
  notifModalContent: {
    height: Math.min(520, SCREEN_HEIGHT * 0.75),
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notifModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifModalTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
  },
  notifUnreadPill: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  notifUnreadPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  notifHeaderActionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  notifTabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    gap: 8,
  },
  notifTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTabActive: {
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notifTabText: {
    fontSize: 11,
  },
  notifListScroll: {
    flex: 1,
  },
  notifEmptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notifEmptyTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  notifEmptyText: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  notifCard: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: 10,
  },
  notifIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStoreBox: { backgroundColor: '#ECFDF5' },
  iconSubBox: { backgroundColor: '#EFF6FF' },
  iconOrderBox: { backgroundColor: '#FAF5FF' },
  iconSystemBox: { backgroundColor: '#FEF2F2' },
  notifContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  notifCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  notifTime: {
    fontSize: 10,
  },
  notifDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  notifCardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  notifJumpText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  notifMarkReadText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
