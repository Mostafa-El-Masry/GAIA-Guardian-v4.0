/**
 * Small helper for building public URLs for Cloudflare R2.
 *
 * In your environment, set:
 *   NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://<your-domain-or-r2-endpoint>
 *
 * Example:
 *   https://media.example.com
 *   https://<account-id>.r2.cloudflarestorage.com/<bucket-name>
 *
 * We keep this helper very small so the Gallery remains portable.
 */
const base =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_IMG_CDN_BASE ||
  process.env.NEXT_PUBLIC_GAIA_GALLERY_URL ||
  process.env.NEXT_PUBLIC_GAIA_GALLERY_FALLBACK;

/**
 * Turn an R2 object key into a URL, or fall back to an API proxy path.
 */
export function getR2Url(key: string): string {
  if (!key) return '/placeholder-gallery-image.png';

  if (base && typeof base === 'string') {
    const trimmedBase = base.replace(/\/$/, '');
    return `${trimmedBase}/${key}`;
  }

  // Fallback: you can implement this API route later if you prefer a proxy.
  return `/api/r2-proxy?key=${encodeURIComponent(key)}`;
}
