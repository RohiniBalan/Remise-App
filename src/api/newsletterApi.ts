import { gatewayClient, legacyProductClient } from './client';

export const newsletterApi = {
  subscribe: async (email: string, source = 'mobile_footer') => {
    try {
      return await gatewayClient.post('/api/newsletter/subscribe', {
        email: email.trim().toLowerCase(),
        source,
      });
    } catch {
      return await legacyProductClient.post('/newsletter/subscribe', {
        email: email.trim().toLowerCase(),
        source,
      });
    }
  },
};
