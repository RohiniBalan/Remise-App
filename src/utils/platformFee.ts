import { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';

export interface PlatformFeeConfig {
  enabled: boolean;
  type: 'fixed' | 'percentage';
  value: number;
  platformFee: number;
}

let cachedConfig: PlatformFeeConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export function getFallbackPlatformFee(subtotal: number = 0): number {
  const envVal = parseFloat(process.env.EXPO_PUBLIC_PLATFORM_COMMISSION_VALUE || '0');
  const envType = (process.env.EXPO_PUBLIC_PLATFORM_COMMISSION_TYPE || 'fixed').toLowerCase();
  const value = Number.isFinite(envVal) && envVal >= 0 ? envVal : 0;

  if (envType === 'percentage') {
    return subtotal > 0 ? Math.round(subtotal * (value / 100)) : 0;
  }
  return value;
}

export async function fetchPlatformFee(subtotal: number = 0): Promise<number> {
  const now = Date.now();
  if (cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    if (cachedConfig.type === 'percentage') {
      return subtotal > 0 ? Math.round(subtotal * (cachedConfig.value / 100)) : 0;
    }
    return cachedConfig.platformFee;
  }

  try {
    const res = await paymentApi.getPlatformFee(subtotal);
    if (res.data?.success) {
      cachedConfig = {
        enabled: Boolean(res.data.enabled),
        type: res.data.type || 'fixed',
        value: Number(res.data.value || 0),
        platformFee: Number(res.data.platformFee || 0),
      };
      lastFetchTime = now;
      return cachedConfig.platformFee;
    }
  } catch (e) {
    // fallback
  }

  return getFallbackPlatformFee(subtotal);
}

export function usePlatformFee(subtotal: number = 0): number {
  const [fee, setFee] = useState<number>(() => getFallbackPlatformFee(subtotal));

  useEffect(() => {
    let mounted = true;
    fetchPlatformFee(subtotal).then(val => {
      if (mounted) setFee(val);
    });
    return () => {
      mounted = false;
    };
  }, [subtotal]);

  return fee;
}
