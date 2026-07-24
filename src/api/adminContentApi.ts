import { legacyProductClient } from './client';

// Ported from the 14 admin marketing-content editor pages under
// client/app/admin/*/page.tsx — all hit LEGACY_PRODUCT_URL
// (wow-lifebackend.onrender.com) via a local axiosInstance with a
// Bearer-token request interceptor (matches legacyProductClient already).
// Each section follows one of two shapes:
//  - "whole object/array" — GET returns the current content, PUT overwrites
//    it entirely (add/remove/reorder happens client-side before saving),
//    POST .../reset restores factory defaults.
//  - Hot Drops (trending) and Studio are the two exceptions: real per-item
//    CRUD (POST create / PUT update / DELETE remove / POST reorder) plus a
//    separate single-object "config" endpoint.

// GET is always bare (array or object) at `res.data.data` on every section.
// PUT differs: object-shaped sections (hero/contact/services/blog-lifestyle/
// reviews/testimonials) send the object bare; array-shaped sections wrap
// the array under a named key on the way out (verified per-page against
// web's actual axiosInstance.put(...) calls — the wrapper key varies:
// `{ characters }`, `{ items }`, etc.) — `wrapKey` reproduces that exactly.
const section = (path: string, wrapKey?: string) => ({
  get: () => legacyProductClient.get(`/${path}`),
  save: (data: any) => legacyProductClient.put(`/${path}`, wrapKey ? { [wrapKey]: data } : data),
  reset: () => legacyProductClient.post(`/${path}/reset`),
});

export const adminHeroApi = section('hero');
export const adminCharactersApi = section('characters', 'characters');
export const adminBestSellersApi = section('bestsellers', 'items');
export const adminShopByAgeApi = section('shopbyage', 'items');
export const adminShopByCategoryApi = section('shopbycategory', 'items');
export const adminBentoGridApi = section('bentogrid', 'items');
export const adminReviewsApi = section('reviews');
export const adminServicesApi = section('services');
export const adminBlogLifestyleApi = section('blog-lifestyle');
export const adminTestimonialsApi = section('enhanced-testimonials');

export const adminContactApi = {
  ...section('contact'),
  getMessages: () => legacyProductClient.get('/contact/messages'),
};

// Ralleyz: whole-array save + reset, plus a real multipart image upload
// (the only admin content page with actual file upload, per web).
export const adminRalleyzApi = {
  ...section('ralleyz', 'items'),
  upload: (imageUri: string) => {
    const fd = new FormData();
    fd.append('image', { uri: imageUri, name: 'ralleyz.jpg', type: 'image/jpeg' } as any);
    return legacyProductClient.post('/ralleyz/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Hot Drops (web folder name) / "Trending Now" — real per-video CRUD +
// separate config object + reorder-by-swap.
export const adminTrendingApi = {
  getVideos: () => legacyProductClient.get('/trending'),
  getConfig: () => legacyProductClient.get('/trending/config'),
  addVideo: (data: any) => legacyProductClient.post('/trending', data),
  updateVideo: (id: string, data: any) => legacyProductClient.put(`/trending/${id}`, data),
  deleteVideo: (id: string) => legacyProductClient.delete(`/trending/${id}`),
  saveConfig: (data: any) => legacyProductClient.put('/trending/config/update', data),
  resetConfig: () => legacyProductClient.post('/trending/config/reset'),
  reorder: (data: any) => legacyProductClient.post('/trending/reorder', data),
};

// Studio Showcase — same shape as Trending (video CRUD + config + reorder).
export const adminStudioApi = {
  getVideos: () => legacyProductClient.get('/studio/videos'),
  getConfig: () => legacyProductClient.get('/studio/config'),
  addVideo: (data: any) => legacyProductClient.post('/studio/videos', data),
  updateVideo: (id: string, data: any) => legacyProductClient.put(`/studio/videos/${id}`, data),
  deleteVideo: (id: string) => legacyProductClient.delete(`/studio/videos/${id}`),
  saveConfig: (data: any) => legacyProductClient.put('/studio/config', data),
  resetConfig: () => legacyProductClient.post('/studio/config/reset'),
  reorder: (data: any) => legacyProductClient.post('/studio/videos/reorder', data),
};
