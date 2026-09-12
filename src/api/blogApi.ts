import axios from 'axios';
import { legacyProductClient, gatewayClient } from './client';
import { GATEWAY_URL } from './endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOG_CANDIDATE_URLS = [
  `${GATEWAY_URL}/api/blogs`,
  'http://localhost:3000/api/blogs',
  'http://localhost:3006/api/blogs',
  'http://10.0.2.2:3000/api/blogs',
  'http://10.0.2.2:3006/api/blogs',
  'http://192.168.1.33:3000/api/blogs',
  'http://192.168.1.33:3006/api/blogs',
  'https://wow-lifebackend.onrender.com/api/blogs',
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

export const blogApi = {
  getArticles: async (params?: { category?: string; search?: string; all?: boolean; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'All') q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.all) q.append('all', 'true');
    if (params?.status) q.append('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';

    // 1. Try local/gateway first
    try {
      const res = await gatewayClient.get(`/api/blogs${queryStr}`);
      if (res.data?.success) return res.data;
    } catch {}

    // 2. Direct candidate URLs (local microservice, emulator, direct host)
    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.get(`${url}${queryStr}`, { timeout: 4000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    // 3. Fallback to legacy product client only if local is unreachable
    try {
      const res = await legacyProductClient.get(`/blogs${queryStr}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  getArticle: async (slugOrId: string) => {
    try {
      const res = await gatewayClient.get(`/api/blogs/${slugOrId}`);
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.get(`${url}/${slugOrId}`, { timeout: 4000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    try {
      const res = await legacyProductClient.get(`/blogs/${slugOrId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  createArticle: async (data: any) => {
    const headers = await getAuthHeaders();

    try {
      const res = await gatewayClient.post('/api/blogs', data, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.post(url, data, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    try {
      const res = await legacyProductClient.post('/blogs', data, { headers });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  updateArticle: async (id: string, data: any) => {
    const headers = await getAuthHeaders();

    try {
      const res = await gatewayClient.put(`/api/blogs/${id}`, data, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.put(`${url}/${id}`, data, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    try {
      const res = await legacyProductClient.put(`/blogs/${id}`, data, { headers });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  deleteArticle: async (id: string) => {
    const headers = await getAuthHeaders();

    try {
      const res = await gatewayClient.delete(`/api/blogs/${id}`, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.delete(`${url}/${id}`, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    try {
      const res = await legacyProductClient.delete(`/blogs/${id}`, { headers });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  togglePublish: async (id: string) => {
    const headers = await getAuthHeaders();

    try {
      const res = await gatewayClient.patch(`/api/blogs/${id}/publish`, {}, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.patch(`${url}/${id}/publish`, {}, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    try {
      const res = await legacyProductClient.patch(`/blogs/${id}/publish`, {}, { headers });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  resetDefaults: async () => {
    const headers = await getAuthHeaders();

    try {
      const res = await gatewayClient.post('/api/blogs/admin/reset', {}, { headers });
      if (res.data?.success) return res.data;
    } catch {}

    for (const url of BLOG_CANDIDATE_URLS) {
      try {
        const res = await axios.post(`${url}/admin/reset`, {}, { headers, timeout: 5000 });
        if (res.data?.success) return res.data;
      } catch {}
    }

    try {
      const res = await legacyProductClient.post('/blogs/admin/reset', {}, { headers });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
};
