import axios from 'axios';
import { gatewayClient, legacyProductClient } from './client';
import { GATEWAY_URL } from './endpoints';

const CONTACT_CANDIDATE_URLS = [
  'http://localhost:3000/api/contact/messages',
  'http://localhost:3006/api/contact/messages',
  'http://192.168.1.33:3000/api/contact/messages',
  'http://192.168.1.33:3006/api/contact/messages',
  'http://10.0.2.2:3000/api/contact/messages',
  'http://10.0.2.2:3006/api/contact/messages',
  `${GATEWAY_URL}/api/contact/messages`,
  'https://wow-lifebackend.onrender.com/api/contact/messages',
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
          if (!resolved && res && (res.status >= 200 && res.status < 300 || res.data?.success)) {
            resolved = true;
            resolve(res);
          }
        })
        .catch((err) => {
          if (
            !resolved &&
            err?.response?.data &&
            (err.response.status === 200 ||
              err.response.status === 400 ||
              err.response.data?.success !== undefined)
          ) {
            resolved = true;
            resolve(err.response);
            return;
          }
          failedCount++;
          errors.push(err);
          if (failedCount >= urls.length && !resolved) {
            reject(errors[0] || new Error('All contact endpoints failed'));
          }
        });
    }
  });
}

export const contactApi = {
  get: async () => {
    try {
      return await gatewayClient.get('/api/contact');
    } catch {
      return await legacyProductClient.get('/contact');
    }
  },
  sendMessage: async (payload: { name: string; email: string; phone: string; message: string; subject?: string }) => {
    try {
      const res = await sendFirstSuccessful(CONTACT_CANDIDATE_URLS, payload, 5000);
      return res;
    } catch {
      return await legacyProductClient.post('/contact/messages', payload);
    }
  },
};

export const servicesApi = {
  get: () => legacyProductClient.get('/services'),
};

export const blogLifestyleApi = {
  get: () => legacyProductClient.get('/blog-lifestyle'),
};

export const testimonialsApi = {
  get: () => legacyProductClient.get('/enhanced-testimonials'),
};
