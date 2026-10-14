import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trash2, ShoppingBag } from 'lucide-react-native';
import { useCart, CartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../../components/common/BrandHeader';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import { useTranslation, translateProductName } from '../../i18n';
import { usePlatformFee } from '../../utils/platformFee';
import { useDeliveryFee } from '../../utils/deliveryFee';
import { creditApi, CreditAccount } from '../../api/creditApi';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { language, t } = useTranslation();
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const { cart, removeFromCart, decreaseQuantity, addToCart, setBuyNowItem } =
    useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [approvedCredit, setApprovedCredit] = useState<CreditAccount | null>(null);

  React.useEffect(() => {
    if (!token || !user) return;
    creditApi.getMyCreditAccounts()
      .then(res => {
        const accounts: CreditAccount[] = Array.isArray(res) ? res : (res as any)?.data || [];
        const appAcc = accounts.find(a => a.status === 'APPROVED' && (a.availableCredit || 0) > 0);
        if (appAcc) setApprovedCredit(appAcc);
      })
      .catch(() => {});
  }, [token, user]);

  React.useEffect(() => {
    navigation.setOptions({ title: t('cart.yourCart') });
  }, [navigation, t, language]);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart],
  );
  const platformFee = usePlatformFee(subtotal);
  const { remainingForFreeDelivery } = useDeliveryFee(subtotal, 'delivery');
  const grandTotal = subtotal + platformFee;

  const handleCheckout = () => {
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    setBuyNowItem(null);
    navigation.navigate('Checkout');
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
        <BrandHeader />
        <View style={[styles.emptyContainer, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
          <ShoppingBag size={40} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
          <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>{t('cart.cartEmpty')}</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => {
              navigation.navigate('Categories', {
                screen: 'CategoryProducts',
                params: { category: 'all' },
              });
            }}
          >
            <Text style={styles.shopBtnText}>{t('cart.continueShopping')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b0f19' : CustomerColors.bg }]}>
      <BrandHeader />
      {remainingForFreeDelivery > 0 ? (
        <View style={[styles.nudge, isDark && { backgroundColor: 'rgba(15, 163, 177, 0.2)' }]}>
          <Text style={[styles.nudgeText, isDark && { color: '#5EEAD4' }]}>
            {t('cart.freeDeliveryNudge', { amount: remainingForFreeDelivery })}
          </Text>
        </View>
      ) : (
        <View style={[styles.nudge, styles.nudgeSuccess, isDark && { backgroundColor: 'rgba(22, 163, 74, 0.2)' }]}>
          <Text style={[styles.nudgeText, styles.nudgeSuccessText]}>
            {t('cart.freeDeliveryUnlocked')}
          </Text>
        </View>
      )}

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartRow
            item={item}
            isDark={isDark}
            onIncrease={() => addToCart({ ...item, quantity: 1 })}
            onDecrease={() => decreaseQuantity(item.id)}
            onRemove={() => removeFromCart(item.id)}
          />
        )}
      />

      <View style={[styles.footer, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderTopColor: isDark ? '#1F2937' : CustomerColors.border }]}>
        <View style={styles.subtotalRow}>
          <Text style={[styles.subtotalLabel, isDark && { color: '#D1D5DB' }]}>{t('cart.subtotal') || 'Product Subtotal'}</Text>
          <Text style={[styles.subtotalValue, isDark && { color: '#FFFFFF' }]}>₹{subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.subtotalRow}>
          <Text style={[styles.platformFeeLabel, isDark && { color: '#9CA3AF' }]}>{t('cart.platformFee') || 'Platform Fee'}</Text>
          <Text style={[styles.platformFeeValue, isDark && { color: '#D1D5DB' }]}>
            {platformFee === 0 ? (t('cart.free') || 'FREE') : `₹${platformFee.toLocaleString()}`}
          </Text>
        </View>
        <View style={[styles.subtotalRow, { borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#E5E7EB', paddingTop: 8, marginTop: 4 }]}>
          <Text style={[styles.subtotalLabel, { fontWeight: '800' }, isDark && { color: '#FFFFFF' }]}>{t('cart.total') || 'Total Amount'}</Text>
          <Text style={[styles.subtotalValue, { fontWeight: '900', color: CustomerColors.primary }, isDark && { color: '#2DD4BF' }]}>₹{grandTotal.toLocaleString()}</Text>
        </View>
        {approvedCredit && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : '#F3E8FF',
            borderColor: isDark ? '#7E22CE' : '#D8B4FE',
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
            gap: 8,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#C084FC' : '#7E22CE', flex: 1 }}>
              💳 Store Credit ({approvedCredit.storeName}): Total ₹{(approvedCredit.creditLimit || 0).toLocaleString()} · ₹{(approvedCredit.availableCredit || 0).toLocaleString()} Remaining (₹{Math.max(0, (approvedCredit.creditLimit || 0) - (approvedCredit.availableCredit || 0)).toLocaleString()} used). Choose Credit at Checkout.
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>{t('cart.proceedToCheckout')}</Text>
        </TouchableOpacity>
      </View>

      <AuthRequiredModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={t('cart.loginToCheckout')}
        subtitle={t('cart.loginToCheckoutDesc')}
        onLogin={() => navigation.navigate('LoginRegister')}
      />
    </View>
  );
}

function CartRow({
  item,
  isDark,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  isDark?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const { language } = useTranslation();
  return (
    <View style={[styles.row, { backgroundColor: isDark ? '#111827' : CustomerColors.white, borderColor: isDark ? '#1F2937' : CustomerColors.border }]}>
      <Image
        source={{ uri: resolveImageUrl(item.image) }}
        style={[styles.rowImage, isDark && { backgroundColor: '#1F2937' }]}
      />
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, isDark && { color: '#F9FAFB' }]} numberOfLines={2}>
          {translateProductName(item.title, language)}
        </Text>
        <Text style={styles.rowPrice}>₹{item.price.toLocaleString()}</Text>
        <View style={[styles.qtyStepper, isDark && { borderColor: '#374151' }]}>
          <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
            <Text style={[styles.qtyBtnText, isDark && { color: '#9CA3AF' }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.qtyValue, isDark && { color: '#FFFFFF' }]}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
            <Text style={[styles.qtyBtnText, isDark && { color: '#9CA3AF' }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Trash2 size={16} color={CustomerColors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: CustomerColors.black,
  },
  shopBtn: {
    backgroundColor: CustomerColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  shopBtnText: { color: CustomerColors.white, fontWeight: '700' },
  nudge: {
    backgroundColor: CustomerColors.mint,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  nudgeSuccess: { backgroundColor: CustomerColors.successBg },
  nudgeText: {
    fontSize: FontSizes.xs,
    color: CustomerColors.teal700,
    textAlign: 'center',
    fontWeight: '600',
  },
  nudgeSuccessText: { color: CustomerColors.success },
  list: { padding: Spacing.md },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: CustomerColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rowImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F9F9F9',
  },
  rowInfo: { flex: 1, gap: 4 },
  rowTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  rowPrice: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: CustomerColors.primary,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, color: CustomerColors.textSecondary },
  qtyValue: {
    width: 24,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: FontSizes.xs,
  },
  removeBtn: { justifyContent: 'center', paddingLeft: Spacing.xs },
  footer: {
    borderTopWidth: 1,
    borderTopColor: CustomerColors.border,
    backgroundColor: CustomerColors.white,
    padding: Spacing.md,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  subtotalLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: CustomerColors.black,
  },
  subtotalValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  platformFeeLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: CustomerColors.textSecondary,
  },
  platformFeeValue: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: CustomerColors.textSecondary,
  },
  checkoutBtn: {
    backgroundColor: CustomerColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: CustomerColors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
});
