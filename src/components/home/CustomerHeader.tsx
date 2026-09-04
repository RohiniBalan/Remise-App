import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ShoppingCart, User, Package, Percent, Settings as SettingsIcon, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

// Shared header (logo, bell, cart, avatar/account menu) — extracted from
// HomeScreen so every customer screen renders the identical header instead
// of duplicating this markup. Behavior/styles are unchanged from HomeScreen;
// only moved here.
export default function CustomerHeader() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount } = useUnreadNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const initial = useMemo(
    () => (user?.fullname || user?.name || user?.email || '?').trim().charAt(0).toUpperCase(),
    [user],
  );

  const goToMenuItem = (route: string) => {
    setMenuOpen(false);
    navigation.navigate(route);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    logout();
    // AppNavigator's RoleGate switches to AuthNavigator automatically once
    // token/user are cleared — no explicit navigation needed here.
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.logo}>REmise</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={20} color={CustomerColors.black} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={20} color={CustomerColors.black} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity style={styles.avatar} onPress={() => setMenuOpen(true)}>
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('LoginRegister')}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuSheet} onPress={() => { }}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuName} numberOfLines={1}>{user?.fullname || user?.name || 'Account'}</Text>
              <Text style={styles.menuEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
            <MenuItem icon={User} label="My Profile" onPress={() => goToMenuItem('Profile')} />
            <MenuItem icon={Package} label="My Orders" onPress={() => goToMenuItem('Orders')} />
            <MenuItem icon={Percent} label="My Offers" onPress={() => goToMenuItem('MyOffers')} />
            <MenuItem icon={SettingsIcon} label="Settings" onPress={() => goToMenuItem('Settings')} />
            <View style={styles.menuDivider} />
            <MenuItem icon={LogOut} label="Sign Out" onPress={handleSignOut} destructive />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({ icon: Icon, label, onPress, destructive }: { icon: any; label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon size={17} color={destructive ? CustomerColors.primary : CustomerColors.textSecondary} />
      <Text style={[styles.menuItemText, destructive && styles.menuItemTextDestructive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: CustomerColors.white,
    borderBottomWidth: 1,
    borderBottomColor: CustomerColors.border,
  },
  logo: { fontSize: FontSizes.lg, fontWeight: '800', color: CustomerColors.primary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBtn: { position: 'relative' },
  badge: {
    position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8,
    paddingHorizontal: 3, backgroundColor: CustomerColors.primary, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: CustomerColors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.sm },
  loginBtn: { backgroundColor: CustomerColors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },

  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'flex-end' },
  menuSheet: { marginTop: 60, marginRight: Spacing.md, width: 220, backgroundColor: CustomerColors.white, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, ...Shadows.card },
  menuHeader: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: CustomerColors.border, marginBottom: Spacing.xs },
  menuName: { fontSize: FontSizes.sm, fontWeight: '800', color: CustomerColors.black },
  menuEmail: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  menuItemText: { fontSize: FontSizes.sm, color: '#374151', fontWeight: '600' },
  menuItemTextDestructive: { color: CustomerColors.primary },
  menuDivider: { height: 1, backgroundColor: CustomerColors.border, marginVertical: Spacing.xs },
});