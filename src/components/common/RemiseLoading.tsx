import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Store } from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

interface RemiseLoadingProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RemiseLoading({
  message,
  subMessage,
  fullscreen = false,
  size = 'md',
}: RemiseLoadingProps) {
  const { isDark } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const trackWidth = isSm ? 100 : isLg ? 160 : 130;
  const barWidth = trackWidth * 0.4;
  const iconSize = isSm ? 28 : isLg ? 48 : 38;
  const fontSize = isSm ? FontSizes.lg : isLg ? 30 : FontSizes.xxl;

  useEffect(() => {
    // Pulse animation for the store icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous left-to-right line loading animation
    const lineSlide = Animated.loop(
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );

    pulse.start();
    lineSlide.start();

    return () => {
      pulse.stop();
      lineSlide.stop();
    };
  }, [pulseAnim, lineAnim]);

  const translateX = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-barWidth, trackWidth],
  });

  const content = (
    <View style={[styles.innerContainer, fullscreen && styles.fullscreenInner]}>
      {/* ── 1. Store Icon in Website's Color (#FF0000) ─────────────── */}
      <Animated.View
        style={[
          styles.iconWrap,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Store size={iconSize} color={CustomerColors.primary} />
      </Animated.View>

      {/* ── 2. Remise Text in Same Color (#FF0000) ─────────────────── */}
      <Text style={[styles.brandText, { fontSize, color: CustomerColors.primary }]}>
        Remise
      </Text>

      {/* ── 3. Line Loading in Same Color (#FF0000) ────────────────── */}
      <View
        style={[
          styles.track,
          {
            width: trackWidth,
            backgroundColor: isDark ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 0, 0, 0.12)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.activeBar,
            {
              width: barWidth,
              backgroundColor: CustomerColors.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>

      {/* ── Optional Message & SubMessage ──────────────────────────── */}
      {message ? (
        <Text
          style={[
            styles.message,
            {
              fontSize: isSm ? 11 : isLg ? FontSizes.sm : FontSizes.xs,
              color: isDark ? '#9CA3AF' : '#6B7280',
            },
          ]}
        >
          {message}
        </Text>
      ) : null}

      {subMessage ? (
        <Text
          style={[
            styles.subMessage,
            {
              color: isDark ? '#6B7280' : '#9CA3AF',
            },
          ]}
        >
          {subMessage}
        </Text>
      ) : null}
    </View>
  );

  if (fullscreen) {
    return (
      <View
        style={[
          styles.fullscreenContainer,
          {
            backgroundColor: isDark ? '#0B0E14' : '#FFFFFF',
          },
        ]}
      >
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fullscreenInner: {
    paddingBottom: Spacing.xxl,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  brandText: {
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  track: {
    height: 3.5,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  activeBar: {
    height: '100%',
    borderRadius: 2,
  },
  message: {
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
    maxWidth: 240,
  },
});
