import { normalizePreview, normalizeSocialUrl } from './socialMedia.js';
import { archivedPublicationCover } from './publicationCoverArchive.js';
export { isDirectVideoUrl, normalizeSocialUrl } from './socialMedia.js';
const previewCache = new Map();
let activeRequests = 0;
const waiting = [];
async function queued(request) {
  if (activeRequests >= 3) await new Promise(resolve => waiting.push(resolve));
  activeRequests++;
  try { return await request(); }
  finally { activeRequests--; waiting.shift()?.(); }
}

export function isPlaceholderImage(value = '') {
  return !value || /(?:^|\/)hero-map\.png(?:[?#]|$)/i.test(String(value).trim());
}

// Only known, public player hosts can become embedded frames.
export function getSocialVideoEmbed(value = '', isVideo = false) {
  let url;
  try { url = new URL(normalizeSocialUrl(value)); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase().replace(/^(www|m|web)\./, '');
  if (['facebook.com', 'fb.com', 'fb.watch'].includes(host)) {
    if (!isVideo && !/(?:^|\/)(?:reel|videos|watch|share\/v)(?:\/|$)/i.test(url.pathname) && !url.searchParams.has('v') && host !== 'fb.watch') return null;
    const id = url.pathname.match(/\/reel\/(\d+)/)?.[1] || url.pathname.match(/\/videos\/(?:[^/]+\/)?(\d+)/)?.[1] || url.searchParams.get('v');
    const href = id ? `https://www.facebook.com/watch/?v=${encodeURIComponent(id)}` : url.href;
    return { platform: 'Facebook', url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=560&autoplay=true&allowfullscreen=true`, sourceUrl: url.href };
  }
  if (host === 'instagram.com') {
    const match = url.pathname.match(/^\/(reel|reels|p|tv)\/([\w-]+)\/?/);
    if (match && (isVideo || match[1] !== 'p')) return { platform: 'Instagram', url: `https://www.instagram.com/${match[1] === 'reels' ? 'reel' : match[1]}/${match[2]}/embed/`, sourceUrl: url.href };
  }
  if (['youtube.com', 'youtu.be'].includes(host)) {
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
    if (/^[\w-]{11}$/.test(id || '')) return { platform: 'YouTube', url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&controls=1`, sourceUrl: url.href };
  }
  if (host === 'tiktok.com') {
    const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
    if (id) return { platform: 'TikTok', url: `https://www.tiktok.com/player/v1/${id}?autoplay=1&controls=1`, sourceUrl: url.href };
  }
  return null;
}

export function getSocialPlatform(value = '') {
  const clean = String(value || '').toLowerCase();
  if (clean.includes('instagram.com') || clean === 'instagram') {
    return { id: 'instagram', label: 'Instagram' };
  }
  if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com') || clean === 'facebook') {
    return { id: 'facebook', label: 'Facebook' };
  }
  return { id: 'social', label: 'Red social' };
}

export async function fetchSocialPreview(sourceUrl = '', { refresh = false } = {}) {
  const cleanUrl = normalizeSocialUrl(sourceUrl);
  if (!cleanUrl) return null;
  const cached = previewCache.get(cleanUrl);
  if (!refresh && cached && cached.expires > Date.now()) return cached.request;

  const request = queued(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`/api/social-preview?url=${encodeURIComponent(cleanUrl)}${refresh ? '&refresh=1' : ''}`, { signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo obtener la vista previa del enlace');
      const payload = await response.json();
      return normalizePreview(payload?.data || {}, cleanUrl);
    } finally { clearTimeout(timeout); }
  }).catch(() => { previewCache.delete(cleanUrl); return null; });

  previewCache.set(cleanUrl, { request, expires: Date.now() + 5 * 60 * 1000 });
  return request;
}

export async function fetchPublicationPreview(links, options = {}) {
  const urls = [...new Set(links.map(normalizeSocialUrl).filter(Boolean))];
  let best = null;
  for (const url of urls) {
    const preview = await fetchSocialPreview(url, options);
    if (!preview) continue;
    best = best ? { ...best, imageUrl: best.imageUrl || preview.imageUrl, videoUrl: best.videoUrl || preview.videoUrl, videoType: best.videoUrl ? best.videoType : preview.videoType, sourceUrl: preview.videoUrl || getSocialVideoEmbed(preview.sourceUrl) ? preview.sourceUrl : best.sourceUrl } : preview;
    if (best.imageUrl && (best.videoUrl || getSocialVideoEmbed(best.sourceUrl))) break;
  }
  const archivedCover = urls.map(archivedPublicationCover).find(Boolean);
  return best ? { ...best, imageUrl: best.imageUrl || archivedCover || '' } : archivedCover ? { imageUrl: archivedCover, videoUrl: '', sourceUrl: urls[0] } : null;
}
