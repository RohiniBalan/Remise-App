// Consolidated design tokens for Remise mobile.
// The web app has NO central theme file — every page hardcodes these hex
// values individually (verified across NavbarHome, CartDrawer, bulk-purchase,
// nearby, store/dashboard, register, admin/layout/Layout.css). This file is
// the single source of truth the mobile app uses instead, split by the two
// visually-distinct chrome identities that already exist on web: the
// customer/store-owner app (red/teal/mint) and the admin CMS (Crisp Indigo).

export const CustomerColors = {
  primary: '#FF0000',
  primaryHover: '#e00000',
  primaryLight: '#ff6666',
  teal: '#0FA3B1',
  teal600: '#0d9488',
  teal700: '#0f766e',
  mint: '#DFF1F1',
  steelBorder: '#BBD5DA',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  black: '#111827',
  textSecondary: '#6B7280',
  border: '#EAEAEA',
  success: '#16A34A',
  successBg: '#F0FDF4',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  warning: '#D97706',
  warningBg: '#FFFBEB',
};

// Reserved for About / Testimonials / Services screens, matching those
// web pages' distinct gold/premium treatment.
export const GoldColors = {
  gold: '#D4AF37',
  goldMuted: '#C9A84C',
  goldDark: '#B8860B',
  goldLight: '#E2BE6A',
  cream: '#F0EAD6',
};

// Admin CMS chrome — ported from client/app/admin/layout/Layout.css's
// "Crisp Indigo" custom-property palette. Deliberately distinct from the
// Customer/Store Owner palette above, matching the web admin's own
// separate visual identity (never shared, per plan).
export const AdminColors = {
  primary: '#4338ca',
  primaryLight: '#e0e7ff',
  gradientStart: '#4f46e5',
  gradientEnd: '#4338ca',
  bg: '#f8fafc',
  sidebarBg: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

// Customer/Store Owner screens use Inter; Admin screens use Plus Jakarta
// Sans — matching the two distinct font choices found on web (next/font
// Inter at the root layout vs. the Google-Fonts @import inside Layout.css).
// Actual .ttf assets + native linking are a follow-up task; until then these
// family names fall back to each platform's system font.
export const Fonts = {
  customer: 'Inter',
  admin: 'PlusJakartaSans',
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};
