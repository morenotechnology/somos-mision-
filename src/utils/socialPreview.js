const previewCache = new Map();

export function isPlaceholderImage(value = '') {
  return !value || /(?:^|\/)hero-map\.png(?:[?#]|$)/i.test(String(value).trim());
}

export function isDirectVideoUrl(value = '') {
  return /^(?:https?:\/\/|\/[^/])/i.test(String(value || '').trim()) && /\.(?:mp4|webm|ogg|mov|m4v|m3u8)(?:[?#]|$)/i.test(String(value).trim());
}

// Only known, public player hosts can become embedded frames.
export function getSocialVideoEmbed(value = '', isVideo = false) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
  if (['facebook.com', 'fb.com', 'fb.watch'].includes(host)) {
    if (!isVideo && !/(?:^|\/)(?:reel|videos|watch|share\/v)(?:\/|$)/i.test(url.pathname) && !url.searchParams.has('v') && host !== 'fb.watch') return null;
    const id = url.pathname.match(/\/reel\/(\d+)/)?.[1] || url.pathname.match(/\/videos\/(?:[^/]+\/)?(\d+)/)?.[1] || url.searchParams.get('v');
    const href = id ? `https://www.facebook.com/watch/?v=${encodeURIComponent(id)}` : url.href;
    return { platform: 'Facebook', url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=560&autoplay=true`, sourceUrl: url.href };
  }
  if (host === 'instagram.com') {
    const match = url.pathname.match(/^\/(reel|reels|p|tv)\/([\w-]+)\/?/);
    if (match && (isVideo || match[1] !== 'p')) return { platform: 'Instagram', url: `https://www.instagram.com/${match[1] === 'reels' ? 'reel' : match[1]}/${match[2]}/embed/`, sourceUrl: url.href };
  }
  if (['youtube.com', 'youtu.be'].includes(host)) {
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
    if (/^[\w-]{11}$/.test(id || '')) return { platform: 'YouTube', url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`, sourceUrl: url.href };
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
  const cleanUrl = String(sourceUrl || '').trim();
  if (!/^https?:\/\//i.test(cleanUrl)) return null;
  const cached = previewCache.get(cleanUrl);
  if (!refresh && cached && cached.expires > Date.now()) return cached.request;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const request = fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=false&video=true&audio=false`, { signal: controller.signal })
    .then(async (response) => {
      if (!response.ok) throw new Error('No se pudo obtener la vista previa del enlace');
      const payload = await response.json();
      const data = payload?.data || {};
      const imageUrl = typeof data.image === 'string' ? data.image : data.image?.url || '';
      const videoValue = data.video;
      const videoUrl = typeof videoValue === 'string' ? videoValue : videoValue?.url || '';
      return {
        title: data.title || '',
        description: data.description || '',
        imageUrl: /^https?:\/\//i.test(imageUrl) ? imageUrl : '',
        videoUrl: isDirectVideoUrl(videoUrl) ? videoUrl : '',
        sourceUrl: /^https?:\/\//i.test(data.url || '') ? data.url : cleanUrl,
      };
    })
    .catch(() => { previewCache.delete(cleanUrl); return null; })
    .finally(() => clearTimeout(timeout));

  previewCache.set(cleanUrl, { request, expires: Date.now() + 5 * 60 * 1000 });
  return request;
}
