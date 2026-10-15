import { TranslationSchema } from '../types';
import { common } from './common';
import { auth } from './auth';
import { products } from './products';
import { cart } from './cart';
import { checkout } from './checkout';
import { orders } from './orders';
import { store } from './store';
import { delivery } from './delivery';
import { offers } from './offers';
import { settings } from './settings';
import { profile } from './profile';
import { wishlist } from './wishlist';
import { notifications } from './notifications';

export const te: TranslationSchema = {
  common,
  auth,
  products,
  cart,
  checkout,
  orders,
  store,
  delivery,
  offers,
  settings,
  profile,
  wishlist,
  notifications,
};
