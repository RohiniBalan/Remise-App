import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

interface RemiseLoadingProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RemiseLoading({
  message = 'Loading...',
  subMessage,
  fullscreen = false,
  size = 'md',
}: RemiseLoadingProps) {
  const { isDark } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pulse animation for logo ring
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Text shimmer/fade animation
    const fade = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    fade.start();

    return () => {
      pulse.stop();
      fade.stop();
    };
  }, [pulseAnim, fadeAnim]);

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const circleSize = isSm ? 44 : isLg ? 72 : 56;
  const fontSize = isSm ? FontSizes.md : isLg ? FontSizes.xxl : FontSizes.xl;

  const content = (
    <View style={[styles.innerContainer, fullscreen && styles.fullscreenInner]}>
      {/* Outer Pulse Ring & Icon */}
      <View style={{ width: circleSize + 20, height: circleSize + 20, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm }}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: circleSize + 16,
              height: circleSize + 16,
              borderRadius: (circleSize + 16) / 2,
              backgroundColor: isDark ? 'rgba(45, 212, 191, 0.15)' : 'rgba(13, 148, 136, 0.12)',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View
          style={[
            styles.circle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#2DD4BF' : CustomerColors.teal600,
            },
          ]}
        >
          <ActivityIndicator
            size={isSm ? 'small' : 'small'}
            color={isDark ? '#2DD4BF' : CustomerColors.teal600}
            style={styles.spinner}
          />
          <Text
            style={[
              styles.lettermark,
              {
                fontSize: isSm ? 16 : isLg ? 26 : 20,
                color: isDark ? '#2DD4BF' : CustomerColors.teal700,
              },
            ]}
          >
            R
          </Text>
        </View>
      </View>

      {/* Brand Text: Remise */}
      <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text
          style={[
            styles.brandText,
            {
              fontSize,
              color: isDark ? '#2DD4BF' : CustomerColors.teal700,
            },
          ]}
        >
          Remise
        </Text>
      </Animated.View>

      {/* Message */}
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
            backgroundColor: isDark ? '#111827' : '#F9FAFB',
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
  pulseRing: {
    position: 'absolute',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spinner: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lettermark: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  message: {
    marginTop: 6,
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
