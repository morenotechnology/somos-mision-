import { facebookVideoPermalink, isFacebookPostUrl, normalizePreview, normalizeSocialUrl } from '../src/utils/socialMedia.js';
import { resolveFacebookNative } from '../src/utils/facebookNative.js';
import { resolveFacebookPhoto } from '../src/utils/facebookPhoto.js';
import { isCroppedSocialImage } from '../src/utils/socialImages.js';

const cache = new Map();
const pending = new Map();
const TTL = 15 * 60 * 1000;

export async function resolvePreview(url, { refresh = false, fetcher = fetch, nativeFetcher = fetcher, now = Date.now() } = {}) {
  const key = normalizeSocialUrl(url);
  if (!key) throw new Error('Enlace social no válido');
  const saved = cache.get(key);
  // A retry cannot hammer the upstream or reuse an indefinitely expired signed URL.
  if (saved && now - saved.time < (refresh ? 60000 : TTL)) return saved.data;
  if (pending.has(key)) return pending.get(key);
  const request = (async () => {
    const native = await resolveFacebookNative(key, nativeFetcher) || await resolveFacebookPhoto(key,nativeFetcher);
    if (native) {
      const data = normalizePreview(native, key);
      if (cache.size >= 500) cache.delete(cache.keys().next().value);
      cache.set(key, { time: now, data });
      return data;
    }
    const read = async target => {
      const upstream = new URL('https://api.microlink.io/');
      upstream.searchParams.set('url', target);
      upstream.searchParams.set('screenshot', 'false');
      upstream.searchParams.set('video', String(!isFacebookPostUrl(target)));
      upstream.searchParams.set('audio', 'false');
      const facebookPost = isFacebookPostUrl(target);
      if (facebookPost) {
        // Page-wide media discovery can select a suggested video rather than this post.
        for (const [name, selector] of Object.entries({
          postImage: 'meta[property="og:image"]',
          postVideo: 'meta[property="og:video:secure_url"], meta[property="og:video:url"], meta[property="og:video"]',
          postUrl: 'meta[property="og:url"]',
        })) {
          upstream.searchParams.set(`data.${name}.selector`, selector);
          upstream.searchParams.set(`data.${name}.attr`, 'content');
          upstream.searchParams.set(`data.${name}.type`, 'string');
        }
      }
      const response = await fetcher(upstream.href, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('La red social no entregó la vista previa');
      const payload = await response.json();
      if (payload.status !== 'success' || !payload.data) throw new Error('Vista previa no disponible');
      const raw = payload.data;
      return normalizePreview(facebookPost ? {
        ...raw,
        url: raw.postUrl || raw.url,
        image: raw.postImage || null,
        video: raw.postVideo || null,
        mediaVerified: Boolean(raw.postImage || raw.postVideo),
      } : raw, target);
    };
    const target = facebookVideoPermalink(key) || key;
    let data = await read(target);
    const canonicalVideo = facebookVideoPermalink(data.sourceUrl);
    if (canonicalVideo && canonicalVideo !== target && !isFacebookPostUrl(key)) {
      const resolvedNative = await resolveFacebookNative(canonicalVideo, nativeFetcher);
      if (resolvedNative) data = { ...data, ...normalizePreview(resolvedNative, key), imageUrl: resolvedNative.imageUrl || data.imageUrl };
    }
    if (!data.videoUrl && canonicalVideo && canonicalVideo !== target && !isFacebookPostUrl(key)) {
      // Resolve shared links once, then request the actual public video instead
      // of caching its /watch thumbnail as if it were the complete preview.
      try {
        const media = await read(canonicalVideo);
        data = { ...data, imageUrl: media.imageUrl || data.imageUrl, videoUrl: media.videoUrl || data.videoUrl, videoType: media.videoType || data.videoType, videoWidth: media.videoWidth || data.videoWidth, videoHeight: media.videoHeight || data.videoHeight, sourceUrl: media.sourceUrl || data.sourceUrl, mediaVerified: media.mediaVerified || data.mediaVerified };
      } catch { /* Keep the real cover and the provider player if unavailable. */ }
    }
    if (!data.videoUrl && isCroppedSocialImage(data.imageUrl)) data = {...data,imageUrl:'',imageWidth:0,imageHeight:0};
    if (cache.size >= 500) cache.delete(cache.keys().next().value);
    if (data.imageUrl || data.videoUrl) cache.set(key, { time: now, data });
    return data;
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  const input = new URL(req.url, 'https://www.somosmisioncolombia.com');
  const url = normalizeSocialUrl(input.searchParams.get('url'));
  if (!url) return res.status(400).json({ error: 'Usa un enlace público de una red social compatible' });
  try {
    const data = await resolvePreview(url, { refresh: input.searchParams.get('refresh') === '1' });
    res.setHeader('Cache-Control', data.imageUrl || data.videoUrl ? 'public, max-age=60, s-maxage=900, stale-while-revalidate=60' : 'no-store');
    return res.status(200).json({ data });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'No pudimos actualizar la portada. El reproductor original sigue disponible.' });
  }
}
