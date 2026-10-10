import { normalizeSocialUrl, socialPostIdentity } from './socialMedia.js';

// Read data, never evaluate third-party scripts. A player can contain other media;
// only the requested video's own VideoConfig is allowed to supply the file.
function readArray(text, start) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === '[' || char === '{') depth++;
    else if (char === ']' || char === '}') {
      depth--;
      if (!depth) { try { return JSON.parse(text.slice(start, index + 1)); } catch { return []; } }
    }
  }
  return [];
}

const publicMedia = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && /(?:^|\.)fbcdn\.net$/.test(url.hostname) ? url.href : '';
  } catch { return ''; }
};

export function extractFacebookNative(html, originalUrl) {
  if (!html || html.length > 4000000) return null;
  const identity = socialPostIdentity(originalUrl);
  if (identity?.platform !== 'facebook' || identity.kind !== 'video') return null;
  const candidates = [];
  const playerIds = new Set();
  for (const match of html.matchAll(/"videoData"\s*:\s*(\[)/g)) {
    const entries = readArray(html, match.index + match[0].lastIndexOf('['));
    for (const entry of entries) {
      if (!/^\d+$/.test(String(entry?.video_id || ''))) continue;
      playerIds.add(String(entry.video_id));
      if (identity.id && String(entry.video_id) !== identity.id) continue;
      const videoUrl = publicMedia(entry.sd_src) || publicMedia(entry.hd_src);
      if (videoUrl) candidates.push({ ...entry, videoUrl });
    }
  }
  // Shared links have no numeric ID: the dedicated player must identify exactly
  // one video. Ambiguous pages never become a playable preview.
  if (new Set(candidates.map(entry => String(entry.video_id))).size !== 1) return null;
  const video = candidates[0];
  if (!video) return null;
  const coverTag = playerIds.size === 1 ? html.match(/<img\b[^>]*class=["'][^"']*\b_1p6f\b[^"']*["'][^>]*>/i)?.[0] : '';
  const cover = coverTag?.match(/\bsrc=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
  return {
    sourceUrl: `https://www.facebook.com/watch/?v=${video.video_id}`,
    inputUrl: normalizeSocialUrl(originalUrl), videoUrl: video.videoUrl, videoType: 'video/mp4',
    videoWidth: Number(video.original_width) || 0, videoHeight: Number(video.original_height) || 0,
    imageUrl: publicMedia(video.thumbnail_src || video.thumbnail_image?.uri) || publicMedia(cover), mediaVerified: true,
  };
}

export async function resolveFacebookNative(originalUrl, fetcher = fetch) {
  const original = normalizeSocialUrl(originalUrl);
  const identity = socialPostIdentity(original);
  if (identity?.platform !== 'facebook' || identity.kind !== 'video') return null;
  try {
    const signal = AbortSignal.timeout(6000);
    let target = original;
    if (!identity.id) {
      for (let redirect = 0; redirect < 3; redirect++) {
        const response = await fetcher(target, { signal, redirect: 'manual' });
        const location = response.headers?.get('location');
        let candidate = '';
        if (location) candidate = normalizeSocialUrl(new URL(location, target).href);
        else if (response.ok) {
          const page = await response.text();
          candidate = normalizeSocialUrl(page.match(/<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']+)/i)?.[1]?.replace(/&amp;/g, '&'));
        }
        const next = socialPostIdentity(candidate);
        if (next?.platform !== 'facebook' || next.kind !== 'video' || candidate === target) break;
        target = candidate;
        if (next.id) break;
      }
    }
    const player = new URL('https://www.facebook.com/plugins/video.php');
    player.searchParams.set('href', target);
    player.searchParams.set('show_text', 'false');
    player.searchParams.set('width', '560');
    const response = await fetcher(player.href, { signal, redirect: 'error' });
    if (!response.ok) return null;
    const media = extractFacebookNative(await response.text(), target);
    return media ? { ...media, inputUrl: original } : null;
  } catch { return null; }
}
