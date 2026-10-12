import { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';

export interface DeliveryFeeConfig {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

let cachedConfig: DeliveryFeeConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export function getFallbackDeliveryFeeConfig(): DeliveryFeeConfig {
  const envFee = parseFloat(process.env.EXPO_PUBLIC_DELIVERY_FEE || '2');
  const envThreshold = parseFloat(process.env.EXPO_PUBLIC_FREE_DELIVERY_THRESHOLD || '499');

  const deliveryFee = Number.isFinite(envFee) && envFee >= 0 ? envFee : 2;
  const freeDeliveryThreshold = Number.isFinite(envThreshold) && envThreshold >= 0 ? envThreshold : 499;

  return {
    deliveryFee,
    freeDeliveryThreshold,
  };
}

export function computeDeliveryFee(
  subtotal: number = 0,
  deliveryMethod?: string | null,
  config: DeliveryFeeConfig = getFallbackDeliveryFeeConfig()
): number {
  if (deliveryMethod === 'pickup') {
    return 0;
  }
  if (subtotal >= config.freeDeliveryThreshold) {
    return 0;
  }
  return config.deliveryFee;
}

export async function fetchDeliveryFeeConfig(
  subtotal: number = 0,
  deliveryMethod?: string | null
): Promise<DeliveryFeeConfig> {
  const method = deliveryMethod || 'delivery';
  const now = Date.now();
  if (cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const res = await paymentApi.getDeliveryFee(subtotal, method);
    if (res.data?.success) {
      cachedConfig = {
        deliveryFee: Number.isFinite(res.data.deliveryFee) ? Number(res.data.deliveryFee) : 2,
        freeDeliveryThreshold: Number.isFinite(res.data.freeDeliveryThreshold)
          ? Number(res.data.freeDeliveryThreshold)
          : 499,
      };
      lastFetchTime = now;
      return cachedConfig;
    }
  } catch (e) {
    // fallback to env or safe defaults
  }

  return getFallbackDeliveryFeeConfig();
}

export interface UseDeliveryFeeResult {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  isFreeDelivery: boolean;
  remainingForFreeDelivery: number;
}

export function useDeliveryFee(
  subtotal: number = 0,
  deliveryMethod?: string | null
): UseDeliveryFeeResult {
  const [config, setConfig] = useState<DeliveryFeeConfig>(() =>
    cachedConfig || getFallbackDeliveryFeeConfig()
  );

  useEffect(() => {
    let mounted = true;
    fetchDeliveryFeeConfig(subtotal, deliveryMethod).then(cfg => {
      if (mounted) setConfig(cfg);
    });
    return () => {
      mounted = false;
    };
  }, [subtotal, deliveryMethod]);

  const deliveryFee = computeDeliveryFee(subtotal, deliveryMethod, config);
  const remainingForFreeDelivery = Math.max(0, config.freeDeliveryThreshold - subtotal);
  const isFreeDelivery = deliveryFee === 0;

  return {
    deliveryFee,
    freeDeliveryThreshold: config.freeDeliveryThreshold,
    standardDeliveryFee: config.deliveryFee,
    isFreeDelivery,
    remainingForFreeDelivery,
  };
}
