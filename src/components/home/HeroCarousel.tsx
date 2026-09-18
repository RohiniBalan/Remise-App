import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  Path,
  Rect,
  G,
  Ellipse,
} from 'react-native-svg';
import {
  CustomerColors,
  GoldColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Signature Vector Hero Graphic for App ──────────────────────────────────
function HomeHeroMark({ isDark }: { isDark: boolean }) {
  const size = Math.min(SCREEN_W - 48, 260);

  return (
    <View style={styles.graphicContainer}>
      <Svg width={size} height={size} viewBox="0 0 360 360">
        <Defs>
          <LinearGradient id="appHomeRedGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF3333" />
            <Stop offset="1" stopColor="#B30000" />
          </LinearGradient>
          <LinearGradient id="appHomeGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F5D061" />
            <Stop offset="1" stopColor="#D4AF37" />
          </LinearGradient>
          <LinearGradient id="appHomeBagGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF4D4D" />
            <Stop offset="1" stopColor="#CC0000" />
          </LinearGradient>
          <RadialGradient id="appHomeOrbGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FF4D4D" stopOpacity={isDark ? "0.25" : "0.18"} />
            <Stop offset="0.6" stopColor="#D4AF37" stopOpacity={isDark ? "0.12" : "0.08"} />
            <Stop offset="1" stopColor="#FF0000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient background glow circle */}
        <Circle cx="180" cy="180" r="155" fill="url(#appHomeOrbGrad)" />

        {/* Orbit ring with dashes */}
        <Circle
          cx="180"
          cy="180"
          r="135"
          fill="none"
          stroke="url(#appHomeRedGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          opacity={isDark ? 0.45 : 0.35}
        />

        {/* Inner glow circle */}
        <Circle
          cx="180"
          cy="180"
          r="105"
          fill="url(#appHomeRedGrad)"
          opacity={isDark ? 0.08 : 0.05}
        />

        {/* ── Central Shopping Bag Composition ── */}
        {/* Shadow base */}
        <Ellipse cx="180" cy="268" rx="80" ry="12" fill={isDark ? "#000" : "#991B1B"} opacity={0.18} />

        {/* Shopping bag body */}
        <Path
          d="M125 155 L235 155 L225 260 C224 264 220 268 215 268 L145 268 C140 268 136 264 135 260 Z"
          fill="url(#appHomeBagGrad)"
        />

        {/* Bag rim / fold */}
        <Rect x="120" y="148" width="120" height="12" rx="4" fill="#E60000" />

        {/* Bag handles */}
        <Path
          d="M150 148 C150 115, 210 115, 210 148"
          fill="none"
          stroke="url(#appHomeGoldGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Remise Logo emblem on bag */}
        <Circle cx="180" cy="210" r="24" fill={isDark ? "#0A0A0A" : "#FFFFFF"} />
        {/* Red lock icon in center */}
        <Rect x="171" y="206" width="18" height="14" rx="3" fill="#FF0000" />
        <Path
          d="M174 206 V201 C174 197, 186 197, 186 201 V206"
          fill="none"
          stroke="#FF0000"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── Floating Store Pin badge (Top Right) ── */}
        <G transform="translate(235, 75)">
          <Circle cx="28" cy="28" r="28" fill={isDark ? "#1E293B" : "#FFFFFF"} />
          <Circle cx="28" cy="28" r="28" fill="none" stroke="url(#appHomeRedGrad)" strokeWidth="1.5" opacity={0.4} />
          {/* Location Pin */}
          <Path
            d="M28 14 C21.4 14 16 19.4 16 26 C16 34 28 44 28 44 C28 44 40 34 40 26 C40 19.4 34.6 14 28 14 Z"
            fill="url(#appHomeRedGrad)"
          />
          <Circle cx="28" cy="24" r="4.5" fill="#FFFFFF" />
        </G>

        {/* ── Floating Fresh Groceries Badge (Top Left) ── */}
        <G transform="translate(48, 95)">
          <Circle cx="26" cy="26" r="26" fill={isDark ? "#1E293B" : "#FFFFFF"} />
          <Circle cx="26" cy="26" r="26" fill="none" stroke="#10B981" strokeWidth="1.5" opacity={0.5} />
          {/* Leaf / Apple Icon */}
          <Path
            d="M26 18 C20 18 16 23 16 29 C16 36 22 39 26 39 C30 39 36 36 36 29 C36 23 32 18 26 18 Z"
            fill="#10B981"
          />
          <Path
            d="M26 15 C26 15 28 12 32 13"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>

        {/* ── Floating Express Delivery Badge (Bottom Left) ── */}
        <G transform="translate(42, 230)">
          <Circle cx="26" cy="26" r="26" fill={isDark ? "#1E293B" : "#FFFFFF"} />
          <Circle cx="26" cy="26" r="26" fill="none" stroke="url(#appHomeGoldGrad)" strokeWidth="1.5" opacity={0.6} />
          {/* Fast Delivery Zap */}
          <Path
            d="M17 28 L30 18 L26 27 L35 27 L22 37 L25 29 Z"
            fill="url(#appHomeGoldGrad)"
          />
        </G>

        {/* ── Floating Beauty / Cosmetics Badge (Bottom Right) ── */}
        <G transform="translate(245, 220)">
          <Circle cx="26" cy="26" r="26" fill={isDark ? "#1E293B" : "#FFFFFF"} />
          <Circle cx="26" cy="26" r="26" fill="none" stroke="#EC4899" strokeWidth="1.5" opacity={0.5} />
          {/* Star / Sparkle */}
          <Path
            d="M26 17 L28.5 23.5 L35 26 L28.5 28.5 L26 35 L23.5 28.5 L17 26 L23.5 23.5 Z"
            fill="#EC4899"
          />
        </G>

        {/* Small sparkle dots */}
        <Circle cx="115" cy="80" r="3" fill="#D4AF37" />
        <Circle cx="280" cy="170" r="2.5" fill="#FF4D4D" />
        <Circle cx="95" cy="205" r="2" fill="#10B981" />
        <Circle cx="240" cy="300" r="3" fill="#D4AF37" />
      </Svg>
    </View>
  );
}

