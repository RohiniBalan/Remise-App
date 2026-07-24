import { legacyProductClient } from './client';

// Ported from client/app/services/ContactPage.tsx, client/app/about/ToyBlogLifestyle.tsx,
// and client/app/testimonials/page.tsx — all three hit LEGACY_PRODUCT_URL
// (wow-lifebackend.onrender.com), same as Category/Product/Cart.
export const contactApi = {
  get: () => legacyProductClient.get('/contact'),
  sendMessage: (payload: { name: string; email: string; phone: string; message: string }) =>
    legacyProductClient.post('/contact/messages', payload),
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
