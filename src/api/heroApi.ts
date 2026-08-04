import axios from 'axios';

// Ported from client's HeroSection.tsx — hero banner content lives on a
// DIFFERENT backend (wow-lifebackend) than products/offers (gatewayClient),
// same split as web. Confirm this URL matches your env before shipping.
const HERO_API_URL = 'https://wow-lifebackend.onrender.com/api';

export interface HeroContent {
  badgeText: string;
  title: string;
  titleGradient: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  carImages: string[];
}

export const heroApi = {
  get: () => axios.get(`${HERO_API_URL}/hero`),
};

export const HERO_FALLBACK: HeroContent = {
  badgeText: 'YOUR EVERYDAY LIFESTYLE STORE',
  title: 'Everything You',
  titleGradient: 'Need, Delivered.',
  description:
    'From fresh groceries and beauty essentials to toys, fashion & home — all in one place, right at your doorstep.',
  primaryButtonText: 'Shop Now',
  secondaryButtonText: 'Browse Categories',
  carImages: [
    'https://images.unsplash.com/photo-1542838132-29423eda0ea4?w=600&h=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&auto=format&fit=crop&q=80',
  ],
};