interface HeroCarouselProps {
  onShopNow?: () => void;
}

export default function HeroCarousel({ onShopNow }: HeroCarouselProps) {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Eyebrow Badge */}
      <View style={styles.eyebrowWrap}>
        <View style={[styles.eyebrowBadge, isDark && styles.eyebrowBadgeDark]}>
          <View style={styles.eyebrowDot} />
          <Text style={[styles.eyebrowText, isDark && styles.eyebrowTextDark]}>
            YOUR EVERYDAY LIFESTYLE STORE
          </Text>
        </View>
      </View>

      {/* Main Title */}
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Everything You{' '}
        <Text style={styles.titleAccent}>Need, Delivered.</Text>
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        From fresh groceries and beauty essentials to toys, fashion &amp; home —
        all in one place, right at your doorstep.
      </Text>

      {/* Graphic Illustration */}
      <HomeHeroMark isDark={isDark} />

      {/* Action Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (onShopNow) {
              onShopNow();
            } else {
              navigation.navigate('Categories');
            }
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>Shop Now</Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]}
          onPress={() => navigation.navigate('Categories')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>
            Browse Categories
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF9EE',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8D2',
  },
  containerDark: {
    backgroundColor: '#111827',
    borderBottomColor: '#1F2937',
  },
  eyebrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  eyebrowBadgeDark: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C701C',
    letterSpacing: 0.8,
  },
  eyebrowTextDark: {
    color: '#F5D061',
  },
  title: {
    fontSize: FontSizes.xl + 4,
    fontWeight: '900',
    color: CustomerColors.black,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  titleAccent: {
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: '#4B5563',
    lineHeight: 21,
    marginBottom: Spacing.md,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: CustomerColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '800',
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#374151',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  secondaryBtnTextDark: {
    color: '#E5E7EB',
  },
});