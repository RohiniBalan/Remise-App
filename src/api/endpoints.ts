import { Platform } from 'react-native';
import Config from 'react-native-config';

// The web app calls THREE different backends depending on the page (verified
// during research — this is the web app's actual behavior, not a bug we're
// introducing). Per the approved plan, the mobile app mirrors this exactly
// rather than normalizing to one backend, so each api/*.ts file below picks
// whichever of these three a given web page/service currently hits.
//
// `localhost` doesn't resolve to the dev machine from an Android emulator —
// it must be substituted with the special 10.0.2.2 alias. iOS simulators
// can use localhost directly.
// const devHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const devHost = '192.168.1.33';

// api-gateway (microservices: auth/user/product/order/payment/content/
// store/offers/notification) — analog of web's NEXT_PUBLIC_API_URL.ii
// Used by: Store, Offers, Smart Order/Compare-Stores checkout, Notifications.
export const GATEWAY_URL = `http://${devHost}:3000`;

// Legacy monolith (Remise/server) — analog of the hardcoded
// `http://localhost:5000` found in checkout/page.tsx, payment-status/page.tsx,
// and orders/page.tsx.
// Used by: Checkout (legacy cart flow), Payment status polling, legacy Orders.
export const LEGACY_MONOLITH_URL = `http://${devHost}:5000`;

// Hardcoded production legacy product/content backend — analog of
// `https://wow-lifebackend.onrender.com/api` found in CartContext.tsx,
// category/product browsing pages, heroApi.js, trendingApi.ts, and the
// Services page's contact-form submit. This one is a real internet host,
// so it resolves the same from a device/emulator as it does from a browser.
export const LEGACY_PRODUCT_URL = 'https://wow-lifebackend.onrender.com/api';

// Web's "Scan Paper" product-scan feature (client/app/api/smart-product-upload)
// calls Google Gemini directly from the Next.js SERVER using a secret key —
// there is no backend microservice route for it, so it can't be mirrored the
// way the URLs above are. The mobile Store Owner "Scan Paper" flow
// (src/api/geminiScanApi.ts) instead calls Gemini directly from the app.
//
// This means the key ships inside the built app and can be extracted by
// decompiling the APK — use a key that's restricted (Google Cloud Console →
// API key restrictions → Android apps, restrict by this app's package name
// `com.remiseapp` + signing certificate SHA-1) and NOT the same key used by
// the web server, so a leak here can't be used to exhaust the web app's quota.
// Get a key at https://aistudio.google.com/apikey — fill it in below.
const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;
