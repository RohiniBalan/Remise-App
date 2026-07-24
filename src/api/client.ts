import axios from 'axios';
import { GATEWAY_URL, LEGACY_MONOLITH_URL, LEGACY_PRODUCT_URL } from './endpoints';
import { storage } from '../utils/storage';

function withAuthInterceptor(instance: ReturnType<typeof axios.create>) {
  instance.interceptors.request.use(async config => {
    const token = await storage.getToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
}

// One client per backend the web app actually calls (see endpoints.ts) —
// keeps the "mirror the web app exactly" behavior explicit at every call
// site instead of hiding it behind a single shared client.
export const gatewayClient = withAuthInterceptor(axios.create({ baseURL: GATEWAY_URL }));
export const legacyMonolithClient = withAuthInterceptor(axios.create({ baseURL: LEGACY_MONOLITH_URL }));
export const legacyProductClient = withAuthInterceptor(axios.create({ baseURL: LEGACY_PRODUCT_URL }));
