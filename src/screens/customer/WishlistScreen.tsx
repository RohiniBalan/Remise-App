import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../../components/common/BrandHeader';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius, Shadows } from '../../styles/theme';

export default function WishlistScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: 1,
      image: item.image,
      totalStock: item.totalStock,
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ShoppingBag size={24} color="#9CA3AF" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>₹{item.price}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <ShoppingBag size={14} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeFromWishlist(item.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={CustomerColors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (wishlist.length === 0) {
    return (
      <View style={styles.container}>
        <BrandHeader />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Heart size={36} color={CustomerColors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save items you love by tapping the heart icon on any product card.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>Explore Products</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BrandHeader />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </Text>
      </View>
      <FlatList
        data={wishlist}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  imageWrap: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    fontWeight: '800',
    color: CustomerColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  price: {
    fontSize: FontSizes.base,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CustomerColors.primary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  addToCartText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  removeBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#F8FAFC',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSizes.sm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: CustomerColors.primary,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  exploreBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
