// Helper to ensure image URLs are absolute in production.
// If the server returns a relative path (e.g. /uploads/xyz.jpg),
// prefix it with the configured BASE_URL (Vite env) so the browser
// can load it when frontend and backend are hosted on different origins.
import { BASE_URL } from '../redux/features/constants.js';

export default function resolveImageUrl(url) {
  if (!url) return '';
  try {
    // If it's already an absolute URL (http(s)://) return as-is
    const isAbsolute = /^https?:\/\//i.test(url);
    if (isAbsolute) return url;

    // If BASE_URL is configured, trim any trailing slash and join
    const base = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';
    if (base) return `${base}${url.startsWith('/') ? '' : '/'}${url}`;

    // Fallback: return the original url (may work if proxy rewrites are in place)
    return url;
  } catch (e) {
    return url;
  }
}
