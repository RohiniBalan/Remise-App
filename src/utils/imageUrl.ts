import { GATEWAY_URL } from '../api/endpoints';

const DEFAULT_SERVER_ORIGIN = 'https://remise.digital';

/**
 * Resolves server image URLs from relative paths or returns absolute/local URIs untouched.
 *
 * Behavior:
 * - Empty / null / undefined / non-string -> returns undefined
 * - Absolute URLs ('http://', 'https://') -> returns unchanged
 * - Local / data URIs ('data:', 'file:', 'content:', 'blob:') -> returns unchanged
 * - Leading slash ('/uploads/products/...') -> prepends 'https://remise.digital'
 * - Relative without slash ('uploads/products/...') -> prepends 'https://remise.digital/'
 */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('content:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const base = (GATEWAY_URL || DEFAULT_SERVER_ORIGIN).replace(/\/+$/, '');

  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }

  return `${base}/${trimmed}`;
}

export const resolveImageUri = resolveImageUrl;
export const resolveServerImageUrl = resolveImageUrl;
