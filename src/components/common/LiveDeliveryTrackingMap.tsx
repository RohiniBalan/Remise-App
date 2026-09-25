import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {
  Bike,
  Navigation,
  MapPin,
  Store,
  Phone,
  Compass,
  Zap,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from 'lucide-react-native';
import { CustomerColors, BorderRadius, FontSizes } from '../../styles/theme';

interface DriverInfo {
  name?: string;
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  rating?: number | string;
  location?: { lat: number; lng: number };
  coordinates?: [number, number];
}

interface LiveDeliveryTrackingMapProps {
  orderId: string;
  deliveryStatus: string;
  driver?: DriverInfo;
  storeName?: string;
  storeAddress?: string;
  customerName?: string;
  customerAddress?: string;
  isStoreOwner?: boolean;
  isDark?: boolean;
}

export default function LiveDeliveryTrackingMap({
  orderId,
  deliveryStatus,
  driver,
  storeName = 'Store',
  storeAddress = 'Store Location',
  customerName = 'Customer',
  customerAddress = 'Delivery Address',
  isStoreOwner = false,
  isDark = false,
}: LiveDeliveryTrackingMapProps) {
  // Mode detection:
  // - If isStoreOwner or status is "Going to Store" / "Accepted" / "Assigned" -> Partner heading to Store
  // - If status is "Out for Delivery" / "Picked Up" -> Partner heading to Customer Doorstep
  const isHeadingToStore =
    deliveryStatus === 'Going to Store' ||
    deliveryStatus === 'Accepted' ||
    deliveryStatus === 'Assigned' ||
    (isStoreOwner && deliveryStatus !== 'Out for Delivery');

  const [progress, setProgress] = useState(0.35);
  const [driverSpeed, setDriverSpeed] = useState(26);
  const [etaMinutes, setEtaMinutes] = useState(isHeadingToStore ? 4 : 11);
  const [distanceKm, setDistanceKm] = useState(isHeadingToStore ? 1.2 : 2.5);
  const [zoom, setZoom] = useState(1);

  // Pulse animation for radar
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // Telemetry simulation update every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.015;
        return next >= 0.95 ? 0.95 : next;
      });
      setDriverSpeed(Math.floor(22 + Math.random() * 12));
      setDistanceKm(prev => Math.max(0.2, Number((prev - 0.03).toFixed(1))));
      setEtaMinutes(prev => (prev > 1 ? Math.round(prev - 0.1) : 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // SVG Canvas dimensions: 400 x 240
  const storePoint = { x: 110, y: 170 };
  const customerPoint = { x: 310, y: 65 };

  const getDriverCoordinates = () => {
    if (isHeadingToStore) {
      const startX = 45;
      const startY = 75;
      const t = progress;
      const curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * 70 + t * t * storePoint.x;
      const curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * 150 + t * t * storePoint.y;
      return { x: curX, y: curY };
    } else {
      const t = progress;
      const curX = (1 - t) * (1 - t) * storePoint.x + 2 * (1 - t) * t * 205 + t * t * customerPoint.x;
      const curY = (1 - t) * (1 - t) * storePoint.y + 2 * (1 - t) * t * 140 + t * t * customerPoint.y;
      return { x: curX, y: curY };
    }
  };

  const driverPos = getDriverCoordinates();
  const driverPhone = driver?.phone || '';
  const driverName = driver?.name || 'Delivery Partner';
  const vehicle = driver?.vehicleType || 'Bike';
  const vehicleNo = driver?.vehicleNumber || 'TN-38-AX-9921';

  const handleCall = () => {
    if (!driverPhone) return;
    Linking.openURL(`tel:${driverPhone}`);
  };

  const handleOpenRoute = () => {
    const origin = encodeURIComponent(storeAddress || 'Store Location');
    const destination = encodeURIComponent(customerAddress || 'Customer Address');
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#090D16' : '#0B1520',
          borderColor: isDark ? '#1E293B' : '#1E3A5F',
        },
      ]}
    >
      {/* ── TOP HUD HEADER ── */}
      <View style={styles.topHud}>
        <View style={styles.topHudLeft}>
          <View style={styles.bikeIconBox}>
            <Bike size={16} color="#2DD4BF" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.stageTitle}>
                {isHeadingToStore
                  ? 'Heading to Store'
                  : 'On the Way to Doorstep'}
              </Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE GPS</Text>
              </View>
            </View>
            <Text style={styles.telemetryText}>
              ETA: <Text style={styles.boldText}>~{etaMinutes} mins</Text> ·{' '}
              {distanceKm} km ·{' '}
              <Text style={{ color: '#2DD4BF', fontWeight: '700' }}>
                {driverSpeed} km/h
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.topHudRight}>
          <TouchableOpacity style={styles.routeBtn} onPress={handleOpenRoute}>
            <Navigation size={12} color="#E2E8F0" />
            <Text style={styles.routeBtnText}>Route</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── VECTOR STREET MAP CANVAS ── */}
      <View style={[styles.mapCanvasWrap, { transform: [{ scale: zoom }] }]}>
        <Svg viewBox="0 0 400 240" style={styles.svgCanvas}>
          <Defs>
            <LinearGradient id="appRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#06B6D4" />
              <Stop offset="50%" stopColor="#14B8A6" />
              <Stop offset="100%" stopColor="#10B981" />
            </LinearGradient>
            <RadialGradient id="appRadar" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.7" />
              <Stop offset="60%" stopColor="#14B8A6" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Background Street Grid */}
          <Path d="M 0 60 L 400 60" stroke="#132A3A" strokeWidth="3" />
          <Path d="M 0 160 L 400 160" stroke="#132A3A" strokeWidth="3" />
          <Path d="M 80 0 L 80 240" stroke="#132A3A" strokeWidth="3" />
          <Path d="M 230 0 L 230 240" stroke="#132A3A" strokeWidth="3" />
          <Path d="M 340 0 L 340 240" stroke="#132A3A" strokeWidth="2.5" />
          <Path d="M 20 220 Q 150 120 380 190" stroke="#153244" strokeWidth="3" fill="none" />

          {/* Active Delivery Route Path */}
          {isHeadingToStore ? (
            <>
              <Path
                d={`M 45 75 Q 70 150 ${storePoint.x} ${storePoint.y}`}
                stroke="#14B8A6"
                strokeWidth="8"
                strokeOpacity="0.2"
                fill="none"
              />
              <Path
                d={`M 45 75 Q 70 150 ${storePoint.x} ${storePoint.y}`}
                stroke="url(#appRouteGrad)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
                fill="none"
              />
            </>
          ) : (
            <>
              <Path
                d={`M ${storePoint.x} ${storePoint.y} Q 205 140 ${customerPoint.x} ${customerPoint.y}`}
                stroke="#22D3EE"
                strokeWidth="9"
                strokeOpacity="0.2"
                fill="none"
              />
              <Path
                d={`M ${storePoint.x} ${storePoint.y} Q 205 140 ${customerPoint.x} ${customerPoint.y}`}
                stroke="url(#appRouteGrad)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
                fill="none"
              />
            </>
          )}

          {/* ── STORE PICKUP PIN ── */}
          <G x={storePoint.x} y={storePoint.y}>
            <Circle r="13" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="2" />
            <SvgText
              y="3"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="bold"
            >
              🏪
            </SvgText>
            <G y="16">
              <Rect x="-35" y="-7" width="70" height="14" rx="7" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
              <SvgText x="0" y="3" textAnchor="middle" fill="#93C5FD" fontSize="7" fontWeight="bold">
                Pickup Store
              </SvgText>
            </G>
          </G>

          {/* ── CUSTOMER DOORSTEP PIN ── */}
          {!isHeadingToStore && (
            <G x={customerPoint.x} y={customerPoint.y}>
              <Circle r="14" fill="#047857" stroke="#34D399" strokeWidth="2" />
              <SvgText
                y="3"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
              >
                🏠
              </SvgText>
              <G y="16">
                <Rect x="-36" y="-7" width="72" height="14" rx="7" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
                <SvgText x="0" y="3" textAnchor="middle" fill="#6EE7B7" fontSize="7" fontWeight="bold">
                  Your Doorstep
                </SvgText>
              </G>
            </G>
          )}

          {/* ── LIVE DRIVER RADAR & BIKE MARKER ── */}
          <G x={driverPos.x} y={driverPos.y}>
            <Circle r="24" fill="url(#appRadar)" />
            <Circle r="11" fill="#0D9488" stroke="#5EEAD4" strokeWidth="2.5" />
            <SvgText
              y="3"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="bold"
            >
              🛵
            </SvgText>
            <G y="-17">
              <Rect x="-30" y="-6" width="60" height="12" rx="6" fill="#042F2E" stroke="#2DD4BF" strokeWidth="1" />
              <SvgText x="0" y="3" textAnchor="middle" fill="#CCFBF1" fontSize="6.5" fontWeight="bold">
                {driverName.split(' ')[0]}
              </SvgText>
            </G>
          </G>
        </Svg>
      </View>

      {/* ── BOTTOM DRIVER & DESTINATION FOOTER ── */}
      <View style={styles.bottomHud}>
        <View style={styles.driverInfoRow}>
          <View style={styles.driverAvatar}>
            <Text style={styles.avatarText}>{driverName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.driverNameText}>{driverName}</Text>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>★ {driver?.rating || '4.9'}</Text>
              </View>
            </View>
            <Text style={styles.vehicleText}>
              {vehicle} · {vehicleNo}
            </Text>
          </View>
        </View>

        {driverPhone ? (
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Phone size={12} color="#FFFFFF" />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(7, 13, 22, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 95, 0.5)',
    zIndex: 10,
  },
  topHudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bikeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  stageTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2DD4BF',
    textTransform: 'uppercase',
  },
  liveBadge: {
    backgroundColor: '#042F2E',
    borderWidth: 1,
    borderColor: '#14B8A6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  liveBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#5EEAD4',
  },
  telemetryText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topHudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  mapCanvasWrap: {
    width: '100%',
    height: 200,
    backgroundColor: '#071018',
  },
  svgCanvas: {
    width: '100%',
    height: '100%',
  },
  bottomHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(7, 13, 22, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 58, 95, 0.5)',
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  driverNameText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  ratingPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FBBF24',
  },
  vehicleText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});
