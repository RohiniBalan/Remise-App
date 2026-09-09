import axios from 'axios';
import { GATEWAY_URL } from './endpoints';

const CANDIDATE_URLS = [
  'http://localhost:3000/api/newsletter/subscribe',
  'http://localhost:3006/api/newsletter/subscribe',
  'http://192.168.1.33:3000/api/newsletter/subscribe',
  'http://192.168.1.33:3006/api/newsletter/subscribe',
  'http://10.0.2.2:3000/api/newsletter/subscribe',
  'http://10.0.2.2:3006/api/newsletter/subscribe',
  `${GATEWAY_URL}/api/newsletter/subscribe`,
  'https://wow-lifebackend.onrender.com/api/newsletter/subscribe',
];

async function sendFirstSuccessful(urls: string[], payload: any, timeoutMs = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    let resolved = false;
    let failedCount = 0;
    const errors: any[] = [];

    for (const url of urls) {
      axios
        .post(url, payload, {
          timeout: timeoutMs,
          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => {
          if (!resolved && res && (res.status >= 200 && res.status < 300 || res.data?.success || res.data?.isDuplicate)) {
            resolved = true;
            resolve(res);
          }
        })
        .catch((err) => {
          // If server responded with an application-level response (200/400/duplicate), resolve it
          if (
            !resolved &&
            err?.response?.data &&
            (err.response.status === 200 ||
              err.response.status === 400 ||
              err.response.data?.isDuplicate ||
              err.response.data?.success !== undefined)
          ) {
            resolved = true;
            resolve(err.response);
            return;
          }
          failedCount++;
          errors.push(err);
          if (failedCount >= urls.length && !resolved) {
            reject(errors[0] || new Error('All endpoints failed'));
          }
        });
    }
  });
}

export const newsletterApi = {
  subscribe: async (email: string, source = 'mobile_footer') => {
    const payload = {
      email: email.trim().toLowerCase(),
      source,
    };

    try {
      const res = await sendFirstSuccessful(CANDIDATE_URLS, payload, 5000);
      return res;
    } catch (err: any) {
      console.warn('Newsletter subscribe fallback exhausted:', err?.message || err);
      const sanitizedError = new Error(
        'Unable to subscribe right now. Please try again later.',
      );
      (sanitizedError as any).response = {
        data: {
          success: false,
          message: 'Unable to subscribe right now. Please try again later.',
        },
      };
      throw sanitizedError;
    }
  },
};
