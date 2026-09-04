import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { productApi, Product, productId, productImage } from '../../api/productApi';
import ProductCard from '../../components/common/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CustomerColors, Spacing, FontSizes } from '../../styles/theme';

// Mirrors web's /bestsellers page — fetches all products sorted by
// bestselling from the product-service via the gateway.

export default function BestSellersScreen() {
  const navigation = useNavigation<any>();
  const { addToCart, setBuyNowItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getProductsViaGateway({
        ownerRole: 'store_owner',
        sort: 'bestselling',
        limit: 10000,
      })
      .then(res => {
        const data = res.data;
        const arr = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];
        setProducts(arr);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CustomerColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.count}>{products.length} products</Text>
      </View>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => productId(item)}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isWished={isWishlisted(productId(item))}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: productId(item),
              })
            }
            onToggleWishlist={() => toggleWishlist(item)}
            onAddToCart={() => {
              addToCart({
                id: productId(item),
                title: item.title,
                price: item.discountedPrice ?? item.price,
                quantity: 1,
                image: productImage(item),
                totalStock: item.totalStock,
              });
              showToast('Added to cart ✓');
            }}
            onBuyNow={() => {
              setBuyNowItem({
                id: productId(item),
                title: item.title,
                price: item.discountedPrice ?? item.price,
                quantity: 1,
                image: productImage(item),
                totalStock: item.totalStock,
              });
              navigation.navigate('Checkout');
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No best sellers found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  count: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary },
  grid: { padding: Spacing.sm },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  empty: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
});
