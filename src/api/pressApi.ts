import axios from 'axios';
import { legacyProductClient, gatewayClient } from './client';
import { GATEWAY_URL } from './endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PressReleaseItem {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  body: string[];
  category: string;
  featured: boolean;
  published: boolean;
  location?: string;
  contactName?: string;
  contactEmail?: string;
  mediaKitUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PRESS_CANDIDATE_URLS = [
  `${GATEWAY_URL}/api/press`,
  'http://localhost:3000/api/press',
  'http://localhost:3006/api/press',
  'http://10.0.2.2:3000/api/press',
  'http://10.0.2.2:3006/api/press',
  'http://192.168.1.33:3000/api/press',
  'http://192.168.1.33:3006/api/press',
];

const getAuthHeaders = async () => {
  try {
    const token =
      (await AsyncStorage.getItem('token')) ||
      (await AsyncStorage.getItem('adminToken')) ||
      (await AsyncStorage.getItem('accessToken')) ||
      (await AsyncStorage.getItem('userToken'));
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const pressApi = {
  getAll: async (params?: { category?: string; search?: string; all?: boolean; status?: string; featured?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'All') q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.all) q.append('all', 'true');
    if (params?.status) q.append('status', params.status);
    if (params?.featured) q.append('featured', 'true');
    const queryStr = q.toString() ? `?${q.toString()}` : '';

    // 1. Try gateway client
    try {
      const res = await gatewayClient.get(`/api/press${queryStr}`);
      if (res.data?.success) return res.data;
    } catch {}

    // 2. Try candidate URLs
    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.get(`${url}${queryStr}`, { timeout: 4000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    // 3. Fallback to AsyncStorage
    try {
      const stored = await AsyncStorage.getItem('remise_press_releases');
      if (stored) {
        const list = JSON.parse(stored);
        return { success: true, data: Array.isArray(list) ? list : [] };
      }
    } catch {}

    return { success: true, data: [] };
  },

  getBySlugOrId: async (slugOrId: string) => {
    try {
      const res = await gatewayClient.get(`/api/press/${slugOrId}`);
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.get(`${url}/${slugOrId}`, { timeout: 4000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    throw new Error('Press release not found');
  },

  create: async (data: any) => {
    const headers = await getAuthHeaders();
    try {
      const res = await gatewayClient.post('/api/press', data, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.post(url, data, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    throw new Error('Failed to create press release on server');
  },

  update: async (id: string, data: any) => {
    const headers = await getAuthHeaders();
    try {
      const res = await gatewayClient.put(`/api/press/${id}`, data, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.put(`${url}/${id}`, data, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    throw new Error('Failed to update press release on server');
  },

  delete: async (id: string) => {
    const headers = await getAuthHeaders();
    try {
      const res = await gatewayClient.delete(`/api/press/${id}`, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.delete(`${url}/${id}`, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    throw new Error('Failed to delete press release on server');
  },

  togglePublish: async (id: string) => {
    const headers = await getAuthHeaders();
    try {
      const res = await gatewayClient.patch(`/api/press/${id}/toggle-publish`, {}, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.patch(`${url}/${id}/toggle-publish`, {}, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    throw new Error('Failed to toggle publish status on server');
  },

  toggleFeatured: async (id: string) => {
    const headers = await getAuthHeaders();
    try {
      const res = await gatewayClient.patch(`/api/press/${id}/toggle-featured`, {}, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of PRESS_CANDIDATE_URLS) {
      try {
        const res = await axios.patch(`${url}/${id}/toggle-featured`, {}, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    throw new Error('Failed to toggle featured status on server');
  },
};
