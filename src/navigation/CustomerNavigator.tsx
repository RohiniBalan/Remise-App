import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid, ClipboardList, MapPin, Heart, ShoppingCart, Package, User } from 'lucide-react-native';
import PlaceholderScreen from '../screens/common/PlaceholderScreen';
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import CategoryScreen from '../screens/customer/CategoryScreen';
import CategoryGridScreen from '../screens/customer/CategoryGridScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import BestSellersScreen from '../screens/customer/BestSellersScreen';
import NewArrivalsScreen from '../screens/customer/NewArrivalsScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import PhonePeWebViewScreen from '../screens/customer/PhonePeWebViewScreen';
import RazorpayWebViewScreen from '../screens/customer/RazorpayWebViewScreen';
import PaymentStatusScreen from '../screens/customer/PaymentStatusScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import BulkPurchaseScreen from '../screens/customer/BulkPurchaseScreen';
import CompareStoresScreen from '../screens/customer/CompareStoresScreen';
import NearbyOffersScreen from '../screens/customer/NearbyOffersScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import AboutScreen from '../screens/customer/AboutScreen';
import ServicesScreen from '../screens/customer/ServicesScreen';
import TestimonialsScreen from '../screens/customer/TestimonialsScreen';
import StoreRegisterScreen from '../screens/customer/StoreRegisterScreen';
import SuppliersScreen from '../screens/customer/SuppliersScreen';
import MyOffersScreen from '../screens/customer/MyOffersScreen';
import HelpCenterScreen from '../screens/customer/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/customer/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/customer/TermsOfServiceScreen';
import SitemapScreen from '../screens/customer/SitemapScreen';
import WishlistScreen from '../screens/customer/WishlistScreen';
import ReturnsRefundsScreen from '../screens/customer/ReturnsRefundsScreen';
import CareersScreen from '../screens/customer/CareersScreen';
import BlogScreen from '../screens/customer/BlogScreen';
import PressScreen from '../screens/customer/PressScreen';
import { SmartOrderCartItem } from '../api/smartOrderApi';
import { CustomerColors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export type CustomerTabParamList = {
  Home: undefined;
  Categories: undefined;
  BulkPurchase: undefined;
  Nearby: undefined;
  Wishlist: undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
  Suppliers?: undefined;
};

export type CategoriesStackParamList = {
  CategoryGrid: undefined;
  CategoryProducts: { category?: string } | undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  PhonePeWebView: { payUrl: string };
  RazorpayWebView: { options: any; orderId: string };
  PaymentStatus: { orderId: string; status?: string };
  Settings: undefined;
  Profile: undefined;
  About: undefined;
  Services: undefined;
  Testimonials: undefined;
  StoreRegister: undefined;
  CompareStores: { items: SmartOrderCartItem[]; purchaseType?: 'bulk' | 'home_seller'; onSuccess?: () => void };
  BulkPurchase: undefined;
  Nearby: undefined;

  Notifications: undefined;
  Suppliers: undefined;
  MyOffers: undefined;
  BestSellers: undefined;
  NewArrivals: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  TermsOfUse: undefined;
  TermsOfService: undefined;
  Sitemap: undefined;
  Wishlist: undefined;
  LoginRegister: undefined;
  Returns: undefined;
  ReturnsRefunds: undefined;
  Careers: undefined;
  Blog: undefined;
  BlogNews: undefined;
  Press: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();

// Nested stack inside the Categories tab — keeps the bottom tab bar visible
// when navigating from the category grid to the product listing.
function CategoriesNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={{ headerShown: false }}>
      <CategoriesStack.Screen name="CategoryGrid" component={CategoryGridScreen} />
      <CategoriesStack.Screen
        name="CategoryProducts"
        component={CategoryScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.category || 'Products',
        })}
      />
    </CategoriesStack.Navigator>
  );
}

function CustomerTabs() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CustomerColors.primary,
        tabBarInactiveTintColor: CustomerColors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          paddingHorizontal: 1,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesNavigator}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="BulkPurchase"
        component={BulkPurchaseScreen}
        options={{
          tabBarLabel: 'Bulk',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyOffersScreen}
        options={{
          tabBarLabel: 'Nearby',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={20} />,
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: CustomerColors.primary,
            fontSize: 9,
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <Package color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={20} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: CustomerColors.primary,
            fontSize: 9,
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: user ? 'Profile' : 'Account',
          tabBarIcon: ({ color, size, focused }) => {
            if (user) {
              const initials = (user.fullname || user.name || user.email || 'U')
                .trim()
                .slice(0, 2)
                .toUpperCase();
              return (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: focused ? CustomerColors.primary : '#E2E8F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: '800',
                      color: focused ? '#FFFFFF' : CustomerColors.textSecondary,
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              );
            }
            return <User color={color} size={20} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: 'Product' }} />
      <Stack.Screen name="BestSellers" component={BestSellersScreen} options={{ headerShown: true, title: 'Best Sellers' }} />
      <Stack.Screen name="NewArrivals" component={NewArrivalsScreen} options={{ headerShown: true, title: 'New Arrivals' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Your Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true }} />
      <Stack.Screen name="PhonePeWebView" component={PhonePeWebViewScreen} options={{ headerShown: true, title: 'PhonePe' }} />
      <Stack.Screen name="RazorpayWebView" component={RazorpayWebViewScreen} options={{ headerShown: true, title: 'Razorpay Checkout', headerStyle: { backgroundColor: '#0a0a0a' }, headerTintColor: '#D4AF37' }} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: true, title: 'About Us' }} />
      <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: true, title: 'Our Services' }} />
      <Stack.Screen name="Testimonials" component={TestimonialsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} options={{ headerShown: true, title: 'Register Your Store' }} />
      <Stack.Screen name="CompareStores" component={CompareStoresScreen} options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="BulkPurchase" component={BulkPurchaseScreen} options={{ headerShown: true, title: 'Bulk Purchase' }} />
      <Stack.Screen name="Nearby" component={NearbyOffersScreen} options={{ headerShown: true, title: 'Nearby Offers' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Suppliers" component={SuppliersScreen} options={{ headerShown: true, title: 'Suppliers' }} />
      <Stack.Screen name="MyOffers" component={MyOffersScreen} options={{ headerShown: true, title: 'My Offers' }} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
      <Stack.Screen name="TermsOfUse" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Use' }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
      <Stack.Screen name="Sitemap" component={SitemapScreen} options={{ headerShown: true, title: 'Sitemap' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ headerShown: true, title: 'My Wishlist' }} />
      <Stack.Screen name="Returns" component={ReturnsRefundsScreen} options={{ headerShown: true, title: 'Returns & Refunds' }} />
      <Stack.Screen name="ReturnsRefunds" component={ReturnsRefundsScreen} options={{ headerShown: true, title: 'Returns & Refunds' }} />
      <Stack.Screen name="Careers" component={CareersScreen} options={{ headerShown: true, title: 'Careers' }} />
      <Stack.Screen name="Blog" component={BlogScreen} options={{ headerShown: true, title: 'Blogs & News' }} />
      <Stack.Screen name="BlogNews" component={BlogScreen} options={{ headerShown: true, title: 'Blogs & News' }} />
      <Stack.Screen name="Press" component={PressScreen} options={{ headerShown: true, title: 'Press' }} />
      <Stack.Screen
        name="LoginRegister"
        component={LoginRegisterScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}