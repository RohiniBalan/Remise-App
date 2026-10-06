import { TranslationSchema } from '../types';

export const cart: TranslationSchema['cart'] = {
  yourCart: 'Your Cart',
  cartEmpty: 'Your Cart is Empty',
  cartEmptyDesc: 'Looks like you have not added anything to your cart yet.',
  startShopping: 'Start Shopping',
  itemCount: '{{count}} items',
  subtotal: 'Subtotal',
  deliveryFee: 'Delivery Fee',
  freeDeliveryNudge: 'Add ₹{{amount}} more to get FREE delivery!',
  totalAmount: 'Total Amount',
  proceedToCheckout: 'Proceed to Checkout',
  clearCart: 'Clear Cart',
  removeConfirm: 'Are you sure you want to remove this item?',
  itemRemoved: 'Item removed from cart',
  moveToWishlist: 'Move to Wishlist',
};
