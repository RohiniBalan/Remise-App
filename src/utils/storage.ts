import AsyncStorage from '@react-native-async-storage/async-storage';

// Mirrors the web app's localStorage keys exactly (see AuthContext.js,
// CartContext.tsx, NavbarHome.tsx). Same key names, same JSON shapes —
// only the underlying storage engine changes (AsyncStorage vs localStorage).
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  // Legacy fallback key some web flows read defensively
  // (`localStorage.getItem('token') || localStorage.getItem('accessToken')`);
  // web never writes it, only clears it. Kept here purely so a stale value
  // from an older build of this app is cleaned up the same way.
  ACCESS_TOKEN: 'accessToken',
} as const;

export interface StoredUser {
  _id: string;
  fullname?: string;
  name?: string;
  email: string;
  mobilenumber?: string;
  role: 'user' | 'customer' | 'store_owner' | 'admin' | 'whole_saler' | 'wholesaler' | 'home_business';
  isEmailVerified?: boolean;
  avatar?: string;
  dob?: string;
  gender?: string;
  profileData?: Record<string, unknown>;
}


async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Non-JSON values (plain token string) are returned as-is.
    return raw as unknown as T;
  }
}

async function setItem(key: string, value: unknown): Promise<void> {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  await AsyncStorage.setItem(key, raw);
}

async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const storage = {
  getToken: () => AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
  setToken: (token: string) => AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
  removeToken: () => AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),

  getUser: () => getItem<StoredUser>(STORAGE_KEYS.USER),
  setUser: (user: StoredUser) => setItem(STORAGE_KEYS.USER, user),
  removeUser: () => removeItem(STORAGE_KEYS.USER),

  getCart: <T>() => getItem<T>(STORAGE_KEYS.CART),
  setCart: (cart: unknown) => setItem(STORAGE_KEYS.CART, cart),
  removeCart: () => removeItem(STORAGE_KEYS.CART),

  getTheme: () => AsyncStorage.getItem(STORAGE_KEYS.THEME),
  setTheme: (theme: 'dark' | 'light') => AsyncStorage.setItem(STORAGE_KEYS.THEME, theme),

  // Matches web's cleanup-only handling of the legacy key.
  clearLegacyAccessToken: () => AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
};
