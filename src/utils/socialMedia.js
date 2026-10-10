// Public social links only. Canonicalization also avoids duplicate preview requests.
export function normalizeSocialUrl(value = '') {
  try {
    const url = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || url.href.length > 2400) return '';
    const host = url.hostname.toLowerCase().replace(/^(www|m|web|mbasic)\./, '');
    if (!['facebook.com', 'fb.com', 'fb.watch', 'instagram.com', 'youtube.com', 'youtu.be', 'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].includes(host)) return '';
    url.protocol = 'https:';
    url.hostname = host === 'fb.com' ? 'www.facebook.com' : ['facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com'].includes(host) ? `www.${host}` : host;
    if (host === 'instagram.com') {
      const post = url.pathname.match(/\/(p|reel|reels|tv)\/([\w-]+)\/?$/);
      if (post) url.pathname = `/${post[1] === 'reels' ? 'reel' : post[1]}/${post[2]}/`;
    }
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (!['v', 'id', 'story_fbid', 'fbid', 'set', 'img_index'].includes(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch { return ''; }
}

export function isDirectVideoUrl(value = '') {
  return /^(?:https?:\/\/|\/[^/])/i.test(String(value || '').trim()) && /\.(?:mp4|webm|ogg|mov|m4v|m3u8)(?:[?#]|$)/i.test(String(value).trim());
}

export function socialPostIdentity(value = '') {
  const normalized = normalizeSocialUrl(value);
  if (!normalized) return null;
  const url = new URL(normalized);
  if (url.hostname === 'www.facebook.com') {
    const videoId = url.pathname.match(/\/(?:reel|videos)\/(?:[^/]+\/)?(\d+)(?:\/|$)/)?.[1]
      || (/^\/(?:watch\/?|video\.php)$/.test(url.pathname) ? url.searchParams.get('v') : '');
    if (videoId) return { platform: 'facebook', kind: 'video', id: videoId };
    const shared = url.pathname.match(/^\/share\/([pv])\/([^/]+)/);
    if (shared) return { platform: 'facebook', kind: shared[1] === 'v' ? 'video' : 'post', id: '', shared: true };
    const id = url.searchParams.get('fbid') || url.searchParams.get('story_fbid')
      || url.pathname.match(/\/posts\/(?:[^/]+\/)?(pfbid[\w]+|\d+)(?:\/|$)/)?.[1];
    return { platform: 'facebook', kind: 'post', id: id || '' };
  }
  if (url.hostname === 'www.instagram.com') {
    const post = url.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/);
    return post ? { platform: 'instagram', kind: post[1] === 'p' ? 'post' : 'video', id: post[2] } : null;
  }
  if (url.hostname === 'fb.watch') return { platform: 'facebook', kind: 'video', id: '', shared: true };
  return { platform: url.hostname, kind: 'video', id: url.searchParams.get('v') || url.pathname };
}

export function isFacebookPostUrl(value = '') {
  const identity = socialPostIdentity(value);
  return identity?.platform === 'facebook' && identity.kind === 'post';
}

export function previewMatchesSource(originalUrl, candidateUrl) {
  const original = socialPostIdentity(originalUrl);
  const candidate = socialPostIdentity(candidateUrl);
  if (!original || !candidate || original.platform !== candidate.platform) return false;
  const path = new URL(normalizeSocialUrl(candidateUrl)).pathname;
  if (/^\/(?:$|(?:login|accounts|checkpoint|consent|privacy)(?:\/|$))/i.test(path)) return false;
  return !(original.id && candidate.id && original.id !== candidate.id);
}

export function normalizePreview(data = {}, originalUrl = '') {
  const original = normalizeSocialUrl(originalUrl);
  const candidate = normalizeSocialUrl(data.url || data.sourceUrl) || original;
  const matches = !original || previewMatchesSource(original, candidate);
  const sourceUrl = matches ? candidate : original;
  const imageUrl = typeof data.image === 'string' ? data.image : data.image?.url || data.imageUrl || '';
  const videoUrl = typeof data.video === 'string' ? data.video : data.video?.url || data.videoUrl || '';
  const videoType = data.video?.type || data.videoType || '';
  // Some legitimate media URLs have no extension; accept them only with a video MIME/type.
  const facebook = socialPostIdentity(original || sourceUrl)?.platform === 'facebook';
  const playable = matches && (!facebook || data.mediaVerified === true)
    && (isDirectVideoUrl(videoUrl) || (/^https:\/\//i.test(videoUrl) && /^(?:video\/(?:mp4|webm|ogg|quicktime)|mp4|webm|mov|m4v)$/i.test(videoType)));
  const dimension = value => Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 32768 ? Number(value) : 0;
  return {
    title: matches ? data.title || '' : '', description: matches ? data.description || '' : '',
    imageUrl: matches && /^https:\/\//i.test(imageUrl) ? imageUrl : '',
    videoUrl: playable ? videoUrl : '', videoType: playable ? videoType : '',
    sourceUrl,
    inputUrl: original || normalizeSocialUrl(data.inputUrl),
    mediaVerified: matches && data.mediaVerified === true,
    imageWidth: matches ? dimension(data.image?.width || data.imageWidth) : 0,
    imageHeight: matches ? dimension(data.image?.height || data.imageHeight) : 0,
    videoWidth: playable ? dimension(data.video?.width || data.videoWidth) : 0,
    videoHeight: playable ? dimension(data.video?.height || data.videoHeight) : 0,
  };
}
// Facebook's /watch redirect may expose only a poster. The same public video ID
// has a reel endpoint that also supplies its playable media metadata.
export function facebookVideoPermalink(value = '') {
  const normalized = normalizeSocialUrl(value);
  if (!normalized) return '';
  const url = new URL(normalized);
  if (!['www.facebook.com', 'facebook.com', 'www.fb.com', 'fb.com'].includes(url.hostname)) return '';
  const id = url.pathname.match(/^\/reel\/(\d+)(?:\/|$)/)?.[1]
    || url.pathname.match(/\/videos\/(?:[^/]+\/)?(\d+)(?:\/|$)/)?.[1]
    || (/^\/(?:watch\/?|video\.php)$/.test(url.pathname) && url.searchParams.get('v'));
  return /^\d+$/.test(id || '') ? `https://www.facebook.com/reel/${id}/` : '';
}
