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
  LogOut
} from 'lucide-react-native';
import { getAdminColors, AdminColors, Spacing, BorderRadius, FontSizes } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';
import type { AdminDrawerParamList } from '../../navigation/AdminNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);

const PORTFOLIO_GROUP: Array<[keyof AdminDrawerParamList, string]> = [
  ['AdminHero', 'Hero'],
  ['AdminHotDrops', 'Hot Drops'],
  ['AdminStudio', 'Studio'],
  ['AdminRalleyz', 'Ralleyz Section'],
  ['AdminCharacters', 'Characters'],
  ['AdminBestSellers', 'Top Picks'],
  ['AdminShopByAge', 'Shop By Age'],
  ['AdminShopByCategory', 'Categories (Carousel)'],
  ['AdminBentoGrid', 'Best of WOW'],
  ['AdminReviews', 'Reviews'],
  ['AdminServices', 'Services/Products'],
  ['AdminContact', 'Contact Form'],
  ['AdminBlogLifestyle', 'Blog & Lifestyle'],
  ['AdminTestimonials', 'Testimonials'],
];

export default function AdminHeader({ navigation, options, route }: any) {
  const { isDark, toggleTheme } = useTheme();
  const themeColors = getAdminColors(isDark);
  const { user, logout } = useAuth();

  const [visible, setVisible] = useState(false);
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
      navigation.navigate('AdminDynamicContent');
    } else if (n.type === 'order' || (n.title && n.title.toLowerCase().includes('order'))) {
      navigation.navigate('AdminOrderHistory');
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
    if (!dateStr) return 'Just now';
    const now = new Date();
    const past = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const title = options?.title ?? route?.name ?? 'Admin';

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
                <Text style={styles.breadcrumbHome}>Home</Text>
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
          <Animated.View style={[styles.menu, { backgroundColor: themeColors.sidebarBg, transform: [{ translateX: slideAnim }] }]}>
            <View style={[styles.menuHeader, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.menuBrand, { color: themeColors.primary }]}>Remise Admin</Text>
              <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color={themeColors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
              <MenuItem label="View Store (Home)" textColor={AdminColors.primary} onPress={() => go('CustomerHome')} />
              <MenuItem label="Dashboard" textColor={themeColors.textPrimary} onPress={() => go('AdminDashboard')} />
              <MenuItem label="Stores" textColor={themeColors.textPrimary} onPress={() => go('AdminStores')} />

              <Text style={[styles.groupLabel, { color: themeColors.textMuted }]}>Portfolio</Text>
              {PORTFOLIO_GROUP.map(([name, label]) => (
                <MenuItem key={name} label={label} textColor={themeColors.textPrimary} onPress={() => go(name)} indent />
              ))}

              <MenuItem label="Blogs & News" textColor={themeColors.textPrimary} onPress={() => go('AdminBlogs')} />
              <MenuItem label="Press Releases" textColor={themeColors.textPrimary} onPress={() => go('AdminPress')} />
              <MenuItem label="Product" textColor={themeColors.textPrimary} onPress={() => go('AdminProduct')} />
              <MenuItem label="Order History" textColor={themeColors.textPrimary} onPress={() => go('AdminOrderHistory')} />
              <MenuItem label="User Management" textColor={themeColors.textPrimary} onPress={() => go('AdminUsers')} />
              <MenuItem label="Dynamic Content" textColor={themeColors.textPrimary} onPress={() => go('AdminDynamicContent')} />
              <MenuItem 
                label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`} 
                textColor={unreadCount > 0 ? AdminColors.primary : themeColors.textPrimary} 
                onPress={() => { close(); handleOpenNotifs(); }} 
              />
              <MenuItem label="Settings" textColor={themeColors.textPrimary} onPress={() => go('AdminSettings')} />
            </ScrollView>

            {/* Bottom Admin User Profile & Logout */}
            <View style={[styles.drawerFooter, { borderTopColor: themeColors.border, backgroundColor: isDark ? '#111827' : '#F8FAFC' }]}>
              <View style={styles.drawerUserCard}>
                <View style={styles.drawerAvatar}>
                  <Text style={styles.drawerAvatarText}>{avatarInitials}</Text>
                </View>
                <View style={styles.drawerUserInfo}>
                  <Text style={[styles.drawerUserName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={[styles.drawerUserEmail, { color: themeColors.textSecondary }]} numberOfLines={1}>
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
                <Text style={styles.drawerLogoutText}>Logout</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.notifModalTitle, { color: themeColors.textPrimary }]}>Admin Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.notifUnreadPill}>
                    <Text style={styles.notifUnreadPillText}>{unreadCount} New</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
            <View style={[styles.notifTabsRow, { borderBottomColor: themeColors.border, backgroundColor: themeColors.bg }]}>
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                style={[styles.notifTabBtn, activeFilter === 'all' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
              >
                <Text style={[styles.notifTabText, activeFilter === 'all' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                  All ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveFilter('stores')}
                style={[styles.notifTabBtn, activeFilter === 'stores' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
              >
                <Text style={[styles.notifTabText, activeFilter === 'stores' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                  Stores
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveFilter('subscribers')}
                style={[styles.notifTabBtn, activeFilter === 'subscribers' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
              >
                <Text style={[styles.notifTabText, activeFilter === 'subscribers' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                  Subscribers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveFilter('unread')}
                style={[styles.notifTabBtn, activeFilter === 'unread' && [styles.notifTabActive, { backgroundColor: themeColors.cardBg }]]}
              >
                <Text style={[styles.notifTabText, activeFilter === 'unread' ? { color: AdminColors.primary, fontWeight: '700' } : { color: themeColors.textSecondary }]}>
                  Unread ({unreadCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView style={styles.notifListScroll} contentContainerStyle={{ padding: Spacing.sm }}>
              {loadingNotifs && notifications.length === 0 ? (
                <View style={styles.notifEmptyBox}>
                  <ActivityIndicator size="small" color={AdminColors.primary} />
                  <Text style={[styles.notifEmptyText, { color: themeColors.textMuted }]}>Loading alerts...</Text>
                </View>
              ) : filteredNotifications.length === 0 ? (
                <View style={styles.notifEmptyBox}>
                  <Bell size={32} color={themeColors.textMuted} />
                  <Text style={[styles.notifEmptyTitle, { color: themeColors.textPrimary }]}>No notifications found</Text>
                  <Text style={[styles.notifEmptyText, { color: themeColors.textMuted }]}>
                    {activeFilter !== 'all' ? 'Try switching filter tabs' : 'New store registrations and subscriber requests will appear here'}
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
                          {n.body || 'No details provided'}
                        </Text>
                        
                        <View style={styles.notifCardActionRow}>
                          <Text style={styles.notifJumpText}>
                            {isStore ? 'Inspect Stores →' : isSub ? 'View Newsletter →' : isOrder ? 'View Order →' : 'View Details →'}
                          </Text>
                          {!n.isRead && (
                            <TouchableOpacity onPress={() => handleMarkRead(id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                              <Text style={styles.notifMarkReadText}>Mark read</Text>
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
    </>
  );
}

function MenuItem({ label, onPress, indent, textColor }: { label: string; onPress: () => void; indent?: boolean; textColor?: string }) {
  return (
    <TouchableOpacity style={[styles.menuItem, indent && styles.menuItemIndent]} onPress={onPress}>
      <Text style={[styles.menuItemText, textColor ? { color: textColor } : {}]}>{label}</Text>
    </TouchableOpacity>
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
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)' },
  menu: { position: 'absolute', top: 0, bottom: 0, left: 0, width: MENU_WIDTH },
  menuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  menuBrand: { fontSize: 16, fontWeight: '800' },
  groupLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 16, marginTop: 12, marginBottom: 4 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemIndent: { paddingLeft: 24 },
  menuItemText: { fontSize: 14, fontWeight: '500' },
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
  notifTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
  },
  notifTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
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
