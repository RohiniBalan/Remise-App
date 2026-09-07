import { gatewayClient } from './client';

export const newsletterApi = {
  subscribe: async (email: string, source = 'mobile_footer') => {
    return await gatewayClient.post('/api/newsletter/subscribe', {
      email: email.trim().toLowerCase(),
      source,
    });
  },
};
