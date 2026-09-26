import { facebookVideoPermalink, normalizePreview, normalizeSocialUrl } from '../src/utils/socialMedia.js';

const cache = new Map();
const pending = new Map();
const TTL = 15 * 60 * 1000;

export async function resolvePreview(url, { refresh = false, fetcher = fetch, now = Date.now() } = {}) {
  const key = normalizeSocialUrl(url);
  if (!key) throw new Error('Enlace social no válido');
  const saved = cache.get(key);
  // A retry cannot hammer the upstream or reuse an indefinitely expired signed URL.
  if (saved && now - saved.time < (refresh ? 60000 : TTL)) return saved.data;
  if (pending.has(key)) return pending.get(key);
  const request = (async () => {
    const read = async target => {
      const response = await fetcher(`https://api.microlink.io/?url=${encodeURIComponent(target)}&screenshot=false&video=true&audio=false`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('La red social no entregó la vista previa');
      const payload = await response.json();
      if (payload.status !== 'success' || !payload.data) throw new Error('Vista previa no disponible');
      return normalizePreview(payload.data, target);
    };
    const target = facebookVideoPermalink(key) || key;
    let data = await read(target);
    const canonicalVideo = facebookVideoPermalink(data.sourceUrl);
    if (!data.videoUrl && canonicalVideo && canonicalVideo !== target) {
      // Resolve shared links once, then request the actual public video instead
      // of caching its /watch thumbnail as if it were the complete preview.
      try {
        const media = await read(canonicalVideo);
        data = { ...data, imageUrl: media.imageUrl || data.imageUrl, videoUrl: media.videoUrl || data.videoUrl, videoType: media.videoType || data.videoType, sourceUrl: media.sourceUrl || data.sourceUrl };
      } catch { /* Keep the real cover and the provider player if unavailable. */ }
    }
    if (cache.size >= 500) cache.delete(cache.keys().next().value);
    cache.set(key, { time: now, data });
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
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=900, stale-while-revalidate=60');
    return res.status(200).json({ data });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'No pudimos actualizar la portada. El reproductor original sigue disponible.' });
  }
}
