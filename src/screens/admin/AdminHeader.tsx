import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView, Dimensions } from 'react-native';
import { Menu, X } from 'lucide-react-native';
import { AdminColors } from '../../styles/theme';
import type { AdminDrawerParamList } from '../../navigation/AdminNavigator';

// Custom slide-in side menu built on RN's built-in Animated API — deliberately
// NOT @react-navigation/drawer, which pulls in react-native-reanimated (and
// transitively react-native-worklets), whose native module currently fails
// to link on this Windows/NDK toolchain (undefined C++ exception-handling
// symbols during the arm64-v8a build). This reproduces the same "sidebar
// nav mirrors client/app/admin/layout/sidebar.tsx" outcome without that
// dependency. Revisit swapping back to @react-navigation/drawer later if the
// toolchain issue gets resolved upstream.

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

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

  const title = options?.title ?? route?.name ?? 'Admin';

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={open} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Menu color={AdminColors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 22 }} />
      </View>

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />
          <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
            <ScrollView>
              <View style={styles.menuHeader}>
                <Text style={styles.menuBrand}>Remise Admin</Text>
                <TouchableOpacity onPress={close}>
                  <X color={AdminColors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>

              <MenuItem label="Dashboard" onPress={() => go('AdminDashboard')} />

              <Text style={styles.groupLabel}>Portfolio</Text>
              {PORTFOLIO_GROUP.map(([name, label]) => (
                <MenuItem key={name} label={label} onPress={() => go(name)} indent />
              ))}

              <MenuItem label="Product" onPress={() => go('AdminProduct')} />
              <MenuItem label="Order History" onPress={() => go('AdminOrderHistory')} />
              <MenuItem label="User Management" onPress={() => go('AdminUsers')} />
              <MenuItem label="Dynamic Content" onPress={() => go('AdminDynamicContent')} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function MenuItem({ label, onPress, indent }: { label: string; onPress: () => void; indent?: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuItem, indent && styles.menuItemIndent]} onPress={onPress}>
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: AdminColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: AdminColors.textPrimary },
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)' },
  menu: { position: 'absolute', top: 0, bottom: 0, left: 0, width: MENU_WIDTH, backgroundColor: AdminColors.sidebarBg },
  menuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: AdminColors.border },
  menuBrand: { fontSize: 16, fontWeight: '800', color: AdminColors.primary },
  groupLabel: { fontSize: 11, fontWeight: '700', color: AdminColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 16, marginTop: 12, marginBottom: 4 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemIndent: { paddingLeft: 24 },
  menuItemText: { fontSize: 14, color: AdminColors.textPrimary, fontWeight: '500' },
});
