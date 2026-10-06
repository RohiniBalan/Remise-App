import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, X } from 'lucide-react-native';

export interface BannerData {
  title: string;
  body: string;
  url?: string;
  type?: string;
  orderId?: string;
  storeId?: string;
}

interface InAppNotificationBannerProps {
  notification: BannerData | null;
  onPress: (data: BannerData) => void;
  onDismiss: () => void;
}

export default function InAppNotificationBanner({
  notification,
  onPress,
  onDismiss,
}: InAppNotificationBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notification) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 12,
      }).start();

      timeoutRef.current = setTimeout(() => {
        dismiss();
      }, 5000);
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [notification]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 6, 12),
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.contentCard}
        onPress={() => {
          dismiss();
          onPress(notification);
        }}
      >
        <View style={styles.iconContainer}>
          <Bell size={20} color="#FFFFFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.bodyText} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          accessibilityLabel="Dismiss banner"
        >
          <X size={16} color="#A0AEC0" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  contentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  closeButton: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
