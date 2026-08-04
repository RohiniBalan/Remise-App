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
// Plain client, no auth interceptor — for the handful of gateway endpoints
// web calls anonymously (offers/active, offers/nearby, offers/:id, offers/
// store/:id, offers/:id/order — see app/api-services/offersApi.ts, none of
// which pass a headers object). gatewayClient above attaches whatever token
// is in storage to EVERY request; using it for these meant a logged-in
// customer's private/targeted offers (created with a targetCustomerId — see
// store/offers/new/page.tsx) were being included in the public feed for
// THEM specifically, since the backend apparently uses the bearer token to
// decide whether to fold the caller's own private offers into public
// results. Web never sends a token here, so it never triggers that; mobile
// was sending one unconditionally, which is what leaked private offers into
// Home and Nearby.
export const gatewayClientPublic = axios.create({ baseURL: GATEWAY_URL });
export const legacyMonolithClient = withAuthInterceptor(axios.create({ baseURL: LEGACY_MONOLITH_URL }));
export const legacyProductClient = withAuthInterceptor(axios.create({ baseURL: LEGACY_PRODUCT_URL }));
