import { gatewayClient, legacyProductClient } from './client';

export const contactApi = {
  get: async () => {
    try {
      return await gatewayClient.get('/api/contact');
    } catch {
      return await legacyProductClient.get('/contact');
    }
  },
  sendMessage: async (payload: { name: string; email: string; phone: string; message: string }) => {
    try {
      return await gatewayClient.post('/api/contact/messages', payload);
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
